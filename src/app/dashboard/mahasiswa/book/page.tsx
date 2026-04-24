import BookingForm from '@/components/features/BookingForm'

export default function BookRoomPage() {
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900">Pinjam Ruangan</h1>
                <p className="text-slate-500 mt-2">Isi formulir di bawah untuk mengajukan peminjaman ruangan kampus.</p>
            </div>
            <BookingForm />
        </div>
    )
}
