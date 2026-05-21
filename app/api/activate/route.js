import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, name, secret } = body;

    const authHeader = request.headers.get("authorization");
    const bearerSecret = authHeader?.replace("Bearer ", "");
    if (
      secret !== process.env.HUB_SECRET &&
      bearerSecret !== process.env.HUB_SECRET
    ) {
      return Response.json({ success: false }, { status: 401 });
    }

    if (!email) {
      return Response.json(
        { success: false, error: "Email required" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail));

    if (existing.length > 0) {
      await db
        .update(users)
        .set({
          status: "active",
          expiry_date: expiry.toISOString(),
          reminder_sent: 0,
        })
        .where(eq(users.email, normalizedEmail));
    } else {
      await db.run(
        sql`INSERT INTO pre_activations (email) VALUES (${normalizedEmail}) ON CONFLICT(email) DO NOTHING`,
      );
    }

    console.log(
      `[ACTIVATE] email=${normalizedEmail} expiry=${expiry.toISOString()}`,
    );
    return Response.json({ success: true });
  } catch (error) {
    console.error("[ACTIVATE ERROR]", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
