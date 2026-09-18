import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Users, 
  Zap, 
  MapPin, 
  ShieldCheck, 
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { mockWarga, mockDai, mockHistory, mockAmaliyah, NILAI_KONVERSI } from '../db_mock';
import { downloadMultiPagePdf, printDocumentHd } from '../utils/pdfExport';

interface ReportModalRekapanProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModalRekapan: React.FC<ReportModalRekapanProps> = ({ isOpen, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');

  if (!isOpen) return null;

  // 1. Data Agregat Keseluruhan
  const totalWarga = mockWarga.length;
  const totalPoin = mockWarga.reduce((sum, w) => sum + w.total_poin, 0);
  const totalRupiah = totalPoin * NILAI_KONVERSI;
  const totalKwhMeter = Number(mockHistory.reduce((sum, h) => sum + (h.kwh_meter || 0), 0).toFixed(1));
  const siapRedeemWarga = mockWarga.filter(w => w.total_poin >= 20000);
  const siapRedeemCount = siapRedeemWarga.length;
  const avgPoin = Math.round(totalPoin / totalWarga);

  // 2. Data Analisa Berbasis Lokasi & Regional
  const regionalJabarWarga = mockWarga.filter(w => w.id_dai === 'D01');
  const regionalJatengWarga = mockWarga.filter(w => w.id_dai === 'D02');

  const jabarPoin = regionalJabarWarga.reduce((sum, w) => sum + w.total_poin, 0);
  const jatengPoin = regionalJatengWarga.reduce((sum, w) => sum + w.total_poin, 0);

  const jabarKwh = Number(
    mockHistory
      .filter(h => regionalJabarWarga.some(w => w.id_warga === h.id_warga))
      .reduce((sum, h) => sum + (h.kwh_meter || 0), 0)
      .toFixed(1)
  );

  const jatengKwh = Number(
    mockHistory
      .filter(h => regionalJatengWarga.some(w => w.id_warga === h.id_warga))
      .reduce((sum, h) => sum + (h.kwh_meter || 0), 0)
      .toFixed(1)
  );

  // 3. Detail Setiap Warga Lengkap
  const enrichedList = mockWarga.map((w, index) => {
    const dai = mockDai.find(d => d.id_dai === w.id_dai);
    const wHistory = mockHistory.filter(h => h.id_warga === w.id_warga);
    const wKwh = wHistory.reduce((sum, h) => sum + (h.kwh_meter || 0), 0);
    const wRupiah = w.total_poin * NILAI_KONVERSI;
    const isSiap = w.total_poin >= 20000;

    const counts: { [id: string]: number } = {};
    wHistory.forEach(h => {
      counts[h.id_amaliyah] = (counts[h.id_amaliyah] || 0) + 1;
    });
    let topId = '';
    let maxCount = 0;
    Object.entries(counts).forEach(([id, cnt]) => {
      if (cnt > maxCount) {
        maxCount = cnt;
        topId = id;
      }
    });
    const topAmaliyah = mockAmaliyah.find(a => a.id_amaliyah === topId)?.nama || 'Sholat 5 Waktu';

    return {
      ...w,
      no: index + 1,
      daiNama: dai?.nama || '-',
      daiRegional: dai?.regional || '-',
      totalKwh: Number(wKwh.toFixed(1)),
      totalRupiah: wRupiah,
      isSiapRedeem: isSiap,
      topAmaliyah,
      historyCount: wHistory.length,
      progressPercent: Math.min(100, Math.round((w.total_poin / 20000) * 100))
    };
  });

  // Handler Unduh Multi-Page PDF Pas Ukuran A4 (Zero Clipping)
  const handleDownloadPdf = async () => {
    try {
      setIsExporting(true);
      const filename = `Laporan_Analisa_Rekapan_Warga_SIMDDII_${new Date().toISOString().slice(0, 10)}.pdf`;
      await downloadMultiPagePdf(['rekapan-page-1', 'rekapan-page-2'], filename, (msg) => {
        setExportProgress(msg);
      });
    } catch (err) {
      console.error(err);
      alert('Terjadi kendala saat memproses PDF. Silakan gunakan opsi Cetak / Simpan PDF HD.');
    } finally {
      setIsExporting(false);
      setExportProgress('');
    }
  };

  // Handler Cetak / Simpan PDF HD Native A4
  const handlePrint = () => {
    printDocumentHd(`Laporan_Analisa_Rekapan_Warga_SIMDDII_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="report-modal-backdrop printable-modal-backdrop">
      <div 
        style={{
          backgroundColor: '#0f172a',
          width: '100%',
          maxWidth: '890px',
          maxHeight: '94vh',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          position: 'relative'
        }}
        className="printable-document-card"
      >
        {/* MODAL CONTROL HEADER (Hidden when printing) */}
        <div 
          className="no-print"
          style={{
            padding: '14px 20px',
            backgroundColor: '#1e293b',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #334155',
            flexWrap: 'wrap',
            gap: '12px',
            zIndex: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.25)' }}>
              <FileSpreadsheet size={20} color="#60a5fa" />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>Pratinjau Laporan Analisis Lengkap (Format A4 Resmi - 2 Halaman)</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Diformat presisi agar pas di lembar A4 tanpa ada teks atau tabel yang terpotong</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              style={{
                padding: '8px 14px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: isExporting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              <Download size={15} /> {isExporting ? (exportProgress || 'Menyusun PDF...') : 'Download PDF (2 Hal. Pas A4)'}
            </button>

            <button
              onClick={handlePrint}
              style={{
                padding: '8px 14px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(5, 150, 105, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              <Printer size={15} /> Cetak / Simpan PDF HD
            </button>

            <button
              onClick={onClose}
              style={{
                padding: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Tutup Pratinjau"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* SCROLLABLE PREVIEW WRAPPER */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '24px', backgroundColor: '#334155' }}>
          
          {/* =========================================================================
              LEMBAR HALAMAN 1: ANALISA STRATEGIS REGIONAL & DEMOGRAFI LOKASI (A4)
             ========================================================================= */}
          <div 
            id="rekapan-page-1"
            className="a4-page-sheet"
          >
            {/* Bagian Atas Halaman 1 */}
            <div>
              {/* 1. KOP SURAT FORMAL RESMI */}
              <div style={{ borderBottom: '3px double #1e293b', paddingBottom: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ 
                      width: '54px', 
                      height: '54px', 
                      borderRadius: '10px', 
                      backgroundColor: '#1e40af', 
                      color: 'white', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontWeight: 800,
                      boxShadow: '0 4px 8px rgba(30, 64, 175, 0.25)'
                    }}>
                      <Zap size={22} color="#facc15" />
                      <span style={{ fontSize: '9px', letterSpacing: '0.05em' }}>SIMDDII</span>
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                        DEWAN DA'WAH ISLAMIYAH INDONESIA (DDII)
                      </h2>
                      <h3 style={{ margin: '1px 0 0 0', fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                        KONSORSIUM ENERGI SURYA & PEMBERDAYAAN UMMAT MANDIRI
                      </h3>
                      <p style={{ margin: '1px 0 0 0', fontSize: '10px', color: '#64748b' }}>
                        Sistem Informasi Manajemen Da'i & Amaliyah Warga Binaan Berbasis Insentif Listrik Prabayar
                      </p>
                      <p style={{ margin: '1px 0 0 0', fontSize: '9px', color: '#94a3b8' }}>
                        Gedung Dewan Da'wah, Jl. Kramat Raya No. 45 Jakarta Pusat | Kontak: (021) 3190-1234
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0', paddingLeft: '12px' }}>
                    <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Nomor Dokumen</div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#1e40af' }}>SIMDDII/LAP-REKAP/2026/09/01</div>
                    <div style={{ fontSize: '9px', color: '#64748b', marginTop: '3px' }}>Tanggal Terbit</div>
                    <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#0f172a' }}>
                      {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. JUDUL LAPORAN */}
              <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                <h1 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  LAPORAN ANALISA KOMPREHENSIF WARGA BINAAN
                </h1>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#2563eb', marginTop: '2px' }}>
                  PEMETAAN SEBARAN GEOSPASIAL LOKASI, AMALIYAH HARIAN & INSENTIF ENERGI
                </div>
              </div>

              {/* 3. 5 KPI UTAMA NASIONAL */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(5, 1fr)', 
                gap: '8px', 
                marginBottom: '16px',
                backgroundColor: '#f1f5f9',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ backgroundColor: '#ffffff', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Warga Binaan</span>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e40af', marginTop: '1px' }}>
                    {totalWarga} <span style={{ fontSize: '10px', fontWeight: 500, color: '#64748b' }}>Jiwa</span>
                  </div>
                  <div style={{ fontSize: '8.5px', color: '#059669', fontWeight: 600 }}>100% Aktif Verifikasi</div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Akumulasi Poin</span>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#d97706', marginTop: '1px' }}>
                    {totalPoin.toLocaleString()} <span style={{ fontSize: '9px', fontWeight: 500, color: '#64748b' }}>Pts</span>
                  </div>
                  <div style={{ fontSize: '8.5px', color: '#64748b' }}>Rata: ~{avgPoin.toLocaleString()} Pts</div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Nilai Insentif</span>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#059669', marginTop: '1px' }}>
                    Rp {totalRupiah.toLocaleString('id-ID')}
                  </div>
                  <div style={{ fontSize: '8.5px', color: '#64748b' }}>1 Poin = Rp 1 Insentif</div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Listrik Tercatat</span>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb', marginTop: '1px' }}>
                    {totalKwhMeter} <span style={{ fontSize: '9px', fontWeight: 500, color: '#64748b' }}>kWh</span>
                  </div>
                  <div style={{ fontSize: '8.5px', color: '#64748b' }}>Meteran Prabayar</div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Kelayakan Tukar</span>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#7c3aed', marginTop: '1px' }}>
                    {siapRedeemCount} / {totalWarga} <span style={{ fontSize: '9px', fontWeight: 500, color: '#64748b' }}>Siap</span>
                  </div>
                  <div style={{ fontSize: '8.5px', color: '#059669', fontWeight: 600 }}>Ambang ≥ 20.000 Pts</div>
                </div>
              </div>

              {/* 4. DATA ANALISA MENDALAM BERBASIS LOKASI ("data analisa keseluruhan warga sesuai lokasi") */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <MapPin size={15} color="#2563eb" />
                  <h3 style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    A. Data Analisa Sebaran Wilayah, Geospasial & Karakteristik Warga
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  
                  {/* Analisa Wilayah 1: Jawa Barat */}
                  <div style={{ 
                    border: '1px solid #cbd5e1', 
                    borderRadius: '8px', 
                    padding: '10px 12px', 
                    backgroundColor: '#f8fafc' 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px', marginBottom: '6px' }}>
                      <div style={{ fontWeight: 700, fontSize: '12px', color: '#1e40af' }}>1. Regional Jawa Barat (Bandung Raya)</div>
                      <span style={{ fontSize: '9px', fontWeight: 700, backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '1px 6px', borderRadius: '10px' }}>
                        2 Warga (66.7%)
                      </span>
                    </div>

                    <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse', marginBottom: '6px' }}>
                      <tbody>
                        <tr>
                          <td style={{ color: '#64748b', padding: '1px 0', width: '42%' }}>Da'i Pembimbing:</td>
                          <td style={{ fontWeight: 700, color: '#0f172a' }}>Ustadz Ahmad, M.Ag. (D01)</td>
                        </tr>
                        <tr>
                          <td style={{ color: '#64748b', padding: '1px 0' }}>Koordinat Sentral Posko:</td>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#2563eb' }}>Lat -6.917400, Long 107.612400</td>
                        </tr>
                        <tr>
                          <td style={{ color: '#64748b', padding: '1px 0' }}>Sebaran Daya Rumah:</td>
                          <td style={{ fontWeight: 600 }}>1x 450 VA (Ibu Siti), 1x 900 VA (Supriadi)</td>
                        </tr>
                        <tr>
                          <td style={{ color: '#64748b', padding: '1px 0' }}>Total Poin & Kontribusi:</td>
                          <td style={{ fontWeight: 700, color: '#d97706' }}>{jabarPoin.toLocaleString()} Pts (65.0% Poin Nasional)</td>
                        </tr>
                        <tr>
                          <td style={{ color: '#64748b', padding: '1px 0' }}>Total Kuota Listrik:</td>
                          <td style={{ fontWeight: 700, color: '#059669' }}>{jabarKwh} kWh</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Analisis Naratif Lengkap Jabar */}
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 8px', fontSize: '9.5px', color: '#334155', lineHeight: '1.4' }}>
                      <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: '2px' }}>Analisis Lapangan & Evaluasi Wilayah:</div>
                      <p style={{ margin: '0 0 3px 0' }}>
                        • <strong>Kepatuhan Ibadah:</strong> Partisipasi warga binaan sangat tinggi dengan penyetoran amaliyah sholat 5 waktu berjamaah harian yang konsisten dan kehadiran majelis taklim aktif.
                      </p>
                      <p style={{ margin: '0 0 3px 0' }}>
                        • <strong>Efisiensi Insentif Listrik:</strong> Ibu Siti mencapai akumulasi 45.000 Pts (tertinggi nasional). Mengingat tarif PLN 450 VA bersubsidi murah (Rp 415/kWh), konversi token menghasilkan kuota energi maksimal yang signifikan meringankan beban rumah tangga warga pra-sejahtera.
                      </p>
                      <p style={{ margin: 0, color: '#065f46', fontWeight: 600 }}>
                        • <strong>Tindak Lanjut Da'i:</strong> Penerbitan kuota token listrik batch I serta akselerasi pembinaan amaliyah sunnah tilawah bagi Bapak Supriadi.
                      </p>
                    </div>
                  </div>

                  {/* Analisa Wilayah 2: Jawa Tengah */}
                  <div style={{ 
                    border: '1px solid #cbd5e1', 
                    borderRadius: '8px', 
                    padding: '10px 12px', 
                    backgroundColor: '#f8fafc' 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px', marginBottom: '6px' }}>
                      <div style={{ fontWeight: 700, fontSize: '12px', color: '#047857' }}>2. Regional Jawa Tengah (Surabaya)</div>
                      <span style={{ fontSize: '9px', fontWeight: 700, backgroundColor: '#d1fae5', color: '#065f46', padding: '1px 6px', borderRadius: '10px' }}>
                        1 Warga (33.3%)
                      </span>
                    </div>

                    <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse', marginBottom: '6px' }}>
                      <tbody>
                        <tr>
                          <td style={{ color: '#64748b', padding: '1px 0', width: '42%' }}>Da'i Pembimbing:</td>
                          <td style={{ fontWeight: 700, color: '#0f172a' }}>Ustadz Budi, S.Sos.I. (D02)</td>
                        </tr>
                        <tr>
                          <td style={{ color: '#64748b', padding: '1px 0' }}>Koordinat Sentral Posko:</td>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#047857' }}>Lat -7.250445, Long 112.768845</td>
                        </tr>
                        <tr>
                          <td style={{ color: '#64748b', padding: '1px 0' }}>Sebaran Daya Rumah:</td>
                          <td style={{ fontWeight: 600 }}>1x 900 VA (Bapak Joko)</td>
                        </tr>
                        <tr>
                          <td style={{ color: '#64748b', padding: '1px 0' }}>Total Poin & Kontribusi:</td>
                          <td style={{ fontWeight: 700, color: '#d97706' }}>{jatengPoin.toLocaleString()} Pts (35.0% Poin Nasional)</td>
                        </tr>
                        <tr>
                          <td style={{ color: '#64748b', padding: '1px 0' }}>Total Kuota Listrik:</td>
                          <td style={{ fontWeight: 700, color: '#059669' }}>{jatengKwh} kWh</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Analisis Naratif Lengkap Jateng */}
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 8px', fontSize: '9.5px', color: '#334155', lineHeight: '1.4' }}>
                      <div style={{ fontWeight: 700, color: '#047857', marginBottom: '2px' }}>Analisis Lapangan & Evaluasi Wilayah:</div>
                      <p style={{ margin: '0 0 3px 0' }}>
                        • <strong>Kepatuhan Ibadah:</strong> Unggul dalam konsistensi ibadah sunnah (tilawah Al-Qur'an 1 juz per sesi dan puasa sunnah Senin-Kamis), menunjukkan dampak positif bimbingan spiritual Da'i.
                      </p>
                      <p style={{ margin: '0 0 3px 0' }}>
                        • <strong>Efisiensi Insentif Listrik:</strong> Bapak Joko telah melampaui target ambang batas redeem 20.000 Pts (tercapai 25.000 Pts / 125%). Karena tarif 900 VA (Rp 1.352/kWh) lebih tinggi, diperlukan konversi berkala agar stabilitas kuota kWh tetap terjaga.
                      </p>
                      <p style={{ margin: 0, color: '#1e40af', fontWeight: 600 }}>
                        • <strong>Tindak Lanjut Da'i:</strong> Klaim token insentif listrik dan perluasan amaliyah ke program bakti sosial gotong royong warga desa.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* 5. TABEL ANALISA KOMPARATIF REGIONAL */}
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
                <div style={{ backgroundColor: '#f1f5f9', padding: '5px 10px', fontSize: '10px', fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #e2e8f0' }}>
                  Matriks Perbandingan Performa & Karakteristik Wilayah Binaan
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', color: '#475569', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '4px 8px' }}>Wilayah Binaan</th>
                      <th style={{ padding: '4px 8px' }}>Da'i Penanggung Jawab</th>
                      <th style={{ padding: '4px 8px', textAlign: 'center' }}>Total Jiwa</th>
                      <th style={{ padding: '4px 8px', textAlign: 'right' }}>Rata Poin/Jiwa</th>
                      <th style={{ padding: '4px 8px', textAlign: 'center' }}>Rasio Siap Klaim</th>
                      <th style={{ padding: '4px 8px' }}>Fokus Pembinaan Berikutnya</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '5px 8px', fontWeight: 700, color: '#1e40af' }}>Jawa Barat (Bandung)</td>
                      <td style={{ padding: '5px 8px' }}>Ustadz Ahmad, M.Ag.</td>
                      <td style={{ padding: '5px 8px', textAlign: 'center' }}>2 Jiwa</td>
                      <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 700, color: '#d97706' }}>23,250 Pts</td>
                      <td style={{ padding: '5px 8px', textAlign: 'center', color: '#059669', fontWeight: 700 }}>50% (1/2 Warga)</td>
                      <td style={{ padding: '5px 8px', color: '#475569' }}>Peningkatan amaliyah sunnah & pencairan token</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px 8px', fontWeight: 700, color: '#047857' }}>Jawa Tengah (Surabaya)</td>
                      <td style={{ padding: '5px 8px' }}>Ustadz Budi, S.Sos.I.</td>
                      <td style={{ padding: '5px 8px', textAlign: 'center' }}>1 Jiwa</td>
                      <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 700, color: '#d97706' }}>25,000 Pts</td>
                      <td style={{ padding: '5px 8px', textAlign: 'center', color: '#059669', fontWeight: 700 }}>100% (1/1 Warga)</td>
                      <td style={{ padding: '5px 8px', color: '#475569' }}>Klaim token & penguatan amaliyah sosial</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>

            {/* Footer Halaman 1 */}
            <div style={{ 
              borderTop: '1px solid #cbd5e1', 
              paddingTop: '6px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              fontSize: '8.5px',
              color: '#64748b'
            }}>
              <span>Sistem Informasi Manajemen Da'i & Amaliyah (SIMDDII) | Dokumen Resmi Rahasia Terbatas</span>
              <span style={{ fontWeight: 700, color: '#1e40af' }}>Halaman 1 dari 2</span>
            </div>
          </div>


          {/* =========================================================================
              LEMBAR HALAMAN 2: INFOGRAFIS VISUAL, TABEL LENGKAP & PENGESAHAN (A4)
             ========================================================================= */}
          <div 
            id="rekapan-page-2"
            className="a4-page-sheet"
          >
            {/* Bagian Atas Halaman 2 */}
            <div>
              {/* Mini Running Header Lembar 2 */}
              <div style={{ 
                borderBottom: '2px solid #1e40af', 
                paddingBottom: '6px', 
                marginBottom: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '9.5px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={14} color="#1e40af" />
                  <span style={{ fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>
                    SIMDDII - DEWAN DA'WAH ISLAMIYAH INDONESIA
                  </span>
                  <span style={{ color: '#94a3b8' }}>| Laporan Analisa Keseluruhan Warga</span>
                </div>
                <div style={{ color: '#64748b', fontFamily: 'monospace' }}>
                  Dokumen No: SIMDDII/LAP-REKAP/2026/09/01
                </div>
              </div>

              {/* 1. INFOGRAFIS VISUAL CAPAIAN & DAYA ("isinya infografis yaa") */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <TrendingUp size={15} color="#d97706" />
                  <h3 style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    B. Infografis Visual Capaian Target & Profil Kelistrikan
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '10px' }}>
                  
                  {/* Leaderboard Progress Bar */}
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 12px', backgroundColor: '#ffffff' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                      Perbandingan Akumulasi Poin Warga vs Target Ambang Batas (20.000 Pts)
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {enrichedList.map(w => {
                        const barPercent = Math.min(100, Math.round((w.total_poin / 45000) * 100));
                        return (
                          <div key={w.id_warga}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                              <span style={{ fontWeight: 600 }}>{w.nama} ({w.golongan_va} VA)</span>
                              <span style={{ fontWeight: 700, color: w.isSiapRedeem ? '#059669' : '#2563eb' }}>
                                {w.total_poin.toLocaleString()} Pts ({w.isSiapRedeem ? '✓ Siap Klaim' : '7.5% Target'})
                              </span>
                            </div>
                            <div style={{ height: '7px', width: '100%', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ 
                                width: `${barPercent}%`, 
                                height: '100%', 
                                backgroundColor: w.isSiapRedeem ? '#10b981' : '#3b82f6',
                                borderRadius: '4px' 
                              }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b', marginTop: '6px', borderTop: '1px dashed #e2e8f0', paddingTop: '4px' }}>
                      <span>Target Minimal: <strong>20.000 Pts</strong></span>
                      <span style={{ color: '#059669', fontWeight: 700 }}>2 dari 3 Warga Memenuhi Syarat</span>
                    </div>
                  </div>

                  {/* Segmentasi Daya & Amaliyah Favorit */}
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 12px', backgroundColor: '#ffffff' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#0f172a', marginBottom: '5px' }}>
                      Distribusi Golongan Daya Listrik PLN
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <div style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%' }} />
                          <span>450 VA (Subsidi Penuh)</span>
                        </div>
                        <strong style={{ color: '#2563eb' }}>1 Warga (33.3%)</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }} />
                          <span>900 VA (Subsidi Terbatas)</span>
                        </div>
                        <strong style={{ color: '#059669' }}>2 Warga (66.7%)</strong>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#0f172a', marginBottom: '3px' }}>
                        Top 3 Amaliyah Teraktif Nasional:
                      </div>
                      <div style={{ fontSize: '9px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div>1. Sholat 5 Waktu Berjamaah (Wajib - 50 Pts)</div>
                        <div>2. Hadir Majelis Taklim (Wajib - 40 Pts)</div>
                        <div>3. Puasa Sunnah Senin Kamis (Sunnah - 30 Pts)</div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* 2. TABEL LENGKAP DETAIL KESELURUHAN WARGA ("detail semuanyaa") */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Users size={15} color="#1e40af" />
                  <h3 style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    C. Rincian Data Lengkap Seluruh Warga Binaan
                  </h3>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1e3a8a', color: 'white' }}>
                      <th style={{ padding: '6px 5px', border: '1px solid #1e3a8a', textAlign: 'center', width: '24px' }}>No</th>
                      <th style={{ padding: '6px 7px', border: '1px solid #1e3a8a' }}>ID & Nama Warga</th>
                      <th style={{ padding: '6px 7px', border: '1px solid #1e3a8a' }}>ID Pelanggan PLN</th>
                      <th style={{ padding: '6px 5px', border: '1px solid #1e3a8a', textAlign: 'center' }}>Daya</th>
                      <th style={{ padding: '6px 7px', border: '1px solid #1e3a8a' }}>Koordinat Lokasi GPS</th>
                      <th style={{ padding: '6px 7px', border: '1px solid #1e3a8a' }}>Da'i Pembimbing</th>
                      <th style={{ padding: '6px 7px', border: '1px solid #1e3a8a' }}>Amaliyah Favorit</th>
                      <th style={{ padding: '6px 7px', border: '1px solid #1e3a8a', textAlign: 'right' }}>Total Poin</th>
                      <th style={{ padding: '6px 7px', border: '1px solid #1e3a8a', textAlign: 'right' }}>Setara Rp</th>
                      <th style={{ padding: '6px 6px', border: '1px solid #1e3a8a', textAlign: 'right' }}>kWh</th>
                      <th style={{ padding: '6px 7px', border: '1px solid #1e3a8a', textAlign: 'center' }}>Status Kelayakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrichedList.map((w, idx) => (
                      <tr 
                        key={w.id_warga}
                        style={{ 
                          backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                          borderBottom: '1px solid #cbd5e1'
                        }}
                      >
                        <td style={{ padding: '6px 5px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 600 }}>
                          {w.no}
                        </td>
                        <td style={{ padding: '6px 7px', border: '1px solid #cbd5e1' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{w.nama}</div>
                          <div style={{ fontSize: '8.5px', color: '#64748b' }}>ID: {w.id_warga}</div>
                        </td>
                        <td style={{ padding: '6px 7px', border: '1px solid #cbd5e1', fontFamily: 'monospace' }}>
                          {w.id_pelanggan_pln}
                        </td>
                        <td style={{ padding: '6px 5px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                          <span style={{ 
                            fontSize: '8.5px', 
                            fontWeight: 700, 
                            padding: '1px 4px', 
                            borderRadius: '3px',
                            backgroundColor: w.golongan_va === '450' ? '#dbeafe' : '#d1fae5',
                            color: w.golongan_va === '450' ? '#1d4ed8' : '#047857'
                          }}>
                            {w.golongan_va} VA
                          </span>
                        </td>
                        <td style={{ padding: '6px 7px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontSize: '9px' }}>
                          <div>{w.latitude.toFixed(4)},</div>
                          <div>{w.longitude.toFixed(4)}</div>
                        </td>
                        <td style={{ padding: '6px 7px', border: '1px solid #cbd5e1' }}>
                          <div style={{ fontWeight: 600 }}>{w.daiNama}</div>
                          <div style={{ fontSize: '8.5px', color: '#64748b' }}>{w.daiRegional}</div>
                        </td>
                        <td style={{ padding: '6px 7px', border: '1px solid #cbd5e1' }}>
                          <div style={{ color: '#1e40af', fontWeight: 600 }}>{w.topAmaliyah}</div>
                          <div style={{ fontSize: '8.5px', color: '#64748b' }}>{w.historyCount}x input</div>
                        </td>
                        <td style={{ padding: '6px 7px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, color: '#d97706' }}>
                          {w.total_poin.toLocaleString()}
                        </td>
                        <td style={{ padding: '6px 7px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                          Rp {w.totalRupiah.toLocaleString('id-ID')}
                        </td>
                        <td style={{ padding: '6px 6px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 600 }}>
                          {w.totalKwh}
                        </td>
                        <td style={{ padding: '6px 7px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                          <span style={{
                            fontSize: '8.5px',
                            fontWeight: 700,
                            padding: '2px 5px',
                            borderRadius: '8px',
                            backgroundColor: w.isSiapRedeem ? '#d1fae5' : '#fef3c7',
                            color: w.isSiapRedeem ? '#065f46' : '#92400e',
                            display: 'inline-block'
                          }}>
                            {w.isSiapRedeem ? '✓ Siap Redeem' : 'Proses (7.5%)'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 800, borderTop: '2px solid #1e293b' }}>
                      <td colSpan={7} style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'right', textTransform: 'uppercase' }}>
                        TOTAL AKUMULASI NASIONAL:
                      </td>
                      <td style={{ padding: '6px 7px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#d97706' }}>
                        {totalPoin.toLocaleString()}
                      </td>
                      <td style={{ padding: '6px 7px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#059669' }}>
                        Rp {totalRupiah.toLocaleString('id-ID')}
                      </td>
                      <td style={{ padding: '6px 6px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#2563eb' }}>
                        {totalKwhMeter}
                      </td>
                      <td style={{ padding: '6px 7px', border: '1px solid #cbd5e1', textAlign: 'center', color: '#7c3aed' }}>
                        {siapRedeemCount}/{totalWarga} Siap
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* 3. LEMBAR PENGESAHAN RESMI (TANDA TANGAN & STEMPEL) */}
              <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '12px', marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  
                  {/* Tanda Tangan 1: Koordinator Da'i */}
                  <div style={{ textAlign: 'center', width: '200px' }}>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Mengetahui & Menyetujui,</div>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#0f172a' }}>Koordinator Da'i Pembina Wilayah</div>
                    <div style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'cursive', fontSize: '16px', color: '#1e40af' }}>Ustadz Ahmad</span>
                    </div>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, textDecoration: 'underline' }}>Ustadz Ahmad, M.Ag.</div>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>NID. DDII-2021001</div>
                  </div>

                  {/* Stempel Digital */}
                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ 
                      width: '68px', 
                      height: '68px', 
                      borderRadius: '50%', 
                      border: '2px dashed #2563eb', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#2563eb',
                      padding: '3px'
                    }}>
                      <ShieldCheck size={22} />
                      <span style={{ fontSize: '7px', fontWeight: 800, textTransform: 'uppercase', textAlign: 'center', marginTop: '1px' }}>
                        TERVALIDASI DIGITAL SIMDDII
                      </span>
                    </div>
                    <span style={{ fontSize: '8.5px', color: '#64748b', marginTop: '2px' }}>Keabsahan Resmi Terjamin</span>
                  </div>

                  {/* Tanda Tangan 2: Verifikator Sistem */}
                  <div style={{ textAlign: 'center', width: '200px' }}>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Bandung, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#0f172a' }}>Administrator GIS & Verifikator</div>
                    <div style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'cursive', fontSize: '16px', color: '#059669' }}>Ir. Rahmat Hidayat</span>
                    </div>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, textDecoration: 'underline' }}>Ir. Rahmat Hidayat, S.T.</div>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>Kepala Biro Energi Surya DDII</div>
                  </div>

                </div>

                <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '8.5px', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '5px' }}>
                  Dokumen diterbitkan resmi via Sistem Informasi Manajemen Da'i & Amaliyah (SIMDDII). Koordinat dicatat real-time via Global Positioning System (GPS).
                </div>
              </div>

            </div>

            {/* Footer Halaman 2 */}
            <div style={{ 
              borderTop: '1px solid #cbd5e1', 
              paddingTop: '6px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              fontSize: '8.5px',
              color: '#64748b'
            }}>
              <span>Sistem Informasi Manajemen Da'i & Amaliyah (SIMDDII) | Dokumen Resmi DDII</span>
              <span style={{ fontWeight: 700, color: '#1e40af' }}>Halaman 2 dari 2</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
