'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    idNumber: '',
    role: 'mahasiswa'
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          nim_nip: formData.idNumber,
          role: formData.role
        }
      }
    })

    if (error) {
      toast.error('Gagal: ' + error.message)
    } else {
      // Logout sesi otomatis dari signUp agar user harus login manual
      await supabase.auth.signOut()
      toast.success('Berhasil! Silakan Login.')
      router.push('/login')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">Registrasi Akun</h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            placeholder="Nama Lengkap"
            className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
          <input
            placeholder="NIM / NIP"
            className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <select
            className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="mahasiswa">Mahasiswa</option>
            <option value="kaprodi">Kaprodi</option>
            <option value="staf_sarpras">Staf Sarpras</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all"
          >
            {loading ? 'Proses...' : 'Daftar Akun'}
          </button>
        </form>
      </div>
    </div>
  )
}
