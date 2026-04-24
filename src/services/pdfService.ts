import jsPDF from 'jspdf';
import QRCode from 'qrcode';

type RoomData = {
  name: string;
  building: string;
  qr_code_token: string;
};

export const generateRoomsPDF = async (rooms: RoomData[]) => {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  const margin = 20;
  const qrSize = 60; // Ukuran QR dalam mm
  const gap = 15;    // Jarak antar item
  const pageHeight = doc.internal.pageSize.getHeight();

  let x = margin;
  let y = margin;

  for (let i = 0; i < rooms.length; i++) {
    const room = rooms[i];

    // 1. Generate QR Data URL
    const qrDataUrl = await QRCode.toDataURL(room.qr_code_token, { margin: 1 });

    // 2. Tambahkan QR Code ke PDF
    doc.addImage(qrDataUrl, 'PNG', x, y, qrSize, qrSize);

    // 3. Tambahkan Teks Label di bawah QR
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(room.name, x + qrSize / 2, y + qrSize + 7, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(room.building, x + qrSize / 2, y + qrSize + 12, { align: 'center' });

    // 4. Update posisi X dan Y (Layout 2 Kolom)
    if ((i + 1) % 2 === 0) {
      x = margin; // Reset ke kiri
      y += qrSize + gap + 10; // Turun ke baris baru
    } else {
      x += qrSize + gap + 15; // Geser ke kolom kanan
    }

    // 5. Cek apakah perlu halaman baru (Jika y sudah mendekati batas bawah)
    if (y + qrSize + 20 > pageHeight && i !== rooms.length - 1) {
      doc.addPage();
      x = margin;
      y = margin;
    }
  }

  doc.save('Daftar_QR_CampusSpace.pdf');
};
