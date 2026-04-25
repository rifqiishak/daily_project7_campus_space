'use client'

import { useEffect, useState } from 'react'
import { getRooms, upsertRoom, deleteRoom } from '@/services/roomService'
import { toast } from 'sonner'
import ConfirmModal from '@/components/ui/ConfirmModal'

export default function MasterRoomsPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<any>(null)
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '', building: '', capacity: '', facilities: '', qr_code_token: ''
  })

  useEffect(() => {
    loadRooms()
  }, [])

  const loadRooms = async () => {
    try {
      const data = await getRooms()
      setRooms(data)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (room: any) => {
    setSelectedRoom(room)
    setFormData({
      name: room.name,
      building: room.building,
      capacity: room.capacity.toString(),
      facilities: room.facilities.join(', '),
      qr_code_token: room.qr_code_token
    })
    setIsModalOpen(true)
  }

  const handleDelete = async () => {
    if (!roomToDelete) return;
    try {
      const result = await deleteRoom(roomToDelete)
      if (result.success) {
        toast.success('Ruangan berhasil dihapus.')
        loadRooms()
      }
    } catch (error: any) {
      console.error("Gagal menghapus:", error)
      toast.error('Gagal menghapus ruangan: ' + (error.message || 'Kemungkinan ada data booking yang terkait dengan ruangan ini.'))
    }
    setRoomToDelete(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await upsertRoom(formData, selectedRoom?.id)
    setIsModalOpen(false)
    setSelectedRoom(null)
    setFormData({ name: '', building: '', capacity: '', facilities: '', qr_code_token: '' })
    loadRooms()
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Modal Konfirmasi Hapus */}
      <ConfirmModal 
        isOpen={!!roomToDelete}
        onClose={() => setRoomToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Ruangan?"
        message="Menghapus ruangan akan menghilangkan semua data terkait. Pastikan tidak ada peminjaman aktif di ruangan ini."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Master Data Ruangan</h1>
          <p className="text-slate-500 font-bold mt-1">Kelola semua fasilitas dan ruangan kampus.</p>
        </div>
        <button 
          onClick={() => { setSelectedRoom(null); setFormData({ name: '', building: '', capacity: '', facilities: '', qr_code_token: '' }); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-100 active:scale-95 w-full sm:w-auto text-sm"
        >
          <span>+ Tambah Ruangan</span>
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-50 overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 text-xs font-bold text-gray-400 uppercase">Nama Ruangan</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase">Gedung</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase">Kapasitas</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase">Fasilitas</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rooms.map((room) => (
              <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <p className="font-bold text-gray-800">{room.name}</p>
                  <p className="text-[10px] text-gray-400 font-mono">ID: ...{room.id.slice(-4)}</p>
                </td>
                <td className="p-4 text-gray-600">{room.building}</td>
                <td className="p-4 text-gray-600">{room.capacity} Orang</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {room.facilities.map((f: string) => (
                      <span key={f} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">{f}</span>
                    ))}
                  </div>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleEdit(room)} className="text-blue-600 hover:underline text-sm font-bold">Edit</button>
                  <button onClick={() => setRoomToDelete(room.id)} className="text-red-600 hover:underline text-sm font-bold">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">{selectedRoom ? 'Edit Ruangan' : 'Tambah Ruangan Baru'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                placeholder="Nama Ruangan" 
                className="w-full border p-2 rounded" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required 
              />
              <input 
                placeholder="Gedung" 
                className="w-full border p-2 rounded" 
                value={formData.building}
                onChange={(e) => setFormData({...formData, building: e.target.value})}
                required 
              />
              <input 
                type="number" 
                placeholder="Kapasitas" 
                className="w-full border p-2 rounded" 
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                required 
              />
              <textarea 
                placeholder="Fasilitas (Pisahkan dengan koma)" 
                className="w-full border p-2 rounded h-24"
                value={formData.facilities}
                onChange={(e) => setFormData({...formData, facilities: e.target.value})}
                required
              />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded font-bold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
