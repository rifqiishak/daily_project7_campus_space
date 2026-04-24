'use client'

import { useState, useRef, useEffect } from 'react'
import { uploadDamageReport } from '@/services/damageReportService'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { PhotoIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'

type Room = {
  id: string
  name: string
}

export default function DamageReportForm() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [roomId, setRoomId] = useState('')
  const [description, setDescription] = useState('')
  
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchRooms() {
      const { data, error } = await supabase.from('rooms').select('id, name').order('name')
      if (!error && data) {
        setRooms(data)
      }
    }
    fetchRooms()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 2 * 1024 * 1024) {
        toast.error('Ukuran gambar maksimal 2MB.')
        return
      }
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !roomId || !description) {
      toast.error('Harap lengkapi foto, ruangan, dan deskripsi kerusakan.')
      return
    }

    setIsLoading(true)
    const formData = new FormData()
    formData.append('image', file)
    formData.append('roomId', roomId)
    formData.append('description', description)

    try {
      const result = await uploadDamageReport(formData)
      if (result.success) {
        toast.success(result.message)
        setFile(null)
        setPreviewUrl(null)
        setRoomId('')
        setDescription('')
        if (fileInputRef.current) fileInputRef.current.value = ''
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi saat mengunggah laporan.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mb-4 shadow-sm border border-blue-100/50">
          <CloudArrowUpIcon className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Formulir Pelaporan</h2>
        <p className="text-slate-400 font-medium mt-2">Bantu kami menjaga kenyamanan kampus dengan melaporkan setiap kerusakan.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Pilihan Ruangan */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Lokasi Fasilitas</label>
          <div className="relative group">
            <select 
              value={roomId} 
              onChange={(e) => setRoomId(e.target.value)}
              className={`w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none transition-all cursor-pointer appearance-none shadow-sm focus:border-blue-600 focus:bg-white ${
                roomId ? 'text-slate-800' : 'text-slate-300'
              }`}
              required
            >
              <option value="" disabled className="text-slate-300 italic">-- Pilih Ruangan --</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id} className="text-slate-800 font-bold">
                  {room.name}
                </option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-focus-within:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Detail Kerusakan</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan secara spesifik kerusakan yang terjadi..."
            className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl p-4 h-32 resize-none font-bold text-slate-800 placeholder:text-slate-300 placeholder:italic focus:border-blue-600 focus:bg-white outline-none transition-all shadow-sm"
            required
          ></textarea>
        </div>

        {/* Upload Foto */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Foto Bukti Kerusakan</label>
          {previewUrl ? (
            <div className="relative border-4 border-slate-50 rounded-[2rem] overflow-hidden group shadow-lg">
              <img src={previewUrl} alt="Preview" className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <button 
                  type="button"
                  onClick={() => { setFile(null); setPreviewUrl(null); }}
                  className="bg-white text-slate-900 px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest border border-white hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all"
                >
                  Ganti Foto
                </button>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-slate-100 border-dashed rounded-[2rem] cursor-pointer bg-slate-50/20 hover:bg-blue-50/30 hover:border-blue-200 transition-all group relative overflow-hidden">
              <div className="flex flex-col items-center justify-center p-6 text-center z-10">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-300 group-hover:text-blue-500 group-hover:scale-110 transition-all shadow-sm mb-4 border border-slate-50">
                  <PhotoIcon className="w-6 h-6" />
                </div>
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest group-hover:text-blue-600 transition-colors">Klik untuk unggah foto</p>
                <p className="text-[10px] text-slate-300 font-bold mt-2 uppercase tracking-tighter italic">PNG, JPG (Maks. 2MB)</p>
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/png, image/jpeg" 
                className="hidden" 
                onChange={handleFileChange} 
              />
            </label>
          )}
        </div>

        {/* Tombol Submit */}
        <button 
          type="submit" 
          disabled={isLoading || !file}
          className={`w-full py-5 rounded-2xl font-black text-white transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 ${
            isLoading || !file ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Mengirim Laporan...</span>
            </>
          ) : (
            <span>Kirim Laporan Kerusakan</span>
          )}
        </button>
      </form>
    </div>
  )
}
