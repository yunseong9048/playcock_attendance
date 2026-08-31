"use client";

import { useFormState } from "react-dom";
import { cancelAttendance, type ActionState } from "@/app/actions";
import { SubmitButton } from "./submit-button";

const initial: ActionState = { ok: false, message: "" };

export function AttendanceCancelButton({ memberId, memberName }: { memberId: string; memberName: string }) {
  const [state, formAction] = useFormState(cancelAttendance, initial);

  return (
    <div className="text-right">
      <form
        action={formAction}
        onSubmit={(event) => {
          if (!window.confirm(`${memberName}님의 오늘 출석을 취소할까요?`)) event.preventDefault();
        }}
      >
        <input type="hidden" name="memberId" value={memberId} />
        <SubmitButton
          className="inline-flex min-h-0 items-center justify-center rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:bg-slate-100"
          pendingText="취소 중…"
        >
          출석 취소
        </SubmitButton>
      </form>
      {state.message && !state.ok && <p role="status" className="mt-1 text-xs font-semibold text-red-600">{state.message}</p>}
    </div>
  );
}
