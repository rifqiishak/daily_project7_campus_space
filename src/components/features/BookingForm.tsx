'use client'

import { useState, useEffect } from 'react'
import { createBooking } from '@/services/bookingService'
import { createClient } from '@/lib/supabase/client'

type Room = {
  id: string
  name: string
}

export default function BookingForm() {
  const supabase = createClient()
  
  // State untuk menyimpan input user
  const [roomId, setRoomId] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [purpose, setPurpose] = useState('')
  const [ktmFile, setKtmFile] = useState<File | null>(null)

  // State untuk UI feedback
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'uploading'>('idle')
  const [message, setMessage] = useState('')
  const [rooms, setRooms] = useState<Room[]>([])

  useEffect(() => {
    async function fetchRooms() {
      const { data, error } = await supabase.from('rooms').select('id, name')
      if (error) {
        console.error("Gagal mengambil data ruangan:", error.message)
        setMessage("Gagal memuat daftar ruangan: " + error.message)
        setStatus('error')
      } else if (data) {
        setRooms(data)
      }
    }
    fetchRooms()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validasi dasar
    if (!roomId || !date || !startTime || !endTime || !purpose) {
      setStatus('error')
      setMessage('Harap isi semua kolom formulir.')
      return
    }

    if (!ktmFile) {
      setStatus('error')
      setMessage('Wajib mengunggah foto KTM sebagai jaminan peminjaman!')
      return
    }

    // Menggabungkan String Tanggal dan Waktu menjadi Objek Date yang valid
    const startDateTime = new Date(`${date}T${startTime}`)
    const endDateTime = new Date(`${date}T${endTime}`)

    // Validasi Logika Waktu (Selesai harus lebih dari Mulai)
    if (endDateTime <= startDateTime) {
      setStatus('error')
      setMessage('Waktu selesai harus lebih lambat dari waktu mulai.')
      return
    }

    setIsLoading(true)
    setStatus('uploading')
    setMessage('Sedang memproses unggahan KTM...')

    try {
      // 1. Ambil data user yang sedang login
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Sesi tidak valid, silakan login ulang.")

      // 2. Upload KTM ke Storage (Bucket: ktm_guarantees)
      const fileExt = ktmFile.name.split('.').pop()
      const fileName = `${Date.now()}_${user.id}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ktm_guarantees')
        .upload(fileName, ktmFile)

      if (uploadError) {
        console.error("Storage Error:", uploadError)
        throw new Error("Gagal mengunggah foto KTM: " + uploadError.message)
      }

      // 3. Dapatkan Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('ktm_guarantees')
        .getPublicUrl(fileName)

      // 4. Simpan Booking ke Database
      setMessage('Menyimpan jadwal peminjaman...')
      const result = await createBooking(
        roomId, 
        purpose, 
        date,
        startTime + ":00", // Format HH:MM:SS
        endTime + ":00",   // Format HH:MM:SS
        publicUrl 
      )

      if (result.success) {
        setStatus('success')
        setMessage(result.message)

        // Reset form setelah berhasil
        setRoomId('')
        setPurpose('')
        setStartTime('')
        setEndTime('')
        setDate('')
        setKtmFile(null)
      } else {
        setStatus('error')
        setMessage(result.message)
      }
    } catch (error: any) {
      setStatus('error')
      setMessage(error.message || 'Terjadi kesalahan sistem.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-100">
      <h2 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">Form Peminjaman</h2>

      {/* Alert Box */}
      {status !== 'idle' && (
        <div className={`p-5 mb-8 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
          status === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 
          status === 'uploading' ? 'bg-blue-50 text-blue-700 border border-blue-100 animate-pulse' :
          'bg-rose-50 text-rose-700 border border-rose-100'
        }`}>
          <span>{status === 'success' ? '✅' : status === 'uploading' ? '⏳' : '⚠️'}</span>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Pilihan Ruangan */}
        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Pilih Fasilitas / Ruangan</label>
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full border border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all font-bold text-slate-700 bg-slate-50/50"
            required
          >
            <option value="" disabled>-- Pilih Ruangan --</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>{room.name}</option>
            ))}
          </select>
        </div>

        {/* Baris Tanggal & Waktu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700 bg-slate-50/50"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Jam Mulai</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700 bg-slate-50/50"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Jam Selesai</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full border border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700 bg-slate-50/50"
              required
            />
          </div>
        </div>

        {/* Keperluan Peminjaman */}
        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Tujuan Penggunaan</label>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="Misal: Rapat Himpunan Mahasiswa Teknik..."
            className="w-full border border-slate-200 rounded-2xl p-4 h-28 resize-none focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700 bg-slate-50/50"
            required
          ></textarea>
        </div>

        {/* Input Jaminan KTM */}
        <div className="p-6 border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-[2rem] text-center hover:bg-blue-50 transition-colors group">
          <label className="block text-sm font-black text-blue-800 mb-2">📸 Jaminan KTM Digital</label>
          <p className="text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-wider">Unggah foto KTM asli (Max 2MB, JPG/PNG)</p>
          
          <div className="flex justify-center">
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/jpg"
              onChange={(e) => setKtmFile(e.target.files ? e.target.files[0] : null)}
              required
              className="block w-full text-xs text-slate-400
                file:mr-4 file:py-3 file:px-6
                file:rounded-2xl file:border-0
                file:text-xs file:font-black file:uppercase file:tracking-widest
                file:bg-blue-600 file:text-white
                hover:file:bg-blue-700 transition-all cursor-pointer"
            />
          </div>
          {ktmFile && (
            <p className="mt-4 text-xs font-bold text-green-600">✅ {ktmFile.name} terpilih</p>
          )}
        </div>

        {/* Tombol Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 px-6 rounded-2xl transition-all shadow-xl shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 active:scale-95"
        >
          {isLoading ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div>
              {status === 'uploading' ? 'Mengunggah KTM...' : 'Menyimpan Data...'}
            </>
          ) : (
            'Ajukan Peminjaman Ruangan'
          )}
        </button>
      </form>
    </div>
  )
}
