-- Reconciliation RPC for missed welcome emails (backup to Zeffy webhook path).
-- Postgres identifies who needs email; the member-welcome-email-reconcile Edge Function sends it.

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
begin
  -- Link completed dues rows to matching members by normalized email.
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

  -- Activate paid members.
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
    and upper(md.status) = 'COMPLETED'
    and md.year = v_year
  order by m.id, md.created_at desc
  limit greatest(1, least(coalesce(p_limit, 50), 200));
end;
$$;

revoke all on function public.get_pending_member_welcome_emails(integer) from public;
grant execute on function public.get_pending_member_welcome_emails(integer) to service_role;

-- Hourly cron invokes the reconcile Edge Function when vault secrets are configured.
create or replace function public.invoke_member_welcome_email_reconcile_cron()
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_base_url text;
  v_secret text;
  v_request_id bigint;
begin
  select decrypted_secret
  into v_base_url
  from vault.decrypted_secrets
  where name = 'supabase_project_url'
  limit 1;

  select decrypted_secret
  into v_secret
  from vault.decrypted_secrets
  where name = 'internal_function_secret'
  limit 1;

  if v_base_url is null or v_secret is null then
    return;
  end if;

  select net.http_post(
    url := rtrim(v_base_url, '/') || '/functions/v1/member-welcome-email-reconcile',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-internal-function-secret', v_secret
    ),
    body := jsonb_build_object('source', 'cron')
  )
  into v_request_id;
end;
$$;

revoke all on function public.invoke_member_welcome_email_reconcile_cron() from public;
grant execute on function public.invoke_member_welcome_email_reconcile_cron() to postgres;

do $cron$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule(jobid)
    from cron.job
    where jobname = 'member-welcome-email-reconcile-hourly';

    perform cron.schedule(
      'member-welcome-email-reconcile-hourly',
      '0 * * * *',
      $job$ select public.invoke_member_welcome_email_reconcile_cron(); $job$
    );
  end if;
end;
$cron$;
