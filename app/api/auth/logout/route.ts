import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Çıkış yapıldı' });
  response.cookies.delete('edupulse_token');
  return response;
}
