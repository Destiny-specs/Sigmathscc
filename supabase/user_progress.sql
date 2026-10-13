-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run
create table if not exists user_progress (
  user_id text not null,
  key text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);
-- Your other tables are used the same way by the server, so this table matches them.
alter table user_progress disable row level security;
