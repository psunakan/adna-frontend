-- pg_net is required for net.http_post inside invoke_member_welcome_email_reconcile_cron.
-- The original migration may have skipped cron.schedule if pg_cron was not yet enabled.

create extension if not exists pg_net with schema extensions;

do $grant$
begin
  if exists (select 1 from pg_namespace where nspname = 'cron') then
    grant usage on schema cron to postgres;
    grant all privileges on all tables in schema cron to postgres;
  end if;
end;
$grant$;

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
