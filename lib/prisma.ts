import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Vercel serverless environment SQLite write-support
if (process.env.VERCEL) {
  const dbName = 'dev.db';
  const targetPath = path.join('/tmp', dbName);

  const candidateSources = [
    path.join(process.cwd(), 'prisma', dbName),
    path.join(process.cwd(), dbName),
    path.join(__dirname, '..', 'prisma', dbName),
    path.join(__dirname, 'prisma', dbName),
    path.join(process.cwd(), '.next', 'server', 'prisma', dbName)
  ];

  if (!fs.existsSync(targetPath) || fs.statSync(targetPath).size === 0) {
    for (const src of candidateSources) {
      try {
        if (fs.existsSync(src) && fs.statSync(src).size > 0) {
          fs.copyFileSync(src, targetPath);
          console.log(`[EduPulse] Copied SQLite database from ${src} to ${targetPath} (${fs.statSync(targetPath).size} bytes)`);
          break;
        }
      } catch (err) {
        console.warn(`[EduPulse] Error copying from ${src}:`, err);
      }
    }
  }

  if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 0) {
    process.env.DATABASE_URL = `file:${targetPath}`;
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
