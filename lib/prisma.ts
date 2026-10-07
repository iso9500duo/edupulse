import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Vercel serverless environment SQLite write-support
if (process.env.VERCEL && process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('file:')) {
  const dbName = 'dev.db';
  const sourcePath = path.join(process.cwd(), dbName);
  const targetPath = path.join('/tmp', dbName);
  try {
    if (!fs.existsSync(targetPath) && fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
    }
    process.env.DATABASE_URL = `file:${targetPath}`;
  } catch (err) {
    console.warn('Vercel SQLite tmp copy note:', err);
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
