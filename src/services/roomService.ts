'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function getRooms() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )

  // Gunakan cache: 'no-store' atau pastikan query tidak di-cache
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('created_at', { ascending: false }) // Urutkan yang terbaru di atas
  
  if (error) throw error
  return data
}

export async function upsertRoom(formData: any, id?: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )

  const roomData = {
    name: formData.name,
    building: formData.building,
    capacity: parseInt(formData.capacity),
    facilities: formData.facilities.split(',').map((f: string) => f.trim()),
    qr_code_token: formData.qr_code_token || `QR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  }

  let result
  if (id) {
    result = await supabase.from('rooms').update(roomData).eq('id', id)
  } else {
    result = await supabase.from('rooms').insert(roomData)
  }

  if (result.error) throw result.error
  revalidatePath('/dashboard/sarpras/rooms')
  return { success: true }
}

export async function deleteRoom(id: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )

  // Gunakan .select() untuk memastikan data benar-benar terhapus
  const { data, error } = await supabase
    .from('rooms')
    .delete()
    .eq('id', id)
    .select()

  if (error) throw error
  
  // Jika data kosong, berarti tidak ada baris yang terhapus (mungkin karena RLS)
  if (!data || data.length === 0) {
    throw new Error("Gagal menghapus: Izin ditolak atau data tidak ditemukan. Periksa kebijakan RLS di Supabase.")
  }

  revalidatePath('/dashboard/sarpras/rooms')
  return { success: true }
}
