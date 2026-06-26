-- Track membership registrations awaiting Zeffy payment confirmation.

create table if not exists public.membership_checkouts (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  member_id uuid not null references public.members (id) on delete cascade,
  email text not null,
  expected_tier text not null check (expected_tier in ('diaspora', 'premium')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);

create index if not exists membership_checkouts_token_idx
  on public.membership_checkouts (token);

create index if not exists membership_checkouts_member_id_idx
  on public.membership_checkouts (member_id);

alter table public.membership_checkouts enable row level security;

create or replace function public.create_membership_checkout(p_email text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_id uuid;
  v_expected_tier text;
  v_token text;
begin
  if p_email is null or trim(p_email) = '' then
    raise exception 'email is required';
  end if;

  select m.id, mt.alias
  into v_member_id, v_expected_tier
  from public.members m
  join public.membership_types mt on mt.id = m.membership_type_id
  where lower(m.email) = lower(trim(p_email))
    and m.created_at > now() - interval '24 hours'
  order by m.created_at desc
  limit 1;

  if v_member_id is null then
    raise exception 'member not found';
  end if;

  if v_expected_tier not in ('diaspora', 'premium') then
    raise exception 'invalid membership tier for checkout';
  end if;

  v_token := encode(gen_random_bytes(24), 'hex');

  insert into public.membership_checkouts (
    token,
    member_id,
    email,
    expected_tier
  ) values (
    v_token,
    v_member_id,
    lower(trim(p_email)),
    v_expected_tier
  );

  return json_build_object(
    'token', v_token,
    'expected_tier', v_expected_tier
  );
end;
$$;

create or replace function public.get_membership_checkout_status(p_token text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_checkout public.membership_checkouts%rowtype;
  v_first_name text;
  v_membership_label text;
  v_paid boolean := false;
  v_year integer := extract(year from now())::integer;
begin
  if p_token is null or trim(p_token) = '' then
    return json_build_object('status', 'invalid');
  end if;

  select *
  into v_checkout
  from public.membership_checkouts
  where token = trim(p_token)
  limit 1;

  if v_checkout.id is null then
    return json_build_object('status', 'invalid');
  end if;

  if v_checkout.expires_at <= now() then
    return json_build_object('status', 'expired');
  end if;

  select m.first_name, mt.label
  into v_first_name, v_membership_label
  from public.members m
  join public.membership_types mt on mt.id = m.membership_type_id
  where m.id = v_checkout.member_id;

  select exists (
    select 1
    from public.member_dues md
    where md.member_id = v_checkout.member_id
      and upper(md.status) = 'COMPLETED'
      and md.year = v_year
  )
  into v_paid;

  if v_paid then
    return json_build_object(
      'status', 'confirmed',
      'first_name', v_first_name,
      'membership_label', v_membership_label,
      'email', v_checkout.email
    );
  end if;

  return json_build_object(
    'status', 'pending',
    'first_name', v_first_name,
    'membership_label', v_membership_label,
    'email', v_checkout.email
  );
end;
$$;

revoke all on function public.create_membership_checkout(text) from public;
revoke all on function public.get_membership_checkout_status(text) from public;

grant execute on function public.create_membership_checkout(text) to anon, authenticated, service_role;
grant execute on function public.get_membership_checkout_status(text) to anon, authenticated, service_role;
