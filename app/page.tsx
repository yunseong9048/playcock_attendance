import Image from "next/image";
import { AttendancePanel } from "@/components/attendance-panel";
import { displayDate, displayTime, todayInSeoul } from "@/lib/date";
import { createAdminClient } from "@/lib/supabase";
import type { Attendance, Member } from "@/lib/types";

export const dynamic = "force-dynamic";

const READ_RETRY_DELAY_MS = 400;

function logReadError(query: string, attempt: number, error: unknown) {
  const details = typeof error === "object" && error !== null
    ? {
        code: "code" in error ? String(error.code) : undefined,
        message: "message" in error ? String(error.message) : "알 수 없는 오류",
        details: "details" in error ? String(error.details) : undefined,
        hint: "hint" in error ? String(error.hint) : undefined
      }
    : { message: String(error) };

  console.error(`[HomePage] ${query} 조회 실패 (${attempt}/2)`, details);
}

async function loadHomeData(today: string) {
  let lastError: unknown = new Error("Supabase 데이터를 불러오지 못했습니다.");

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const supabase = createAdminClient();
      const [memberResult, attendanceResult] = await Promise.all([
        supabase.from("members").select("*").order("name"),
        supabase.from("attendance").select("*, members(name)").eq("attendance_date", today).order("checked_at", { ascending: false })
      ]);

      if (!memberResult.error && !attendanceResult.error) {
        return { members: memberResult.data ?? [], attendance: attendanceResult.data ?? [] };
      }

      if (memberResult.error) logReadError("members", attempt, memberResult.error);
      if (attendanceResult.error) logReadError("attendance", attempt, attendanceResult.error);
      lastError = memberResult.error ?? attendanceResult.error;
    } catch (error) {
      lastError = error;
      logReadError("네트워크 또는 클라이언트", attempt, error);
    }

    if (attempt === 1) {
      await new Promise((resolve) => setTimeout(resolve, READ_RETRY_DELAY_MS));
    }
  }

  throw lastError;
}

export default async function HomePage() {
  const today = todayInSeoul();
  let members: Member[] = [];
  let attendance: Attendance[] = [];
  let loadError = false;
  try {
    const data = await loadHomeData(today);
    members = data.members;
    attendance = data.attendance as unknown as Attendance[];
  } catch {
    loadError = true;
  }

  return (
    <div className="space-y-5">
      <section className="px-1 pb-2 pt-3">
        <div className="flex items-center gap-4 sm:gap-6">
          <Image
            src="/playcock_image.png"
            alt="같이 즐기고 대신 플레이콕 동호회 로고"
            width={128}
            height={124}
            className="h-24 w-24 shrink-0 rounded-3xl border border-white bg-white object-cover shadow-card sm:h-32 sm:w-32"
            priority
          />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-court-600">{displayDate(today)}</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">오늘도 반가워요!</h1>
            <p className="mt-2 text-slate-600">이름을 찾아 간편하게 출석해 주세요.</p>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <div className="shrink-0 rounded-2xl bg-ink px-5 py-3 text-center text-white"><span className="block text-2xl font-black">{attendance.length}</span><span className="text-xs text-white/70">오늘 출석</span></div>
        </div>
      </section>
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-card" aria-labelledby="payment-notice-title">
        <p id="payment-notice-title" className="text-lg font-black text-amber-950">출석 후 콕 제출과 입금확인!</p>
        <div className="mt-3 rounded-2xl bg-white/80 px-4 py-3">
          <p className="text-lg font-black tracking-tight text-ink">카카오뱅크 3333-30-6012841</p>
          <p className="mt-1 text-sm font-bold text-slate-600">예금주: 김영근</p>
        </div>
      </section>
      {loadError ? <div className="card border-red-100 text-center text-red-700">데이터를 불러오지 못했습니다. 새로고침 해주세요</div> : <AttendancePanel members={members} attendedIds={attendance.map((item) => item.member_id)} />}
      <section className="card">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black">오늘의 출석자</h2><span className="rounded-full bg-court-100 px-3 py-1 text-sm font-bold text-court-700">{attendance.length}명</span></div>
        {attendance.length ? <ul className="divide-y divide-slate-100">{attendance.map((item, index) => <li key={item.id} className="flex items-center gap-3 py-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-court-50 text-sm font-black text-court-600">{index + 1}</span><span className="flex-1 font-bold">{item.members?.name ?? "알 수 없는 회원"}</span><time className="text-sm text-slate-500">{displayTime(item.checked_at)}</time></li>)}</ul> : <div className="py-8 text-center text-slate-500"><p className="text-3xl">🏸</p><p className="mt-2">아직 출석한 회원이 없어요.</p></div>}
      </section>
    </div>
  );
}
