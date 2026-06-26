-- Allow password reset for any member with portal credentials (including pending payment).
-- Restrict RPC to the password-reset-request edge function (service role only).

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

  if not exists (
    select 1 from public.member_credentials where member_id = v_member.id
  ) then
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

revoke all on function public.create_member_password_reset(text) from public;
revoke all on function public.create_member_password_reset(text) from anon, authenticated;
grant execute on function public.create_member_password_reset(text) to service_role;

notify pgrst, 'reload schema';
