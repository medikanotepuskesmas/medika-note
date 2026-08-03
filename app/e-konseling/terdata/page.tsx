'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

export default function TerdataEKonseling() {
  const [startDate, setStartDate] = useState('');
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [printDateTime, setPrintDateTime] = useState<string>('');

  // Fungsi Hapus Data (Khusus Admin / Pengelola Data)
  const handleDeleteItem = async (id: string, namaPasien: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data e-Konseling pasien "${namaPasien}"?`)) return;

    try {
      const { error } = await supabase.from('EKonseling').delete().eq('id', id);

      if (error) {
        toast.error('Gagal menghapus data: ' + error.message);
      } else {
        toast.success('Data e-Konseling berhasil dihapus!');
        setDataList(dataList.filter((item) => item.id !== id));
      }
    } catch (err: any) {
      toast.error('Terjadi kesalahan: ' + err.message);
    }
  };

  // Ambil Data Sesuai Filter Tanggal
  const handleViewData = async () => {
    setLoading(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase.from('EKonseling').select('*');

      if (error) {
        toast.error('Gagal mengambil data: ' + error.message);
      } else {
        let result = data || [];

        if (startDate) {
          result = result.filter((item) => {
            const itemDate = item.tglKonseling || item.tgl || item.tanggal || item.created_at;
            return itemDate && itemDate >= startDate;
          });
        }

        result.sort((a, b) => {
          const dateA = new Date(a.tglKonseling || a.tgl || a.tanggal || a.created_at || 0).getTime();
          const dateB = new Date(b.tglKonseling || b.tgl || b.tanggal || b.created_at || 0).getTime();
          return dateB - dateA;
        });

        setDataList(result);
        toast.success(`Ditemukan ${result.length} data e-Konseling`);
      }
    } catch (err: any) {
      toast.error('Terjadi kesalahan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Export Excel
  const handleDownloadExcel = () => {
    if (dataList.length === 0) {
      toast.error('Tidak ada data untuk diunduh. Klik VIEW terlebih dahulu.');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(dataList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap e-Konseling');
    XLSX.writeFile(workbook, `Rekap_eKonseling_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Helper Format Jam Cetak Realtime
  const getCurrentFormattedDateTime = () => {
    const d = new Date();
    const datePart = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear().toString().slice(-2)}`;
    let hours = d.getHours();
    const minutesStr = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    return `${datePart}, ${hours}:${minutesStr} ${ampm}`;
  };

  // Fungsi Cetak PDF
  const handlePrintIndividual = (item: any) => {
    setSelectedItem(item);
    setPrintDateTime(getCurrentFormattedDateTime());
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Helper Format Tanggal
  const formatDate = (dateStr: any) => {
    if (!dateStr || dateStr === '-') return '-';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID');
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: auto;
            margin: 8mm;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* 1. LAYOUT WEBSITE (Disembunyikan Total Saat Print) */}
      <div className="flex min-h-screen bg-slate-100 print:hidden">
        <Sidebar />

        <main className="flex-1 p-4 pt-24 md:p-8 max-w-6xl mx-auto space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <h1 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">
              Rekapitulasi Data e-Konseling Pasien
            </h1>

            <div className="flex flex-col md:flex-row items-end justify-between gap-4">
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-semibold mb-1 text-slate-700">
                  Mulai Tgl
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="p-2.5 border border-slate-300 rounded-md text-sm text-slate-900 font-semibold bg-white outline-none focus:ring-2 focus:ring-cyan-500 w-full"
                />
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={handleViewData}
                  disabled={loading}
                  className="flex-1 md:flex-none px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-md shadow transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-eye"></i>
                  <span>{loading ? 'Memuat...' : 'VIEW'}</span>
                </button>

                <button
                  onClick={handleDownloadExcel}
                  className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md shadow transition flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-file-excel"></i>
                  <span>DOWNLOAD EXCEL</span>
                </button>
              </div>
            </div>
          </div>

          {hasSearched && (
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-700">
                  <thead className="bg-slate-800 text-white uppercase text-xs">
                    <tr>
                      <th className="p-3 text-center">No</th>
                      <th className="p-3">Tgl Konseling</th>
                      <th className="p-3">Nama Pasien</th>
                      <th className="p-3">Dokter</th>
                      <th className="p-3">Diagnosa</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {dataList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-500">
                          Tidak ada data e-Konseling terdata yang ditemukan.
                        </td>
                      </tr>
                    ) : (
                      dataList.map((item, idx) => {
                        const tglVal = item.tglKonseling || item.tgl || item.created_at;
                        const namaPasienVal = item.namaPasien || item.nama || '-';

                        return (
                          <tr key={item.id || idx} className="hover:bg-slate-50 transition">
                            <td className="p-3 text-center font-semibold">{idx + 1}</td>
                            <td className="p-3 font-medium">{formatDate(tglVal)}</td>
                            <td className="p-3 font-bold text-slate-900">{namaPasienVal}</td>
                            <td className="p-3">{item.namaDokter || item.dokter || '-'}</td>
                            <td className="p-3">{item.diagnosa || '-'}</td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {/* Tombol Cetak PDF */}
                                <button
                                  onClick={() => handlePrintIndividual(item)}
                                  className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-md shadow transition flex items-center gap-1"
                                >
                                  <i className="fa-solid fa-file-pdf"></i>
                                  <span>Cetak PDF</span>
                                </button>

                                {/* Tombol Hapus Data */}
                                <button
                                  onClick={() => handleDeleteItem(item.id, namaPasienVal)}
                                  className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-900 text-white font-bold text-xs rounded-md shadow transition flex items-center gap-1"
                                  title="Hapus Data e-Konseling"
                                >
                                  <i className="fa-solid fa-trash-can"></i>
                                  <span>Hapus</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 2. DOKUMEN CETAK FORM DOKUMENTASI e-KONSELING */}
      {selectedItem && (
        <div className="hidden print:block bg-white text-black p-4 text-xs font-serif leading-tight w-full">
          {/* KOP SURAT DENGAN LOGO SURABAYA */}
          <div className="relative flex items-center justify-center border-b-2 border-black pb-2 mb-3">
            <img
              src="/logo-surabaya.png"
              alt="Logo Surabaya"
              className="absolute left-2 top-1 h-16 w-auto object-contain"
              onError={(e: any) => {
                e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/b/b2/City_of_Surabaya_Logo.svg';
              }}
            />

            <div className="text-center">
              <h3 className="font-bold text-xs tracking-wide uppercase">
                PEMERINTAH KOTA SURABAYA
              </h3>
              <h3 className="font-bold text-xs tracking-wide uppercase">DINAS KESEHATAN</h3>
              <h2 className="font-extrabold text-sm tracking-wider uppercase">
                UPTD PUSKESMAS BANYU URIP
              </h2>
              <p className="text-[10px] mt-0.5">
                Jalan Banyu Urip Kidul VI No. 8 Surabaya 60254 <br />
                Telp. (031) 5685424 Fax. 5615292
              </p>
            </div>
          </div>

          {/* Judul Formulir */}
          <div className="text-center mb-3">
            <h4 className="font-bold text-xs uppercase underline tracking-wider">
              FORM DOKUMENTASI KONSELING PASIEN
            </h4>
          </div>

          {/* TABEL DOKUMEN e-KONSELING */}
          <table className="w-full border-collapse border border-black text-xs mb-4">
            <tbody>
              {/* 1. IDENTITAS PASIEN */}
              <tr>
                <td className="border border-black p-1.5 font-bold bg-slate-50" colSpan={4}>
                  1. Identitas Pasien
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1.5 font-medium w-1/4">Nama Pasien</td>
                <td className="border border-black p-1.5 w-1/4">{selectedItem.namaPasien || '-'}</td>
                <td className="border border-black p-1.5 font-medium w-1/4">Jenis Kelamin</td>
                <td className="border border-black p-1.5 w-1/4">
                  {selectedItem.jenisKelamin === 'L' ? 'Laki-laki (L)' : selectedItem.jenisKelamin === 'P' ? 'Perempuan (P)' : selectedItem.jenisKelamin || 'L'}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1.5 font-medium">Tanggal Lahir</td>
                <td className="border border-black p-1.5">{formatDate(selectedItem.tglLahir)}</td>
                <td className="border border-black p-1.5 font-medium">Tanggal Konseling</td>
                <td className="border border-black p-1.5">{formatDate(selectedItem.tglKonseling || selectedItem.created_at)}</td>
              </tr>
              <tr>
                <td className="border border-black p-1.5 font-medium">Alamat Pasien</td>
                <td className="border border-black p-1.5" colSpan={3}>
                  {selectedItem.alamat || '-'}
                </td>
              </tr>

              {/* 2. DATA MEDIS & KONSELING */}
              <tr>
                <td className="border border-black p-1.5 font-bold bg-slate-50" colSpan={4}>
                  2. Data Medis & Konseling
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1.5 font-medium">Nama Dokter</td>
                <td className="border border-black p-1.5">{selectedItem.namaDokter || '-'}</td>
                <td className="border border-black p-1.5 font-medium">Diagnosa</td>
                <td className="border border-black p-1.5">{selectedItem.diagnosa || '-'}</td>
              </tr>
              <tr>
                <td className="border border-black p-1.5 font-medium">
                  Nama Obat, Dosis & Cara Pemakaian
                </td>
                <td className="border border-black p-1.5 whitespace-pre-wrap" colSpan={3}>
                  {selectedItem.namaObat || '-'}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1.5 font-medium">Riwayat Alergi</td>
                <td className="border border-black p-1.5">{selectedItem.riwayatAlergi || 'Tidak Ada'}</td>
                <td className="border border-black p-1.5 font-medium">Pernah Datang Konseling</td>
                <td className="border border-black p-1.5">
                  {selectedItem.pernahKonseling === 'Ya'
                    ? `Ya ${selectedItem.konselingSebelumnya ? `(${selectedItem.konselingSebelumnya})` : ''}`
                    : selectedItem.pernahKonseling || 'Tidak'}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1.5 font-medium">Keluhan Pasien</td>
                <td className="border border-black p-1.5 whitespace-pre-wrap" colSpan={3}>
                  {selectedItem.keluhanPasien || '-'}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1.5 font-medium">Tindak Lanjut Konseling</td>
                <td className="border border-black p-1.5 whitespace-pre-wrap" colSpan={3}>
                  {selectedItem.tindakLanjut || '-'}
                </td>
              </tr>
            </tbody>
          </table>

          {/* AREA TANDA TANGAN (SANGAT LUAS - LEGA UNTUK DITANDATANGANI) */}
          <div className="grid grid-cols-2 text-center mt-8 pt-4">
            <div>
              <p className="font-semibold text-xs">Pasien</p>
              <div className="h-28"></div> 
              <p className="font-bold underline uppercase text-xs">
                {selectedItem.namaPasien || 'Pasien'}
              </p>
            </div>
            <div>
              <p className="font-semibold text-xs">Apoteker Penanggung Jawab</p>
              <div className="h-28"></div> 
              <p className="font-bold underline uppercase text-xs">
                {selectedItem.apoteker || selectedItem.namaApoteker || 'Apoteker'}
              </p>
            </div>
          </div>

          {/* KETERANGAN TANGGAL CETAK */}
          <div className="text-right text-[10px] text-slate-700 italic mt-6">
            Tanggal Cetak: {printDateTime}
          </div>
        </div>
      )}
    </>
  );
}