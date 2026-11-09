"use client";

import { useMemo, useState } from "react";
import type { Ranking } from "@/lib/types";

type RankingPeriod = "current" | "previous" | "total";

const countKeys: Record<RankingPeriod, keyof Pick<Ranking, "month_count" | "previous_month_count" | "total_count">> = {
  current: "month_count",
  previous: "previous_month_count",
  total: "total_count"
};

export function RankingTabs({ rankings, currentMonth, previousMonth }: { rankings: Ranking[]; currentMonth: string; previousMonth: string }) {
  const [period, setPeriod] = useState<RankingPeriod>("current");
  const countKey = countKeys[period];
  const sortedRankings = useMemo(
    () => [...rankings].sort((a, b) => b[countKey] - a[countKey] || b.total_count - a.total_count || a.name.localeCompare(b.name, "ko")),
    [rankings, countKey]
  );
  const tabs: Array<{ id: RankingPeriod; label: string }> = [
    { id: "current", label: "이번 달" },
    { id: "previous", label: "저번 달" },
    { id: "total", label: "누적" }
  ];
  const periodLabel = period === "current" ? currentMonth : period === "previous" ? previousMonth : "전체 누적";

  return (
    <>
      <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1.5" role="tablist" aria-label="랭킹 기간">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" role="tab" aria-selected={period === tab.id} onClick={() => setPeriod(tab.id)} className={`rounded-xl px-3 py-2.5 text-sm font-bold transition ${period === tab.id ? "bg-white text-court-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {tab.label}
          </button>
        ))}
      </div>
      <p className="mb-2 text-sm font-bold text-slate-500">{periodLabel} 출석 순위</p>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b border-slate-200 text-sm text-slate-500"><th className="px-2 py-3 text-left">순위</th><th className="px-2 py-3 text-left">회원</th><th className="px-2 py-3 text-right">출석 횟수</th></tr></thead>
          <tbody>{sortedRankings.map((member, index) => <tr key={member.id} className="border-b border-slate-100 last:border-0"><td className="px-2 py-4 font-black text-court-600">{index < 3 ? ["🥇", "🥈", "🥉"][index] : index + 1}</td><td className="px-2 py-4 font-bold">{member.name}</td><td className="px-2 py-4 text-right font-black">{member[countKey]}회</td></tr>)}</tbody>
        </table>
      </div>
    </>
  );
}
