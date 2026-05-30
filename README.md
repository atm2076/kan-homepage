# 칸공인중개사 홈페이지 완성본 - Vercel + Supabase 운영용

이 프로젝트는 구미 칸공인중개사 홈페이지 운영용 완성본입니다.

## 기능

- 손님용 메인 화면
- 매물 카드 목록
- 매물 검색 / 필터
- 매물 상세페이지
- 관리자 로그인
- 매물 등록 / 수정 / 삭제
- 매물 사진 업로드
- 사진 설명 저장
- Supabase DB 저장
- Supabase Storage 사진 저장
- 백업 내보내기 / 불러오기
- 전화 / 문자 / 블로그 / 지도 연결

## 배포 설정

```txt
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

## 환경변수

```env
SUPABASE_URL=Supabase Project URL
SUPABASE_SERVICE_ROLE_KEY=Supabase service_role key
ADMIN_PASSWORD=3883
SUPABASE_STORAGE_BUCKET=property-photos
```

## Supabase 준비

Supabase SQL Editor에서 `supabase-schema.sql` 전체를 실행하세요.

## 사용

배포 후 홈페이지 오른쪽 아래 `관리자` 버튼을 누르고 비밀번호를 입력하면 매물 등록, 수정, 삭제, 사진 업로드가 가능합니다.
