alter table public.submissions
  add column if not exists grade_class text not null default '6학년 1반';

update public.submissions
set grade_class = '6학년 1반'
where grade_class is null or btrim(grade_class) = '';

create table if not exists public.submission_comments (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions (id) on delete cascade,
  commenter_name text not null check (char_length(commenter_name) between 1 and 24),
  commenter_grade_class text not null default '6학년 1반' check (char_length(commenter_grade_class) between 1 and 32),
  content text not null check (char_length(content) between 2 and 300),
  created_at timestamptz not null default now()
);

create index if not exists submission_comments_submission_id_created_at_idx
  on public.submission_comments (submission_id, created_at asc);

create table if not exists public.submission_hearts (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists submission_hearts_submission_id_created_at_idx
  on public.submission_hearts (submission_id, created_at desc);

alter table public.submissions enable row level security;
alter table public.submission_comments enable row level security;
alter table public.submission_hearts enable row level security;

grant select, insert on public.submissions to anon, authenticated;
grant select, insert on public.submission_comments to anon, authenticated;
grant select, insert on public.submission_hearts to anon, authenticated;

drop policy if exists "service role full access submissions" on public.submissions;
create policy "service role full access submissions"
  on public.submissions
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "public read submissions" on public.submissions;
create policy "public read submissions"
  on public.submissions
  for select
  using (true);

drop policy if exists "public insert submissions" on public.submissions;
create policy "public insert submissions"
  on public.submissions
  for insert
  with check (true);

drop policy if exists "service role full access submission comments" on public.submission_comments;
create policy "service role full access submission comments"
  on public.submission_comments
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "public read submission comments" on public.submission_comments;
create policy "public read submission comments"
  on public.submission_comments
  for select
  using (true);

drop policy if exists "public insert submission comments" on public.submission_comments;
create policy "public insert submission comments"
  on public.submission_comments
  for insert
  with check (true);

drop policy if exists "service role full access submission hearts" on public.submission_hearts;
create policy "service role full access submission hearts"
  on public.submission_hearts
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "public read submission hearts" on public.submission_hearts;
create policy "public read submission hearts"
  on public.submission_hearts
  for select
  using (true);

drop policy if exists "public insert submission hearts" on public.submission_hearts;
create policy "public insert submission hearts"
  on public.submission_hearts
  for insert
  with check (true);
