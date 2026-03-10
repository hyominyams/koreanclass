import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = "padlet-admin";

function getAdminToken() {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SECRET;

  if (!password || !secret) {
    return null;
  }

  return createHmac("sha256", secret).update(password).digest("hex");
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SECRET);
}

export async function isAdminAuthenticated() {
  const expectedToken = getAdminToken();

  if (!expectedToken) {
    return false;
  }

  const cookieStore = await cookies();
  const savedToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!savedToken) {
    return false;
  }

  return safeCompare(savedToken, expectedToken);
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

export async function loginAdmin(password: string) {
  const expectedToken = getAdminToken();
  const configuredPassword = process.env.ADMIN_PASSWORD;

  if (!expectedToken || !configuredPassword) {
    return false;
  }

  if (password !== configuredPassword) {
    return false;
  }

  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, expectedToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return true;
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
