-- 칸공인중개사 홈페이지용 Supabase DB 스키마
-- Supabase SQL Editor에서 이 파일 전체를 실행하세요.

create extension if not exists "pgcrypto";

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sort_order integer not null default 0,
  badge text default '추천',
  title text not null,
  short_title text,
  location text,
  landmark text,
  property_type text,
  deal_type text default '월세',
  deposit text,
  rent text,
  management text,
  area text,
  floor text,
  direction text,
  parking text,
  move_in text,
  approval_date text,
  rooms text,
  options text,
  summary text,
  description text,
  image_count integer not null default 15,
  photos jsonb not null default '[]'::jsonb,
  photo_memo jsonb not null default '[]'::jsonb,
  facilities jsonb not null default '[]'::jsonb,
  safety jsonb not null default '[]'::jsonb,
  education jsonb not null default '[]'::jsonb
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_properties_updated_at on public.properties;
create trigger set_properties_updated_at
before update on public.properties
for each row
execute function public.set_updated_at();

-- 프론트에서 직접 DB 접근하지 않고 Vercel API + service role로만 접근합니다.
alter table public.properties enable row level security;

drop policy if exists "no direct anonymous access" on public.properties;
create policy "no direct anonymous access"
on public.properties
for all
using (false)
with check (false);

-- 사진 저장용 public bucket 생성. 이미 있으면 그대로 둡니다.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-photos',
  'property-photos',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 초기 샘플 매물 3개. 필요 없으면 관리자에서 삭제하거나 기본값 초기화를 사용하세요.
insert into public.properties (
  id, sort_order, badge, title, short_title, location, landmark, property_type, deal_type,
  deposit, rent, management, area, floor, direction, parking, move_in, approval_date,
  rooms, options, summary, description, image_count, photos, photo_memo, facilities, safety, education
) values
(
  '11111111-1111-4111-8111-111111111111', 30, '추천 원룸', '구미 인의동 원룸 월세', '인의동 원룸 100/18',
  '경상북도 구미시 인의동', '미래로병원 뒤 / 국가산단 출퇴근 동선', '다가구주택 내 원룸', '월세',
  '100만원', '18만원', '월세 포함', '약 30㎡', '2층 / 총 4층', '동향', '가능', '즉시입주 협의', '계약 전 최종 확인',
  '방 1 / 욕실 1', '에어컨, 냉장고, 세탁기, TV, 침대 등 기본 옵션',
  '저렴한 월세와 관리비 포함 조건을 찾는 직장인·자취생에게 맞는 가성비 원룸입니다.',
  '인의동 생활권과 국가산업단지 출퇴근 동선을 함께 보기 좋은 위치입니다. 보증금 부담이 낮고 월세가 저렴해 처음 자취를 시작하는 분께도 부담이 적습니다.',
  15, '[]'::jsonb,
  '["구미 인의동 원룸 외관 및 주차 공간","구미 인의동 원룸 현관 입구","구미 인의동 원룸 방 전체 구조","구미 인의동 원룸 침대 및 생활 공간","구미 인의동 원룸 수납 공간","구미 인의동 원룸 주방","구미 인의동 원룸 싱크대와 조리 공간","구미 인의동 원룸 냉장고 옵션","구미 인의동 원룸 세탁기 공간","구미 인의동 원룸 욕실","구미 인의동 원룸 창문과 채광","구미 인의동 원룸 내부 마감 상태","구미 인의동 원룸 공용부","구미 인의동 원룸 생활권 지도","칸공인중개사사무소 위치 안내"]'::jsonb,
  '["편의점","병원","식당가","버스정류장","국가산단 통근 동선"]'::jsonb,
  '["중개사 직접 확인","실사진 안내","계약 전 등기 확인","허위매물 없음"]'::jsonb,
  '["인의초 생활권","경운대 이동 가능","직장인·학생 자취 수요"]'::jsonb
),
(
  '22222222-2222-4222-8222-222222222222', 20, '리모델링', '구미 진평동 원룸 월세', '진평동 원룸 300/40',
  '경상북도 구미시 진평동', '강동병원·먹자골목 인근 생활권', '다가구주택 내 원룸', '월세',
  '300만원', '40만원', '월세 포함', '약 28㎡', '2층 / 총 4층', '남향 협의', '가능', '즉시입주 가능', '계약 전 최종 확인',
  '방 1 / 욕실 1', '풀옵션, 리모델링, 침대, TV, 에어컨, 세탁기, 냉장고',
  '진평동 생활권에서 깔끔한 리모델링 원룸을 찾는 분께 추천하는 관리비 포함 매물입니다.',
  '강동병원과 진평동 먹자골목 생활권을 이용하기 좋고, 내부 상태가 깔끔해 바로 생활하기 좋은 원룸입니다.',
  15, '[]'::jsonb,
  '["구미 진평동 원룸 외관","구미 진평동 원룸 현관","구미 진평동 원룸 방 전체","구미 진평동 원룸 침대 공간","구미 진평동 원룸 TV 옵션","구미 진평동 원룸 주방","구미 진평동 원룸 싱크대","구미 진평동 원룸 냉장고","구미 진평동 원룸 세탁 공간","구미 진평동 원룸 욕실","구미 진평동 원룸 창문","구미 진평동 원룸 수납","구미 진평동 원룸 공용부","구미 진평동 원룸 생활권 지도","칸공인중개사 위치 지도"]'::jsonb,
  '["강동병원","다이소","먹자골목","편의점","버스정류장"]'::jsonb,
  '["실사진","직접 확인 매물","계약 전 권리 확인","중개대상물 표시 준수"]'::jsonb,
  '["인동·진평 생활권","통근 수요","자취방 수요"]'::jsonb
),
(
  '33333333-3333-4333-8333-333333333333', 10, '투룸', '구미 인의동 투룸 월세', '인의동 투룸 500/55',
  '경상북도 구미시 인의동', '인동 로데오거리 생활권 / 통근라인', '다가구주택 내 투룸', '월세',
  '500만원', '55만원', '월세 포함 협의', '약 50㎡', '중층 / 총 4층', '남향', '가능', '협의 가능', '계약 전 최종 확인',
  '방 2 / 욕실 1', '에어컨, 세탁기, 냉장고, 주방 분리형',
  '방 2개 구조와 분리형 주방을 원하는 직장인·신혼부부에게 맞는 인의동 투룸 월세입니다.',
  '인의동 생활권과 출퇴근 동선을 함께 보기 좋은 투룸입니다. 원룸보다 넓은 구조를 원하는 분께 적합합니다.',
  15, '[]'::jsonb,
  '["구미 인의동 투룸 외관","구미 인의동 투룸 현관","구미 인의동 투룸 거실","구미 인의동 투룸 큰방","구미 인의동 투룸 작은방","구미 인의동 투룸 주방","구미 인의동 투룸 싱크대","구미 인의동 투룸 욕실","구미 인의동 투룸 세탁 공간","구미 인의동 투룸 수납","구미 인의동 투룸 창문과 채광","구미 인의동 투룸 내부 상태","구미 인의동 투룸 공용부","구미 인의동 투룸 생활권 지도","칸공인중개사 위치 지도"]'::jsonb,
  '["로데오거리","마트","편의점","병원","식당가"]'::jsonb,
  '["중개사 확인","실사진","계약 전 확인","허위매물 없음"]'::jsonb,
  '["인의초 생활권","가족·직장인 수요","인동 생활권"]'::jsonb
)
on conflict (id) do nothing;
