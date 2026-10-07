import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'edupulse-super-secret-jwt-key-2026';
const TOKEN_COOKIE = 'edupulse_token';

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  plan: string;
}

export function signToken(payload: AuthSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthSession;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<AuthSession | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(TOKEN_COOKIE)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<AuthSession> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Yetkisiz erişim. Lütfen giriş yapınız.');
  }
  return user;
}

export async function requireRole(allowedRoles: string[]): Promise<AuthSession> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Bu işlem için yetkiniz bulunmamaktadır.');
  }
  return user;
}
