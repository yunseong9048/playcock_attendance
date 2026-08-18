import { redirect } from "next/navigation";
import { loginAdmin } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { isAdmin } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  if (isAdmin()) redirect("/admin");
  return <div className="mx-auto max-w-md pt-16"><section className="card"><p className="font-bold text-court-600">관리자 전용</p><h1 className="mt-2 text-2xl font-black">관리자 로그인</h1><p className="mb-6 mt-2 text-sm text-slate-600">환경변수에 설정한 관리자 비밀번호를 입력하세요.</p><ActionForm action={loginAdmin} buttonLabel="로그인" buttonClass="primary w-full"><label className="block text-sm font-bold" htmlFor="password">비밀번호</label><input className="field" id="password" name="password" type="password" required autoFocus /></ActionForm></section></div>;
}
