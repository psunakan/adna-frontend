-- Member portal authentication (legacy bcrypt-compatible)

create extension if not exists pgcrypto;

create table if not exists public.member_sessions (
  token uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists member_sessions_member_id_idx on public.member_sessions (member_id);
create index if not exists member_sessions_expires_at_idx on public.member_sessions (expires_at);

alter table public.member_sessions enable row level security;

create or replace function public.login_member(p_email text, p_password text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member public.members%rowtype;
  v_creds public.member_credentials%rowtype;
  v_token uuid;
begin
  select *
  into v_member
  from public.members
  where lower(email) = lower(trim(p_email))
    and deactivated = false
    and is_active = true;

  if not found then
    return json_build_object('success', false, 'error', 'Invalid email or password.');
  end if;

  select *
  into v_creds
  from public.member_credentials
  where member_id = v_member.id;

  if not found then
    return json_build_object(
      'success',
      false,
      'error',
      'No login credentials found for this account. Please contact support.'
    );
  end if;

  if v_creds.is_locked and (v_creds.lockout_end_at is null or v_creds.lockout_end_at > now()) then
    return json_build_object(
      'success',
      false,
      'error',
      'Account is temporarily locked. Please try again later.'
    );
  end if;

  if v_creds.is_locked and v_creds.lockout_end_at <= now() then
    update public.member_credentials
    set
      is_locked = false,
      invalid_login_attempts = 0,
      lockout_end_at = null
    where member_id = v_member.id;

    v_creds.is_locked := false;
    v_creds.invalid_login_attempts := 0;
  end if;

  if v_creds.password_hash <> crypt(p_password, v_creds.password_hash) then
    update public.member_credentials
    set
      invalid_login_attempts = invalid_login_attempts + 1,
      is_locked = case when invalid_login_attempts + 1 >= 5 then true else is_locked end,
      lockout_end_at = case
        when invalid_login_attempts + 1 >= 5 then now() + interval '15 minutes'
        else lockout_end_at
      end
    where member_id = v_member.id;

    return json_build_object('success', false, 'error', 'Invalid email or password.');
  end if;

  update public.member_credentials
  set
    invalid_login_attempts = 0,
    is_locked = false,
    lockout_end_at = null
  where member_id = v_member.id;

  update public.members
  set
    last_login_at = now(),
    is_first_login = false
  where id = v_member.id;

  v_token := gen_random_uuid();

  insert into public.member_sessions (token, member_id, expires_at)
  values (v_token, v_member.id, now() + interval '7 days');

  return json_build_object(
    'success',
    true,
    'token',
    v_token,
    'member',
    json_build_object(
      'id',
      v_member.id,
      'email',
      v_member.email,
      'first_name',
      v_member.first_name,
      'last_name',
      v_member.last_name,
      'is_first_login',
      v_member.is_first_login
    )
  );
end;
$$;

create or replace function public.get_member_profile(p_token uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.member_sessions%rowtype;
  v_member public.members%rowtype;
  v_type public.membership_types%rowtype;
begin
  select *
  into v_session
  from public.member_sessions
  where token = p_token
    and expires_at > now();

  if not found then
    return json_build_object('success', false, 'error', 'Session expired. Please log in again.');
  end if;

  select *
  into v_member
  from public.members
  where id = v_session.member_id
    and deactivated = false
    and is_active = true;

  if not found then
    delete from public.member_sessions where token = p_token;
    return json_build_object('success', false, 'error', 'Member account not found.');
  end if;

  select *
  into v_type
  from public.membership_types
  where id = v_member.membership_type_id;

  return json_build_object(
    'success',
    true,
    'member',
    json_build_object(
      'id',
      v_member.id,
      'email',
      v_member.email,
      'first_name',
      v_member.first_name,
      'middle_name',
      v_member.middle_name,
      'last_name',
      v_member.last_name,
      'phone_number',
      v_member.phone_number,
      'country_residence',
      v_member.country_residence,
      'membership_label',
      coalesce(v_type.label, 'Member'),
      'last_login_at',
      v_member.last_login_at,
      'is_first_login',
      v_member.is_first_login
    )
  );
end;
$$;

create or replace function public.logout_member(p_token uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.member_sessions where token = p_token;
  return json_build_object('success', true);
end;
$$;

revoke all on function public.login_member(text, text) from public;
revoke all on function public.get_member_profile(uuid) from public;
revoke all on function public.logout_member(uuid) from public;

grant execute on function public.login_member(text, text) to anon, authenticated;
grant execute on function public.get_member_profile(uuid) to anon, authenticated;
grant execute on function public.logout_member(uuid) to anon, authenticated;
