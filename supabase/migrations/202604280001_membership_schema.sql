-- Normalized membership schema (legacy-compatible)

create table if not exists public.membership_types (
  id uuid primary key,
  alias text not null unique,
  label text not null,
  amount numeric(10, 2) not null default 0
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  title text,
  first_name text not null,
  middle_name text,
  last_name text not null,
  phone_number text not null,
  country_residence text not null,
  state_residence text,
  email text not null,
  is_student boolean not null default false,
  education_level text,
  employment_status text,
  licence_status text,
  nurse_licences text[] not null default '{}',
  licence_speciality text,
  other_education text,
  other_specialty_input text,
  position_other_input text,
  position_title text,
  practice_setting text,
  specialties text[] not null default '{}',
  nursing_education_country text,
  country_practice text,
  state_practice text,
  membership_type_id uuid references public.membership_types (id),
  status smallint not null default 1,
  is_active boolean not null default true,
  is_first_login boolean not null default true,
  created_at timestamptz not null default now(),
  last_login_at timestamptz,
  deactivated boolean not null default false,
  deactivated_at timestamptz
);

create unique index if not exists members_email_unique on public.members (lower(email));

create table if not exists public.member_credentials (
  member_id uuid primary key references public.members (id) on delete cascade,
  password_hash text not null,
  password_salt text not null,
  invalid_login_attempts integer not null default 0,
  is_locked boolean not null default false,
  lockout_end_at timestamptz
);

create table if not exists public.member_dues (
  id uuid primary key,
  member_id uuid references public.members (id) on delete set null,
  member_email text not null,
  order_id text,
  currency text not null default 'USD',
  amount numeric(10, 2) not null,
  first_name text,
  middle_name text,
  last_name text,
  status text not null,
  message text,
  year integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table public.membership_types enable row level security;
alter table public.members enable row level security;
alter table public.member_credentials enable row level security;
alter table public.member_dues enable row level security;

drop policy if exists "Membership types are publicly readable" on public.membership_types;
create policy "Membership types are publicly readable"
  on public.membership_types
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Anyone can register as a member" on public.members;
create policy "Anyone can register as a member"
  on public.members
  for insert
  to anon, authenticated
  with check (true);

-- Seed membership types (legacy IDs preserved)
insert into public.membership_types (id, alias, label, amount) values
  ('56f6be17-ebcd-43ca-9dc6-0e2545e88cac', 'premium', 'Premium Membership ($150)', 150.00),
  ('d8e37c51-aee6-4f6b-82be-b4bf613cf3ad', 'diaspora', 'Diaspora Membership ($75)', 75.00),
  ('b9aabd89-7ea5-4da2-aa66-ef09dfb7b4a0', 'regular', 'Regular Membership (FREE)', 0.00)
on conflict (id) do nothing;
