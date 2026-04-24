'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Booking = {
    id: string
    purpose: string
    booking_date: string
    start_time: string
    end_time: string
    status: string
    rooms: { name: string; building: string } | null
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-700' },
    approved_kaprodi: { label: 'Disetujui Kaprodi', color: 'bg-blue-100 text-blue-700' },
    approved_sarpras: { label: 'Disetujui Sarpras', color: 'bg-green-100 text-green-700' },
    ongoing: { label: 'Sedang Berlangsung', color: 'bg-purple-100 text-purple-700' },
    completed: { label: 'Selesai', color: 'bg-slate-100 text-slate-600' },
    rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-700' },
}

export default function HistoryPage() {
    const supabase = createClient()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchHistory() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from('bookings')
                .select('id, purpose, booking_date, start_time, end_time, status, rooms(name, building)')
                .eq('user_id', user.id)
                .order('booking_date', { ascending: false })
                .order('start_time', { ascending: false })

            if (data) setBookings(data as unknown as Booking[])
            setLoading(false)
        }
        fetchHistory()
    }, [])

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900">Riwayat Peminjaman</h1>
                <p className="text-slate-500 mt-2">Daftar semua pengajuan peminjaman ruangan Anda.</p>
            </div>

            {loading ? (
                <div className="text-slate-400 animate-pulse font-bold py-20 text-center">Memuat data...</div>
            ) : bookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <p className="text-4xl mb-4">📋</p>
                    <p className="text-slate-500 font-bold">Belum ada riwayat peminjaman.</p>
                    <p className="text-slate-400 text-sm mt-1">Mulai pinjam ruangan melalui menu "Pinjam Ruangan".</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((b) => {
                        const statusInfo = STATUS_LABELS[b.status] || { label: b.status, color: 'bg-gray-100 text-gray-600' }

                        return (
                            <div key={b.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
                                <div className="flex-1">
                                    <p className="font-black text-slate-900 text-lg">{b.purpose}</p>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {b.rooms?.name} — {b.rooms?.building}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {b.booking_date} · {b.start_time.substring(0, 5)} - {b.end_time.substring(0, 5)}
                                    </p>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${statusInfo.color}`}>
                                    {statusInfo.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
