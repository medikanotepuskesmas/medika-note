'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  
  // State Profile & Role
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // State Modal Logout
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Ambil data profile pengguna dari tabel 'profiles'
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, nama')
          .eq('id', user.id)
          .single();

        if (profile) {
          setRole(profile.role);
          setUserName(profile.nama || user.email?.split('@')[0] || 'Pengguna');
        }
      }
    } catch (err) {
      console.error('Gagal memuat profil pengguna:', err);
    } finally {
      setLoading(false);
    }
  };

  const processLogout = async () => {
    setShowLogoutModal(false);
    const logoutToast = toast.loading('Memproses keluar...');
    try {
      await supabase.auth.signOut();
      toast.success('Berhasil keluar!', { id: logoutToast });
      router.push('/login');
    } catch (err: any) {
      toast.error('Gagal keluar: ' + err.message, { id: logoutToast });
    }
  };

  return (
    <>
      {/* Header Floating Mobile */}
      <div className="md:hidden fixed top-3 left-3 right-3 z-50 bg-slate-900/90 backdrop-blur-md text-white px-5 py-3.5 flex items-center justify-between rounded-2xl shadow-2xl border border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-400 text-sm">
            <i className="fa-solid fa-notes-medical"></i>
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight text-white">e-Konseling & PIO</h1>
            <p className="text-[10px] text-slate-400 font-medium">UPTD Puskesmas Banyu Urip</p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 text-slate-200 hover:text-white border border-slate-700 transition active:scale-95 text-base"
        >
          <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>
      </div>

      {/* Backdrop Gelap saat Menu Terbuka di Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Desktop & Mobile Slide-over */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 h-screen flex flex-col justify-between p-4 shadow-xl border-r border-slate-800 shrink-0 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-5">
          {/* Header App Desktop */}
          <div className="hidden md:block px-2 py-3 border-b border-slate-800">
            <h1 className="font-bold text-white text-lg tracking-wide">
              e-Konseling & PIO
            </h1>
            <p className="text-xs text-slate-400">UPTD Puskesmas Banyu Urip</p>
          </div>

          {/* Profile Info User Login */}
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/50 flex items-center gap-3 mt-10 md:mt-0">
            <div className="w-9 h-9 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center text-sm shadow shrink-0">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-xs text-slate-100 truncate">
                {userName || 'Memuat...'}
              </p>
              <span
                className={`inline-block px-2 py-0.5 text-[10px] font-extrabold rounded mt-0.5 uppercase tracking-wide ${
                  role === 'admin'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                }`}
              >
                {loading ? '...' : role === 'admin' ? 'ADMINISTRATOR' : 'STAFF'}
              </span>
            </div>
          </div>

          {/* Menu Navigasi 3 Grid Kategori Terpisah */}
          <nav className="space-y-4 text-sm font-medium">
            {/* GRID 1: E-KONSELING */}
            <div className="space-y-1.5">
              <div className="px-3 text-[11px] font-bold text-teal-400 tracking-wider uppercase">
                E-KONSELING
              </div>
              <div className="space-y-1">
                <Link
                  href="/e-konseling/tambah"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    pathname === '/e-konseling/tambah'
                      ? 'bg-teal-600 text-white font-bold shadow'
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-file-circle-plus"></i>
                  <span>Tambah Data</span>
                </Link>

                <Link
                  href="/e-konseling/terdata"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    pathname === '/e-konseling/terdata'
                      ? 'bg-teal-600 text-white font-bold shadow'
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-list-check"></i>
                  <span>Data Terdata</span>
                </Link>
              </div>
            </div>

            <div className="border-t border-slate-800/80"></div>

            {/* GRID 2: E-PIO (INFO OBAT) */}
            <div className="space-y-1.5">
              <div className="px-3 text-[11px] font-bold text-cyan-400 tracking-wider uppercase">
                E-PIO (INFO OBAT)
              </div>
              <div className="space-y-1">
                <Link
                  href="/e-pio/tambah"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    pathname === '/e-pio/tambah'
                      ? 'bg-cyan-600 text-white font-bold shadow'
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-file-medical"></i>
                  <span>Tambah Data</span>
                </Link>

                <Link
                  href="/e-pio/terdata"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    pathname === '/e-pio/terdata'
                      ? 'bg-cyan-600 text-white font-bold shadow'
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-box-archive"></i>
                  <span>Data Terdata</span>
                </Link>
              </div>
            </div>

            {/* 👑 GRID 3: KHUSUS ADMIN (KELOLA PENGGUNA & BLOKIR) */}
            {role === 'admin' && (
              <>
                <div className="border-t border-slate-800/80"></div>
                <div className="space-y-1.5">
                  <div className="px-3 text-[11px] font-bold text-rose-400 tracking-wider uppercase">
                    PENGATURAN ADMIN
                  </div>
                  <Link
                    href="/admin/users"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition border ${
                      pathname === '/admin/users'
                        ? 'bg-rose-700 text-white font-bold shadow border-rose-600'
                        : 'text-rose-300 bg-rose-950/20 hover:bg-rose-900/40 border-rose-900/40'
                    }`}
                  >
                    <i className="fa-solid fa-user-shield text-rose-400"></i>
                    <span>Kelola Akun & Blokir</span>
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>

        {/* Tombol Log Out */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-950/50 border border-rose-800/60 text-rose-300 hover:bg-rose-600 hover:text-white font-semibold text-sm rounded-lg transition shadow-sm"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* MODAL DIALOG KONFIRMASI LOGOUT */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-lg">
                <i className="fa-solid fa-right-from-bracket"></i>
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Konfirmasi Log Out</h3>
            </div>
            
            <p className="text-sm text-slate-600">
              Apakah Anda yakin ingin keluar dari aplikasi e-Konseling & PIO?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition"
              >
                Batal
              </button>
              <button
                onClick={processLogout}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg transition shadow-md"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}