import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Mengkonversi daftar lembar halaman A4 (pageElementIds) menjadi berkas PDF multi-halaman
 * yang pas 100% dengan ukuran A4 (210mm x 297mm) tanpa ada konten yang terpotong.
 */
export const downloadMultiPagePdf = async (
  pageElementIds: string[],
  filename: string,
  onProgress?: (status: string) => void
): Promise<void> => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidth = pdf.internal.pageSize.getWidth();   // 210 mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297 mm

    for (let i = 0; i < pageElementIds.length; i++) {
      const elId = pageElementIds[i];
      const element = document.getElementById(elId);
      if (!element) {
        console.warn(`Elemen halaman "${elId}" tidak ditemukan.`);
        continue;
      }

      if (onProgress) {
        onProgress(`Memproses lembar ${i + 1} dari ${pageElementIds.length}...`);
      }

      // Jika bukan halaman pertama, tambahkan halaman baru ke dokumen PDF
      if (i > 0) {
        pdf.addPage();
      }

      // Render elemen ke Canvas resolusi tinggi (scale: 2)
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 800
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.96);
      
      // Masukkan gambar tepat 1 halaman penuh A4 (0, 0, 210, 297)
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
    }

    if (onProgress) onProgress('Menyimpan berkas PDF...');
    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
  } catch (error) {
    console.error('Gagal mengunduh multi-page PDF:', error);
    throw error;
  }
};

/**
 * Mengkonversi elemen DOM tunggal menjadi berkas PDF A4 beresolusi tinggi.
 */
export const downloadElementAsPdf = async (
  elementId: string, 
  filename: string,
  onProgress?: (status: string) => void
): Promise<void> => {
  return downloadMultiPagePdf([elementId], filename, onProgress);
};

/**
 * Membuka dialog pencetakan bawaan sistem dengan konfigurasi A4 HD
 */
export const printDocumentHd = (documentTitle: string): void => {
  const originalTitle = document.title;
  document.title = documentTitle;
  
  setTimeout(() => {
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  }, 100);
};
