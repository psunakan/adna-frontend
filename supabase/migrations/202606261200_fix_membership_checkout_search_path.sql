-- gen_random_bytes lives in the extensions schema on Supabase hosted projects.

alter function public.create_membership_checkout(text) set search_path = public, extensions;
alter function public.get_membership_checkout_status(text) set search_path = public, extensions;

notify pgrst, 'reload schema';
