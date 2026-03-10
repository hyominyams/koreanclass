create extension if not exists "pgcrypto";

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  topic_id text not null,
  author_name text not null,
  group_name text,
  perspective text not null,
  content text not null,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint submissions_content_length check (char_length(content) between 10 and 1200),
  constraint submissions_author_length check (char_length(author_name) between 1 and 24),
  constraint submissions_perspective_length check (char_length(perspective) between 1 and 32)
);

create index if not exists submissions_topic_id_idx
  on public.submissions (topic_id);

create index if not exists submissions_submitted_at_idx
  on public.submissions (submitted_at desc);

create index if not exists submissions_topic_id_submitted_at_idx
  on public.submissions (topic_id, submitted_at desc);

alter table public.submissions enable row level security;

drop policy if exists "service role full access" on public.submissions;
create policy "service role full access"
  on public.submissions
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "public read submissions" on public.submissions;
create policy "public read submissions"
  on public.submissions
  for select
  using (true);

drop policy if exists "public create submissions" on public.submissions;
create policy "public create submissions"
  on public.submissions
  for insert
  with check (auth.role() in ('anon', 'authenticated', 'service_role'));
