-- Allow portal login and profile access for registered members pending payment (is_active = false).

create or replace function public.login_member(p_email text, p_password text)
returns json
language plpgsql
security definer
set search_path = public, extensions
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
    and deactivated = false;

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
      v_member.is_first_login,
      'is_active',
      v_member.is_active
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
      v_member.is_active
    )
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
  v_updated integer;
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
    select 1 from public.member_credentials where member_id = v_row.member_id
  ) then
    return json_build_object(
      'success',
      false,
      'error',
      'No login credentials found for this account. Please contact support.'
    );
  end if;

  v_hash := crypt(p_password, gen_salt('bf'));

  update public.member_credentials
  set
    password_hash = v_hash,
    password_salt = split_part(v_hash, '$', 3),
    invalid_login_attempts = 0,
    is_locked = false,
    lockout_end_at = null
  where member_id = v_row.member_id;

  get diagnostics v_updated = row_count;

  if v_updated = 0 then
    return json_build_object(
      'success',
      false,
      'error',
      'Unable to update password. Please contact support.'
    );
  end if;

  update public.member_password_reset_tokens
  set used_at = now()
  where token = p_token;

  delete from public.member_sessions
  where member_id = v_row.member_id;

  return json_build_object('success', true);
end;
$$;

notify pgrst, 'reload schema';
