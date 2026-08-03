'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function TambahEPIO() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    noForm: '',
    tglPertanyaan: new Date().toISOString().split('T')[0],
    waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    metodePenyampaian: 'Lisan',
    namaPenanya: '',
    noTelp: '',
    statusPenanya: 'Pasien',
    umur: '',
    tinggiBadan: '',
    beratBadan: '',
    jenisKelamin: 'L',
    kehamilan: 'Tidak',
    usiaKehamilan: '',
    menyusui: 'Tidak',
    jenisPertanyaan: 'Dosis',
    uraianPertanyaan: '',
    jawabanPIO: '',
    referensi: '',
    penyampaianJawaban: 'Segera',
    apoteker: '',
    tglJawab: new Date().toISOString().split('T')[0],
    waktuJawab: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    metodeJawab: 'Lisan',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const toastId = toast.loading('Menyimpan data e-PIO...');

    try {
      const kehamilanVal =
        formData.kehamilan === 'Ya' && formData.usiaKehamilan
          ? `Ya (${formData.usiaKehamilan} minggu)`
          : formData.kehamilan;

      const { error } = await supabase.from('EPIO').insert([
        {
          id: crypto.randomUUID(),
          // Kolom Baru & Kolom Lama diisi sekaligus agar terhindar dari error NULL
          noForm: formData.noForm || '-',
          no: formData.noForm || '-',
          tglPertanyaan: formData.tglPertanyaan,
          tgl: formData.tglPertanyaan,
          waktu: formData.waktu || '00.00',
          metodePenyampaian: formData.metodePenyampaian || 'Lisan',
          metode: formData.metodePenyampaian || 'Lisan',
          namaPenanya: formData.namaPenanya,
          nama: formData.namaPenanya || '-',
          noTelp: formData.noTelp || '-',
          telepon: formData.noTelp || '-',
          statusPenanya: formData.statusPenanya || 'Pasien',
          status: formData.statusPenanya || 'Pasien',
          umur: formData.umur || '-',
          usia: formData.umur || '-',
          tinggiBadan: formData.tinggiBadan || '-',
          tb: formData.tinggiBadan || '-',
          beratBadan: formData.beratBadan || '-',
          bb: formData.beratBadan || '-',
          jenisKelamin: formData.jenisKelamin,
          kehamilan: kehamilanVal,
          kondisiKhusus: kehamilanVal,
          usiaKehamilan: formData.usiaKehamilan || '-',
          menyusui: formData.menyusui,
          jenisPertanyaan: formData.jenisPertanyaan || 'Dosis',
          jenis: formData.jenisPertanyaan || 'Dosis',
          uraianPertanyaan: formData.uraianPertanyaan || '-',
          pertanyaan: formData.uraianPertanyaan || '-',
          jawabanPIO: formData.jawabanPIO || '-',
          jawaban: formData.jawabanPIO || '-',
          referensi: formData.referensi || '-',
          pustaka: formData.referensi || '-',
          penyampaianJawaban: formData.penyampaianJawaban,
          waktuPenyampaian: formData.penyampaianJawaban,
          apoteker: formData.apoteker || '-',
          penanggungJawab: formData.apoteker || '-',
          tglJawab: formData.tglJawab,
          waktuJawab: formData.waktuJawab,
          metodeJawab: formData.metodeJawab,
        },
      ]);

      if (error) {
        toast.error('Gagal menyimpan: ' + error.message, { id: toastId });
      } else {
        toast.success('Data e-PIO berhasil disimpan!', { id: toastId });
        router.push('/e-pio/terdata');
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
              FORM DOKUMENTASI PELAYANAN INFORMASI OBAT (e-PIO)
            </h2>
            <p className="text-sm text-cyan-100 mt-1">UPTD PUSKESMAS BANYU URIP</p>
          </div>

          <form className="p-6 space-y-6 text-slate-800" onSubmit={handleSubmit}>
            {/* Header / No. Form */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
              <h3 className="font-bold text-cyan-800 text-base border-b border-slate-200 pb-2">
                Header Dokumentasi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">No. Form</label>
                  <input
                    type="text"
                    name="noForm"
                    value={formData.noForm}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                    placeholder="Contoh: 7e123e"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Tanggal Pertanyaan *</label>
                  <input
                    type="date"
                    name="tglPertanyaan"
                    required
                    value={formData.tglPertanyaan}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-300 rounded-lg text-base text-slate-900 font-semibold focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Waktu (WIB)</label>
                  <input
                    type="text"
                    name="waktu"
                    value={formData.waktu}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                    placeholder="10.15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Metode Pertanyaan *</label>
                  <select
                    name="metodePenyampaian"
                    value={formData.metodePenyampaian}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                  >
                    <option value="Lisan">Lisan</option>
                    <option value="Tertulis">Tertulis</option>
                    <option value="Telepon">Telepon</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 1. Identitas Penanya */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
              <h3 className="font-bold text-cyan-800 text-base border-b border-slate-200 pb-2">
                1. Identitas Penanya
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Nama Penanya *</label>
                  <input
                    type="text"
                    name="namaPenanya"
                    required
                    value={formData.namaPenanya}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                    placeholder="Nama penanya"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">No. Telepon / HP</label>
                  <input
                    type="text"
                    name="noTelp"
                    value={formData.noTelp}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                    placeholder="08123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Status Penanya *</label>
                  <select
                    name="statusPenanya"
                    value={formData.statusPenanya}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                  >
                    <option value="Pasien">Pasien</option>
                    <option value="Keluarga Pasien">Keluarga Pasien</option>
                    <option value="Petugas Kesehatan">Petugas Kesehatan (Dokter/Perawat/Bidan)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Data Pasien */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
              <h3 className="font-bold text-cyan-800 text-base border-b border-slate-200 pb-2">
                2. Data Pasien
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Umur (Tahun)</label>
                  <input
                    type="number"
                    name="umur"
                    value={formData.umur}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                    placeholder="Contoh: 35"
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Tinggi Badan (cm)</label>
                  <input
                    type="number"
                    name="tinggiBadan"
                    value={formData.tinggiBadan}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                    placeholder="Contoh: 160"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Berat Badan (kg)</label>
                  <input
                    type="number"
                    name="beratBadan"
                    value={formData.beratBadan}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                    placeholder="Contoh: 60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold mb-1">Kehamilan</label>
                  <select
                    name="kehamilan"
                    value={formData.kehamilan}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                  >
                    <option value="Tidak">Tidak</option>
                    <option value="Ya">Ya</option>
                  </select>

                  {formData.kehamilan === 'Ya' && (
                    <div className="mt-2">
                      <label className="block text-xs font-semibold text-cyan-800 mb-1">
                        Berapa Minggu Kehamilan?
                      </label>
                      <input
                        type="number"
                        name="usiaKehamilan"
                        value={formData.usiaKehamilan}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-cyan-400 rounded-lg text-sm bg-cyan-50 outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="Masukkan angka minggu (misal: 12)"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Menyusui</label>
                  <select
                    name="menyusui"
                    value={formData.menyusui}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                  >
                    <option value="Tidak">Tidak</option>
                    <option value="Ya">Ya</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Pertanyaan */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
              <h3 className="font-bold text-cyan-800 text-base border-b border-slate-200 pb-2">
                3. Pertanyaan
              </h3>

              <div>
                <label className="block text-sm font-semibold mb-1">Uraian Pertanyaan *</label>
                <textarea
                  name="uraianPertanyaan"
                  rows={3}
                  required
                  value={formData.uraianPertanyaan}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                  placeholder="Detail pertanyaan..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Jenis Pertanyaan *</label>
                <select
                  name="jenisPertanyaan"
                  value={formData.jenisPertanyaan}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                >
                  <option value="Dosis">Dosis</option>
                  <option value="Identifikasi Obat">Identifikasi Obat</option>
                  <option value="Cara Pemakaian">Cara Pemakaian</option>
                  <option value="Kontraindikasi">Kontraindikasi</option>
                  <option value="Efek Samping Obat">Efek Samping Obat</option>
                  <option value="Interaksi Obat">Interaksi Obat</option>
                  <option value="Stabilitas">Stabilitas</option>
                  <option value="Penggunaan Terapetik">Penggunaan Terapetik</option>
                  <option value="Farmakokinetika">Farmakokinetika</option>
                  <option value="Farmakodinamika">Farmakodinamika</option>
                  <option value="Harga Obat">Harga Obat</option>
                  <option value="Keracunan">Keracunan</option>
                  <option value="Ketersediaan Obat">Ketersediaan Obat</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>
            </div>

            {/* 4. Jawaban */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
              <h3 className="font-bold text-cyan-800 text-base border-b border-slate-200 pb-2">
                4. Jawaban
              </h3>

              <div>
                <textarea
                  name="jawabanPIO"
                  rows={4}
                  required
                  value={formData.jawabanPIO}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                  placeholder="Detail jawaban..."
                ></textarea>
              </div>
            </div>

            {/* 5. Referensi */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
              <h3 className="font-bold text-cyan-800 text-base border-b border-slate-200 pb-2">
                5. Referensi
              </h3>

              <div>
                <input
                  type="text"
                  name="referensi"
                  value={formData.referensi}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                  placeholder="Contoh: MIMS, ISO, Pharmacotherapy"
                />
              </div>
            </div>

            {/* 6. Penyampaian Jawaban */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
              <h3 className="font-bold text-cyan-800 text-base border-b border-slate-200 pb-2">
                6. Penyampaian Jawaban
              </h3>

              <div>
                <select
                  name="penyampaianJawaban"
                  value={formData.penyampaianJawaban}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                >
                  <option value="Segera">Segera / Langsung</option>
                  <option value="Dalam 24 Jam">Dalam 24 Jam</option>
                  <option value="Lebih dari 24 Jam">Lebih dari 24 Jam</option>
                </select>
              </div>
            </div>

            {/* 7. Apoteker yang Menjawab */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
              <h3 className="font-bold text-cyan-800 text-base border-b border-slate-200 pb-2">
                7. Apoteker yang Menjawab
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Nama Apoteker *</label>
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

                <div>
                  <label className="block text-sm font-semibold mb-1">Metode Jawaban</label>
                  <select
                    name="metodeJawab"
                    value={formData.metodeJawab}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                  >
                    <option value="Lisan">Lisan</option>
                    <option value="Tertulis">Tertulis</option>
                    <option value="Telepon">Telepon</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Tanggal Jawab</label>
                  <input
                    type="date"
                    name="tglJawab"
                    value={formData.tglJawab}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Waktu Jawab (WIB)</label>
                  <input
                    type="text"
                    name="waktuJawab"
                    value={formData.waktuJawab}
                    onChange={handleChange}
                    className="w-full p-3 border border-slate-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
                    placeholder="Contoh: 10.30"
                  />
                </div>
              </div>
            </div>

            {/* Tombol Simpan */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg shadow-lg transition disabled:opacity-50 flex items-center gap-2"
              >
                <i className="fa-solid fa-floppy-disk"></i>
                <span>{loading ? 'Menyimpan...' : 'Simpan Data e-PIO'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}