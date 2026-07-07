-- Welcome email is sent after payment succeeds, not at registration.

alter table public.members
  add column if not exists welcome_email_sent_at timestamptz;

create unique index if not exists member_dues_order_id_unique
  on public.member_dues (order_id)
  where order_id is not null;

create or replace function public.mark_member_welcome_email_sent(p_member_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_member_id is null then
    return false;
  end if;

  update public.members
  set welcome_email_sent_at = now()
  where id = p_member_id
    and welcome_email_sent_at is null;

  return found;
end;
$$;

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
  v_first_name text := nullif(trim(p_first_name), '');
  v_last_name text := nullif(trim(p_last_name), '');
  v_member_first_name text;
  v_membership_label text;
  v_send_welcome_email boolean := false;
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
    select
      md.member_id,
      m.first_name,
      coalesce(mt.label, 'Membership'),
      (
        upper(md.status) = 'COMPLETED'
        and m.id is not null
        and m.welcome_email_sent_at is null
      )
    into
      v_member_id,
      v_member_first_name,
      v_membership_label,
      v_send_welcome_email
    from public.member_dues md
    left join public.members m on m.id = md.member_id
    left join public.membership_types mt on mt.id = m.membership_type_id
    where md.id = v_existing_dues;

    return json_build_object(
      'success', true,
      'duplicate', true,
      'member_dues_id', v_existing_dues,
      'member_id', v_member_id,
      'member_found', v_member_id is not null,
      'membership_updated', false,
      'send_welcome_email', coalesce(v_send_welcome_email, false),
      'first_name', v_member_first_name,
      'membership_label', v_membership_label,
      'email', lower(trim(p_email)),
      'campaign_id', p_campaign_id
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
    v_first_name,
    v_last_name,
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
      first_name = coalesce(v_first_name, first_name),
      last_name = coalesce(v_last_name, last_name)
    where id = v_member_id;

    select
      m.first_name,
      coalesce(mt.label, 'Membership'),
      (m.welcome_email_sent_at is null)
    into v_member_first_name, v_membership_label, v_send_welcome_email
    from public.members m
    left join public.membership_types mt on mt.id = m.membership_type_id
    where m.id = v_member_id;
  end if;

  return json_build_object(
    'success', true,
    'duplicate', false,
    'member_id', v_member_id,
    'member_found', v_member_id is not null,
    'membership_updated', v_member_id is not null and lower(p_status) = 'succeeded',
    'send_welcome_email', coalesce(v_send_welcome_email, false),
    'first_name', v_member_first_name,
    'membership_label', v_membership_label,
    'email', lower(trim(p_email)),
    'campaign_id', p_campaign_id
  );
end;
$$;

revoke all on function public.mark_member_welcome_email_sent(uuid) from public;
grant execute on function public.mark_member_welcome_email_sent(uuid) to service_role;

revoke all on function public.process_zeffy_membership_payment(
  text,
  text,
  integer,
  text,
  text,
  uuid,
  text,
  text,
  text,
  text
) from public;

grant execute on function public.process_zeffy_membership_payment(
  text,
  text,
  integer,
  text,
  text,
  uuid,
  text,
  text,
  text,
  text
) to service_role;
