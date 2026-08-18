"use client";
import { useFormState } from "react-dom";
import type { ActionState } from "@/app/actions";
import { SubmitButton } from "./submit-button";

export function ActionForm({ action, children, buttonLabel, buttonClass = "primary", pendingText = "처리 중…" }: { action: (state: ActionState, data: FormData) => Promise<ActionState>; children: React.ReactNode; buttonLabel: string; buttonClass?: string; pendingText?: string }) {
  const [state, formAction] = useFormState(action, { ok: false, message: "" });
  return <form action={formAction} className="space-y-3">{children}<SubmitButton className={buttonClass} pendingText={pendingText}>{buttonLabel}</SubmitButton>{state.message && <p className={`text-sm font-semibold ${state.ok ? "text-court-600" : "text-red-600"}`}>{state.message}</p>}</form>;
}
