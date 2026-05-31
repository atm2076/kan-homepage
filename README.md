# 칸공인중개사 홈페이지 - Vercel 배포용

## 현재 구성
- React + Vite + Tailwind
- 모바일 반응형 홈페이지
- 매물 검색 / 지역 필터 / 매물 종류 필터
- 매물 상세보기 / 사진 / 지도 영역 / 편의시설·안전시설·교육시설 펼침
- 전화상담 / 매물의뢰 / 상담신청
- 우측 하단 관리자 잠금장치
- 관리자 비밀번호 기본값: 3883
- Supabase 연결 시 PC·휴대폰·다른 컴퓨터에서 같은 매물 공유
- Supabase 미연결 시 해당 브라우저 localStorage에만 저장

## Vercel 배포 순서
1. GitHub에 이 폴더 전체 업로드
2. Vercel에서 Import Project
3. Framework Preset은 Vite 선택
4. Environment Variables에 아래 3개 입력
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_ADMIN_PASSWORD
5. Deploy 클릭

## Supabase SQL
`supabase_schema.sql` 파일 내용을 Supabase SQL Editor에 붙여넣고 실행하세요.

## 중요
현재 관리자 비밀번호 방식은 임시 운영용입니다. 실제 서비스가 커지면 Supabase Auth 또는 서버 로그인으로 바꾸는 것이 안전합니다.
