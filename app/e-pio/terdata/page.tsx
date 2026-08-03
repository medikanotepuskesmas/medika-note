'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

export default function TerdataEPIO() {
  const [startDate, setStartDate] = useState('');
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [printDateTime, setPrintDateTime] = useState<string>('');

  // Fungsi Hapus Data (Khusus Admin / Pengelola Data)
  const handleDeleteItem = async (id: string, namaPenanya: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data e-PIO penanya "${namaPenanya}"?`)) return;

    try {
      const { error } = await supabase.from('EPIO').delete().eq('id', id);

      if (error) {
        toast.error('Gagal menghapus data: ' + error.message);
      } else {
        toast.success('Data e-PIO berhasil dihapus!');
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
      const { data, error } = await supabase.from('EPIO').select('*');

      if (error) {
        toast.error('Gagal mengambil data: ' + error.message);
      } else {
        let result = data || [];

        if (startDate) {
          result = result.filter((item) => {
            const itemDate = item.tglPertanyaan || item.tgl || item.tanggal || item.created_at;
            return itemDate && itemDate >= startDate;
          });
        }

        result.sort((a, b) => {
          const dateA = new Date(a.tglPertanyaan || a.tgl || a.tanggal || a.created_at || 0).getTime();
          const dateB = new Date(b.tglPertanyaan || b.tgl || b.tanggal || b.created_at || 0).getTime();
          return dateB - dateA;
        });

        setDataList(result);
        toast.success(`Ditemukan ${result.length} data e-PIO`);
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap e-PIO');
    XLSX.writeFile(workbook, `Rekap_ePIO_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Helper Format Waktu Cetak Realtime
  const getCurrentFormattedDateTime = () => {
    const d = new Date();
    const datePart = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear().toString().slice(-2)}`;
    let hours = d.getHours();
    const minutesStr = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    return `${datePart}, ${hours}:${minutesStr} ${ampm}`;
  };

  // Fungsi Cetak Individual
  const handlePrintIndividual = (item: any) => {
    setSelectedItem(item);
    setPrintDateTime(getCurrentFormattedDateTime());
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Helper Format Tanggal Standar
  const formatDate = (dateStr: any) => {
    if (!dateStr || dateStr === '-') return '-';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID');
    } catch {
      return dateStr;
    }
  };

  // Helper Format Waktu Jam
  const formatTime = (item: any) => {
    if (item.waktu) return item.waktu;
    if (item.created_at) {
      try {
        return new Date(item.created_at).toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch {
        return '-';
      }
    }
    return '-';
  };

  return (
    <>
      {/* STYLE CSS PRINT */}
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

      {/* 1. LAYOUT WEBSITE (Disembunyikan Total Saat Mode Print) */}
      <div className="flex min-h-screen bg-slate-100 print:hidden">
        <Sidebar />

        <main className="flex-1 p-4 pt-24 md:p-8 max-w-6xl mx-auto space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <h1 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">
              Rekapitulasi Data e-PIO (Pelayanan Informasi Obat)
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
                      <th className="p-3">Tanggal</th>
                      <th className="p-3">Nama Penanya</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Jenis Pertanyaan</th>
                      <th className="p-3">Apoteker Menjawab</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {dataList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-500">
                          Tidak ada data terdata yang ditemukan.
                        </td>
                      </tr>
                    ) : (
                      dataList.map((item, idx) => {
                        const tglVal = item.tglPertanyaan || item.tgl || item.tanggal || item.created_at;
                        const penanyaVal = item.namaPenanya || item.nama || item.penanya || '-';
                        const statusVal = item.statusPenanya || item.status || '-';
                        const jenisVal = item.jenisPertanyaan || item.jenis || '-';
                        const apotekerVal = item.apoteker || item.penanggungJawab || item.petugas || '-';

                        return (
                          <tr key={item.id || idx} className="hover:bg-slate-50 transition">
                            <td className="p-3 text-center font-semibold">{idx + 1}</td>
                            <td className="p-3 font-medium">{formatDate(tglVal)}</td>
                            <td className="p-3 font-bold text-slate-900">{penanyaVal}</td>
                            <td className="p-3">{statusVal}</td>
                            <td className="p-3">{jenisVal}</td>
                            <td className="p-3">{apotekerVal}</td>
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
                                  onClick={() => handleDeleteItem(item.id, penanyaVal)}
                                  className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-900 text-white font-bold text-xs rounded-md shadow transition flex items-center gap-1"
                                  title="Hapus Data e-PIO"
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

      {/* 2. DOKUMEN CETAK PRESISI (Tampil Hanya Saat Cetak PDF) */}
      {selectedItem && (
        <div className="hidden print:block bg-white text-black p-4 text-xs font-serif leading-tight w-full">
          {/* KOP SURAT RESMI DENGAN LOGO SURABAYA */}
          <div className="relative flex items-center justify-center border-b-2 border-black pb-2 mb-3">
            <img
              src="/logo-surabaya.png"
              alt="Logo Surabaya"
              className="absolute left-2 top-1 h-16 w-auto object-contain"
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
              FORM DOKUMENTASI PELAYANAN INFORMASI OBAT
            </h4>
          </div>

          {/* TABEL DOKUMEN e-PIO */}
          <table className="w-full border-collapse border border-black text-xs mb-2">
            <tbody>
              {/* BARIS HEADER */}
              <tr>
                <td className="border border-black p-1.5" colSpan={4}>
                  <strong>No:</strong> {selectedItem.noForm || selectedItem.no || selectedItem.id?.slice(0, 6) || '-'} &nbsp;&nbsp;&nbsp;&nbsp;
                  <strong>Tanggal:</strong> {formatDate(selectedItem.tglPertanyaan || selectedItem.tgl || selectedItem.tanggal || selectedItem.created_at)} &nbsp;&nbsp;&nbsp;&nbsp;
                  <strong>Waktu:</strong> {formatTime(selectedItem)} WIB &nbsp;&nbsp;&nbsp;&nbsp;
                  <strong>Metode:</strong> {selectedItem.metodePenyampaian || selectedItem.metode || 'Lisan'}
                </td>
              </tr>

              {/* 1. IDENTITAS PENANYA */}
              <tr>
                <td className="border border-black p-1.5 font-bold bg-slate-50" colSpan={4}>
                  1. Identitas Penanya
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1.5 font-medium w-1/4">Nama</td>
                <td className="border border-black p-1.5 w-1/4">{selectedItem.namaPenanya || selectedItem.nama || '-'}</td>
                <td className="border border-black p-1.5 font-medium w-1/4">No. Telp</td>
                <td className="border border-black p-1.5 w-1/4">{selectedItem.noTelp || selectedItem.telepon || '-'}</td>
              </tr>
              <tr>
                <td className="border border-black p-1.5 font-medium">Status</td>
                <td className="border border-black p-1.5" colSpan={3}>
                  {selectedItem.statusPenanya || selectedItem.status || 'Pasien'}
                </td>
              </tr>

              {/* 2. DATA PASIEN */}
              <tr>
                <td className="border border-black p-1.5 font-bold bg-slate-50" colSpan={4}>
                  2. Data Pasien
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1.5 font-medium">Umur</td>
                <td className="border border-black p-1.5">
                  {selectedItem.umur ? `${selectedItem.umur} tahun` : selectedItem.usia ? `${selectedItem.usia} tahun` : '-'}
                </td>
                <td className="border border-black p-1.5 font-medium">Jenis Kelamin</td>
                <td className="border border-black p-1.5">
                  {selectedItem.jenisKelamin === 'L' ? 'Laki-laki (L)' : selectedItem.jenisKelamin === 'P' ? 'Perempuan (P)' : selectedItem.jenisKelamin || 'L'}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1.5 font-medium">Tinggi Badan</td>
                <td className="border border-black p-1.5">
                  {selectedItem.tinggiBadan || selectedItem.tb ? `${selectedItem.tinggiBadan || selectedItem.tb} cm` : '-'}
                </td>
                <td className="border border-black p-1.5 font-medium">Berat Badan</td>
                <td className="border border-black p-1.5">
                  {selectedItem.beratBadan || selectedItem.bb ? `${selectedItem.beratBadan || selectedItem.bb} kg` : '-'}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-1.5 font-medium">Kehamilan</td>
                <td className="border border-black p-1.5">
                  {selectedItem.kehamilan || selectedItem.kondisiKhusus || 'Tidak'}
                </td>
                <td className="border border-black p-1.5 font-medium">Menyusui</td>
                <td className="border border-black p-1.5">
                  {selectedItem.menyusui || 'Tidak'}
                </td>
              </tr>

              {/* 3. PERTANYAAN */}
              <tr>
                <td className="border border-black p-2" colSpan={4}>
                  <p className="font-bold mb-1">
                    3. Pertanyaan: {selectedItem.uraianPertanyaan || selectedItem.pertanyaan || selectedItem.uraian || '-'}
                  </p>
                  <p className="font-semibold mt-2 mb-1">Jenis Pertanyaan:</p>
                  <div className="grid grid-cols-3 gap-2">
                    <p>[ {selectedItem.jenisPertanyaan === 'Identifikasi Obat' ? '✓' : ' '} ] Identifikasi Obat</p>
                    <p>[ {selectedItem.jenisPertanyaan === 'Stabilitas' ? '✓' : ' '} ] Stabilitas</p>
                    <p>[ {selectedItem.jenisPertanyaan === 'Farmakokinetika' ? '✓' : ' '} ] Farmakokinetika</p>
                    <p>[ {selectedItem.jenisPertanyaan === 'Interaksi Obat' ? '✓' : ' '} ] Interaksi Obat</p>
                    <p>[ {selectedItem.jenisPertanyaan === 'Dosis' ? '✓' : ' '} ] Dosis</p>
                    <p>[ {selectedItem.jenisPertanyaan === 'Farmakodinamika' ? '✓' : ' '} ] Farmakodinamika</p>
                    <p>[ {selectedItem.jenisPertanyaan === 'Harga Obat' ? '✓' : ' '} ] Harga Obat</p>
                    <p>[ {selectedItem.jenisPertanyaan === 'Keracunan' ? '✓' : ' '} ] Keracunan</p>
                    <p>[ {selectedItem.jenisPertanyaan === 'Ketersediaan Obat' ? '✓' : ' '} ] Ketersediaan Obat</p>
                    <p>[ {selectedItem.jenisPertanyaan === 'Kontraindikasi' ? '✓' : ' '} ] Kontraindikasi</p>
                    <p>[ {selectedItem.jenisPertanyaan === 'Efek Samping Obat' ? '✓' : ' '} ] Efek Samping Obat</p>
                    <p>[ {selectedItem.jenisPertanyaan === 'Lain-lain' ? '✓' : ' '} ] Lain-lain</p>
                    <p>[ {selectedItem.jenisPertanyaan === 'Cara Pemakaian' ? '✓' : ' '} ] Cara Pemakaian</p>
                    <p>[ {selectedItem.jenisPertanyaan === 'Penggunaan Terapetik' ? '✓' : ' '} ] Penggunaan Terapetik</p>
                  </div>
                </td>
              </tr>

              {/* 4. JAWABAN */}
              <tr>
                <td className="border border-black p-2 whitespace-pre-wrap" colSpan={4}>
                  <strong>4. Jawaban:</strong> {selectedItem.jawabanPIO || selectedItem.jawaban || '-'}
                </td>
              </tr>

              {/* 5. REFERENSI */}
              <tr>
                <td className="border border-black p-2" colSpan={4}>
                  <strong>5. Referensi:</strong> {selectedItem.referensi || selectedItem.pustaka || '-'}
                </td>
              </tr>

              {/* 6. PENYAMPAIAN JAWABAN */}
              <tr>
                <td className="border border-black p-2" colSpan={4}>
                  <strong>6. Penyampaian Jawaban:</strong> {selectedItem.penyampaianJawaban || 'Segera'}
                </td>
              </tr>

              {/* 7. APOTEKER YANG MENJAWAB */}
              <tr>
                <td className="border border-black p-2" colSpan={4}>
                  <p className="font-bold mb-1">
                    7. Apoteker yang menjawab: {selectedItem.apoteker || selectedItem.penanggungJawab || selectedItem.petugas || '-'}
                  </p>
                  <p>
                    <strong>Tanggal:</strong> {formatDate(selectedItem.tglJawab || selectedItem.tglPertanyaan || selectedItem.created_at)} &nbsp;&nbsp;&nbsp;&nbsp;
                    <strong>Waktu:</strong> {selectedItem.waktuJawab || formatTime(selectedItem)} WIB &nbsp;&nbsp;&nbsp;&nbsp;
                    <strong>Metode Jawaban:</strong> {selectedItem.metodeJawab || selectedItem.metodePenyampaian || 'Lisan'}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>

          {/* KETERANGAN TANGGAL CETAK REALTIME */}
          <div className="text-right text-[10px] text-slate-700 italic mt-1">
            Tanggal Cetak: {printDateTime}
          </div>
        </div>
      )}
    </>
  );
}