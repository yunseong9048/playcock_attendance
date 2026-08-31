"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { clearAdminSession, createAdminSession, isAdmin, isValidAdminPassword } from "@/lib/admin-auth";
import { todayInSeoul } from "@/lib/date";
import { createAdminClient } from "@/lib/supabase";

export type ActionState = { ok: boolean; message: string };
const nameSchema = z.string().transform((value) => value.trim().replace(/\s+/g, " ")).pipe(z.string().min(2, "이름은 2자 이상 입력해 주세요.").max(30, "이름은 30자 이하로 입력해 주세요."));

function errorMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  if (code === "23505") return "이미 등록된 이름이거나 오늘 출석을 완료했습니다.";
  if (code === "23503") return "연결된 출석 기록이 있어 회원을 삭제할 수 없습니다.";
  return "처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
}

export async function registerMember(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = nameSchema.safeParse(formData.get("name"));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("members").insert({ name: parsed.data });
    if (error) return { ok: false, message: errorMessage(error) };
    revalidatePath("/"); revalidatePath("/ranking");
    return { ok: true, message: `${parsed.data} 회원을 등록했습니다. 검색 후 출석해 주세요.` };
  } catch (error) { return { ok: false, message: errorMessage(error) }; }
}

export async function checkAttendance(_: ActionState, formData: FormData): Promise<ActionState> {
  const memberId = z.string().uuid().safeParse(formData.get("memberId"));
  if (!memberId.success) return { ok: false, message: "회원을 먼저 선택해 주세요." };
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("attendance").insert({ member_id: memberId.data, attendance_date: todayInSeoul(), checked_at: new Date().toISOString() });
    if (error?.code === "23505") return { ok: true, message: "오늘 이미 출석을 완료했어요." };
    if (error) return { ok: false, message: errorMessage(error) };
    revalidatePath("/"); revalidatePath("/ranking"); revalidatePath("/admin");
    return { ok: true, message: "출석 완료! 오늘도 즐겁게 운동하세요." };
  } catch (error) { return { ok: false, message: errorMessage(error) }; }
}

export async function cancelAttendance(_: ActionState, formData: FormData): Promise<ActionState> {
  const memberId = z.string().uuid().safeParse(formData.get("memberId"));
  if (!memberId.success) return { ok: false, message: "회원을 먼저 선택해 주세요." };

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("attendance")
      .delete()
      .eq("member_id", memberId.data)
      .eq("attendance_date", todayInSeoul())
      .select("id");

    if (error) return { ok: false, message: errorMessage(error) };
    if (!data?.length) return { ok: true, message: "취소할 오늘 출석 기록이 없습니다." };

    revalidatePath("/"); revalidatePath("/ranking"); revalidatePath("/admin");
    return { ok: true, message: "오늘 출석을 취소했습니다." };
  } catch (error) {
    return { ok: false, message: errorMessage(error) };
  }
}

export async function loginAdmin(_: ActionState, formData: FormData): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  if (!isValidAdminPassword(password)) return { ok: false, message: "비밀번호가 올바르지 않습니다." };
  createAdminSession();
  redirect("/admin");
}

export async function logoutAdmin() { clearAdminSession(); redirect("/admin/login"); }

async function requireAdmin() { if (!isAdmin()) throw new Error("Unauthorized"); }

export async function adminSaveMember(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = nameSchema.safeParse(formData.get("name"));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const id = String(formData.get("id") ?? "");
  const supabase = createAdminClient();
  const result = id ? await supabase.from("members").update({ name: parsed.data }).eq("id", id) : await supabase.from("members").insert({ name: parsed.data });
  if (result.error) return { ok: false, message: errorMessage(result.error) };
  revalidatePath("/"); revalidatePath("/ranking"); revalidatePath("/admin");
  return { ok: true, message: id ? "회원 이름을 수정했습니다." : "회원을 추가했습니다." };
}

export async function adminDeleteMember(formData: FormData) {
  await requireAdmin();
  const id = z.string().uuid().parse(formData.get("id"));
  await createAdminClient().from("members").delete().eq("id", id);
  revalidatePath("/"); revalidatePath("/ranking"); revalidatePath("/admin");
}

export async function adminDeleteAttendance(formData: FormData) {
  await requireAdmin();
  const id = z.string().uuid().parse(formData.get("id"));
  await createAdminClient().from("attendance").delete().eq("id", id);
  revalidatePath("/"); revalidatePath("/ranking"); revalidatePath("/admin");
}
