-- Process Zeffy membership payments: record dues + upgrade member tier.

create or replace function public.process_zeffy_membership_payment(
  p_zeffy_payment_id text,
  p_email text,
  p_amount_cents integer,
  p_currency text,
  p_status text,
  p_membership_type_id uuid,
  p_first_name text default null,
  p_last_name text default null,
  p_campaign_id text default null,
  p_description text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_id uuid;
  v_existing_dues uuid;
  v_year integer := extract(year from now())::integer;
  v_amount numeric(10, 2);
begin
  if p_zeffy_payment_id is null or trim(p_zeffy_payment_id) = '' then
    raise exception 'zeffy payment id is required';
  end if;

  if p_email is null or trim(p_email) = '' then
    raise exception 'buyer email is required';
  end if;

  if p_membership_type_id is null then
    raise exception 'membership type is required';
  end if;

  v_amount := round(coalesce(p_amount_cents, 0)::numeric / 100.0, 2);

  select id into v_existing_dues
  from public.member_dues
  where order_id = p_zeffy_payment_id
  limit 1;

  if v_existing_dues is not null then
    return json_build_object(
      'success', true,
      'duplicate', true,
      'member_dues_id', v_existing_dues
    );
  end if;

  select id into v_member_id
  from public.members
  where lower(email) = lower(trim(p_email))
  limit 1;

  insert into public.member_dues (
    id,
    member_id,
    member_email,
    order_id,
    currency,
    amount,
    first_name,
    last_name,
    status,
    message,
    year,
    created_at,
    updated_at
  ) values (
    gen_random_uuid(),
    v_member_id,
    lower(trim(p_email)),
    p_zeffy_payment_id,
    upper(coalesce(p_currency, 'USD')),
    v_amount,
    nullif(trim(p_first_name), ''),
    nullif(trim(p_last_name), ''),
    case
      when lower(p_status) = 'succeeded' then 'COMPLETED'
      else upper(coalesce(p_status, 'PENDING'))
    end,
    coalesce(nullif(trim(p_description), ''), 'Zeffy membership payment'),
    v_year,
    now(),
    now()
  );

  if v_member_id is not null and lower(p_status) = 'succeeded' then
    update public.members
    set
      membership_type_id = p_membership_type_id,
      is_active = true,
      deactivated = false,
      deactivated_at = null
    where id = v_member_id;
  end if;

  return json_build_object(
    'success', true,
    'duplicate', false,
    'member_id', v_member_id,
    'member_found', v_member_id is not null,
    'membership_updated', v_member_id is not null and lower(p_status) = 'succeeded',
    'email', lower(trim(p_email)),
    'campaign_id', p_campaign_id
  );
end;
$$;

revoke all on function public.process_zeffy_membership_payment from public;
grant execute on function public.process_zeffy_membership_payment to service_role;
