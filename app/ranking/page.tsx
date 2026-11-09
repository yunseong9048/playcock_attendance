import { RankingTabs } from "@/components/ranking-tabs";
import { currentMonthInSeoul, displayMonth, previousMonthInSeoul } from "@/lib/date";
import { createAdminClient } from "@/lib/supabase";
import type { Ranking } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const currentMonth = currentMonthInSeoul();
  const previousMonth = previousMonthInSeoul();
  let rankings: Ranking[] = [];
  let error = false;
  try {
    const supabase = createAdminClient();
    const { data, error: rankingError } = await supabase
      .from("attendance_rankings")
      .select("id, name, created_at, total_count, month_count, previous_month_count");
    if (rankingError) throw rankingError;
    rankings = (data ?? []) as Ranking[];
  } catch (rankingError) {
    console.error("[RankingPage] 랭킹 조회 실패", rankingError);
    error = true;
  }

  return <div className="space-y-5"><section className="px-1 pt-3"><p className="font-bold text-court-600">함께 만든 기록</p><h1 className="mt-2 text-3xl font-black">출석 랭킹</h1><p className="mt-2 text-slate-600">이번 달, 저번 달, 누적 기록을 기간별로 확인하세요.</p></section><section className="card">{error ? <p className="py-8 text-center text-red-600">랭킹을 불러오지 못했습니다.</p> : rankings.length ? <RankingTabs rankings={rankings} currentMonth={displayMonth(currentMonth)} previousMonth={displayMonth(previousMonth)} /> : <p className="py-8 text-center text-slate-500">등록된 회원이 없습니다.</p>}</section></div>;
}
