begin;

create extension if not exists pgtap with schema extensions;

select plan(11);

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
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Welcome',
    'Pending',
    '+15555550101',
    'USA',
    'welcome-pending@test.adna.org',
    'd8e37c51-aee6-4f6b-82be-b4bf613cf3ad'::uuid,
    true
  ),
  (
    '22222222-2222-2222-2222-222222222222'::uuid,
    'Welcome',
    'Sent',
    '+15555550102',
    'USA',
    'welcome-sent@test.adna.org',
    'd8e37c51-aee6-4f6b-82be-b4bf613cf3ad'::uuid,
    true
  );

update public.members
set welcome_email_sent_at = now()
where id = '22222222-2222-2222-2222-222222222222'::uuid;

select is(
  (
    public.process_zeffy_membership_payment(
      'zeffy-order-welcome-pending',
      'welcome-pending@test.adna.org',
      7500,
      'USD',
      'succeeded',
      'd8e37c51-aee6-4f6b-82be-b4bf613cf3ad'::uuid,
      'Welcome',
      'Pending'
    )->>'send_welcome_email'
  ),
  'true',
  'successful payment returns send_welcome_email=true when welcome_email_sent_at is null'
);

select isnt(
  public.claim_member_welcome_email_send('11111111-1111-1111-1111-111111111111'::uuid),
  null,
  'claim_member_welcome_email_send returns a token for unsent member'
);

select is(
  public.claim_member_welcome_email_send('11111111-1111-1111-1111-111111111111'::uuid),
  null,
  'second claim while lease is active returns null'
);

select ok(
  public.mark_member_welcome_email_sent(
    '11111111-1111-1111-1111-111111111111'::uuid,
    (
      select welcome_email_claim_token
      from public.members
      where id = '11111111-1111-1111-1111-111111111111'::uuid
    )
  ),
  'mark_member_welcome_email_sent marks sent with valid claim token'
);

select isnt(
  (
    select welcome_email_sent_at
    from public.members
    where id = '11111111-1111-1111-1111-111111111111'::uuid
  ),
  null,
  'mark_member_welcome_email_sent sets welcome_email_sent_at'
);

select is(
  (
    public.process_zeffy_membership_payment(
      'zeffy-order-welcome-pending',
      'welcome-pending@test.adna.org',
      7500,
      'USD',
      'succeeded',
      'd8e37c51-aee6-4f6b-82be-b4bf613cf3ad'::uuid,
      'Welcome',
      'Pending'
    )->>'send_welcome_email'
  ),
  'false',
  'duplicate webhook after email marked sent returns send_welcome_email=false'
);

insert into public.member_dues (
  id,
  member_id,
  member_email,
  order_id,
  amount,
  status,
  year
)
values (
  '33333333-3333-3333-3333-333333333333'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'welcome-pending@test.adna.org',
  'zeffy-order-retry-before-email',
  75.00,
  'COMPLETED',
  extract(year from now())::integer
);

update public.members
set
  welcome_email_sent_at = null,
  welcome_email_claimed_at = null,
  welcome_email_claim_token = null
where id = '11111111-1111-1111-1111-111111111111'::uuid;

select is(
  (
    public.process_zeffy_membership_payment(
      'zeffy-order-retry-before-email',
      'welcome-pending@test.adna.org',
      7500,
      'USD',
      'succeeded',
      'd8e37c51-aee6-4f6b-82be-b4bf613cf3ad'::uuid,
      'Welcome',
      'Pending'
    )->>'send_welcome_email'
  ),
  'true',
  'duplicate webhook before email marked sent returns send_welcome_email=true'
);

select throws_ok(
  $$
    insert into public.member_dues (
      id,
      member_id,
      member_email,
      order_id,
      amount,
      status,
      year
    )
    values (
      '44444444-4444-4444-4444-444444444444'::uuid,
      '11111111-1111-1111-1111-111111111111'::uuid,
      'welcome-pending@test.adna.org',
      'zeffy-order-retry-before-email',
      75.00,
      'COMPLETED',
      extract(year from now())::integer
    )
  $$,
  '23505',
  null,
  'two rows with the same non-null order_id cannot be inserted'
);

select is(
  (
    public.process_zeffy_membership_payment(
      'zeffy-order-failed-payment',
      'welcome-pending@test.adna.org',
      7500,
      'USD',
      'failed',
      'd8e37c51-aee6-4f6b-82be-b4bf613cf3ad'::uuid,
      'Welcome',
      'Pending'
    )->>'send_welcome_email'
  ),
  'false',
  'non-succeeded payment does not send welcome email'
);

select is(
  (
    public.process_zeffy_membership_payment(
      'zeffy-order-already-sent',
      'welcome-sent@test.adna.org',
      7500,
      'USD',
      'succeeded',
      'd8e37c51-aee6-4f6b-82be-b4bf613cf3ad'::uuid,
      'Welcome',
      'Sent'
    )->>'send_welcome_email'
  ),
  'false',
  'first payment for member with welcome_email_sent_at returns send_welcome_email=false'
);

update public.members
set
  welcome_email_claimed_at = now() - interval '11 minutes',
  welcome_email_claim_token = gen_random_uuid()
where id = '11111111-1111-1111-1111-111111111111'::uuid;

select isnt(
  public.claim_member_welcome_email_send('11111111-1111-1111-1111-111111111111'::uuid),
  null,
  'stale claim older than lease can be reclaimed'
);

select * from finish();

rollback;
