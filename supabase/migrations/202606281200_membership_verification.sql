-- Verifiable membership letters: server-issued codes + public lookup.

create table if not exists public.membership_verifications (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  verification_code text not null,
  membership_year integer not null,
  membership_tier text not null check (membership_tier in ('diaspora', 'premium')),
  membership_label text not null,
  member_display_name text not null,
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  constraint membership_verifications_member_year_unique unique (member_id, membership_year),
  constraint membership_verifications_code_unique unique (verification_code)
);

create index if not exists membership_verifications_code_active_idx
  on public.membership_verifications (verification_code)
  where revoked_at is null;

alter table public.membership_verifications enable row level security;

revoke all on table public.membership_verifications from public;
grant select, insert, update on table public.membership_verifications to service_role;

create or replace function public.generate_verification_code()
returns text
language plpgsql
volatile
set search_path = public, extensions
as $$
declare
  v_code text;
  v_attempts integer := 0;
begin
  loop
    v_attempts := v_attempts + 1;
    if v_attempts > 20 then
      raise exception 'Unable to generate a unique verification code.';
    end if;

    v_code :=
      'ADNA-'
      || upper(substr(encode(extensions.gen_random_bytes(3), 'hex'), 1, 4))
      || '-'
      || upper(substr(encode(extensions.gen_random_bytes(3), 'hex'), 1, 4))
      || '-'
      || upper(substr(encode(extensions.gen_random_bytes(3), 'hex'), 1, 4))
      || '-'
      || upper(substr(encode(extensions.gen_random_bytes(3), 'hex'), 1, 4));

    exit when not exists (
      select 1
      from public.membership_verifications mv
      where mv.verification_code = v_code
    );
  end loop;

  return v_code;
end;
$$;

create or replace function public.member_has_paid_membership(p_member_id uuid, p_year integer)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.member_dues md
    where md.member_id = p_member_id
      and upper(md.status) = 'COMPLETED'
      and md.year = p_year
  );
$$;

create or replace function public.issue_membership_verification(p_token uuid)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_session public.member_sessions%rowtype;
  v_member public.members%rowtype;
  v_type public.membership_types%rowtype;
  v_year integer := extract(year from now())::integer;
  v_paid boolean := false;
  v_display_name text;
  v_existing public.membership_verifications%rowtype;
  v_code text;
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

  v_paid := public.sync_member_payment_from_dues(v_member.id);

  select *
  into v_member
  from public.members
  where id = v_session.member_id;

  select *
  into v_type
  from public.membership_types
  where id = v_member.membership_type_id;

  if coalesce(v_type.alias, 'regular') not in ('diaspora', 'premium') then
    return json_build_object(
      'success',
      false,
      'error',
      'Membership letters are available for paid Professional and Premium members only.'
    );
  end if;

  if not v_member.is_active or not public.member_has_paid_membership(v_member.id, v_year) then
    return json_build_object(
      'success',
      false,
      'error',
      'Complete your membership payment for the current year before requesting a letter.'
    );
  end if;

  v_display_name := trim(
    concat_ws(
      ' ',
      nullif(trim(v_member.first_name), ''),
      nullif(trim(v_member.middle_name), ''),
      nullif(trim(v_member.last_name), '')
    )
  );

  select *
  into v_existing
  from public.membership_verifications mv
  where mv.member_id = v_member.id
    and mv.membership_year = v_year
    and mv.revoked_at is null;

  if found then
    update public.membership_verifications
    set
      member_display_name = v_display_name,
      membership_tier = v_type.alias,
      membership_label = v_type.label,
      issued_at = now()
    where id = v_existing.id;

    return json_build_object(
      'success',
      true,
      'verification',
      json_build_object(
        'verification_code',
        v_existing.verification_code,
        'member_display_name',
        v_display_name,
        'membership_tier',
        v_type.alias,
        'membership_label',
        v_type.label,
        'membership_year',
        v_year,
        'issued_at',
        now(),
        'member_id',
        v_member.id
      )
    );
  end if;

  v_code := public.generate_verification_code();

  insert into public.membership_verifications (
    member_id,
    verification_code,
    membership_year,
    membership_tier,
    membership_label,
    member_display_name
  )
  values (
    v_member.id,
    v_code,
    v_year,
    v_type.alias,
    v_type.label,
    v_display_name
  );

  return json_build_object(
    'success',
    true,
    'verification',
    json_build_object(
      'verification_code',
      v_code,
      'member_display_name',
      v_display_name,
      'membership_tier',
      v_type.alias,
      'membership_label',
      v_type.label,
      'membership_year',
      v_year,
      'issued_at',
      now(),
      'member_id',
      v_member.id
    )
  );
end;
$$;

create or replace function public.verify_membership_code(p_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(trim(coalesce(p_code, '')));
  v_record public.membership_verifications%rowtype;
  v_member public.members%rowtype;
  v_type public.membership_types%rowtype;
  v_paid boolean := false;
  v_valid boolean := false;
begin
  if v_code = '' or v_code !~ '^ADNA-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$' then
    return json_build_object(
      'success',
      true,
      'valid',
      false,
      'message',
      'Enter a valid verification code in the format ADNA-XXXX-XXXX-XXXX-XXXX.'
    );
  end if;

  select *
  into v_record
  from public.membership_verifications mv
  where mv.verification_code = v_code
    and mv.revoked_at is null;

  if not found then
    return json_build_object(
      'success',
      true,
      'valid',
      false,
      'message',
      'No matching verification record was found. The code may be incorrect or revoked.'
    );
  end if;

  select *
  into v_member
  from public.members m
  where m.id = v_record.member_id
    and m.deactivated = false;

  if not found then
    return json_build_object(
      'success',
      true,
      'valid',
      false,
      'verification_code',
      v_code,
      'message',
      'This verification code is no longer active.'
    );
  end if;

  select *
  into v_type
  from public.membership_types mt
  where mt.id = v_member.membership_type_id;

  v_paid := public.member_has_paid_membership(v_member.id, v_record.membership_year);

  v_valid :=
    v_member.is_active
    and v_paid
    and coalesce(v_type.alias, 'regular') = v_record.membership_tier
    and coalesce(v_type.alias, 'regular') in ('diaspora', 'premium');

  return json_build_object(
    'success',
    true,
    'valid',
    v_valid,
    'verification_code',
    v_code,
    'member_display_name',
    v_record.member_display_name,
    'membership_label',
    v_record.membership_label,
    'membership_tier',
    v_record.membership_tier,
    'membership_year',
    v_record.membership_year,
    'issued_at',
    v_record.issued_at,
    'message',
    case
      when v_valid then
        'This verification code confirms an active A-DNA membership for the stated year.'
      else
        'This code was issued by A-DNA but membership is not currently active for that year.'
    end
  );
end;
$$;

revoke all on function public.generate_verification_code() from public;
revoke all on function public.member_has_paid_membership(uuid, integer) from public;
revoke all on function public.issue_membership_verification(uuid) from public;
revoke all on function public.verify_membership_code(text) from public;

grant execute on function public.issue_membership_verification(uuid) to anon, authenticated, service_role;
grant execute on function public.verify_membership_code(text) to anon, authenticated, service_role;
grant execute on function public.member_has_paid_membership(uuid, integer) to service_role;
