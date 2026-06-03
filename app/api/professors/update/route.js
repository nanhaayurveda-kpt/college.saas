// app/api/professors/update/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { eq, and, ne } from "drizzle-orm";
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
  // ─── Auth ──────────────────────────────────────────────────────────────
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url), {
      status: 303,
    });
  }
  const session = await getSession(token);
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url), {
      status: 303,
    });
  }

  const userResult = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, session.email));
  const user = userResult[0];
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), {
      status: 303,
    });
  }

  // ─── Parse form ────────────────────────────────────────────────────────
  const formData = await request.formData();
  const idRaw = formData.get("id");
  const id = parseInt(idRaw, 10);
  if (isNaN(id)) {
    await setFlash("error", "Invalid professor id");
    return NextResponse.redirect(new URL("/professors", request.url), {
      status: 303,
    });
  }

  // ─── Ownership check ───────────────────────────────────────────────────
  const professorCheck = await db
    .select()
    .from(schema.professors)
    .where(and(eq(schema.professors.id, id), eq(schema.professors.user_id, 1)));
  if (!professorCheck.length) {
    return NextResponse.redirect(new URL("/professors", request.url), {
      status: 303,
    });
  }

  const name = formData.get("name");
  const qualification = formData.get("qualification") || null;
  const phone = formData.get("phone") || null;
  const email = formData.get("email") || null;
  const pin = formData.get("pin") || null;
  const current = professorCheck[0];

  const photo_url = formData.get("photo_url") || current.photo_url || null;
  // PIN duplicate check (PIN is globally unique)
  if (pin) {
    const pinConflict = await db
      .select()
      .from(schema.professors)
      .where(and(eq(schema.professors.pin, pin), ne(schema.professors.id, id)));
    if (pinConflict.length > 0) {
      await setFlash(
        "error",
        "This PIN is already assigned to another professor.",
      );
      return NextResponse.redirect(
        new URL(`/professors/${id}/edit`, request.url),
        { status: 303 },
      );
    }
  }

  if (!name) {
    await setFlash("error", "Name is required");
    return NextResponse.redirect(
      new URL(`/professors/${id}/edit`, request.url),
      {
        status: 303,
      },
    );
  }

  // ─── Duplicate check: same name + phone (excluding self) ───────────────
  if (phone) {
    const conditions = [
      eq(schema.professors.user_id, 1),
      eq(schema.professors.name, name),
      eq(schema.professors.phone, phone),
      ne(schema.professors.id, id),
    ];
    const conflict = await db
      .select()
      .from(schema.professors)
      .where(and(...conditions));
    if (conflict.length > 0) {
      await setFlash(
        "error",
        `Another professor named ${name} with phone ${phone} already exists.`,
      );
      return NextResponse.redirect(
        new URL(`/professors/${id}/edit`, request.url),
        { status: 303 },
      );
    }
  }

  // ─── Update ────────────────────────────────────────────────────────────
  await db
    .update(schema.professors)
    .set({
      name,
      qualification,
      phone,
      email,
      pin,
      photo_url,
    })
    .where(and(eq(schema.professors.id, id), eq(schema.professors.user_id, 1)));

  await setFlash("success", "Professor updated successfully!");
  return NextResponse.redirect(new URL(`/professors/${id}`, request.url), {
    status: 303,
  });
}
