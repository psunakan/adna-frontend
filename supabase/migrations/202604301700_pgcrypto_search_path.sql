-- pgcrypto (crypt/gen_salt) lives in the extensions schema on Supabase hosted projects.

alter function public.login_member(text, text) set search_path = public, extensions;
alter function public.get_member_profile(uuid) set search_path = public, extensions;
alter function public.logout_member(uuid) set search_path = public, extensions;
alter function public.create_member_password_reset(text) set search_path = public, extensions;
alter function public.reset_member_password(uuid, text) set search_path = public, extensions;

notify pgrst, 'reload schema';
