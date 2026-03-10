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
