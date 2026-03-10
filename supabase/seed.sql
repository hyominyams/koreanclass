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
  '교사 계정에서 새 주제를 등록하면 학생 화면 왼쪽 사이드바에 실제 수업 주제가 바로 나타납니다.',
  '교사가 실제 수업용 주제를 추가하기 전까지 보여 주는 기본 예시 카드입니다.',
  '학생이 부담 없이 생각을 시작할 수 있도록 어떤 질문으로 열어 주면 좋을까요?',
  array['예시', '관리자 추가']
)
on conflict (id) do update
set
  title = excluded.title,
  category = excluded.category,
  prompt = excluded.prompt,
  summary = excluded.summary,
  guiding_question = excluded.guiding_question,
  tags = excluded.tags;
