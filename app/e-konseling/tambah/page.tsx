'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function TambahEKonseling() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    namaPasien: '',
    jenisKelamin: 'L',
    tglLahir: '',
    tglKonseling: new Date().toISOString().split('T')[0],
    alamat: '',
    namaDokter: '',
    diagnosa: '',
    namaObat: '',
    riwayatAlergi: '', // BERSIIH/KOSONG TOTAL
    pernahKonseling: 'Tidak',
    konselingSebelumnya: '',
    keluhanPasien: '',
    tindakLanjut: '',
    apoteker: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const toastId = toast.loading('Menyimpan data e-Konseling...');

    try {
      const { error } = await supabase.from('EKonseling').insert([
        {
          id: crypto.randomUUID(),
          namaPasien: formData.namaPasien,
          jenisKelamin: formData.jenisKelamin,
          tglLahir: formData.tglLahir || null,
          tglKonseling: formData.tglKonseling,
          alamat: formData.alamat || '-',
          namaDokter: formData.namaDokter || '-',
          diagnosa: formData.diagnosa || '-',
          namaObat: formData.namaObat || '-',
          riwayatAlergi: formData.riwayatAlergi || 'Tidak Ada',
          pernahKonseling: formData.pernahKonseling,
          konselingSebelumnya: formData.pernahKonseling === 'Ya' ? formData.konselingSebelumnya : '',
          keluhanPasien: formData.keluhanPasien || '-',
          tindakLanjut: formData.tindakLanjut || '-',
          apoteker: formData.apoteker || '-',
          namaApoteker: formData.apoteker || '-',
        },
      ]);

      if (error) {
        toast.error('Gagal menyimpan: ' + error.message, { id: toastId });
      } else {
        toast.success('Data e-Konseling berhasil disimpan!', { id: toastId });
        router.push('/e-konseling/terdata');
      }
    } catch (err: any) {
      toast.error('Terjadi kesalahan: ' + err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1 p-4 pt-24 md:p-8 max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden mb-6">
          <div className="bg-cyan-700 text-white p-6 text-center border-b border-cyan-800">
            <h2 className="text-xl font-bold tracking-wide">
              FORM DOKUMENTASI KONSELING PASIEN
            </h2>
            <p className="text-sm text-cyan-100 mt-1">UPTD PUSKESMAS BANYU URIP</p>
          </div>

          <form className="p-6 space-y-6 text-slate-800" onSubmit={handleSubmit}>
            {/* 1. Identitas Pasien */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
              <h3 className="font-bold text-cyan-800 text-base border-b border-slate-200 pb-2">
                1. Identitas Pasien
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Nama Pasien *</label>
                  <input
                    type="text"
                    name="namaPasien"
                    required
                    value={formData.namaPasien}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                    placeholder="Nama pasien"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Jenis Kelamin</label>
                  <select
                    name="jenisKelamin"
                    value={formData.jenisKelamin}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    name="tglLahir"
                    value={formData.tglLahir}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Tanggal Konseling *</label>
                  <input
                    type="date"
                    name="tglKonseling"
                    required
                    value={formData.tglKonseling}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Alamat Pasien</label>
                  <input
                    type="text"
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                    placeholder="Alamat lengkap..."
                  />
                </div>
              </div>
            </div>

            {/* 2. Data Medis & Konseling */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
              <h3 className="font-bold text-cyan-800 text-base border-b border-slate-200 pb-2">
                2. Data Medis & Konseling
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Nama Dokter</label>
                  <input
                    type="text"
                    name="namaDokter"
                    value={formData.namaDokter}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                    placeholder="Nama Dokter Penanggung Jawab"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Diagnosa</label>
                  <input
                    type="text"
                    name="diagnosa"
                    value={formData.diagnosa}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                    placeholder="Diagnosa medis"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Nama Obat, Dosis & Cara Pemakaian</label>
                <textarea
                  name="namaObat"
                  rows={3}
                  value={formData.namaObat}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                  placeholder="Detail obat, aturan pakai, dosis..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Riwayat Alergi</label>
                  <input
                    type="text"
                    name="riwayatAlergi"
                    value={formData.riwayatAlergi}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                    placeholder="Masukkan riwayat alergi jika ada..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold mb-1">Pernah Datang Konseling?</label>
                  <select
                    name="pernahKonseling"
                    value={formData.pernahKonseling}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                  >
                    <option value="Tidak">Tidak</option>
                    <option value="Ya">Ya</option>
                  </select>

                  {formData.pernahKonseling === 'Ya' && (
                    <div className="mt-2">
                      <label className="block text-xs font-semibold text-cyan-800 mb-1">
                        Konseling Sebelumnya (Kapan / Detail)
                      </label>
                      <input
                        type="text"
                        name="konselingSebelumnya"
                        value={formData.konselingSebelumnya}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-cyan-400 rounded-lg text-sm bg-cyan-50 outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="Contoh: 1 bulan yang lalu"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Keluhan Pasien</label>
                <textarea
                  name="keluhanPasien"
                  rows={2}
                  value={formData.keluhanPasien}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                  placeholder="Keluhan pasien saat ini..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Tindak Lanjut Konseling</label>
                <textarea
                  name="tindakLanjut"
                  rows={2}
                  value={formData.tindakLanjut}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                  placeholder="Edukasi / rekomendasi tindak lanjut..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Apoteker Penanggung Jawab *</label>
                <input
                  type="text"
                  name="apoteker"
                  required
                  value={formData.apoteker}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                  placeholder="Nama Apoteker"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg shadow-lg transition disabled:opacity-50 flex items-center gap-2"
              >
                <i className="fa-solid fa-floppy-disk"></i>
                <span>{loading ? 'Menyimpan...' : 'Simpan Data e-Konseling'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}