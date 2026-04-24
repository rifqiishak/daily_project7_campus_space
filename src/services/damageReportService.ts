'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function uploadDamageReport(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )

  const file = formData.get('image') as File
  const roomId = formData.get('roomId') as string
  const description = formData.get('description') as string

  // 1. Validasi Auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Harap login terlebih dahulu." }

  try {
    // 2. Upload Gambar ke Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `reports/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('facility-reports')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // 3. Ambil Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('facility-reports')
      .getPublicUrl(filePath)

    // 4. Simpan Data ke Tabel
    const { error: dbError } = await supabase
      .from('damage_reports')
      .insert({
        user_id: user.id,
        room_id: roomId,
        description: description,
        image_url: publicUrl
      })

    if (dbError) throw dbError

    return { success: true, message: "Laporan berhasil dikirim!" }
  } catch (error) {
    return { success: false, message: "Terjadi kesalahan saat memproses laporan." }
  }
}
