-- Production had refresh_member_membership_status / get_member_profile without
-- has_paid_current_year_dues in the member JSON (migration 202606271500 was marked
-- applied before that field was added). Re-apply the corrected definitions.

create or replace function public.refresh_member_membership_status(p_token uuid)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_session public.member_sessions%rowtype;
  v_member public.members%rowtype;
  v_type public.membership_types%rowtype;
  v_paid boolean := false;
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
    and deactivated = false;

  if not found then
    delete from public.member_sessions where token = p_token;
    return json_build_object('success', false, 'error', 'Member account not found.');
  end if;

  v_paid := public.sync_member_payment_from_dues(v_member.id);

  select *
  into v_member
  from public.members
  where id = v_session.member_id
    and deactivated = false;

  select *
  into v_type
  from public.membership_types
  where id = v_member.membership_type_id;

  return json_build_object(
    'success',
    true,
    'payment_status',
    case
      when v_paid then 'paid'
      else 'pending'
    end,
    'payment_message',
    case
      when v_paid then
        'We found a completed membership payment for your account.'
      else
        'No completed payment found for this year. Pay on Zeffy using the same email as your account, then refresh again.'
    end,
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
      v_member.is_first_login,
      'is_active',
      v_member.is_active,
      'has_paid_current_year_dues',
      v_paid
    )
  );
end;
$$;

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
  v_paid boolean := false;
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
    and deactivated = false;

  if not found then
    delete from public.member_sessions where token = p_token;
    return json_build_object('success', false, 'error', 'Member account not found.');
  end if;

  v_paid := public.sync_member_payment_from_dues(v_member.id);

  select *
  into v_member
  from public.members
  where id = v_session.member_id
    and deactivated = false;

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
      v_member.is_first_login,
      'is_active',
      v_member.is_active,
      'has_paid_current_year_dues',
      v_paid
    )
  );
end;
$$;

revoke all on function public.refresh_member_membership_status(uuid) from public;
revoke all on function public.get_member_profile(uuid) from public;

grant execute on function public.refresh_member_membership_status(uuid) to anon, authenticated, service_role;
grant execute on function public.get_member_profile(uuid) to anon, authenticated, service_role;
