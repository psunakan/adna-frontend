begin;

create extension if not exists pgtap with schema extensions;

select plan(6);

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
    '33333333-3333-3333-3333-333333333333'::uuid,
    'Reconcile',
    'Pending',
    '+15555550301',
    'USA',
    'reconcile-pending@test.adna.org',
    'd8e37c51-aee6-4f6b-82be-b4bf613cf3ad'::uuid,
    false
  ),
  (
    '44444444-4444-4444-4444-444444444444'::uuid,
    'Reconcile',
    'Sent',
    '+15555550302',
    'USA',
    'reconcile-sent@test.adna.org',
    'd8e37c51-aee6-4f6b-82be-b4bf613cf3ad'::uuid,
    true
  ),
  (
    '55555555-5555-5555-5555-555555555555'::uuid,
    'Reconcile',
    'Inactive',
    '+15555550303',
    'USA',
    'reconcile-deactivated@test.adna.org',
    'd8e37c51-aee6-4f6b-82be-b4bf613cf3ad'::uuid,
    true
  );

update public.members
set welcome_email_sent_at = now()
where id = '44444444-4444-4444-4444-444444444444'::uuid;

update public.members
set deactivated = true
where id = '55555555-5555-5555-5555-555555555555'::uuid;

insert into public.member_dues (
  id,
  member_id,
  member_email,
  order_id,
  currency,
  amount,
  status,
  message,
  year,
  created_at,
  updated_at
)
values
  (
    '66666666-6666-6666-6666-666666666661'::uuid,
    null,
    'reconcile-pending@test.adna.org',
    'orphan-dues-reconcile',
    'USD',
    75.00,
    'COMPLETED',
    'Orphan dues for reconcile test',
    extract(year from now())::integer,
    now(),
    now()
  ),
  (
    '66666666-6666-6666-6666-666666666662'::uuid,
    '44444444-4444-4444-4444-444444444444'::uuid,
    'reconcile-sent@test.adna.org',
    'already-sent-reconcile',
    'USD',
    75.00,
    'COMPLETED',
    'Already sent welcome email',
    extract(year from now())::integer,
    now(),
    now()
  ),
  (
    '66666666-6666-6666-6666-666666666663'::uuid,
    '55555555-5555-5555-5555-555555555555'::uuid,
    'reconcile-deactivated@test.adna.org',
    'deactivated-reconcile',
    'USD',
    75.00,
    'COMPLETED',
    'Deactivated member dues',
    extract(year from now())::integer,
    now(),
    now()
  );

select is(
  (
    select count(*)::integer
    from public.get_pending_member_welcome_emails(50)
    where member_id = '33333333-3333-3333-3333-333333333333'::uuid
  ),
  1,
  'returns unpaid member with completed current-year dues and no welcome email'
);

select is(
  (
    select member_id
    from public.member_dues
    where id = '66666666-6666-6666-6666-666666666661'::uuid
  ),
  '33333333-3333-3333-3333-333333333333'::uuid,
  'links orphan completed dues to member by normalized email'
);

select ok(
  (
    select is_active
    from public.members
    where id = '33333333-3333-3333-3333-333333333333'::uuid
  ),
  'activates member when completed current-year dues exist'
);

select is(
  (
    select count(*)::integer
    from public.get_pending_member_welcome_emails(50)
    where member_id = '44444444-4444-4444-4444-444444444444'::uuid
  ),
  0,
  'excludes members who already received welcome email'
);

select is(
  (
    select count(*)::integer
    from public.get_pending_member_welcome_emails(50)
    where member_id = '55555555-5555-5555-5555-555555555555'::uuid
  ),
  0,
  'excludes deactivated members'
);

select is(
  (
    select membership_label
    from public.get_pending_member_welcome_emails(50)
    where member_id = '33333333-3333-3333-3333-333333333333'::uuid
  ),
  'Diaspora Membership ($75)',
  'returns membership label from membership type'
);

select * from finish();

rollback;
