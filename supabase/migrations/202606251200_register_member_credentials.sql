-- Store portal credentials when a member registers via the membership form.

create or replace function public.register_member_credentials(p_email text, p_password text)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_member_id uuid;
  v_hash text;
begin
  if p_email is null or trim(p_email) = '' then
    return json_build_object('success', false, 'error', 'Email is required.');
  end if;

  if length(trim(p_password)) < 8 then
    return json_build_object(
      'success',
      false,
      'error',
      'Password must be at least 8 characters.'
    );
  end if;

  select id
  into v_member_id
  from public.members
  where lower(email) = lower(trim(p_email))
  order by created_at desc
  limit 1;

  if v_member_id is null then
    return json_build_object('success', false, 'error', 'Member not found.');
  end if;

  if exists (
    select 1 from public.member_credentials where member_id = v_member_id
  ) then
    return json_build_object('success', false, 'error', 'Account credentials already exist.');
  end if;

  v_hash := crypt(p_password, gen_salt('bf'));

  insert into public.member_credentials (
    member_id,
    password_hash,
    password_salt
  ) values (
    v_member_id,
    v_hash,
    split_part(v_hash, '$', 3)
  );

  return json_build_object('success', true);
end;
$$;

revoke all on function public.register_member_credentials(text, text) from public;
grant execute on function public.register_member_credentials(text, text) to anon, authenticated, service_role;
