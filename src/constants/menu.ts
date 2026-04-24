export const MENU_ITEMS = {
  mahasiswa: [
    { title: 'Dashboard', path: '/dashboard', icon: 'ChartBarIcon' },
    { title: 'Pinjam Ruangan', path: '/dashboard/mahasiswa/book', icon: 'PlusCircleIcon' },
    { title: 'Riwayat Pinjam', path: '/dashboard/mahasiswa/history', icon: 'ClockIcon' },
    { title: 'Lapor Kerusakan', path: '/dashboard/mahasiswa/report', icon: 'WrenchScrewdriverIcon' },
    { title: 'Pengaturan Akun', path: '/dashboard/settings', icon: 'CogIcon' },
  ],
  kaprodi: [
    { title: 'Dashboard', path: '/dashboard', icon: 'ChartBarIcon' },
    { title: 'Jadwal Akademik', path: '/dashboard/kaprodi/academic', icon: 'AcademicCapIcon' },
    { title: 'Persetujuan (Approval)', path: '/dashboard/kaprodi/approval', icon: 'CheckBadgeIcon' },
    { title: 'Heatmap Kepadatan', path: '/dashboard/analytics/heatmap', icon: 'FireIcon' },
    { title: 'Riwayat Pinjam', path: '/dashboard/kaprodi/history', icon: 'ClockIcon' },
    { title: 'Pengaturan Akun', path: '/dashboard/settings', icon: 'CogIcon' },
  ],
  staf_sarpras: [
    { title: 'Dashboard', path: '/dashboard', icon: 'ShieldCheckIcon' },
    { title: 'Manajemen QR', path: '/dashboard/sarpras/qr-manager', icon: 'QrCodeIcon' },
    { title: 'Laporan Kerusakan', path: '/dashboard/sarpras/reports', icon: 'WrenchScrewdriverIcon' },
    { title: 'Master Ruangan', path: '/dashboard/sarpras/rooms', icon: 'BuildingOfficeIcon' },
    { title: 'Pengaturan Akun', path: '/dashboard/settings', icon: 'CogIcon' },
  ],
}
