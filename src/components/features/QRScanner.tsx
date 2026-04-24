'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { validateQrCheckIn } from '@/services/checkinService'

export default function QRScanner() {
  const [scanResult, setScanResult] = useState<string | null>(null)
  const isProcessingRef = useRef(false)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    // Mencegah render ganda di React Strict Mode
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        false // Verbose logging mati
      )

      scannerRef.current.render(onScanSuccess, onScanFailure)
    }

    // Cleanup saat komponen ditutup (mematikan kamera)
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error)
        scannerRef.current = null
      }
    }
  }, [])

  const onScanSuccess = async (decodedText: string) => {
    // Hentikan scan jika sedang memproses hasil sebelumnya
    if (isProcessingRef.current) return

    isProcessingRef.current = true

    // Matikan kamera sejenak saat memproses
    if (scannerRef.current) {
      scannerRef.current.pause(true)
    }

    try {
      // Panggil Server Action
      const result = await validateQrCheckIn(decodedText)
      setScanResult(result.message)

      if (result.success) {
        // Jika sukses, biarkan kamera mati dan tampilkan pesan sukses
        if (scannerRef.current) scannerRef.current.clear()
      } else {
        // Jika gagal (salah ruangan/waktu), nyalakan kamera lagi setelah 3 detik
        setTimeout(() => {
          setScanResult(null)
          isProcessingRef.current = false
          if (scannerRef.current) scannerRef.current.resume()
        }, 3000)
      }
    } catch (error) {
      setScanResult("Terjadi kesalahan jaringan.")
      isProcessingRef.current = false
    }
  }

  const onScanFailure = (error: any) => {
    // Diabaikan: html5-qrcode melempar error setiap frame jika tidak menemukan QR
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-center mb-4 text-gray-800">Scan QR Ruangan</h2>

      {/* Target div untuk library kamera */}
      <div id="reader" className="w-full overflow-hidden rounded-lg"></div>

      {isProcessingRef.current && !scanResult && (
        <div className="mt-4 text-center text-blue-600 font-medium animate-pulse">
          Memvalidasi check-in...
        </div>
      )}

      {scanResult && (
        <div className={`mt-4 p-4 rounded-lg text-center font-medium ${scanResult.includes('berhasil') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
          {scanResult}
        </div>
      )}
    </div>
  )
}
