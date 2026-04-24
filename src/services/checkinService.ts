'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function validateQrCheckIn(qrToken: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )

  // 1. Ambil User Login
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Anda belum login." }

  // 2. Cari Ruangan berdasarkan Token QR yang di-scan
  const { data: room } = await supabase
    .from('rooms')
    .select('id, name')
    .eq('qr_code_token', qrToken)
    .single()

  if (!room) return { success: false, message: "QR Code tidak valid atau bukan milik CampusSpace." }

  // 3. Cari Booking yang Valid (Milik user ini, di ruangan ini, status disetujui, dan waktunya pas)
  // Kita beri toleransi check-in 15 menit sebelum jadwal dimulai.
  const now = new Date()
  const nowIso = now.toISOString()
  
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('id, start_time, end_time')
    .eq('user_id', user.id)
    .eq('room_id', room.id)
    .eq('status', 'approved_sarpras') // Hanya yang sudah disetujui akhir
    .lte('start_time', new Date(now.getTime() + 15 * 60000).toISOString()) // Toleransi 15 menit awal
    .gte('end_time', nowIso) // Belum melewati batas selesai
    .single()

  if (!booking || bookingError) {
    return { success: false, message: `Tidak ada jadwal aktif untuk Anda di ${room.name} saat ini.` }
  }

  // 4. Update Status Booking menjadi 'ongoing' dan catat jam check-in
  const { error: updateError } = await supabase
    .from('bookings')
    .update({ 
      status: 'ongoing',
      checked_in_at: nowIso
    })
    .eq('id', booking.id)

  if (updateError) return { success: false, message: "Gagal mencatat check-in ke database." }

  return { success: true, message: `Check-in berhasil di ${room.name}! Selamat beraktivitas.` }
}
