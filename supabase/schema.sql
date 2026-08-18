-- Supabase SQL Editor에서 한 번 실행하세요.
create extension if not exists pgcrypto;

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 30),
  created_at timestamptz not null default now()
);

-- 대소문자와 앞뒤 공백이 다른 동일 이름도 중복으로 처리합니다.
create unique index if not exists members_normalized_name_unique
  on public.members (lower(trim(name)));

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  attendance_date date not null,
  checked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint attendance_member_date_unique unique (member_id, attendance_date)
);

create index if not exists attendance_date_idx on public.attendance (attendance_date desc);
create index if not exists attendance_member_idx on public.attendance (member_id);

alter table public.members enable row level security;
alter table public.attendance enable row level security;

-- 브라우저에는 service role key를 노출하지 않습니다.
-- 앱의 모든 DB 작업은 Next.js 서버에서 service role로 수행됩니다.
-- service_role은 RLS를 우회하므로 anon/authenticated 정책은 의도적으로 만들지 않습니다.
