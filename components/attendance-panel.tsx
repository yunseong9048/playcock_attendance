"use client";

import { useMemo, useState } from "react";
import { useFormState } from "react-dom";
import { checkAttendance, registerMember, type ActionState } from "@/app/actions";
import type { Member } from "@/lib/types";
import { SubmitButton } from "./submit-button";

const initial: ActionState = { ok: false, message: "" };

export function AttendancePanel({ members, attendedIds }: { members: Member[]; attendedIds: string[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Member | null>(null);
  const [attendanceState, attendanceAction] = useFormState(checkAttendance, initial);
  const [registerState, registerAction] = useFormState(registerMember, initial);
  const normalized = query.trim().replace(/\s+/g, " ");
  const results = useMemo(() => normalized ? members.filter((m) => m.name.toLocaleLowerCase("ko").includes(normalized.toLocaleLowerCase("ko"))).slice(0, 8) : [], [members, normalized]);
  const exact = members.some((m) => m.name.toLocaleLowerCase("ko") === normalized.toLocaleLowerCase("ko"));
  const attended = selected ? attendedIds.includes(selected.id) : false;

  return (
    <section className="card">
      <label className="mb-2 block text-sm font-bold text-slate-700" htmlFor="member-search">내 이름 찾기</label>
      <input id="member-search" className="field text-lg" placeholder="이름을 입력하세요" autoComplete="off" value={query} onChange={(e) => { setQuery(e.target.value); setSelected(null); }} />
      {normalized && !selected && (
        <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {results.map((member) => <button key={member.id} type="button" onClick={() => { setSelected(member); setQuery(member.name); }} className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-court-50"><span className="font-semibold">{member.name}</span>{attendedIds.includes(member.id) && <span className="text-sm font-bold text-court-600">출석 완료</span>}</button>)}
          {!results.length && <p className="px-4 py-3 text-sm text-slate-500">검색 결과가 없습니다.</p>}
        </div>
      )}
      {selected && <div className={`mt-4 rounded-2xl p-4 ${attended ? "bg-court-50 text-court-700" : "bg-slate-50"}`}><p className="font-bold">{selected.name}님</p><p className="mt-1 text-sm">{attended ? "오늘 출석이 완료되었습니다. ✓" : "이 회원으로 오늘 출석할까요?"}</p></div>}
      <form action={attendanceAction} className="mt-4">
        <input type="hidden" name="memberId" value={selected?.id ?? ""} />
        <SubmitButton className="primary w-full text-lg" disabled={!selected || attended}>{attended ? "오늘 출석 완료 ✓" : "출석하기"}</SubmitButton>
      </form>
      {attendanceState.message && <p role="status" className={`mt-3 text-center text-sm font-semibold ${attendanceState.ok ? "text-court-600" : "text-red-600"}`}>{attendanceState.message}</p>}
      {normalized.length >= 2 && !exact && (
        <form action={registerAction} className="mt-5 border-t border-slate-100 pt-5">
          <input type="hidden" name="name" value={normalized} />
          <p className="mb-3 text-sm text-slate-600"><strong>{normalized}</strong> 이름이 없다면 새 회원으로 등록할 수 있어요.</p>
          <SubmitButton className="secondary w-full" pendingText="등록 중…">신규 회원 등록</SubmitButton>
        </form>
      )}
      {registerState.message && <p role="status" className={`mt-3 text-center text-sm font-semibold ${registerState.ok ? "text-court-600" : "text-red-600"}`}>{registerState.message}</p>}
    </section>
  );
}
