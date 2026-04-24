'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LandingPage() {
  const supabase = createClient()
  
  const [liveSchedules, setLiveSchedules] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [selectedRoom, setSelectedRoom] = useState('')
  const [loading, setLoading] = useState(true)

  // Daftar Jam Operasional normal kampus
  const timeSlots = ["08:00", "09:00", "10:00", "13:00", "15:00"]

  // Ambil daftar ruangan untuk dropdown saat pertama kali dimuat
  useEffect(() => {
    async function fetchRooms() {
      const { data } = await supabase.from('rooms').select('name').order('name')
      if (data && data.length > 0) {
        setRooms(data)
        if (selectedRoom === '') {
          setSelectedRoom(data[0].name)
        }
      } else {
        setLoading(false)
      }
    }
    fetchRooms()
  }, [])

  const fetchTodaySchedules = async () => {
    if (!selectedRoom) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      // Menggunakan format en-CA agar mendapatkan YYYY-MM-DD sesuai waktu lokal pengguna
      const today = new Date().toLocaleDateString('en-CA');

      const { data, error } = await supabase
        .from('bookings')
        .select('start_time, end_time, status, rooms!inner(name)')
        .eq('booking_date', today)
        .in('status', ['approved', 'pending', 'approved_kaprodi', 'approved_sarpras', 'ongoing']) 
        .eq('rooms.name', selectedRoom);

      if (error) throw error;
      setLiveSchedules(data || []);

    } catch (err) {
      console.error("🚨 GAGAL TARIK DATA:", err);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchTodaySchedules();

    // AKTIFKAN SUPABASE REALTIME
    // Mendengarkan semua perubahan (INSERT, UPDATE, DELETE) pada tabel bookings
    const channel = supabase
      .channel('public:bookings')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bookings' }, 
        () => {
          console.log("🔄 Perubahan terdeteksi! Mengupdate jadwal...");
          fetchTodaySchedules();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedRoom]);

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans scroll-smooth">
      
      {/* --- 1. NAVBAR --- */}
      <nav className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">C</div>
          <span className="text-xl font-bold tracking-tight text-slate-800">Campus<span className="text-blue-600">Space</span></span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-bold text-slate-600 ml-auto mr-6">
          <a href="#fitur" className="hover:text-blue-600 transition-colors">Fitur</a>
          <a href="#cara-kerja" className="hover:text-blue-600 transition-colors">Cara Kerja</a>
        </div>
        <Link 
          href="/login"
          className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-full transition-all font-bold text-sm shadow-lg shadow-slate-200"
        >
          SSO Login
        </Link>
      </nav>

      <main className="flex-1">
        {/* --- 2. HERO SECTION + LIVE UPDATE WIDGET --- */}
        <section className="max-w-7xl mx-auto px-6 py-10 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Sisi Kiri: Teks Promosi */}
          <div className="space-y-6 md:space-y-8 text-center lg:text-left order-1">
            <h1 className="text-4xl md:text-7xl font-extrabold text-slate-900 leading-tight">
              Pesan Ruangan. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Tanpa Ribet.</span>
            </h1>
            <p className="text-base md:text-lg text-slate-500 max-w-md leading-relaxed mx-auto lg:mx-0 font-medium">
              Pantau ketersediaan fasilitas kampus secara real-time. Transparan, cepat, dan tidak ada lagi drama jadwal bentrok.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link 
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white font-black text-base md:text-lg px-8 md:px-10 py-4 md:py-5 rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-95 text-center"
              >
                Mulai Pinjam Sekarang
              </Link>
            </div>
          </div>

          {/* Sisi Kanan: Widget Live Update */}
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl shadow-slate-200 border border-slate-50 relative overflow-hidden min-h-[350px] md:min-h-[400px] order-2">
            
            {/* Header Widget */}
            <div className="flex justify-between items-start mb-6 md:mb-8 border-b border-slate-50 pb-6">
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Status Ruangan</p>
                <select 
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="text-2xl md:text-3xl font-black text-slate-800 bg-transparent border-none focus:ring-0 cursor-pointer p-0 mb-1 block hover:text-blue-600 transition-colors appearance-none"
                >
                  {rooms.length > 0 ? (
                    rooms.map((room, idx) => (
                      <option key={idx} value={room.name}>{room.name}</option>
                    ))
                  ) : (
                    <option disabled>Memuat Ruangan...</option>
                  )}
                </select>
                <div className="flex items-center gap-2 mt-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <p className="text-green-600 text-[10px] font-black uppercase tracking-widest">
                    Live Update: {todayFormatted}
                  </p>
                </div>
              </div>
              <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl text-[10px] font-black border border-blue-100 uppercase tracking-wider">
                Real-time
              </div>
            </div>

            {/* Konten Widget: 3 WARNA (Available, Pending, Booked) */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold animate-pulse text-sm">Sinkronisasi Jadwal...</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {timeSlots.map((slot) => {
                  // 1. CARI APAKAH ADA BOOKING DI JAM INI
                  const booking = liveSchedules.find(b => b.start_time.startsWith(slot));
                  
                  // 2. TENTUKAN STATUS KOTAK INI (3 WARNA)
                  let statusColor = 'available';
                  if (booking) {
                    statusColor = (booking.status === 'approved' || booking.status === 'approved_sarpras' || booking.status === 'ongoing') 
                      ? 'booked' 
                      : 'pending';
                  }

                  return (
                    <div 
                      key={slot}
                      className={`group relative flex items-center p-5 rounded-[2rem] border transition-all duration-500 overflow-hidden ${
                        statusColor === 'booked' ? 'bg-rose-50/50 border-rose-100 shadow-sm' :
                        statusColor === 'pending' ? 'bg-amber-50/50 border-amber-100 shadow-sm' : 
                        'bg-white border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-50 hover:-translate-y-1'
                      }`}
                    >
                      {/* Dekorasi Latar (Glow Efek) */}
                      <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full blur-3xl opacity-20 transition-all group-hover:scale-150 ${
                        statusColor === 'booked' ? 'bg-rose-400' :
                        statusColor === 'pending' ? 'bg-amber-400' : 
                        'bg-blue-400'
                      }`}></div>

                      {/* Kotak Jam (Digital Chip Style) */}
                      <div className={`mr-6 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[80px] transition-all duration-500 shadow-lg ${
                        statusColor === 'booked' ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white rotate-2' :
                        statusColor === 'pending' ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white -rotate-2' : 
                        'bg-gradient-to-br from-slate-800 to-slate-900 text-white group-hover:from-blue-600 group-hover:to-blue-700'
                      }`}>
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Time</span>
                        <span className="text-2xl font-black tracking-tighter">{slot}</span>
                      </div>
 
                      {/* Teks Status */}
                      <div className="flex-1 relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-md ${
                            statusColor === 'booked' ? 'bg-rose-100 text-rose-600' :
                            statusColor === 'pending' ? 'bg-amber-100 text-amber-700' : 
                            'bg-blue-50 text-blue-600'
                          }`}>
                            {statusColor === 'booked' ? 'Reserved' : statusColor === 'pending' ? 'Verification' : 'Open Slot'}
                          </span>
                        </div>
                        <p className={`font-black text-xl tracking-tight leading-none ${
                          statusColor === 'booked' ? 'text-rose-900' :
                          statusColor === 'pending' ? 'text-amber-900' : 
                          'text-slate-800'
                        }`}>
                          {statusColor === 'booked' ? 'Sedang Digunakan' : 
                           statusColor === 'pending' ? 'Menunggu Konfirmasi' : 
                           'Tersedia Sekarang'}
                        </p>
                      </div>
 
                      {/* Ikon Indikator */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                        statusColor === 'booked' ? 'bg-rose-100/50 text-rose-500' :
                        statusColor === 'pending' ? 'bg-amber-100/50 text-amber-500' : 
                        'bg-blue-50 text-blue-500 group-hover:bg-blue-600 group-hover:text-white'
                      }`}>
                        {statusColor === 'booked' ? (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        ) : statusColor === 'pending' ? (
                          <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* --- 3. FITUR UTAMA --- */}
        <section id="fitur" className="bg-slate-50 py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Fitur Unggulan</h2>
              <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group">
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform inline-block">📅</div>
                <h3 className="text-xl font-black text-slate-800 mb-4">Jadwal Real-time</h3>
                <p className="text-slate-500 leading-relaxed text-sm font-medium">Cek ketersediaan ruangan langsung dari HP Anda tanpa harus ke ruang administrasi.</p>
              </div>
              <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group">
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform inline-block">🛡️</div>
                <h3 className="text-xl font-black text-slate-800 mb-4">Approval Cepat</h3>
                <p className="text-slate-500 leading-relaxed text-sm font-medium">Proses persetujuan bertingkat dari Kaprodi hingga Sarpras secara digital dan transparan.</p>
              </div>
              <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group">
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform inline-block">🛠️</div>
                <h3 className="text-xl font-black text-slate-800 mb-4">Lapor Kerusakan</h3>
                <p className="text-slate-500 leading-relaxed text-sm font-medium">Temukan fasilitas rusak? Foto dan lapor langsung agar segera diperbaiki tim teknis.</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- 4. CARA KERJA --- */}
        <section id="cara-kerja" className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Cara Meminjam Fasilitas</h2>
              <p className="text-slate-500 font-medium">Ikuti 4 langkah mudah untuk reservasi ruangan kampus.</p>
              <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full mt-6"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {/* Garis Penghubung (Hanya Desktop) */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>

              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-xl shadow-blue-100 group-hover:scale-110 transition-transform mb-6">1</div>
                <h4 className="text-lg font-black text-slate-800 mb-2">Pilih Ruangan</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed px-4">Tentukan lokasi, tanggal, dan jam sesuai kebutuhan kegiatan Anda.</p>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-16 h-16 bg-white text-blue-600 border-2 border-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg shadow-slate-100 group-hover:scale-110 transition-transform mb-6">2</div>
                <h4 className="text-lg font-black text-slate-800 mb-2">Unggah Jaminan</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed px-4">Unggah foto KTM sebagai syarat jaminan keamanan fasilitas kampus.</p>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-16 h-16 bg-white text-blue-600 border-2 border-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg shadow-slate-100 group-hover:scale-110 transition-transform mb-6">3</div>
                <h4 className="text-lg font-black text-slate-800 mb-2">Approval</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed px-4">Tunggu persetujuan digital dari Kaprodi dan tim Sarpras.</p>
              </div>

              {/* Step 4 */}
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-16 h-16 bg-blue-900 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-xl shadow-slate-200 group-hover:scale-110 transition-transform mb-6">4</div>
                <h4 className="text-lg font-black text-slate-800 mb-2">Gunakan!</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed px-4">Setelah disetujui, silakan gunakan fasilitas sesuai waktu yang dijadwalkan.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 py-16 px-6 text-center border-t border-slate-800">
        <div className="text-white font-black text-2xl mb-4">Campus<span className="text-blue-500">Space</span></div>
        <p className="text-slate-500 text-sm max-w-md mx-auto mb-10 leading-relaxed font-medium">
          Sistem Informasi Manajemen Fasilitas Kampus Terintegrasi. Cepat, Transparan, dan Modern.
        </p>
        <div className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} - CampusSpace
        </div>
      </footer>
    </div>
  );
}
