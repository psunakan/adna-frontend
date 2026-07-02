-- Allow password reset for any active member, including those without portal credentials yet.
-- Completing reset creates member_credentials when missing (first-time portal password setup).

create or replace function public.create_member_password_reset(p_email text)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_member public.members%rowtype;
  v_token uuid;
begin
  select *
  into v_member
  from public.members
  where lower(email) = lower(trim(p_email))
    and deactivated = false;

  if not found then
    return null;
  end if;

  update public.member_password_reset_tokens
  set used_at = now()
  where member_id = v_member.id
    and used_at is null;

  v_token := gen_random_uuid();

  insert into public.member_password_reset_tokens (token, member_id, expires_at)
  values (v_token, v_member.id, now() + interval '1 hour');

  return json_build_object(
    'token',
    v_token,
    'email',
    v_member.email,
    'first_name',
    v_member.first_name
  );
end;
$$;

create or replace function public.reset_member_password(p_token uuid, p_password text)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_row public.member_password_reset_tokens%rowtype;
  v_hash text;
begin
  if length(trim(p_password)) < 8 then
    return json_build_object(
      'success',
      false,
      'error',
      'Password must be at least 8 characters.'
    );
  end if;

  select *
  into v_row
  from public.member_password_reset_tokens
  where token = p_token
    and used_at is null
    and expires_at > now();

  if not found then
    return json_build_object(
      'success',
      false,
      'error',
      'This reset link is invalid or has expired. Please request a new one.'
    );
  end if;

  if not exists (
    select 1 from public.members
    where id = v_row.member_id
      and deactivated = false
  ) then
    return json_build_object(
      'success',
      false,
      'error',
      'This account is no longer active. Please contact support.'
    );
  end if;

  v_hash := crypt(p_password, gen_salt('bf'));

  insert into public.member_credentials (
    member_id,
    password_hash,
    password_salt,
    invalid_login_attempts,
    is_locked,
    lockout_end_at
  ) values (
    v_row.member_id,
    v_hash,
    split_part(v_hash, '$', 3),
    0,
    false,
    null
  )
  on conflict (member_id) do update set
    password_hash = excluded.password_hash,
    password_salt = excluded.password_salt,
    invalid_login_attempts = 0,
    is_locked = false,
    lockout_end_at = null;

  update public.member_password_reset_tokens
  set used_at = now()
  where token = p_token;

  delete from public.member_sessions
  where member_id = v_row.member_id;

  return json_build_object('success', true);
end;
$$;

revoke all on function public.create_member_password_reset(text) from public;
revoke all on function public.create_member_password_reset(text) from anon, authenticated;
grant execute on function public.create_member_password_reset(text) to service_role;

notify pgrst, 'reload schema';
