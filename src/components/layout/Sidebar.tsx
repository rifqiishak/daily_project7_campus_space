'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { MENU_ITEMS } from '@/constants/menu'
import { createClient } from '@/lib/supabase/client'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { 
  ChartBarIcon, 
  AcademicCapIcon, 
  CheckBadgeIcon, 
  FireIcon, 
  ClockIcon, 
  CogIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  QrCodeIcon,
  XMarkIcon,
  ArrowLeftOnRectangleIcon,
  WrenchScrewdriverIcon,
  PlusCircleIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

const iconMap: Record<string, any> = {
  ChartBarIcon,
  AcademicCapIcon,
  CheckBadgeIcon,
  FireIcon,
  ClockIcon,
  CogIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  QrCodeIcon,
  WrenchScrewdriverIcon,
  PlusCircleIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon
}

interface SidebarProps {
  role: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const items = MENU_ITEMS[role as keyof typeof MENU_ITEMS] || []

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      {/* Modal Logout Kustom */}
      <ConfirmModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Keluar Sistem?"
        message="Sesi Anda akan berakhir dan Anda harus login kembali untuk mengelola fasilitas kampus."
        confirmText="Ya, Keluar Sekarang"
        cancelText="Tetap di Sini"
        type="danger"
      />

      {/* Overlay untuk mobile saat sidebar terbuka */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-[101]
        w-72 bg-white border-r border-slate-100 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header Sidebar */}
        <div className="p-8 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">C</div>
            <span className="text-xl font-black tracking-tight text-slate-800">Campus<span className="text-blue-600">Space</span></span>
          </Link>
          
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar pb-8">
          <div className="mb-4 px-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Menu Utama</p>
          </div>
          
          {items.map((item) => {
            const Icon = iconMap[item.icon]
            const isActive = pathname === item.path

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                className={`
                  flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all duration-200 group
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 translate-x-1' 
                    : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
                  }
                `}
              >
                <div className={`
                  p-2 rounded-xl transition-colors
                  ${isActive ? 'bg-white/20' : 'bg-slate-50 group-hover:bg-white'}
                `}>
                  {Icon && <Icon className="w-5 h-5" />}
                </div>
                <span className="text-sm tracking-tight">{item.title}</span>
              </Link>
            )
          })}
        </nav>

        {/* Tombol Keluar */}
        <div className="p-6 border-t border-slate-50">
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-rose-500 hover:bg-rose-50 transition-all duration-200 group"
          >
            <div className="p-2 rounded-xl bg-rose-100/50 group-hover:bg-rose-500 group-hover:text-white transition-all">
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            </div>
            <span className="text-sm tracking-tight">Keluar Sistem</span>
          </button>
        </div>
      </aside>
    </>
  )
}
