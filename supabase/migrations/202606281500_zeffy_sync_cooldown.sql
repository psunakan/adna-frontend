-- Rate-limit portal-triggered Zeffy API backfill per member.

alter table public.members
  add column if not exists last_zeffy_sync_at timestamptz;

create or replace function public.try_acquire_zeffy_sync(
  p_token uuid,
  p_cooldown_seconds integer default 60
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.member_sessions%rowtype;
  v_member public.members%rowtype;
  v_acquired boolean := false;
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
    and deactivated = false
  for update;

  if not found then
    delete from public.member_sessions where token = p_token;
    return json_build_object('success', false, 'error', 'Member account not found.');
  end if;

  if v_member.last_zeffy_sync_at is null
     or v_member.last_zeffy_sync_at < now() - make_interval(secs => greatest(p_cooldown_seconds, 1)) then
    update public.members
    set last_zeffy_sync_at = now()
    where id = v_member.id;

    v_acquired := true;
  end if;

  return json_build_object(
    'success',
    true,
    'allowed',
    v_acquired,
    'email',
    v_member.email
  );
end;
$$;

revoke all on function public.try_acquire_zeffy_sync(uuid, integer) from public;
grant execute on function public.try_acquire_zeffy_sync(uuid, integer) to service_role;
