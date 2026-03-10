alter table public.submissions
  add column if not exists author_secret_hash text not null default '';

alter table public.submissions
  drop constraint if exists submissions_author_secret_hash_check;

alter table public.submissions
  add constraint submissions_author_secret_hash_check
  check (
    author_secret_hash = '' or author_secret_hash ~ '^[0-9a-f]{64}$'
  );

revoke all on public.submissions from anon, authenticated;

grant select (
  id,
  topic_id,
  author_name,
  grade_class,
  perspective,
  content,
  submitted_at
) on public.submissions to anon, authenticated;

grant insert (
  topic_id,
  author_name,
  grade_class,
  author_secret_hash,
  perspective,
  content
) on public.submissions to anon, authenticated;
