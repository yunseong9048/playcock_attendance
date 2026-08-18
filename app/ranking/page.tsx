import { currentMonthInSeoul } from "@/lib/date";
import { createAdminClient } from "@/lib/supabase";
import type { Ranking } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const month = currentMonthInSeoul();
  let rankings: Ranking[] = [];
  let error = false;
  try {
    const supabase = createAdminClient();
    const { data, error: rankingError } = await supabase
      .from("attendance_rankings")
      .select("id, name, created_at, total_count, month_count")
      .order("total_count", { ascending: false })
      .order("month_count", { ascending: false })
      .order("name", { ascending: true });
    if (rankingError) throw rankingError;
    rankings = (data ?? []) as Ranking[];
  } catch { error = true; }
  return <div className="space-y-5"><section className="px-1 pt-3"><p className="font-bold text-court-600">함께 만든 기록</p><h1 className="mt-2 text-3xl font-black">출석 랭킹</h1><p className="mt-2 text-slate-600">누적 기록과 {Number(month.slice(5))}월 기록을 함께 확인하세요.</p></section><section className="card">{error ? <p className="py-8 text-center text-red-600">랭킹을 불러오지 못했습니다.</p> : rankings.length ? <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-slate-200 text-sm text-slate-500"><th className="px-2 py-3 text-left">순위</th><th className="px-2 py-3 text-left">회원</th><th className="px-2 py-3 text-right">이번 달</th><th className="px-2 py-3 text-right">누적</th></tr></thead><tbody>{rankings.map((member, i) => <tr key={member.id} className="border-b border-slate-100 last:border-0"><td className="px-2 py-4 font-black text-court-600">{i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</td><td className="px-2 py-4 font-bold">{member.name}</td><td className="px-2 py-4 text-right">{member.month_count}회</td><td className="px-2 py-4 text-right font-black">{member.total_count}회</td></tr>)}</tbody></table></div> : <p className="py-8 text-center text-slate-500">등록된 회원이 없습니다.</p>}</section></div>;
}
