import { currentMonthInSeoul } from "@/lib/date";
import { createAdminClient } from "@/lib/supabase";
import type { Attendance, Member, Ranking } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const month = currentMonthInSeoul();
  let rankings: Ranking[] = [];
  let error = false;
  try {
    const supabase = createAdminClient();
    const [membersResult, attendanceResult] = await Promise.all([supabase.from("members").select("*").order("name"), supabase.from("attendance").select("member_id, attendance_date")]);
    if (membersResult.error || attendanceResult.error) throw membersResult.error ?? attendanceResult.error;
    const attendance = (attendanceResult.data ?? []) as Pick<Attendance, "member_id" | "attendance_date">[];
    rankings = ((membersResult.data ?? []) as Member[]).map((member) => ({ ...member, total_count: attendance.filter((a) => a.member_id === member.id).length, month_count: attendance.filter((a) => a.member_id === member.id && a.attendance_date.startsWith(month)).length })).sort((a, b) => b.total_count - a.total_count || b.month_count - a.month_count || a.name.localeCompare(b.name, "ko"));
  } catch { error = true; }
  return <div className="space-y-5"><section className="px-1 pt-3"><p className="font-bold text-court-600">함께 만든 기록</p><h1 className="mt-2 text-3xl font-black">출석 랭킹</h1><p className="mt-2 text-slate-600">누적 기록과 {Number(month.slice(5))}월 기록을 함께 확인하세요.</p></section><section className="card">{error ? <p className="py-8 text-center text-red-600">랭킹을 불러오지 못했습니다.</p> : rankings.length ? <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-slate-200 text-sm text-slate-500"><th className="px-2 py-3 text-left">순위</th><th className="px-2 py-3 text-left">회원</th><th className="px-2 py-3 text-right">이번 달</th><th className="px-2 py-3 text-right">누적</th></tr></thead><tbody>{rankings.map((member, i) => <tr key={member.id} className="border-b border-slate-100 last:border-0"><td className="px-2 py-4 font-black text-court-600">{i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</td><td className="px-2 py-4 font-bold">{member.name}</td><td className="px-2 py-4 text-right">{member.month_count}회</td><td className="px-2 py-4 text-right font-black">{member.total_count}회</td></tr>)}</tbody></table></div> : <p className="py-8 text-center text-slate-500">등록된 회원이 없습니다.</p>}</section></div>;
}
