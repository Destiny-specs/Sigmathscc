-- ============================================================
-- SigMath database (fresh project for the Grade 9 and 10 study)
-- Run once: Supabase > SQL Editor > New query > paste > Run
-- ============================================================

create table users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  password text not null,
  role text not null,
  class_code text,
  created_at timestamp default now(),
  xp int4 default 0,
  badges text[] default '{}',
  streak int4 default 0,
  last_active date,
  is_muted boolean default false
);

create table classes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp default now(),
  class_name text not null,
  class_code text not null unique,
  teacher_id uuid references users(id) on delete set null
);

create table quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  topic text not null,
  score int4 not null,
  total int4 not null,
  created_at timestamp default now()
);

create table announcements (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references users(id) on delete cascade,
  class_code text not null,
  message text not null,
  teacher_name text not null,
  topic text,
  created_at timestamptz default now()
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  "order" int4,
  difficulty text,
  title text not null,
  description text,
  content text,
  grade_level text not null,
  icon text
);

create table completed_lessons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  lesson_id uuid,
  completed_at timestamp default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references users(id) on delete set null,
  sender_name text not null,
  class_code text not null,
  message text not null,
  created_at timestamp default now()
);

create table direct_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references users(id) on delete cascade,
  receiver_id uuid references users(id) on delete cascade,
  message text not null,
  read_at timestamp,
  created_at timestamp default now()
);

-- progress saved to each student's account (lessons, quizzes, flashcards, boss wins)
create table user_progress (
  user_id text not null,
  key text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

-- faster lookups
create index on users (class_code);
create index on quiz_results (user_id, created_at);
create index on messages (class_code, created_at);
create index on direct_messages (sender_id, receiver_id, created_at);
create index on announcements (class_code, created_at);

-- ============================================================
-- SECURITY: turn on Row Level Security for every table and add NO policies.
-- That means nobody can read or write these tables with the public (publishable) key.
-- Only your website's server can, because it uses the secret key.
-- ============================================================
alter table users enable row level security;
alter table classes enable row level security;
alter table quiz_results enable row level security;
alter table announcements enable row level security;
alter table lessons enable row level security;
alter table completed_lessons enable row level security;
alter table messages enable row level security;
alter table direct_messages enable row level security;
alter table user_progress enable row level security;

-- ============================================================
-- Make sure the website's server key (service_role) can always use the tables,
-- whichever "expose new tables" setting you chose when creating the project.
-- ============================================================
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
alter default privileges in schema public grant all on tables to service_role;
