import Link from "next/link";
import { redirect } from "next/navigation";
import { adminDeleteAttendance, adminDeleteMember, adminSaveMember, logoutAdmin } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { isAdmin } from "@/lib/admin-auth";
import { displayTime, todayInSeoul } from "@/lib/date";
import { createAdminClient } from "@/lib/supabase";
import type { Attendance, Member } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: { date?: string; edit?: string } }) {
  if (!isAdmin()) redirect("/admin/login");
  const date = /^\d{4}-\d{2}-\d{2}$/.test(searchParams.date ?? "") ? searchParams.date! : todayInSeoul();
  const supabase = createAdminClient();
  const [memberResult, attendanceResult] = await Promise.all([supabase.from("members").select("*").order("name"), supabase.from("attendance").select("*, members(name)").eq("attendance_date", date).order("checked_at")]);
  const members = (memberResult.data ?? []) as Member[];
  const attendance = (attendanceResult.data ?? []) as unknown as Attendance[];
  const editing = members.find((member) => member.id === searchParams.edit);
  return <div className="space-y-5"><section className="flex items-end justify-between px-1 pt-3"><div><p className="font-bold text-court-600">안전한 관리 영역</p><h1 className="mt-2 text-3xl font-black">관리자</h1></div><form action={logoutAdmin}><button className="secondary text-sm">로그아웃</button></form></section><section className="card"><h2 className="mb-4 text-xl font-black">{editing ? "회원 수정" : "회원 추가"}</h2><ActionForm action={adminSaveMember} buttonLabel={editing ? "수정 저장" : "회원 추가"}><input type="hidden" name="id" value={editing?.id ?? ""} /><input className="field" name="name" defaultValue={editing?.name} placeholder="회원 이름" required />{editing && <Link className="ml-3 text-sm font-semibold text-slate-500" href="/admin">취소</Link>}</ActionForm></section><section className="card"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black">회원 목록</h2><span className="text-sm font-bold text-slate-500">{members.length}명</span></div><ul className="divide-y divide-slate-100">{members.map((member) => <li key={member.id} className="flex items-center gap-2 py-3"><span className="flex-1 font-bold">{member.name}</span><Link href={`/admin?edit=${member.id}&date=${date}`} className="secondary min-h-0 px-3 py-2 text-sm">수정</Link><form action={adminDeleteMember}><input type="hidden" name="id" value={member.id} /><button className="rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">삭제</button></form></li>)}</ul></section><section className="card"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black">날짜별 출석</h2><p className="mt-1 text-sm text-slate-500">{attendance.length}명 출석</p></div><form className="flex gap-2"><input className="field py-2" name="date" type="date" defaultValue={date} /><button className="secondary">조회</button></form></div>{attendance.length ? <ul className="divide-y divide-slate-100">{attendance.map((item) => <li key={item.id} className="flex items-center gap-3 py-3"><span className="flex-1 font-bold">{item.members?.name}</span><span className="text-sm text-slate-500">{displayTime(item.checked_at)}</span><form action={adminDeleteAttendance}><input type="hidden" name="id" value={item.id} /><button className="rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">출석 삭제</button></form></li>)}</ul> : <p className="py-8 text-center text-slate-500">이 날짜의 출석 기록이 없습니다.</p>}</section></div>;
}
