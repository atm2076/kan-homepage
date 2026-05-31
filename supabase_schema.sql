-- 칸공인중개사 홈페이지 매물 저장용 테이블
create extension if not exists pgcrypto;

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  headline text default '',
  price text not null,
  deposit integer default 0,
  monthly integer default 0,
  manage_fee text default '관리비 포함',
  area text default '',
  location text default '',
  summary text default '',
  type text default '',
  status text default '즉시입주 협의',
  tags text[] default '{}',
  photos text[] default '{}',
  facilities text[] default '{}',
  safety text[] default '{}',
  education text[] default '{}',
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.listings enable row level security;

-- 누구나 홈페이지에서 매물을 볼 수 있게 허용
create policy "Public can read listings"
on public.listings for select
to anon, authenticated
using (true);

-- 임시 관리자 화면에서 등록/삭제/수정 가능하게 허용
-- 실제 운영 전에는 서버 로그인 또는 Supabase Auth 기반 정책으로 바꾸는 것이 안전합니다.
create policy "Temporary public insert listings"
on public.listings for insert
to anon, authenticated
with check (true);

create policy "Temporary public update listings"
on public.listings for update
to anon, authenticated
using (true)
with check (true);

create policy "Temporary public delete listings"
on public.listings for delete
to anon, authenticated
using (true);
