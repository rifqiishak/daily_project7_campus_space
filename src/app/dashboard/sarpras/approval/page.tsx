'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function SarprasApprovalPage() {
  const supabase = createClient();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKtm, setSelectedKtm] = useState<string | null>(null);

  useEffect(() => {
    fetchApprovedKaprodi();
  }, []);

  const fetchApprovedKaprodi = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          rooms (name, building),
          profiles (full_name, nim_nip)
        `)
        .eq('status', 'approved_kaprodi')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      toast.error('Gagal mengambil data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalAction = async (id: string, action: 'approved_sarpras' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: action })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(action === 'approved_sarpras' ? 'Peminjaman DISAHKAN sepenuhnya!' : 'Peminjaman DITOLAK pada tahap akhir.');
      fetchApprovedKaprodi(); 
    } catch (error: any) {
      toast.error('Gagal memproses aksi: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600 border-r-transparent"></div>
        <span className="ml-4 text-slate-500 font-black animate-pulse tracking-widest uppercase text-[10px]">Verifikasi Akhir...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-950 tracking-tight">Verifikasi Sarpras</h1>
        <p className="text-slate-500 mt-2 font-bold italic">Langkah terakhir untuk mengesahkan peminjaman ruangan.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white p-20 text-center rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50">
          <div className="text-6xl mb-6">✅</div>
          <p className="text-slate-900 text-xl font-black">Semua Beres!</p>
          <p className="text-slate-400 font-bold mt-2">Tidak ada peminjaman yang menunggu verifikasi akhir Sarpras.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 hover:shadow-2xl transition-all duration-300">
              
              <div className="space-y-4 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-blue-600 text-white font-black px-4 py-1.5 rounded-xl text-[10px] uppercase tracking-widest">
                    {booking.rooms?.name}
                  </span>
                  <span className="bg-green-50 text-green-600 font-black px-3 py-1.5 rounded-xl text-[9px] uppercase tracking-widest border border-green-100">
                    Disetujui Kaprodi
                  </span>
                </div>
                
                <h3 className="text-2xl font-black text-slate-950 tracking-tight leading-tight">
                  {booking.purpose}
                </h3>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-2 text-slate-700">👤 {booking.profiles?.full_name}</span>
                  <span className="flex items-center gap-2">📅 {booking.booking_date}</span>
                  <span className="flex items-center gap-2">🕒 {booking.start_time.substring(0,5)} - {booking.end_time.substring(0,5)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto pt-6 lg:pt-0 border-t lg:border-t-0 border-slate-50">
                <button 
                  onClick={() => setSelectedKtm(booking.ktm_url)}
                  className="px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-black rounded-2xl transition-all text-[10px] uppercase tracking-widest"
                >
                  Lihat KTM
                </button>
                <button 
                  onClick={() => handleFinalAction(booking.id, 'rejected')}
                  className="px-6 py-3 bg-rose-50 text-rose-600 hover:bg-rose-100 font-black rounded-2xl transition-all text-[10px] uppercase tracking-widest"
                >
                  Tolak
                </button>
                <button 
                  onClick={() => handleFinalAction(booking.id, 'approved_sarpras')}
                  className="px-8 py-3 bg-slate-950 hover:bg-black text-white font-black rounded-2xl shadow-xl shadow-slate-200 transition-all text-[10px] uppercase tracking-widest"
                >
                  Sahkan Peminjaman
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL GAMBAR KTM */}
      {selectedKtm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md" onClick={() => setSelectedKtm(null)}>
          <div className="relative max-w-3xl w-full bg-white rounded-[2rem] overflow-hidden p-4 shadow-2xl" onClick={e => e.stopPropagation()}>
             <img src={selectedKtm} alt="KTM" className="w-full h-auto rounded-xl max-h-[80vh] object-contain" />
             <button onClick={() => setSelectedKtm(null)} className="absolute top-6 right-6 w-10 h-10 bg-rose-500 text-white rounded-full font-bold">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
