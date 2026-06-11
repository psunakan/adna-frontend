-- Demo member account for portal testing
-- Email: demo@adna.org  |  Password: DemoPassword123!

create extension if not exists pgcrypto;

do $$
declare
  v_member_id uuid := 'a1111111-1111-1111-1111-111111111111';
  v_password text := 'DemoPassword123!';
  v_hash text;
begin
  delete from public.member_credentials
  where member_id in (
    select id from public.members where lower(email) = 'demo@adna.org'
  );

  delete from public.members
  where lower(email) = 'demo@adna.org';

  v_hash := crypt(v_password, gen_salt('bf'));

  insert into public.members (
    id,
    title,
    first_name,
    last_name,
    phone_number,
    country_residence,
    email,
    is_student,
    education_level,
    employment_status,
    licence_status,
    nurse_licences,
    position_title,
    practice_setting,
    specialties,
    nursing_education_country,
    country_practice,
    membership_type_id,
    status,
    is_active,
    is_first_login,
    deactivated
  ) values (
    v_member_id,
    'Ms',
    'Demo',
    'User',
    '+15555550100',
    'USA',
    'demo@adna.org',
    false,
    'Bachelors',
    'fulltime',
    'Active',
    array[]::text[],
    'Staff Nurse',
    'Hospital',
    array[]::text[],
    'USA',
    'USA',
    'b9aabd89-7ea5-4da2-aa66-ef09dfb7b4a0',
    1,
    true,
    false,
    false
  );

  insert into public.member_credentials (
    member_id,
    password_hash,
    password_salt,
    invalid_login_attempts,
    is_locked,
    lockout_end_at
  ) values (
    v_member_id,
    v_hash,
    split_part(v_hash, '$', 3),
    0,
    false,
    null
  );
end;
$$;
