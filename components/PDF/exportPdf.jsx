import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatValueByType } from './renderFormattedCell'
import logoBase64 from '../logo/logoAdaTour'


const getColumns = (item) => (item ? Object.keys(item) : [])

export const exportToPDF = (data = [], title = "Judul Tabel") => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;

    doc.addImage(logoBase64, 'PNG', 17, 10, 50, 23)

    // Judul besar
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('ADA TOUR & TRAVEL', centerX + 15, 17, { align: 'center' });

    // Subjudul
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Umrah - Haji KHUSUS', centerX + 15, 25, { align: 'center' });
    doc.text('PT. AMIINAH ZHAFER TRAVELINDO WISATA', centerX + 15, 31, { align: 'center' });
    doc.text('PPIU NO. 235 TH 2020', centerX + 15, 37, { align: 'center' });

    // Garis bawah
    doc.setLineWidth(0.5);
    doc.line(14, 42, 196, 42); // Tetap di kiri-kanan halaman


    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(title.toUpperCase(), centerX, 53, { align: "center" })

    // 🔍 Ambil kolom dari data pertama
    const columns = getColumns(data[0])
    const headers = columns.map(key => key.toUpperCase()) // Optional: capitalized headers

    const body = data.map(item =>
        columns.map(col => {
            const raw = item[col]
            return formatValueByType ? formatValueByType(raw) : raw
        })
    )

    autoTable(doc, {
        head: [headers],
        body,
        startY: 63,
        theme: 'plain',
        styles: {
            fontSize: 8,
            textColor: 20,
            lineColor: [0, 0, 0],
            lineWidth: 0.2,
        },
        headStyles: {
            textColor: 20,
            fontStyle: 'bold',
        },
    })

    const finalY = doc.lastAutoTable.finalY || 50
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Hormat Kami,', 14, finalY + 20)
    doc.setFont('helvetica', 'bold')
    doc.text('ADA TOUR & TRAVEL,', 14, finalY + 25)
    doc.text('___________________', 14, finalY + 46)
    doc.text('Direktur Keuangan', 14, finalY + 48 + 5)

     // ✅ PREVIEW PDF DENGAN TITLE TAB RAPI
    const pdfBlob = doc.output('blob')
    const pdfUrl = URL.createObjectURL(pdfBlob)

    const previewWindow = window.open(pdfUrl, '_blank')

    if (previewWindow) {
        previewWindow.onload = () => {
            previewWindow.document.title = title.toUpperCase()
        }
    }
}