'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]; 

export default function HeatmapPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState('all');
  
  const [densityMatrix, setDensityMatrix] = useState<number[][]>(
    Array(7).fill(0).map(() => Array(10).fill(0))
  );

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  useEffect(() => {
    fetchData();
  }, [selectedRoom]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: roomsData } = await supabase.from('rooms').select('*').order('name');
      setRooms(roomsData || []);

      let newMatrix = Array(7).fill(0).map(() => Array(10).fill(0));

      let bookingQuery = supabase.from('bookings').select('booking_date, start_time').in('status', ['approved', 'approved_kaprodi', 'approved_sarpras', 'ongoing']);
      if (selectedRoom !== 'all') bookingQuery = bookingQuery.eq('room_id', selectedRoom);
      const { data: bookings } = await bookingQuery;

      let academicQuery = supabase.from('academic_schedules').select('day_of_week, start_time');
      if (selectedRoom !== 'all') academicQuery = academicQuery.eq('room_id', selectedRoom);
      const { data: academics } = await academicQuery;

      bookings?.forEach((b) => {
        const date = new Date(b.booking_date);
        let dayIndex = date.getDay(); 
        dayIndex = dayIndex === 0 ? 6 : dayIndex - 1; 

        const hourStr = b.start_time.split(':')[0];
        const hour = parseInt(hourStr, 10);
        const hourIndex = hour - 8; 

        if (dayIndex >= 0 && dayIndex < 7 && hourIndex >= 0 && hourIndex < 10) {
          newMatrix[dayIndex][hourIndex] += 1;
        }
      });

      academics?.forEach((a) => {
        const dayIndex = parseInt(a.day_of_week, 10) - 1; 
        const hourStr = a.start_time.split(':')[0];
        const hour = parseInt(hourStr, 10);
        const hourIndex = hour - 8;

        if (dayIndex >= 0 && dayIndex < 7 && hourIndex >= 0 && hourIndex < 10) {
          newMatrix[dayIndex][hourIndex] += 1; 
        }
      });

      setDensityMatrix(newMatrix);
    } catch (error) {
      console.error("Gagal memuat heatmap:", error);
    } finally {
      setLoading(false);
    }
  };

  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-slate-50/50 hover:bg-slate-100 border-transparent';
    if (count === 1) return 'bg-blue-100 border-blue-200 text-blue-700 shadow-sm';
    if (count === 2) return 'bg-blue-400 border-blue-500 text-white shadow-md scale-[1.02]';
    if (count >= 3) return 'bg-blue-700 border-blue-800 text-white shadow-lg scale-[1.05]';
    return 'bg-slate-50';
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
        <div>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Heatmap</h1>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  {todayFormatted}
                </span>
            </div>
          </div>
          <p className="text-slate-500 font-medium max-w-lg">Analisis penggunaan ruangan berdasarkan intensitas kegiatan akademik dan peminjaman mahasiswa.</p>
        </div>
        
        <div className="w-full md:w-80">
          <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">Filter Ruangan</label>
          <select 
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-white font-black text-slate-700 focus:border-blue-600 outline-none transition-all shadow-sm appearance-none cursor-pointer"
          >
            <option value="all">📊 Semua Ruangan</option>
            {rooms.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-50 overflow-x-auto custom-scrollbar">
        
        {/* LEGENDA */}
        <div className="flex justify-end items-center gap-8 mb-12 border-b border-slate-50 pb-8">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kepadatan:</span>
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-lg bg-slate-100" title="Kosong"></div>
              <div className="w-6 h-6 rounded-lg bg-blue-100" title="1 Kegiatan"></div>
              <div className="w-6 h-6 rounded-lg bg-blue-400" title="2 Kegiatan"></div>
              <div className="w-6 h-6 rounded-lg bg-blue-700" title="3+ Kegiatan"></div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-slate-400 font-black text-[10px] uppercase tracking-widest">Sinkronisasi Matriks...</p>
          </div>
        ) : (
          <div className="min-w-[900px] pb-4">
            {/* Header Hari */}
            <div className="grid grid-cols-8 gap-4 mb-8">
              <div className="text-right pr-6 text-[10px] font-black text-slate-300 uppercase pt-4 tracking-widest">Time / Day</div>
              {DAYS.map(day => (
                <div key={day} className="text-center">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">{day}</span>
                </div>
              ))}
            </div>

            {/* Baris Jam */}
            <div className="space-y-4">
              {HOURS.map((hour, hourIndex) => (
                <div key={hour} className="grid grid-cols-8 gap-4">
                  <div className="text-right pr-6 text-xs font-black text-slate-400 flex items-center justify-end tracking-tighter">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  {DAYS.map((_, dayIndex) => {
                    const count = densityMatrix[dayIndex][hourIndex];
                    return (
                      <div 
                        key={`${dayIndex}-${hourIndex}`}
                        className={`h-20 rounded-[1.5rem] border-2 flex items-center justify-center transition-all duration-300 cursor-help ${getColorClass(count)}`}
                        title={`${count} kegiatan pada ${DAYS[dayIndex]} jam ${hour}:00`}
                      >
                        {count > 0 && (
                          <div className="text-center">
                            <p className="text-2xl font-black">{count}</p>
                            <p className="text-[8px] font-bold uppercase opacity-60 tracking-widest -mt-1">Event</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
