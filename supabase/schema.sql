-- Supabase SQL Editor에서 한 번 실행하세요.
create extension if not exists pgcrypto;

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 30),
  attendance_count integer not null default 0 check (attendance_count >= 0),
  created_at timestamptz not null default now()
);

-- 이미 members 테이블을 만든 프로젝트에 누적 출석 컬럼을 추가합니다.
alter table public.members
  add column if not exists attendance_count integer not null default 0;

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

-- 기존 출석 기록을 기준으로 누적 횟수를 한 번 보정합니다.
update public.members m
set attendance_count = (
  select count(*)::integer
  from public.attendance a
  where a.member_id = m.id
);

-- 출석 추가/삭제와 members.attendance_count를 항상 같은 트랜잭션에서 동기화합니다.
create or replace function public.sync_member_attendance_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.members
    set attendance_count = attendance_count + 1
    where id = new.member_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.members
    set attendance_count = greatest(attendance_count - 1, 0)
    where id = old.member_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists attendance_count_sync on public.attendance;
create trigger attendance_count_sync
after insert or delete on public.attendance
for each row execute function public.sync_member_attendance_count();

-- 누적 횟수는 members 컬럼에서, 이번 달과 저번 달 횟수는 PostgreSQL에서 집계합니다.
create or replace view public.attendance_rankings
with (security_invoker = true) as
select
  m.id,
  m.name,
  m.created_at,
  m.attendance_count as total_count,
  count(a.id) filter (
    where a.attendance_date >= date_trunc('month', timezone('Asia/Seoul', now()))::date
      and a.attendance_date < (date_trunc('month', timezone('Asia/Seoul', now())) + interval '1 month')::date
  )::integer as month_count,
  count(a.id) filter (
    where a.attendance_date >= (date_trunc('month', timezone('Asia/Seoul', now())) - interval '1 month')::date
      and a.attendance_date < date_trunc('month', timezone('Asia/Seoul', now()))::date
  )::integer as previous_month_count
from public.members m
left join public.attendance a on a.member_id = m.id
group by m.id, m.name, m.created_at, m.attendance_count;

alter table public.members enable row level security;
alter table public.attendance enable row level security;

-- 변경된 View 컬럼을 Supabase REST API가 즉시 인식하도록 스키마 캐시를 갱신합니다.
notify pgrst, 'reload schema';

-- 브라우저에는 service role key를 노출하지 않습니다.
-- 앱의 모든 DB 작업은 Next.js 서버에서 service role로 수행됩니다.
-- service_role은 RLS를 우회하므로 anon/authenticated 정책은 의도적으로 만들지 않습니다.
