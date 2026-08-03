import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Kirim langsung ke Supabase
    const { data, error } = await supabase.from('EPIO').insert([
      {
        id: crypto.randomUUID(),
        namaPenanya: body.namaPenanya,
        noTelp: body.noTelp || '',
        metode: body.metode,
        statusPenanya: body.statusPenanya,
        pertanyaan: body.pertanyaan,
        jawaban: body.jawaban,
        apoteker: body.apoteker || '',
        waktuPenyampaian: body.waktuPenyampaian,
      },
    ]);

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    console.error('Error e-PIO:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}