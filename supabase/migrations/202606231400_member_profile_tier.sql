-- Expose membership tier alias on member profile for portal badges and upgrade UI.

create or replace function public.get_member_profile(p_token uuid)
returns json
language plpgsql
security definer
set search_path = public, extensions
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
      coalesce(v_type.label, 'Regular Membership (FREE)'),
      'membership_tier',
      coalesce(v_type.alias, 'regular'),
      'last_login_at',
      v_member.last_login_at,
      'is_first_login',
      v_member.is_first_login
    )
  );
end;
$$;

revoke all on function public.get_member_profile(uuid) from public;
grant execute on function public.get_member_profile(uuid) to anon, authenticated, service_role;

notify pgrst, 'reload schema';
