'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')
  const [stats, setStats] = useState({ rooms: 0, bookings: 0, reports: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      // Ambil data user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)

        if (profiles && profiles.length > 0) {
          const profile = profiles[0]
          setUserName(profile.full_name)
          setUserRole(profile.role)
        } else {
          // Fallback ke user_metadata
          setUserName(user.user_metadata?.full_name || user.email || 'User')
          setUserRole(user.user_metadata?.role || 'mahasiswa')
        }
      }

      // Ambil statistik ringkas
      const { count: roomCount } = await supabase.from('rooms').select('*', { count: 'exact', head: true })
      const { count: bookingCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true })
      const { count: reportCount } = await supabase.from('damage_reports').select('*', { count: 'exact', head: true })

      setStats({
        rooms: roomCount || 0,
        bookings: bookingCount || 0,
        reports: reportCount || 0,
      })
      setIsLoading(false)
    }
    loadDashboard()
  }, [])

  const roleLabel = userRole === 'staf_sarpras' ? 'Staf Sarpras' : userRole === 'kaprodi' ? 'Kaprodi' : 'Mahasiswa'

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-slate-400 animate-pulse font-bold text-lg">Memuat Dashboard...</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Sambutan */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900">
          Selamat Datang, {userName}! 👋
        </h1>
        <p className="text-slate-500 mt-2">
          Anda login sebagai <span className="font-bold text-blue-600">{roleLabel}</span>. Berikut ringkasan sistem hari ini.
        </p>
      </div>

      {/* Statistik Kartu */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-4xl mb-3">🏢</div>
          <p className="text-3xl font-black text-slate-900">{stats.rooms}</p>
          <p className="text-sm text-slate-500 font-bold mt-1">Total Ruangan</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-3xl font-black text-blue-600">{stats.bookings}</p>
          <p className="text-sm text-slate-500 font-bold mt-1">Total Peminjaman</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-4xl mb-3">🔧</div>
          <p className="text-3xl font-black text-orange-500">{stats.reports}</p>
          <p className="text-sm text-slate-500 font-bold mt-1">Laporan Kerusakan</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-black text-slate-800 mb-6">Aksi Cepat</h2>
        <div className="flex flex-wrap gap-4">
          {userRole === 'mahasiswa' && (
            <>
              <button onClick={() => router.push('/dashboard/mahasiswa/book')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all">
                Pinjam Ruangan
              </button>
              <button onClick={() => router.push('/dashboard/mahasiswa/report')} className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 py-3 rounded-xl transition-all">
                Lapor Kerusakan
              </button>
            </>
          )}
          {userRole === 'kaprodi' && (
            <button onClick={() => router.push('/dashboard/kaprodi/approval')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all">
              Review Persetujuan
            </button>
          )}
          {userRole === 'staf_sarpras' && (
            <>
              <button onClick={() => router.push('/dashboard/sarpras/rooms')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all">
                Kelola Ruangan
              </button>
              <button onClick={() => router.push('/dashboard/sarpras/qr-manager')} className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 py-3 rounded-xl transition-all">
                Manajemen QR
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
