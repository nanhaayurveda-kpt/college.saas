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
  university_name: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  principal_name: z.string().optional(),
  affiliation_no: z.string().optional(),
  college_code: z.string().optional(),
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

  const existing = await db
    .select()
    .from(schema.college_settings)
    .where(eq(schema.college_settings.user_id, 1));
  const current = existing[0] || {};

  const formData = await request.formData();

  // logo upload
  const logoFile = formData.get("logo");
  let logo_url = current.logo_url || null;
  const uploadedLogo = await uploadToCloudinary(logoFile);
  if (uploadedLogo) logo_url = uploadedLogo;

  // signature upload
  const signatureFile = formData.get("signature");
  let signature_url = current.signature_url || null;
  const uploadedSignature = await uploadToCloudinary(signatureFile);
  if (uploadedSignature) signature_url = uploadedSignature;

  const raw = {
    college_name: formData.get("college_name"),
    university_name: formData.get("university_name") || undefined,
    address: formData.get("address") || undefined,
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    principal_name: formData.get("principal_name") || undefined,
    affiliation_no: formData.get("affiliation_no") || undefined,
    college_code: formData.get("college_code") || undefined,
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
    user_id: 1,
    ...parsed.data,
    logo_url,
    signature_url,
    updated_at: new Date(),
  };

  if (existing.length > 0) {
    await db
      .update(schema.college_settings)
      .set(data)
      .where(eq(schema.college_settings.user_id, 1));
  } else {
    await db.insert(schema.college_settings).values(data);
  }

  await setFlash("success", "Settings saved successfully!");
  return NextResponse.redirect(new URL("/settings", request.url), { status: 303 });
}