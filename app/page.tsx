'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Cek sesi saat ini
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
      } else {
        setLoading(false);
      }
    };

    checkSession();

    // 2. Dengarkan perubahan status login/logout secara real-time
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.replace('/login');
      } else {
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex items-center gap-3 text-cyan-800 font-bold bg-white px-6 py-4 rounded-xl shadow-sm border border-slate-200">
          <i className="fa-solid fa-circle-notch animate-spin text-2xl text-cyan-700"></i>
          <span>Memuat Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1 p-8 max-w-5xl mx-auto space-y-6">
        {/* Banner Welcome */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Selamat Datang di Aplikasi e-Konseling & e-PIO
            </h2>
            <p className="text-slate-600 mt-1 text-sm">
              Sistem rekapitulasi data Pelayanan Informasi Obat dan Konseling Pasien UPTD Puskesmas Banyu Urip.
            </p>
          </div>
        </div>

        {/* Action Quick Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card e-Konseling */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-teal-700">
              <i className="fa-solid fa-user-doctor text-2xl"></i>
              <h3 className="font-bold text-lg">Menu e-Konseling</h3>
            </div>
            <p className="text-sm text-slate-600">
              Input data formulir dokumentasi konseling pasien baru atau lihat rekap data terdata.
            </p>
            <div className="flex gap-3 pt-2">
              <Link
                href="/e-konseling/tambah"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-sm transition"
              >
                + Tambah Data
              </Link>
              <Link
                href="/e-konseling/terdata"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-sm transition"
              >
                Lihat Terdata
              </Link>
            </div>
          </div>

          {/* Card e-PIO */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-cyan-700">
              <i className="fa-solid fa-pills text-2xl"></i>
              <h3 className="font-bold text-lg">Menu e-PIO</h3>
            </div>
            <p className="text-sm text-slate-600">
              Input data formulir Pelayanan Informasi Obat baru atau unduh laporan file Excel.
            </p>
            <div className="flex gap-3 pt-2">
              <Link
                href="/e-pio/tambah"
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg text-sm transition"
              >
                + Tambah Data
              </Link>
              <Link
                href="/e-pio/terdata"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-sm transition"
              >
                Lihat Terdata
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}