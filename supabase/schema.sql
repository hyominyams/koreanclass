create extension if not exists pgcrypto;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

grant execute on function public.is_admin() to anon, authenticated, service_role;

create table if not exists public.topics (
  id text primary key,
  title text not null,
  category text not null,
  prompt text not null,
  summary text not null,
  guiding_question text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists topics_created_at_idx
  on public.topics (created_at asc);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  topic_id text not null references public.topics (id) on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 24),
  grade_class text not null default '6학년 1반' check (char_length(grade_class) between 1 and 32),
  perspective text not null default '학생 의견',
  content text not null check (char_length(content) between 10 and 1200),
  submitted_at timestamptz not null default now()
);

create index if not exists submissions_topic_id_submitted_at_idx
  on public.submissions (topic_id, submitted_at desc);

create index if not exists submissions_submitted_at_idx
  on public.submissions (submitted_at desc);

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

alter table public.topics enable row level security;
alter table public.submissions enable row level security;
alter table public.submission_comments enable row level security;
alter table public.submission_hearts enable row level security;

grant select on public.topics to anon, authenticated;
grant select, insert on public.submissions to anon, authenticated;
grant select, insert on public.submission_comments to anon, authenticated;
grant select, insert on public.submission_hearts to anon, authenticated;

drop policy if exists "admin manage topics" on public.topics;
create policy "admin manage topics"
  on public.topics
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "public read topics" on public.topics;
create policy "public read topics"
  on public.topics
  for select
  using (true);

drop policy if exists "admin manage submissions" on public.submissions;
create policy "admin manage submissions"
  on public.submissions
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

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

drop policy if exists "admin manage submission comments" on public.submission_comments;
create policy "admin manage submission comments"
  on public.submission_comments
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

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

drop policy if exists "admin manage submission hearts" on public.submission_hearts;
create policy "admin manage submission hearts"
  on public.submission_hearts
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

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

insert into public.topics (
  id,
  title,
  category,
  prompt,
  summary,
  guiding_question,
  tags
)
values (
  'example-topic',
  '[예시] 새 주제를 추가해 보세요',
  '예시',
  '교사 계정에서 새 주제를 등록하면 이 보드 왼쪽 사이드바에 주제가 추가되고 학생들은 같은 화면에서 글을 공유할 수 있습니다.',
  '교사가 실제 수업 주제를 추가하기 전까지 보여 주는 기본 예시 주제입니다.',
  '학생들이 부담 없이 첫 글을 시작할 수 있도록 어떤 질문으로 열어 주면 좋을까요?',
  array['예시', '공유 보드']
)
on conflict (id) do update
set
  title = excluded.title,
  category = excluded.category,
  prompt = excluded.prompt,
  summary = excluded.summary,
  guiding_question = excluded.guiding_question,
  tags = excluded.tags;
