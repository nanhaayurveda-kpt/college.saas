// app/api/professors/add/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { setFlash } from "@/lib/flash";

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

  const formData = await request.formData();
  const name = formData.get("name");
  const qualification = formData.get("qualification") || null;
  const phone = formData.get("phone") || null;
  const email = formData.get("email") || null;
  const pin = formData.get("pin");

  if (!name || !pin) {
    await setFlash("error", "Name and PIN are required");
    return NextResponse.redirect(new URL("/professors/add", request.url), { status: 303 });
  }

  const pinCheck = await db
    .select({ id: schema.professors.id, name: schema.professors.name })
    .from(schema.professors)
    .where(eq(schema.professors.pin, pin));
  if (pinCheck.length > 0) {
    await setFlash("error", `PIN ${pin} is already in use. Please choose a different PIN.`);
    return NextResponse.redirect(new URL("/professors/add", request.url), { status: 303 });
  }

  if (phone) {
    const conditions = [
      eq(schema.professors.user_id, 1),
      eq(schema.professors.name, name),
      eq(schema.professors.phone, phone),
    ];
    const existing = await db
      .select()
      .from(schema.professors)
      .where(and(...conditions));
    if (existing.length > 0) {
      await setFlash("error", `Professor ${name} with phone ${phone} already exists.`);
      return NextResponse.redirect(new URL("/professors/add", request.url), { status: 303 });
    }
  }

  const photoFile = formData.get("photo");
  const photo_url = await uploadToCloudinary(photoFile);

  await db.insert(schema.professors).values({
    name,
    qualification,
    phone,
    email,
    pin,
    photo_url,
    user_id: 1,
  });

  await setFlash("success", "Professor added successfully!");
  return NextResponse.redirect(new URL("/professors", request.url), { status: 303 });
}