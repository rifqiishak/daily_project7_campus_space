import DamageReportForm from '@/components/features/DamageReportForm'

export default function ReportPage() {
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900">Lapor Kerusakan</h1>
                <p className="text-slate-500 mt-2">Laporkan kerusakan fasilitas agar segera ditangani oleh tim Sarpras.</p>
            </div>
            <DamageReportForm />
        </div>
    )
}
