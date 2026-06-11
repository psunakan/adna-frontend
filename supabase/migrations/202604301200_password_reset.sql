-- Member portal password reset tokens

create table if not exists public.member_password_reset_tokens (
  token uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists member_password_reset_tokens_member_id_idx
  on public.member_password_reset_tokens (member_id);

create index if not exists member_password_reset_tokens_active_idx
  on public.member_password_reset_tokens (expires_at)
  where used_at is null;

alter table public.member_password_reset_tokens enable row level security;

-- Called only from the password-reset-request edge function (service role)
create or replace function public.create_member_password_reset(p_email text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member public.members%rowtype;
  v_token uuid;
begin
  select *
  into v_member
  from public.members
  where lower(email) = lower(trim(p_email))
    and deactivated = false
    and is_active = true;

  if not found then
    return null;
  end if;

  if not exists (
    select 1 from public.member_credentials where member_id = v_member.id
  ) then
    return null;
  end if;

  update public.member_password_reset_tokens
  set used_at = now()
  where member_id = v_member.id
    and used_at is null;

  v_token := gen_random_uuid();

  insert into public.member_password_reset_tokens (token, member_id, expires_at)
  values (v_token, v_member.id, now() + interval '1 hour');

  return json_build_object(
    'token',
    v_token,
    'email',
    v_member.email,
    'first_name',
    v_member.first_name
  );
end;
$$;

create or replace function public.reset_member_password(p_token uuid, p_password text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.member_password_reset_tokens%rowtype;
  v_hash text;
begin
  if length(trim(p_password)) < 8 then
    return json_build_object(
      'success',
      false,
      'error',
      'Password must be at least 8 characters.'
    );
  end if;

  select *
  into v_row
  from public.member_password_reset_tokens
  where token = p_token
    and used_at is null
    and expires_at > now();

  if not found then
    return json_build_object(
      'success',
      false,
      'error',
      'This reset link is invalid or has expired. Please request a new one.'
    );
  end if;

  v_hash := crypt(p_password, gen_salt('bf'));

  update public.member_credentials
  set
    password_hash = v_hash,
    password_salt = split_part(v_hash, '$', 3),
    invalid_login_attempts = 0,
    is_locked = false,
    lockout_end_at = null
  where member_id = v_row.member_id;

  update public.member_password_reset_tokens
  set used_at = now()
  where token = p_token;

  delete from public.member_sessions
  where member_id = v_row.member_id;

  return json_build_object('success', true);
end;
$$;

revoke all on function public.create_member_password_reset(text) from public;
revoke all on function public.reset_member_password(uuid, text) from public;

grant execute on function public.reset_member_password(uuid, text) to anon, authenticated;
