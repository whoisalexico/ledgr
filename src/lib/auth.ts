"use server";

import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { getCookie, setCookie, deleteCookie } from "vinxi/http";

const SALT_ROUNDS = 12;
const SESSION_COOKIE = "ledgr_session";
// 30 дней
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

// ─── Пароль ──────────────────────────────────────────────────────────────────

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ─── Сессия ──────────────────────────────────────────────────────────────────

/** Создаёт сессию в БД и устанавливает httpOnly cookie */
export async function createSession(userId: string): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  const session = await prisma.session.create({
    data: { userId, expiresAt },
  });

  setCookie(SESSION_COOKIE, session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return session.token;
}

/** Читает текущего пользователя из cookie → БД. Возвращает null если нет/истёк */
export async function getCurrentUser() {
  let token: string | undefined;

  try {
    token = getCookie(SESSION_COOKIE);
  } catch {
    return null;
  }

  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  return session.user;
}

/** Удаляет сессию из БД и сбрасывает cookie */
export async function destroySession(): Promise<void> {
  let token: string | undefined;

  try {
    token = getCookie(SESSION_COOKIE);
  } catch {
    return;
  }

  if (token) {
    await prisma.session.delete({ where: { token } }).catch(() => {
      /* уже удалена */
    });
  }

  deleteCookie(SESSION_COOKIE, { path: "/" });
}
