'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// Definisi tipe data hasil JOIN dari 3 tabel
type DamageReport = {
  id: string
  description: string
  image_url: string
  status: 'reported' | 'inspected' | 'in_repair' | 'resolved'
  created_at: string
  profiles: { full_name: string } | null
  rooms: { name: string; building: string } | null
}

export default function ReportDashboard() {
  const [reports, setReports] = useState<DamageReport[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // State untuk Modal Gambar
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('damage_reports')
      .select(`
        id, description, image_url, status, created_at,
        profiles ( full_name ),
        rooms ( name, building )
      `)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setReports(data as unknown as DamageReport[])
    }
    setLoading(false)
  }

  // Fungsi untuk memajukan status laporan
  const updateStatus = async (reportId: string, newStatus: DamageReport['status']) => {
    setActionLoading(reportId)

    const { error } = await supabase
      .from('damage_reports')
      .update({ status: newStatus })
      .eq('id', reportId)

    if (!error) {
      // Optimistic Update: Perbarui state lokal agar UI langsung berubah tanpa re-fetch
      setReports((prev) => 
        prev.map((report) => 
          report.id === reportId ? { ...report, status: newStatus } : report
        )
      )
      toast.success('Status laporan diperbarui.')
    } else {
      toast.error('Gagal mengupdate status laporan.')
    }
    
    setActionLoading(null)
  }

  // Helper untuk styling status
  const statusConfig = {
    reported: { label: 'Dilaporkan', color: 'bg-red-100 text-red-700', nextAction: 'inspected', nextLabel: 'Tandai Diperiksa' },
    inspected: { label: 'Diperiksa', color: 'bg-yellow-100 text-yellow-700', nextAction: 'in_repair', nextLabel: 'Mulai Perbaikan' },
    in_repair: { label: 'Sedang Diperbaiki', color: 'bg-blue-100 text-blue-700', nextAction: 'resolved', nextLabel: 'Tandai Selesai' },
    resolved: { label: 'Selesai', color: 'bg-green-100 text-green-700', nextAction: null, nextLabel: '' },
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Laporan Kerusakan</h1>
        <p className="text-gray-500 mt-1">Pantau dan tindak lanjuti laporan kerusakan fasilitas kampus.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-800"></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">Hore! Tidak ada laporan kerusakan saat ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const config = statusConfig[report.status]
            
            return (
              <div key={report.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                {/* Thumbnail Gambar (Klik untuk memperbesar) */}
                <div 
                  className="h-48 w-full bg-gray-100 relative cursor-pointer group"
                  onClick={() => setSelectedImage(report.image_url)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={report.image_url} alt="Kerusakan" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 font-medium tracking-wide">Lihat Foto</span>
                  </div>
                </div>

                {/* Konten Kartu */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.color}`}>
                      {config.label}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-gray-800 text-lg">{report.rooms?.name}</h3>
                  <p className="text-xs text-gray-500 mb-3">📍 {report.rooms?.building}</p>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    &quot;{report.description}&quot;
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Pelapor: <span className="font-semibold text-gray-700">{report.profiles?.full_name}</span>
                    </span>
                    
                    {/* Tombol Aksi Dinamis */}
                    {config.nextAction && (
                      <button
                        onClick={() => updateStatus(report.id, config.nextAction as DamageReport['status'])}
                        disabled={actionLoading === report.id}
                        className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {actionLoading === report.id ? 'Memproses...' : config.nextLabel}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal / Lightbox untuk Gambar Full */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <button 
              className="absolute -top-10 right-0 text-white hover:text-gray-300 font-bold text-xl"
              onClick={() => setSelectedImage(null)}
            >
              Tutup ✕
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={selectedImage} 
              alt="Detail Kerusakan" 
              className="w-full h-full object-contain rounded-lg shadow-2xl" 
            />
          </div>
        </div>
      )}
    </div>
  )
}
