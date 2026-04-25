'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LandingPage() {
  const supabase = createClient()
  
  const [liveSchedules, setLiveSchedules] = useState<any[]>([])
  const [academicSchedules, setAcademicSchedules] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [selectedRoom, setSelectedRoom] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  // Daftar Jam Operasional lengkap (termasuk jam 12:00 dan 14:00)
  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"]

  // 1. Ambil daftar ruangan untuk filter dropdown
  useEffect(() => {
    const fetchRooms = async () => {
      const { data } = await supabase.from('rooms').select('*').order('name');
      if (data) setRooms(data);
    };
    fetchRooms();
  }, []);

  const fetchTodaySchedules = async () => {
    setLoading(true);
    const today = new Date();
    const todayDateString = today.toLocaleDateString('en-CA'); 
    const currentDayOfWeek = today.getDay(); // 0 (Minggu) sampai 6 (Sabtu)

    // --- 1. BLOK BOOKING (Jalan Setiap Hari) ---
    try {
      let bookingQuery = supabase
        .from('bookings')
        .select('start_time, end_time, status, purpose, rooms(name)')
        .eq('booking_date', todayDateString)
        .in('status', ['approved', 'pending', 'approved_kaprodi', 'approved_sarpras', 'ongoing']);

      if (selectedRoom !== 'all') {
        bookingQuery = bookingQuery.eq('room_id', selectedRoom);
      }

      const { data: bookingsData, error: bookingsError } = await bookingQuery;
      if (!bookingsError) setLiveSchedules(bookingsData || []); 
    } catch (err) {
      console.error("🚨 GAGAL TARIK BOOKING:", err);
    }

    // --- 2. BLOK AKADEMIK (Hanya Jalan Senin - Jumat) ---
    if (currentDayOfWeek >= 1 && currentDayOfWeek <= 5) {
      try {
        let academicQuery = supabase
          .from('academic_schedules')
          .select('start_time, end_time, subject_name, rooms(name)')
          .eq('day_of_week', String(currentDayOfWeek));

        if (selectedRoom !== 'all') {
          academicQuery = academicQuery.eq('room_id', selectedRoom);
        }

        const { data: academicData, error: academicError } = await academicQuery;
        if (academicError) throw academicError;
        
        setAcademicSchedules(academicData || []);
      } catch (err) {
        console.error("🚨 GAGAL TARIK AKADEMIK:", err);
        setAcademicSchedules([]); 
      }
    } else {
      console.log("ℹ️ Hari Libur Akhir Pekan: Tidak ada jadwal akademik rutin.");
      setAcademicSchedules([]);
    }

    setLoading(false); 
  };

  useEffect(() => {
    fetchTodaySchedules();
  }, [selectedRoom]);

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  // Fungsi sakti untuk mencegah tulisan "UNDEFINED"
  const getSafeRoomName = (roomData: any) => {
    if (!roomData) return "RUANGAN UMUM";
    if (Array.isArray(roomData)) return roomData[0]?.name || "RUANGAN";
    return roomData.name || "RUANGAN";
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-blue-100">
      
      {/* NAVBAR */}
      <nav className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 py-5 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-200">C</div>
          <span className="text-2xl font-black tracking-tighter text-slate-950">Campus<span className="text-blue-600">Space</span></span>
        </div>
        <div className="hidden md:flex gap-10 text-sm font-extrabold text-slate-500 ml-auto mr-10 uppercase tracking-widest">
          <a href="#fitur" className="hover:text-blue-600 transition-all">Fitur</a>
          <a href="#cara-kerja" className="hover:text-blue-600 transition-all">Cara Kerja</a>
        </div>
        <Link 
          href="/login"
          className="bg-slate-950 hover:bg-black text-white px-8 py-3 rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95"
        >
          SSO Login
        </Link>
      </nav>

      <main className="flex-1">
        {/* HERO + LIVE UPDATE */}
        <section className="max-w-7xl mx-auto px-6 py-12 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          
          <div className="space-y-8 text-center lg:text-left order-1">
            <h1 className="text-5xl md:text-8xl font-black text-slate-950 leading-[0.9] tracking-tighter">
              Pesan Ruangan. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Tanpa Ribet.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-md leading-relaxed mx-auto lg:mx-0 font-bold">
              Pantau ketersediaan fasilitas kampus secara real-time. Transparan, cepat, dan terintegrasi langsung dengan jadwal perkuliahan.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-4">
              <Link 
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white font-black text-lg px-12 py-6 rounded-[2rem] shadow-2xl shadow-blue-200 transition-all active:scale-95 text-center"
              >
                Mulai Pinjam Sekarang
              </Link>
            </div>
          </div>

          {/* WIDGET LIVE UPDATE DENGAN FILTER ELEGAN */}
          <div className="bg-white rounded-[3rem] p-8 md:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-slate-50 relative overflow-hidden min-h-[450px] order-2">
            
            <div className="flex justify-between items-start mb-10 border-b border-slate-50 pb-8">
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-2">Live Status Kampus</p>
                <h2 className="text-3xl font-black text-slate-950 tracking-tighter">Status Ruangan</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <p className="text-green-600 text-[10px] font-black uppercase tracking-widest">
                    Update Terkini: {todayFormatted}
                  </p>
                </div>
              </div>
              
              {/* DROPDOWN FILTER ELEGAN */}
              <div className="flex flex-col items-end gap-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Filter Lokasi</span>
                <select 
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="bg-slate-50 border-2 border-slate-100 text-slate-950 text-xs font-black rounded-xl px-5 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all cursor-pointer shadow-sm appearance-none"
                >
                  <option value="all">🌐 Semua Ruangan</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-slate-400 font-extrabold text-xs uppercase tracking-widest">Sinkronisasi Jadwal...</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar">
                {timeSlots.map((slot) => {
                  const slotHour = slot.substring(0, 2);
                  
                  const academic = academicSchedules.find(a => a.start_time.startsWith(slotHour));
                  const booking = liveSchedules.find(b => b.start_time.startsWith(slotHour));
                  
                  let statusColor = 'available';
                  let mainText = 'Tersedia Sekarang';
                  let badgeText = 'Open Slot';
                  let roomName = 'Siap Untuk Dipesan';
                  let icon = '✔️';

                  if (academic) {
                    statusColor = 'academic';
                    mainText = academic.subject_name;
                    badgeText = 'Kuliah Aktif';
                    roomName = `RUANGAN: ${getSafeRoomName(academic.rooms)}`;
                    icon = '📚';
                  } else if (booking) {
                    statusColor = (booking.status === 'approved' || booking.status === 'approved_sarpras' || booking.status === 'ongoing') ? 'booked' : 'pending';
                    mainText = booking.purpose || 'Kegiatan Mahasiswa';
                    badgeText = statusColor === 'booked' ? 'Reserved' : 'Verification';
                    roomName = `DI ${getSafeRoomName(booking.rooms)}`;
                    icon = statusColor === 'booked' ? '🔒' : '⏳';
                  }

                  return (
                    <div 
                      key={slot}
                      className={`group relative flex items-center p-6 rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${
                        statusColor === 'booked' ? 'bg-rose-50/40 border-rose-100' :
                        statusColor === 'pending' ? 'bg-amber-50/40 border-amber-100' : 
                        statusColor === 'academic' ? 'bg-indigo-50/40 border-indigo-100' :
                        'bg-white border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-50/50 hover:-translate-y-1'
                      }`}
                    >
                      {/* Glow Dekorasi */}
                      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20 transition-all group-hover:scale-150 ${
                        statusColor === 'booked' ? 'bg-rose-400' :
                        statusColor === 'pending' ? 'bg-amber-400' : 
                        statusColor === 'academic' ? 'bg-indigo-400' :
                        'bg-blue-400'
                      }`}></div>

                      {/* Kotak Jam (Digital Style) */}
                      <div className={`mr-6 p-5 rounded-[1.5rem] flex flex-col items-center justify-center min-w-[90px] transition-all duration-500 shadow-xl ${
                        statusColor === 'booked' ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white rotate-2' :
                        statusColor === 'pending' ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white -rotate-2' : 
                        statusColor === 'academic' ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white' :
                        'bg-gradient-to-br from-slate-900 to-slate-950 text-white group-hover:from-blue-600 group-hover:to-blue-700'
                      }`}>
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">Time</span>
                        <span className="text-3xl font-black tracking-tighter">{slot}</span>
                      </div>
 
                      {/* Teks Status */}
                      <div className="flex-1 relative z-10">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-lg ${
                            statusColor === 'booked' ? 'bg-rose-100 text-rose-600' :
                            statusColor === 'pending' ? 'bg-amber-100 text-amber-700' : 
                            statusColor === 'academic' ? 'bg-indigo-100 text-indigo-700' :
                            'bg-blue-50 text-blue-600'
                          }`}>
                            {badgeText}
                          </span>
                        </div>
                        <p className={`font-black text-xl tracking-tight leading-none mb-1.5 ${
                          statusColor === 'booked' ? 'text-rose-950' :
                          statusColor === 'pending' ? 'text-amber-950' : 
                          statusColor === 'academic' ? 'text-indigo-950' :
                          'text-slate-950'
                        }`}>
                          {mainText}
                        </p>
                        <p className={`text-[10px] font-extrabold uppercase tracking-widest ${
                          statusColor === 'booked' ? 'text-rose-500' :
                          statusColor === 'pending' ? 'text-amber-600' : 
                          statusColor === 'academic' ? 'text-indigo-500' :
                          'text-slate-400'
                        }`}>
                          {roomName}
                        </p>
                      </div>
 
                      {/* Ikon Indikator */}
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 bg-white shadow-sm border border-slate-50 ${
                        statusColor === 'booked' ? 'text-rose-500' :
                        statusColor === 'pending' ? 'text-amber-500' : 
                        statusColor === 'academic' ? 'text-indigo-500' :
                        'text-blue-500'
                      }`}>
                        <span className="text-xl">{icon}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* FITUR */}
        <section id="fitur" className="bg-slate-50/50 py-24 border-y border-slate-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-20">
              <p className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] mb-3">Keunggulan Utama</p>
              <h2 className="text-4xl md:text-5xl font-black text-slate-950 mb-4 tracking-tighter">Fitur Terintegrasi</h2>
              <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="bg-white p-12 rounded-[3rem] shadow-xl shadow-slate-100 border border-slate-50 hover:-translate-y-2 transition-all duration-500 group">
                <div className="text-5xl mb-8 bg-slate-50 w-20 h-20 flex items-center justify-center rounded-3xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">📅</div>
                <h3 className="text-2xl font-black text-slate-950 mb-4 tracking-tight">Jadwal Real-time</h3>
                <p className="text-slate-500 leading-relaxed font-bold text-sm">Cek ketersediaan ruangan kampus langsung dari smartphone Anda tanpa drama jadwal bentrok.</p>
              </div>
              <div className="bg-white p-12 rounded-[3rem] shadow-xl shadow-slate-100 border border-slate-50 hover:-translate-y-2 transition-all duration-500 group">
                <div className="text-5xl mb-8 bg-slate-50 w-20 h-20 flex items-center justify-center rounded-3xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">🛡️</div>
                <h3 className="text-2xl font-black text-slate-950 mb-4 tracking-tight">Approval Digital</h3>
                <p className="text-slate-500 leading-relaxed font-bold text-sm">Proses persetujuan terintegrasi dari Kaprodi hingga Sarpras secara digital dan transparan.</p>
              </div>
              <div className="bg-white p-12 rounded-[3rem] shadow-xl shadow-slate-100 border border-slate-50 hover:-translate-y-2 transition-all duration-500 group">
                <div className="text-5xl mb-8 bg-slate-50 w-20 h-20 flex items-center justify-center rounded-3xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">🛠️</div>
                <h3 className="text-2xl font-black text-slate-950 mb-4 tracking-tight">Lapor Kerusakan</h3>
                <p className="text-slate-500 leading-relaxed font-bold text-sm">Temukan fasilitas rusak? Foto dan lapor langsung agar segera ditangani tim teknis.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CARA KERJA */}
        <section id="cara-kerja" className="py-32 bg-white">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] mb-3">Langkah Mudah</p>
            <h2 className="text-4xl md:text-5xl font-black text-slate-950 mb-20 tracking-tighter">Cara Meminjam Fasilitas</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>

              <div className="relative z-10 flex flex-col items-center group">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center text-3xl font-black shadow-2xl shadow-blue-200 group-hover:scale-110 transition-all duration-500 mb-8">1</div>
                <h4 className="text-xl font-black text-slate-950 mb-3 tracking-tight">Pilih Ruangan</h4>
                <p className="text-sm text-slate-500 font-bold leading-relaxed px-6">Tentukan lokasi, tanggal, dan jam sesuai kebutuhan kegiatan Anda.</p>
              </div>

              <div className="relative z-10 flex flex-col items-center group">
                <div className="w-20 h-20 bg-white text-blue-600 border-2 border-blue-600 rounded-3xl flex items-center justify-center text-3xl font-black shadow-xl group-hover:scale-110 transition-all duration-500 mb-8">2</div>
                <h4 className="text-xl font-black text-slate-950 mb-3 tracking-tight">Unggah KTM</h4>
                <p className="text-sm text-slate-500 font-bold leading-relaxed px-6">Unggah foto kartu identitas sebagai syarat jaminan keamanan fasilitas.</p>
              </div>

              <div className="relative z-10 flex flex-col items-center group">
                <div className="w-20 h-20 bg-white text-blue-600 border-2 border-blue-600 rounded-3xl flex items-center justify-center text-3xl font-black shadow-xl group-hover:scale-110 transition-all duration-500 mb-8">3</div>
                <h4 className="text-xl font-black text-slate-950 mb-3 tracking-tight">Approval</h4>
                <p className="text-sm text-slate-500 font-bold leading-relaxed px-6">Tunggu persetujuan digital dari Kaprodi dan tim administrasi Sarpras.</p>
              </div>

              <div className="relative z-10 flex flex-col items-center group">
                <div className="w-20 h-20 bg-slate-950 text-white rounded-3xl flex items-center justify-center text-3xl font-black shadow-2xl group-hover:scale-110 transition-all duration-500 mb-8">4</div>
                <h4 className="text-xl font-black text-slate-950 mb-3 tracking-tight">Gunakan!</h4>
                <p className="text-sm text-slate-500 font-bold leading-relaxed px-6">Setelah disetujui, silakan gunakan fasilitas kampus sesuai jadwal.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 py-20 px-6 text-center border-t border-slate-900">
        <div className="text-white font-black text-3xl mb-6 tracking-tighter">Campus<span className="text-blue-500">Space</span></div>
        <p className="text-slate-500 text-sm max-w-md mx-auto mb-12 leading-relaxed font-bold">
          Sistem Informasi Manajemen Fasilitas Kampus Terintegrasi. Cepat, Transparan, dan Modern.
        </p>
        <div className="text-slate-700 text-[10px] font-black uppercase tracking-[0.4em]">
          &copy; {new Date().getFullYear()} - CampusSpace V1.0
        </div>
      </footer>
    </div>
  );
}
