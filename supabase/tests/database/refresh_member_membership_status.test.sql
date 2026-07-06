begin;

create extension if not exists pgtap with schema extensions;

select plan(8);

insert into public.members (
  id,
  first_name,
  last_name,
  phone_number,
  country_residence,
  email,
  membership_type_id,
  is_active
)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    'Active',
    'Unpaid',
    '+15555550101',
    'USA',
    'active-unpaid@test.adna.org',
    'b9aabd89-7ea5-4da2-aa66-ef09dfb7b4a0'::uuid,
    true
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
    'Paid',
    'Member',
    '+15555550102',
    'USA',
    'paid-member@test.adna.org',
    'b9aabd89-7ea5-4da2-aa66-ef09dfb7b4a0'::uuid,
    true
  );

insert into public.member_sessions (token, member_id, expires_at)
values
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    now() + interval '1 day'
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
    now() + interval '1 day'
  );

insert into public.member_dues (
  id,
  member_id,
  member_email,
  amount,
  status,
  year
)
values (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
  'paid-member@test.adna.org',
  75.00,
  'COMPLETED',
  extract(year from now())::integer
);

select is(
  public.refresh_member_membership_status('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid)->>'payment_status',
  'pending',
  'active member without current-year dues returns pending payment_status'
);

select isnt(
  public.refresh_member_membership_status('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid)->>'payment_message',
  'We found a completed membership payment for your account.',
  'active member without current-year dues does not get completed-payment message'
);

select is(
  public.refresh_member_membership_status(
    'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid
  )->'member'->>'is_active',
  'true',
  'active member without dues still reports is_active=true'
);

select is(
  public.refresh_member_membership_status(
    'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid
  )->'member'->>'has_paid_current_year_dues',
  'false',
  'active member without dues reports has_paid_current_year_dues=false'
);

select is(
  public.refresh_member_membership_status('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid)->>'payment_status',
  'paid',
  'member with completed current-year dues returns paid payment_status'
);

select is(
  public.refresh_member_membership_status(
    'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid
  )->>'payment_message',
  'We found a completed membership payment for your account.',
  'member with completed current-year dues gets completed-payment message'
);

select is(
  public.refresh_member_membership_status(
    'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid
  )->'member'->>'has_paid_current_year_dues',
  'true',
  'member with completed current-year dues reports has_paid_current_year_dues=true'
);

select is(
  public.refresh_member_membership_status(
    'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid
  )->'member'->>'is_active',
  'true',
  'paid member JSON includes is_active'
);

select * from finish();

rollback;
