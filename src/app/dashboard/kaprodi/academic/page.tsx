'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function ManageAcademicPage() {
  const supabase = createClient();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Modal Hapus
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);

  // State Form
  const [formData, setFormData] = useState({
    room_id: '',
    day_of_week: '1',
    start_time: '',
    end_time: '',
    subject: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: roomsData } = await supabase.from('rooms').select('*');
      setRooms(roomsData || []);

      const { data: schedulesData } = await supabase
        .from('academic_schedules')
        .select('*, rooms(name)')
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });
      
      setSchedules(schedulesData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('academic_schedules').insert([formData]);
      if (error) throw error;
      
      toast.success("Jadwal berhasil ditambahkan! 🎓");
      setFormData({ ...formData, subject: '', start_time: '', end_time: '' });
      fetchData(); 
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal menambah jadwal: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (!scheduleToDelete) return;
    
    const { error } = await supabase.from('academic_schedules').delete().eq('id', scheduleToDelete);
    if (error) {
      toast.error("Gagal menghapus: " + error.message);
    } else {
      toast.success("Jadwal berhasil dihapus.");
      fetchData();
    }
    setScheduleToDelete(null);
  };

  const getDayName = (day: string) => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return days[parseInt(day)];
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      
      {/* Modal Konfirmasi Hapus Kustom */}
      <ConfirmModal 
        isOpen={!!scheduleToDelete}
        onClose={() => setScheduleToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Jadwal Kuliah?"
        message="Data jadwal ini akan dihapus permanen dan sistem akan mengizinkan peminjaman ruangan di waktu tersebut."
        confirmText="Ya, Hapus Jadwal"
        cancelText="Jangan Hapus"
        type="danger"
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Kelola Jadwal Akademik</h1>
          <p className="text-slate-500 mt-2 font-medium">Input jadwal rutin kuliah (SIAKAD) untuk menghindari jadwal bentrok.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* FORM INPUT */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50 sticky top-10">
            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <span className="p-2 bg-blue-100 text-blue-600 rounded-xl">➕</span> Tambah Jadwal
            </h3>
            
            <form onSubmit={handleAddSchedule} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Pilih Ruangan</label>
                <select 
                  required
                  value={formData.room_id}
                  onChange={(e) => setFormData({...formData, room_id: e.target.value})}
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50/50 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
                >
                  <option value="">-- Pilih Ruangan --</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Hari</label>
                <select 
                  value={formData.day_of_week}
                  onChange={(e) => setFormData({...formData, day_of_week: e.target.value})}
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50/50 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
                >
                  <option value="1">Senin</option>
                  <option value="2">Selasa</option>
                  <option value="3">Rabu</option>
                  <option value="4">Kamis</option>
                  <option value="5">Jumat</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Jam Mulai</label>
                  <input 
                    type="time" 
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50/50 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Jam Selesai</label>
                  <input 
                    type="time" 
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50/50 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nama Mata Kuliah</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Pemrograman Web"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50/50 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-95"
              >
                Simpan Jadwal
              </button>
            </form>
          </div>
        </div>

        {/* TABEL DATA */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar pb-4">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ruangan</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mata Kuliah</th>
                    <th className="p-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {schedules.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-6">
                        <span className="font-black text-slate-800">{s.rooms?.name}</span>
                      </td>
                      <td className="p-6 text-sm">
                        <div className="font-bold text-slate-700">{getDayName(s.day_of_week)}</div>
                        <div className="text-slate-400 font-medium">{s.start_time.substring(0,5)} - {s.end_time.substring(0,5)}</div>
                      </td>
                      <td className="p-6">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-black uppercase">
                          {s.subject}
                        </span>
                      </td>
                      <td className="p-6 text-center">
                        <button 
                          onClick={() => setScheduleToDelete(s.id)}
                          className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all shadow-sm hover:shadow-rose-100"
                          title="Hapus Jadwal"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {schedules.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-20 text-center text-slate-400 font-medium italic">
                        Belum ada jadwal rutin yang terdaftar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
