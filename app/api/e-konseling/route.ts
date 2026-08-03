import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await prisma.eKonseling.create({
      data: {
        id: crypto.randomUUID(),
        namaPasien: body.namaPasien,
        jenisKelamin: body.jenisKelamin,
        tglLahir: body.tglLahir ? new Date(body.tglLahir) : null,
        tglKonseling: body.tglKonseling ? new Date(body.tglKonseling) : new Date(),
        alamat: body.alamat || '',
        namaDokter: body.namaDokter || '',
        diagnosa: body.diagnosa || '',
        resepObat: body.resepObat || '',
        riwayatAlergi: body.riwayatAlergi || '',
        keluhan: body.keluhan || '',
      },
    });

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Error e-Konseling:', error);
    return NextResponse.json({ success: false, error: 'Gagal menyimpan data' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await prisma.eKonseling.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal mengambil data' }, { status: 500 });
  }
}