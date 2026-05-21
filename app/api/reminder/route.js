import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fees } from "@/lib/schema";
import { eq, and, lt } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // ── Fee overdue auto-set ──────────────────────────────────
    await db.update(fees).set({ status: "overdue" })
      .where(and(eq(fees.status, "pending"), lt(fees.due_date, now)));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}