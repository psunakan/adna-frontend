-- Separate welcome-email claim lease from sent timestamp to prevent duplicate sends.

alter table public.members
  add column if not exists welcome_email_claimed_at timestamptz,
  add column if not exists welcome_email_claim_token uuid;

create or replace function public.claim_member_welcome_email_send(p_member_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token uuid;
  v_now timestamptz := now();
  v_lease interval := interval '10 minutes';
begin
  if p_member_id is null then
    return null;
  end if;

  update public.members
  set
    welcome_email_claimed_at = v_now,
    welcome_email_claim_token = gen_random_uuid()
  where id = p_member_id
    and welcome_email_sent_at is null
    and (
      welcome_email_claimed_at is null
      or welcome_email_claimed_at < v_now - v_lease
    )
  returning welcome_email_claim_token into v_token;

  return v_token;
end;
$$;

create or replace function public.mark_member_welcome_email_sent(
  p_member_id uuid,
  p_claim_token uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_member_id is null or p_claim_token is null then
    return false;
  end if;

  update public.members
  set
    welcome_email_sent_at = now(),
    welcome_email_claimed_at = null,
    welcome_email_claim_token = null
  where id = p_member_id
    and welcome_email_sent_at is null
    and welcome_email_claim_token = p_claim_token;

  return found;
end;
$$;

create or replace function public.clear_member_welcome_email_claim(
  p_member_id uuid,
  p_claim_token uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_member_id is null or p_claim_token is null then
    return false;
  end if;

  update public.members
  set
    welcome_email_claimed_at = null,
    welcome_email_claim_token = null
  where id = p_member_id
    and welcome_email_sent_at is null
    and welcome_email_claim_token = p_claim_token;

  return found;
end;
$$;

-- Exclude members with an active (non-stale) claim lease from reconcile queue.
create or replace function public.get_pending_member_welcome_emails(
  p_limit integer default 50
)
returns table (
  member_id uuid,
  email text,
  first_name text,
  membership_label text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_year integer := extract(year from now())::integer;
  v_lease interval := interval '10 minutes';
begin
  update public.member_dues md
  set member_id = m.id
  from public.members m
  where md.member_id is null
    and upper(md.status) = 'COMPLETED'
    and md.year = v_year
    and m.deactivated = false
    and nullif(btrim(md.member_email), '') is not null
    and nullif(btrim(m.email), '') is not null
    and lower(btrim(md.member_email)) = lower(btrim(m.email));

  update public.members m
  set is_active = true
  where m.deactivated = false
    and m.is_active = false
    and exists (
      select 1
      from public.member_dues md
      where md.member_id = m.id
        and upper(md.status) = 'COMPLETED'
        and md.year = v_year
    );

  return query
  select distinct on (m.id)
    m.id,
    m.email,
    m.first_name,
    coalesce(mt.label, 'Membership') as membership_label
  from public.members m
  join public.member_dues md on md.member_id = m.id
  left join public.membership_types mt on mt.id = m.membership_type_id
  where m.deactivated = false
    and m.welcome_email_sent_at is null
    and (
      m.welcome_email_claimed_at is null
      or m.welcome_email_claimed_at < now() - v_lease
    )
    and upper(md.status) = 'COMPLETED'
    and md.year = v_year
  order by m.id, md.created_at desc
  limit greatest(1, least(coalesce(p_limit, 50), 200));
end;
$$;

revoke all on function public.claim_member_welcome_email_send(uuid) from public;
revoke all on function public.mark_member_welcome_email_sent(uuid, uuid) from public;
revoke all on function public.clear_member_welcome_email_claim(uuid, uuid) from public;

grant execute on function public.claim_member_welcome_email_send(uuid) to service_role;
grant execute on function public.mark_member_welcome_email_sent(uuid, uuid) to service_role;
grant execute on function public.clear_member_welcome_email_claim(uuid, uuid) to service_role;
