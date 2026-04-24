'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type BookingHistory = {
  id: string
  purpose: string
  start_time: string
  end_time: string
  status: 'pending' | 'approved_kaprodi' | 'approved_sarpras' | 'rejected' | 'ongoing' | 'completed'
  rooms: { name: string; building: string } | null
}

export default function StudentHistoryPage() {
  const [bookings, setBookings] = useState<BookingHistory[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchMyBookings = async () => {
      // 1. Ambil ID user yang sedang login
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // 2. Fetch booking milik user tersebut saja
        // 2. Fetch booking milik user tersebut saja
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            id, purpose, booking_date, start_time, end_time, status,
            rooms ( name, building )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (!error && data) {
          setBookings(data as any)
        }
      }
      setLoading(false)
    }

    fetchMyBookings()
  }, [])

  // Format Tanggal (Input: "2026-04-25" -> Output: "25 April 2026")
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  // Format Jam (Input: "08:00:00" -> Output: "08:00")
  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5)
  }

  // Helper untuk styling label status
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'approved': 
      case 'approved_kaprodi': 
      case 'approved_sarpras': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200'
      case 'ongoing': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">Riwayat Peminjaman</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600 border-r-transparent"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
          <p className="text-slate-400 font-bold">Belum ada riwayat peminjaman.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking: any) => (
            <div key={booking.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-50 shadow-xl shadow-slate-100 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(booking.status)}`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">ID: {booking.id.slice(0, 8)}</span>
                </div>
                <div>
                  <h3 className="font-black text-xl text-slate-800 group-hover:text-blue-600 transition-colors">{booking.rooms?.name}</h3>
                  <p className="text-sm text-slate-500 font-bold flex items-center gap-2 mt-1">
                    <span className="text-blue-500">📍</span> {booking.rooms?.building}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium italic leading-relaxed">" {booking.purpose} "</p>
                </div>
              </div>

              <div className="text-right border-t md:border-t-0 pt-6 md:pt-0 flex flex-col items-end">
                <div className="bg-blue-50 px-4 py-3 rounded-2xl border border-blue-100 mb-4 inline-block">
                  <p className="text-sm font-black text-blue-700">
                    {formatDate(booking.booking_date)}
                  </p>
                  <p className="text-xs font-bold text-blue-500 mt-1">
                    {formatTime(booking.start_time)} - {formatTime(booking.end_time)} WIB
                  </p>
                </div>
                
                {booking.status === 'approved_sarpras' && (
                  <button className="w-full md:w-auto bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-200 active:scale-95 flex items-center gap-2">
                    <span>📱 Scan QR Check-in</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
