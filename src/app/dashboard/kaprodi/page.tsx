'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// Mendefinisikan tipe data balikan dari Supabase (termasuk relasi)
type BookingWithDetails = {
  id: string
  purpose: string
  start_time: string
  end_time: string
  status: string
  profiles: { full_name: string } | null
  rooms: { name: string } | null
}

export default function KaprodiDashboard() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  const supabase = createClient()

  // 1. FETCH DATA (Hanya yang berstatus 'pending')
  useEffect(() => {
    fetchPendingBookings()
  }, [])

  const fetchPendingBookings = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        purpose,
        start_time,
        end_time,
        status,
        profiles ( full_name ),
        rooms ( name )
      `)
      .eq('status', 'pending')
      .order('start_time', { ascending: true })

    if (!error && data) {
      setBookings(data as unknown as BookingWithDetails[])
    }
    setIsLoading(false)
  }

  // 2. FUNGSI UPDATE STATUS
  const handleUpdateStatus = async (bookingId: string, newStatus: 'approved' | 'rejected') => {
    setActionLoading(bookingId)

    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId)

    if (!error) {
      setBookings((prev) => prev.filter((b) => b.id !== bookingId))
      toast.success(newStatus === 'rejected' ? 'Peminjaman ditolak.' : 'Peminjaman disetujui.')
    } else {
      toast.error('Gagal mengupdate status: ' + error.message)
    }
    
    setActionLoading(null)
  }

  // Format jam untuk UI (Input: "08:00:00" -> Output: "08:00")
  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Kaprodi</h1>
          <p className="text-gray-500 mt-1">Persetujuan Peminjaman Ruangan</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-gray-500 animate-pulse">
          Memuat data peminjaman...
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">
          <p className="text-gray-500 text-lg">Tidak ada peminjaman yang menunggu persetujuan.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-sm font-semibold text-gray-600">Peminjam</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Ruangan</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Waktu Mulai - Selesai</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Keperluan</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-800">
                    {booking.profiles?.full_name || 'User Tidak Diketahui'}
                  </td>
                  <td className="p-4 text-gray-600">
                    {booking.rooms?.name || 'Ruang Dihapus'}
                  </td>
                  <td className="p-4 text-gray-600 text-sm">
                    <div className="font-bold text-slate-800">{formatTime(booking.start_time)}</div>
                    <div className="text-slate-400 font-medium">s/d {formatTime(booking.end_time)}</div>
                  </td>
                  <td className="p-4 text-gray-600 text-sm max-w-xs truncate">
                    {booking.purpose}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'rejected')}
                      disabled={actionLoading === booking.id}
                      className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Tolak
                    </button>
                    
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'approved')}
                      disabled={actionLoading === booking.id}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading === booking.id ? 'Memproses...' : 'Setujui'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
