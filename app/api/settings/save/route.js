// app/api/settings/save/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { setFlash } from "@/lib/flash";
import { z } from "zod";

const settingsSchema = z.object({
  college_name: z.string().min(1, "College name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  principal_name: z.string().optional(),
  affiliation_no: z.string().optional(),
  college_code: z.string().optional(),
  upi_id: z.string().optional(),
});

async function uploadToCloudinary(file) {
  if (!file || file.size === 0) return null;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", uploadPreset);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: fd },
  );
  const data = await res.json();
  return data.secure_url || null;
}

export async function POST(request) {
  // ─── Auth ──────────────────────────────────────────────────────────────
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }
  const session = await getSession(token);
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  const userResult = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, session.email));
  const user = userResult[0];
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  // ─── Get existing settings ─────────────────────────────────────────────
  const existing = await db
    .select()
    .from(schema.college_settings)
    .where(eq(schema.college_settings.user_id, user.id));
  const current = existing[0] || {};

  // ─── Parse form ────────────────────────────────────────────────────────
  const formData = await request.formData();

  // ─── Handle file uploads (logo and QR code) ────────────────────────────
  const logoFile = formData.get("logo");
  const qrFile = formData.get("qr_code");

  let logo_url = current.logo_url || null;
  let qr_code_url = current.qr_code_url || null;

  const uploadedLogo = await uploadToCloudinary(logoFile);
  if (uploadedLogo) logo_url = uploadedLogo;

  const uploadedQr = await uploadToCloudinary(qrFile);
  if (uploadedQr) qr_code_url = uploadedQr;

  // ─── Validate fields ───────────────────────────────────────────────────
  const raw = {
    college_name: formData.get("college_name"),
    address: formData.get("address") || undefined,
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    principal_name: formData.get("principal_name") || undefined,
    affiliation_no: formData.get("affiliation_no") || undefined,
    college_code: formData.get("college_code") || undefined,
    upi_id: formData.get("upi_id") || undefined,
  };

  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    await setFlash(
      "error",
      "Invalid data: " + JSON.stringify(parsed.error.flatten().fieldErrors),
    );
    return NextResponse.redirect(new URL("/settings", request.url), { status: 303 });
  }

  const data = {
    user_id: user.id,
    ...parsed.data,
    logo_url,
    qr_code_url,
    updated_at: new Date(),
  };

  // ─── UPDATE existing OR INSERT new (idempotent) ────────────────────────
  // Since settings are per-user, retry will always go through UPDATE path
  // after first save — this is naturally retry-safe.
  if (existing.length > 0) {
    await db
      .update(schema.college_settings)
      .set(data)
      .where(eq(schema.college_settings.user_id, user.id));
  } else {
    await db.insert(schema.college_settings).values(data);
  }

  await setFlash("success", "Settings saved successfully!");
  return NextResponse.redirect(new URL("/settings", request.url), { status: 303 });
}