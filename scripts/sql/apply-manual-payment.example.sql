-- Admin manual payment replay (Supabase Dashboard → SQL Editor)
-- Run as project admin after verifying the Zeffy receipt.
-- Replace placeholders before running.

-- 1) Check member exists
select id, email, first_name, last_name, is_active
from public.members
where lower(email) = lower('molayodecker@gmail.com');

-- 2) Check existing dues
select id, member_id, member_email, status, amount, currency, year, order_id, created_at
from public.member_dues
where lower(member_email) = lower('molayodecker@gmail.com')
order by created_at desc;

-- 3) Apply Professional ($75) payment — use a unique order_id per replay
select public.process_zeffy_membership_payment(
  p_zeffy_payment_id => 'manual-molayodecker-REPLACE-WITH-ZEFFY-ID',
  p_email => 'molayodecker@gmail.com',
  p_amount_cents => 7500,
  p_currency => 'USD',
  p_status => 'succeeded',
  p_membership_type_id => 'd8e37c51-aee6-4f6b-82be-b4bf613cf3ad'::uuid,
  p_first_name => null,
  p_last_name => null,
  p_campaign_id => null,
  p_description => 'Manual admin replay — Zeffy payment verified'
);

-- Premium ($150) membership type id: 56f6be17-ebcd-43ca-9dc6-0e2545e88cac
-- Premium amount cents: 15000

-- 4) Verify
select id, email, is_active from public.members where lower(email) = lower('molayodecker@gmail.com');
