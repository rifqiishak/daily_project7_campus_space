'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Tipe balikan untuk memudahkan frontend menangani error
type AvailabilityResult = {
  isAvailable: boolean;
  message: string;
}

export async function checkRoomAvailability(
  roomId: string,
  bookingDate: string,  // '2026-04-25'
  startTimeStr: string, // '08:00:00'
  endTimeStr: string    // '10:00:00'
): Promise<AvailabilityResult> {

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )

  // 1. CEK JADWAL SIAKAD (academic_schedules)
  // Ekstrak Hari (0 = Minggu, 1 = Senin, dst) dari tanggal booking
  const dayOfWeek = new Date(bookingDate).getDay();

  const { data: classes, error: classError } = await supabase
    .from('academic_schedules')
    .select('subject, start_time, end_time')
    .eq('room_id', roomId)
    .eq('day_of_week', dayOfWeek)
    // Logika Overlap: Waktu Mulai Request < Waktu Selesai Kelas AND Waktu Selesai Request > Waktu Mulai Kelas
    .lt('start_time', endTimeStr)
    .gt('end_time', startTimeStr);

  if (classError) throw new Error("Gagal mengecek jadwal SIAKAD");

  if (classes && classes.length > 0) {
    return {
      isAvailable: false,
      message: `Ruangan dipakai untuk jadwal kuliah: ${classes[0].subject} (${classes[0].start_time} - ${classes[0].end_time})`
    };
  }

  // 2. CEK PEMINJAMAN LAIN (bookings)
  const { data: bookings, error: bookingError } = await supabase
    .from('bookings')
    .select('purpose, status')
    .eq('room_id', roomId)
    .eq('booking_date', bookingDate) // Cek pada tanggal yang sama
    .in('status', ['pending', 'approved', 'approved_kaprodi', 'approved_sarpras', 'ongoing'])
    // Logika Overlap: Request Mulai < Booking Selesai AND Request Selesai > Booking Mulai
    .lt('start_time', endTimeStr)
    .gt('end_time', startTimeStr);

  if (bookingError) {
    console.error("🔴 ERROR CEK JADWAL:", bookingError);
    throw new Error("Gagal mengecek data peminjaman: " + bookingError.message);
  }

  if (bookings && bookings.length > 0) {
    return {
      isAvailable: false,
      message: `Ruangan sudah di-booking untuk: ${bookings[0].purpose} (Status: ${bookings[0].status})`
    };
  }

  return {
    isAvailable: true,
    message: "Ruangan tersedia."
  };
}

export async function createBooking(
  roomId: string,
  purpose: string,
  bookingDate: string,
  startTime: string,
  endTime: string,
  ktmUrl: string
) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )

  // 1. DAPATKAN DATA USER YANG SEDANG LOGIN
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, message: "Anda harus login untuk melakukan peminjaman." }
  }

  // 2. VALIDASI ULANG (Mencegah Race Condition)
  const check = await checkRoomAvailability(roomId, bookingDate, startTime, endTime)
  if (!check.isAvailable) {
    return { success: false, message: `Gagal menyimpan: ${check.message}` }
  }

  // 3. INSERT DATA KE TABEL BOOKINGS
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      user_id: user.id,
      room_id: roomId,
      booking_date: bookingDate,
      start_time: startTime,
      end_time: endTime,
      purpose: purpose,
      status: 'pending',
      ktm_url: ktmUrl
    })
    .select()

  if (error) {
    console.log("🔴 ERROR SUPABASE ASLI:", error); 
    console.error("Insert Error:", error.message)
    return { success: false, message: "Terjadi kesalahan sistem saat menyimpan data." }
  }

  return {
    success: true,
    message: "Booking berhasil dibuat! Menunggu persetujuan Kaprodi.",
    data: data
  }
}
