import { NextResponse } from "next/server";

export async function GET(request) {
  const response = NextResponse.redirect(new URL("/professor-login", request.url));
  response.cookies.delete("professor_session");
  return response;
}