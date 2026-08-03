'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error('Login gagal: ' + error.message);
        setLoading(false);
        return;
      }

      // Cek apakah akun sedang diblokir oleh Admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profile && profile.is_blocked) {
        await supabase.auth.signOut();
        toast.error('Akun Anda telah DIBLOKIR oleh Admin. Hubungi penanggung jawab!');
        setLoading(false);
        return;
      }

      toast.success(`Selamat datang, ${profile?.nama || 'Pengguna'}!`);
      
      // MENGARAHKAN LANGSUNG KE DASHBOARD UTAMA
      router.push('/');
      router.refresh();
    } catch (err: any) {
      toast.error('Terjadi kesalahan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 w-full max-w-md">
        <h2 className="text-2xl font-bold text-cyan-800 text-center mb-1">
          Login Sistem
        </h2>
        <p className="text-xs text-slate-600 text-center mb-6 font-medium">
          e-Konseling & e-PIO UPTD Puskesmas Banyu Urip
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* EMAIL */}
          <div>
            <label className="block text-sm font-bold text-cyan-800 mb-1">
              Email
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 pr-10 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 bg-white focus:ring-2 focus:ring-cyan-600 outline-none font-medium"
                placeholder="Masukkan password Anda"
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
            {loading ? 'Memeriksa...' : 'Login'}
          </button>
        </form>

        <p className="text-xs text-center text-slate-700 mt-5">
          Belum punya akun?{' '}
          <a href="/register" className="text-cyan-800 font-bold hover:underline">
            Daftar di sini
          </a>
        </p>
      </div>
    </div>
  );
}