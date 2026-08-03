'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nama, setNama] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Helper untuk menentukan provider email pengguna (Gmail, Outlook, Yahoo, dll)
  const getEmailProviderUrl = (emailStr: string) => {
    const domain = emailStr.split('@')[1]?.toLowerCase();
    if (domain === 'gmail.com') return 'https://mail.google.com';
    if (domain === 'outlook.com' || domain === 'hotmail.com' || domain === 'live.com')
      return 'https://outlook.live.com';
    if (domain === 'yahoo.com' || domain === 'yahoo.co.id') return 'https://mail.yahoo.com';
    return `https://${domain || 'mail.google.com'}`;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            nama: nama,
            role: 'staff',
          },
        },
      });

      if (error) {
        // Tampilkan pesan error secara jelas
        const errorMessage = error.message || JSON.stringify(error);
        toast.error('Registrasi gagal: ' + errorMessage);
      } else if (data.user && data.user.identities && data.user.identities.length === 0) {
        // Kasus jika email sudah terdaftar sebelumnya
        toast.error('Email ini sudah terdaftar! Silakan gunakan email lain atau Login.');
      } else {
        setIsSuccess(true);
        toast.success('Registrasi berhasil! Silakan cek email Anda.');
      }
    } catch (err: any) {
      toast.error('Terjadi kesalahan: ' + (err.message || 'Gagal terhubung ke server'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 w-full max-w-md">
        <h2 className="text-2xl font-bold text-cyan-800 text-center mb-1">
          Registrasi Akun
        </h2>
        <p className="text-xs text-slate-600 text-center mb-6 font-medium">
          e-Konseling & e-PIO UPTD Puskesmas Banyu Urip
        </p>

        {isSuccess ? (
          <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-5 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl">
              <i className="fa-solid fa-envelope-circle-check"></i>
            </div>
            <h3 className="font-bold text-emerald-800 text-base">Verifikasi Email Dikirim!</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tautan konfirmasi telah dikirim ke <strong className="text-slate-800">{email}</strong>.
              Silakan klik tombol di bawah untuk langsung membuka inbox email Anda dan melakukan verifikasi.
            </p>

            {/* TOMBOL DENGAN LINK LANGSUNG KE INBOX EMAIL */}
            <div className="pt-2 space-y-2">
              <a
                href={getEmailProviderUrl(email)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow transition flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-arrow-up-right-from-square"></i>
                <span>Buka Inbox Email Anda ({email.split('@')[1]})</span>
              </a>

              <button
                onClick={() => router.push('/login')}
                className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs transition"
              >
                Ke Halaman Login
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            {/* NAMA LENGKAP */}
            <div>
              <label className="block text-sm font-bold text-cyan-800 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 bg-white focus:ring-2 focus:ring-cyan-600 outline-none font-medium"
                placeholder="Nama Anda"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-bold text-cyan-800 mb-1">
                Email Valid
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 bg-white focus:ring-2 focus:ring-cyan-600 outline-none font-medium"
                placeholder="email@puskesmas.com"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-bold text-cyan-800 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 pr-10 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 bg-white focus:ring-2 focus:ring-cyan-600 outline-none font-medium"
                  placeholder="Minimal 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-800 transition"
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-lg shadow transition disabled:opacity-50 mt-2"
            >
              {loading ? 'Mengirim Verifikasi...' : 'Daftar Akun'}
            </button>
          </form>
        )}

        <p className="text-xs text-center text-slate-700 mt-5">
          Sudah punya akun?{' '}
          <a href="/login" className="text-cyan-800 font-bold hover:underline">
            Login di sini
          </a>
        </p>
      </div>
    </div>
  );
}