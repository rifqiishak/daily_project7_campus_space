'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function HistoryPage() {
  const supabase = createClient();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // Mengambil semua data (approved, rejected, pending)
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          rooms (name),
          profiles (full_name, nim_nip)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
        <span className="ml-4 text-slate-500 font-bold uppercase text-[10px] tracking-widest">Memuat riwayat...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Rekapitulasi Peminjaman</h1>
        <p className="text-slate-500 mt-2 font-medium">Laporan lengkap seluruh aktivitas peminjaman fasilitas kampus.</p>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-slate-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="p-8">Pemohon</th>
                <th className="p-8">Ruangan</th>
                <th className="p-8">Jadwal & Tujuan</th>
                <th className="p-8">Jaminan</th>
                <th className="p-8">Status Akhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-6">
                    <p className="font-black text-slate-800 text-sm">{item.profiles?.full_name || 'Tanpa Nama'}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{item.profiles?.nim_nip || 'ID Kosong'}</p>
                  </td>
                  <td className="p-6">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">
                      {item.rooms?.name || '-'}
                    </span>
                  </td>
                  <td className="p-6">
                    <p className="text-xs font-bold text-slate-700">{item.purpose || 'Tanpa Keterangan'}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      <span>📅 {item.booking_date}</span>
                      <span>🕒 {item.start_time.substring(0,5)} - {item.end_time.substring(0,5)}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    {item.ktm_url ? (
                      <a 
                        href={item.ktm_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 font-black hover:text-blue-700 transition-colors text-[10px] uppercase tracking-widest bg-blue-50/50 px-3 py-2 rounded-xl"
                      >
                        🖼️ Lihat KTM
                      </a>
                    ) : (
                      <span className="text-slate-300 text-[10px] font-black uppercase italic tracking-widest">Tidak Ada</span>
                    )}
                  </td>
                  <td className="p-6 text-right lg:text-left">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] shadow-sm ${
                      item.status === 'approved' ? 'bg-green-100 text-green-700' :
                      item.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
