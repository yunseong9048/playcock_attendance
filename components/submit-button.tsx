"use client";
import { useFormStatus } from "react-dom";

export function SubmitButton({ children, className = "primary", pendingText = "처리 중…", disabled = false }: { children: React.ReactNode; className?: string; pendingText?: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return <button className={className} disabled={pending || disabled} type="submit">{pending ? pendingText : children}</button>;
}
