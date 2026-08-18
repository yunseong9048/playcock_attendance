export type Member = { id: string; name: string; created_at: string };
export type Attendance = { id: string; member_id: string; attendance_date: string; checked_at: string; created_at: string; members?: { name: string } | null };
export type Ranking = Member & { total_count: number; month_count: number };
