create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

grant execute on function public.is_admin() to anon, authenticated, service_role;

drop policy if exists "service role full access topics" on public.topics;
drop policy if exists "admin manage topics" on public.topics;
create policy "admin manage topics"
  on public.topics
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "service role full access submissions" on public.submissions;
drop policy if exists "admin manage submissions" on public.submissions;
create policy "admin manage submissions"
  on public.submissions
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "service role full access submission comments" on public.submission_comments;
drop policy if exists "admin manage submission comments" on public.submission_comments;
create policy "admin manage submission comments"
  on public.submission_comments
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "service role full access submission hearts" on public.submission_hearts;
drop policy if exists "admin manage submission hearts" on public.submission_hearts;
create policy "admin manage submission hearts"
  on public.submission_hearts
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
