'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      toast.error('Gagal mengambil data pengguna: ' + error.message);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  // Toggle Memblokir / Membuka Akses Akun
  const toggleBlockStatus = async (userId: string, currentStatus: boolean, email: string) => {
    const actionText = currentStatus ? 'membuka blokir' : 'MEMBLOKIR';
    if (!confirm(`Apakah Anda yakin ingin ${actionText} akun ${email}?`)) return;

    const { error } = await supabase
      .from('profiles')
      .update({ is_blocked: !currentStatus })
      .eq('id', userId);

    if (error) {
      toast.error('Gagal mengubah status blokir: ' + error.message);
    } else {
      toast.success(currentStatus ? 'Blokir akun berhasil dibuka!' : 'Akun berhasil DIBLOKIR!');
      fetchUsers();
    }
  };

  // Ubah Role (ADMIN / STAFF)
  const changeRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      toast.error('Gagal mengubah role: ' + error.message);
    } else {
      toast.success(`Role berhasil diubah menjadi ${newRole.toUpperCase()}`);
      fetchUsers();
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1 p-4 pt-24 md:p-8 max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Manajemen Pengguna & Keamanan
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Khusus Admin: Kelola akun staf, atur peran, dan antisispasi akun ilegal.
              </p>
            </div>
            <button
              onClick={fetchUsers}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <i className="fa-solid fa-rotate"></i> Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-700">
              <thead className="bg-slate-800 text-white uppercase text-xs">
                <tr>
                  <th className="p-3 text-center">No</th>
                  <th className="p-3">Nama Pengguna</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Hak Akses (Role)</th>
                  <th className="p-3 text-center">Status Akses</th>
                  <th className="p-3 text-center">Aksi Keamanan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500">
                      Memuat data pengguna...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500">
                      Belum ada pengguna terdaftar.
                    </td>
                  </tr>
                ) : (
                  users.map((u, idx) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 text-center font-semibold">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">{u.nama || '-'}</td>
                      <td className="p-3 font-medium">{u.email}</td>
                      <td className="p-3">
                        <select
                          value={u.role || 'staff'}
                          onChange={(e) => changeRole(u.id, e.target.value)}
                          className="p-1.5 border border-slate-300 rounded text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value="staff">STAFF</option>
                          <option value="admin">ADMIN</option>
                        </select>
                      </td>
                      <td className="p-3 text-center">
                        {u.is_blocked ? (
                          <span className="px-2.5 py-1 bg-rose-100 text-rose-700 font-bold text-xs rounded-full border border-rose-200">
                            DIBLOKIR
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
                            AKTIF
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleBlockStatus(u.id, u.is_blocked, u.email)}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold text-white shadow transition flex items-center gap-1.5 mx-auto ${
                            u.is_blocked
                              ? 'bg-emerald-600 hover:bg-emerald-700'
                              : 'bg-rose-600 hover:bg-rose-700'
                          }`}
                        >
                          <i className={`fa-solid ${u.is_blocked ? 'fa-unlock' : 'fa-user-slash'}`}></i>
                          <span>{u.is_blocked ? 'Buka Blokir' : 'Blokir Akun'}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}