'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function ApprovalPage() {
  const supabase = createClient();
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // STATE UNTUK MODAL GAMBAR
  const [selectedKtm, setSelectedKtm] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const fetchPendingBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          rooms (name),
          profiles (full_name, nim_nip)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingBookings(data || []);
    } catch (error) {
      console.error('Error fetching approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approved_kaprodi' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: action })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Peminjaman berhasil ${action === 'approved_kaprodi' ? 'disetujui Kaprodi' : 'ditolak'}!`);
      fetchPendingBookings(); 
    } catch (error: any) {
      toast.error('Gagal memproses aksi: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600 border-r-transparent"></div>
        <span className="ml-4 text-slate-500 font-bold animate-pulse tracking-widest uppercase text-xs">Memuat antrean...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-10 relative">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Persetujuan Peminjaman</h1>
        <p className="text-slate-500 mt-2 font-medium">Klik tombol "Lihat KTM" untuk memvalidasi identitas pemohon.</p>
      </div>

      {pendingBookings.length === 0 ? (
        <div className="bg-white p-20 text-center rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50">
          <div className="text-6xl mb-6 text-slate-200">🎉</div>
          <p className="text-slate-400 text-xl font-bold">Semua permintaan telah diproses.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingBookings.map((booking) => (
            <div key={booking.id} className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 hover:shadow-2xl hover:border-blue-100 transition-all duration-300">
              
              <div className="space-y-4 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-blue-600 text-white font-black px-4 py-1.5 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100">
                    {booking.rooms?.name || 'Ruangan Dihapus'}
                  </span>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-tight">
                      👤 {booking.profiles?.full_name || 'Tanpa Nama'} <span className="text-slate-400 ml-1">({booking.profiles?.nim_nip || 'NIM Kosong'})</span>
                    </span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-black text-slate-800 leading-tight">
                  {booking.purpose || 'Tanpa Keterangan'}
                </h3>
                
                <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-2">📅 {booking.booking_date}</span>
                  <span className="flex items-center gap-2">🕒 {booking.start_time.substring(0,5)} - {booking.end_time.substring(0,5)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto border-t lg:border-t-0 pt-6 lg:pt-0 border-slate-50">
                {booking.ktm_url ? (
                  <button 
                    onClick={() => setSelectedKtm(booking.ktm_url)}
                    className="flex justify-center items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-blue-600 font-black rounded-2xl transition-all text-[11px] border-2 border-blue-50 uppercase tracking-widest"
                  >
                    📸 Lihat KTM
                  </button>
                ) : (
                  <span className="flex justify-center items-center px-6 py-3 bg-rose-50 text-rose-500 font-black rounded-2xl text-[10px] border border-rose-100 uppercase tracking-widest">
                    KTM Tidak Ada
                  </span>
                )}

                <button 
                  onClick={() => handleAction(booking.id, 'rejected')}
                  className="px-8 py-3 bg-white text-rose-600 hover:bg-rose-50 font-black rounded-2xl border-2 border-rose-50 transition-all text-[11px] uppercase tracking-widest"
                >
                  Tolak
                </button>
                <button 
                  onClick={() => handleAction(booking.id, 'approved_kaprodi')}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl shadow-xl shadow-green-100 transition-all text-[11px] uppercase tracking-widest"
                >
                  Setujui
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* POPUP MODAL GAMBAR KTM */}
      {selectedKtm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md transition-all duration-300">
          {/* Overlay untuk klik tutup */}
          <div className="absolute inset-0" onClick={() => setSelectedKtm(null)}></div>
          
          <div className="relative w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl p-4 z-10 animate-in fade-in zoom-in-95 duration-300">
            {/* Tombol Close Modern */}
            <button 
              onClick={() => setSelectedKtm(null)}
              className="absolute -top-4 -right-4 bg-rose-500 hover:bg-rose-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-2xl border-4 border-white transition-all hover:scale-110 active:scale-95"
            >
              ✕
            </button>
            
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-slate-50">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Validasi KTM Digital</h4>
            </div>

            {/* Kontainer Gambar */}
            <div className="w-full bg-slate-50 rounded-[1.5rem] overflow-hidden flex items-center justify-center min-h-[400px] mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={selectedKtm} 
                alt="Foto Jaminan KTM" 
                className="max-w-full max-h-[70vh] object-contain shadow-sm"
              />
            </div>

            <div className="p-6 text-center">
              <button 
                onClick={() => setSelectedKtm(null)}
                className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
              >
                Klik di mana saja untuk menutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
