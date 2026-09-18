import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  FileSpreadsheet
} from 'lucide-react';
import { useLpj } from '../context/LpjContext';
import { mockLpjMonthlyTrend } from '../lpj_mock';
import { downloadMultiPagePdf, printDocumentHd } from '../utils/pdfExport';

interface ReportModalLpjProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModalLpj: React.FC<ReportModalLpjProps> = ({ isOpen, onClose }) => {
  const { budgetConfig, kategoriAnggaran, ledgerItems, esgImpacts } = useLpj();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');

  if (!isOpen) return null;

  const sisaKas = budgetConfig.paguAnggaran - budgetConfig.realisasiAnggaran;
  const persenSerapan = Math.min(100, Math.round((budgetConfig.realisasiAnggaran / budgetConfig.paguAnggaran) * 100));

  // Handler Download PDF 3 Halaman A4 Presisi
  const handleDownloadPdf = async () => {
    try {
      setIsExporting(true);
      const filename = `Laporan_Pertanggungjawaban_LPJ_SIMDDII_${new Date().toISOString().slice(0, 10)}.pdf`;
      await downloadMultiPagePdf(['lpj-page-1', 'lpj-page-2', 'lpj-page-3'], filename, (msg) => {
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

  // Handler Cetak / Simpan PDF HD
  const handlePrint = () => {
    printDocumentHd(`Laporan_Pertanggungjawaban_LPJ_SIMDDII_${new Date().toISOString().slice(0, 10)}`);
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
            <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.25)' }}>
              <FileSpreadsheet size={20} color="#34d399" />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>Pratinjau Dokumen Resmi LPJ (Format A4 - 3 Halaman)</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Laporan Pertanggungjawaban Realisasi Anggaran, Penyaluran Energi & Audit Keuangan</div>
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
              <Download size={15} /> {isExporting ? (exportProgress || 'Menyusun PDF...') : 'Download PDF (3 Hal. Pas A4)'}
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
              LEMBAR 1: KOP SURAT, RINGKASAN EKSEKUTIF & 6 KPI ANGGARAN LPJ
             ========================================================================= */}
          <div 
            id="lpj-page-1"
            className="a4-page-sheet"
          >
            <div>
              {/* 1. KOP SURAT RESMI */}
              <div style={{ borderBottom: '3px double #1e293b', paddingBottom: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ 
                      width: '54px', 
                      height: '54px', 
                      borderRadius: '10px', 
                      backgroundColor: '#059669', 
                      color: 'white', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontWeight: 800,
                      boxShadow: '0 4px 8px rgba(5, 150, 105, 0.25)'
                    }}>
                      <ShieldCheck size={22} color="#ffffff" />
                      <span style={{ fontSize: '9px', letterSpacing: '0.05em' }}>SIMDDII</span>
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                        DEWAN DA'WAH ISLAMIYAH INDONESIA (DDII)
                      </h2>
                      <h3 style={{ margin: '1px 0 0 0', fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                        BADAN PENGELOLA ENERGI SURYA & PEMBERDAYAAN UMMAT
                      </h3>
                      <p style={{ margin: '1px 0 0 0', fontSize: '10px', color: '#64748b' }}>
                        Laporan Pertanggungjawaban (LPJ) Penyaluran Insentif Token Listrik Berbasis Amaliyah Warga
                      </p>
                      <p style={{ margin: '1px 0 0 0', fontSize: '9px', color: '#94a3b8' }}>
                        Sekretariat Pusat: Gedung Menara Da'wah, Jl. Kramat Raya No. 45 Jakarta Pusat | Telp: (021) 3190-1234
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0', paddingLeft: '12px' }}>
                    <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Nomor Dokumen LPJ</div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#059669' }}>{budgetConfig.nomorLpj}</div>
                    <div style={{ fontSize: '9px', color: '#64748b', marginTop: '3px' }}>Periode Pertanggungjawaban</div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#0f172a' }}>{budgetConfig.periodeAktif}</div>
                  </div>
                </div>
              </div>

              {/* 2. JUDUL DOKUMEN LPJ */}
              <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                <h1 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  LAPORAN PERTANGGUNGJAWABAN (LPJ) KEUANGAN & OPERASIONAL
                </h1>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#059669', marginTop: '2px' }}>
                  REALISASI ANGGARAN PROGRAM SUBSIDI ENERGI & PEMBINAAN SPIRITUAL UMMAT
                </div>
              </div>

              {/* 3. 6 KARTU KPI KEUANGAN & ENERGI */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '8px', 
                marginBottom: '14px' 
              }}>
                <div style={{ border: '1px solid #e2e8f0', padding: '8px 10px', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
                  <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Pagu Anggaran</span>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e40af', marginTop: '1px' }}>
                    Rp {budgetConfig.paguAnggaran.toLocaleString('id-ID')}
                  </div>
                  <div style={{ fontSize: '8.5px', color: '#64748b' }}>Pagu DIPA Program 100%</div>
                </div>

                <div style={{ border: '1px solid #a7f3d0', padding: '8px 10px', borderRadius: '6px', backgroundColor: '#ecfdf5' }}>
                  <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>Realisasi Belanja</span>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#059669', marginTop: '1px' }}>
                    Rp {budgetConfig.realisasiAnggaran.toLocaleString('id-ID')}
                  </div>
                  <div style={{ fontSize: '8.5px', color: '#059669', fontWeight: 700 }}>Penyerapan: {persenSerapan}%</div>
                </div>

                <div style={{ border: '1px solid #fde68a', padding: '8px 10px', borderRadius: '6px', backgroundColor: '#fffbeb' }}>
                  <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>Sisa Saldo Kas</span>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#d97706', marginTop: '1px' }}>
                    Rp {sisaKas.toLocaleString('id-ID')}
                  </div>
                  <div style={{ fontSize: '8.5px', color: '#64748b' }}>Sisa Alokasi Cadangan Q4</div>
                </div>

                <div style={{ border: '1px solid #e2e8f0', padding: '8px 10px', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
                  <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Token Listrik Tersalurkan</span>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb', marginTop: '1px' }}>
                    {budgetConfig.targetKwh.toLocaleString()} <span style={{ fontSize: '10px', fontWeight: 500, color: '#64748b' }}>kWh</span>
                  </div>
                  <div style={{ fontSize: '8.5px', color: '#059669', fontWeight: 600 }}>Terkonversi ke Meter Warga</div>
                </div>

                <div style={{ border: '1px solid #e2e8f0', padding: '8px 10px', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
                  <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Indeks Efisiensi Biaya</span>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#7c3aed', marginTop: '1px' }}>
                    Rp {budgetConfig.biayaPerJiwa.toLocaleString('id-ID')}
                  </div>
                  <div style={{ fontSize: '8.5px', color: '#64748b' }}>Per Warga / Bulan</div>
                </div>

                <div style={{ border: '1px solid #e2e8f0', padding: '8px 10px', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
                  <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status Audit LPJ</span>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#059669', marginTop: '3px' }}>
                    WTP TERVERIFIKASI
                  </div>
                  <div style={{ fontSize: '8.5px', color: '#059669', fontWeight: 600 }}>Kepatuhan Syariah 100%</div>
                </div>
              </div>

              {/* 4. NARASI LAPORAN AKUNTABILITAS TATA KELOLA */}
              <div style={{ 
                border: '1px solid #cbd5e1', 
                borderRadius: '8px', 
                padding: '10px 12px', 
                backgroundColor: '#ffffff',
                marginBottom: '14px',
                fontSize: '10px',
                lineHeight: '1.45',
                color: '#334155'
              }}>
                <div style={{ fontWeight: 700, color: '#065f46', fontSize: '11px', marginBottom: '4px' }}>
                  Ringkasan Eksekutif & Akuntabilitas Penyerapan Dana
                </div>
                <p style={{ margin: '0 0 4px 0' }}>
                  Laporan Pertanggungjawaban (LPJ) ini disusun sebagai wujud transparansi, akuntabilitas, dan kepatuhan syariah dalam pengelolaan dana amanah program insentif energi mandiri. Melalui platform terintegrasi <strong>SIMDDII (Sistem Informasi Manajemen Da'i & Amaliyah)</strong>, seluruh alokasi dana bantuan token listrik telah disalurkan tepat sasaran kepada warga binaan yang terverifikasi aktif menjalankan amaliyah ibadah harian.
                </p>
                <p style={{ margin: 0 }}>
                  Dari total pagu anggaran sebesar <strong>Rp {budgetConfig.paguAnggaran.toLocaleString('id-ID')}</strong>, telah terealisasi secara efektif sebesar <strong>Rp {budgetConfig.realisasiAnggaran.toLocaleString('id-ID')} ({persenSerapan}%)</strong> dengan efisiensi operasional teruji dan sisa kas sebesar <strong>Rp {sisaKas.toLocaleString('id-ID')}</strong> yang dialokasikan sebagai cadangan kesinambungan kuota listrik di kuartal berikutnya.
                </p>
              </div>

              {/* 5. TABEL REALISASI BELANJA PER KATEGORI UTAMA */}
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
                <div style={{ backgroundColor: '#f1f5f9', padding: '6px 10px', fontSize: '10.5px', fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #e2e8f0' }}>
                  Alokasi & Realisasi Anggaran per Pos Belanja Program
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#065f46', color: 'white' }}>
                      <th style={{ padding: '6px 8px', width: '32px', textAlign: 'center' }}>Kode</th>
                      <th style={{ padding: '6px 8px' }}>Pos Pengeluaran / Komponen Biaya</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>Pagu Anggaran</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>Realisasi (Rp)</th>
                      <th style={{ padding: '6px 8px', textAlign: 'center' }}>Serapan</th>
                      <th style={{ padding: '6px 8px' }}>Keterangan Kemanfaatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kategoriAnggaran.map((kat, idx) => (
                      <tr 
                        key={kat.id}
                        style={{ 
                          backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                          borderBottom: '1px solid #e2e8f0'
                        }}
                      >
                        <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{kat.id}</td>
                        <td style={{ padding: '5px 8px', fontWeight: 700, color: '#0f172a' }}>{kat.nama}</td>
                        <td style={{ padding: '5px 8px', textAlign: 'right' }}>Rp {kat.pagu.toLocaleString('id-ID')}</td>
                        <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                          Rp {kat.realisasi.toLocaleString('id-ID')}
                        </td>
                        <td style={{ padding: '5px 8px', textAlign: 'center' }}>
                          <span style={{ 
                            fontSize: '8.5px', 
                            fontWeight: 700, 
                            padding: '1px 5px', 
                            borderRadius: '10px', 
                            backgroundColor: kat.persentase >= 75 ? '#d1fae5' : '#fef3c7',
                            color: kat.persentase >= 75 ? '#065f46' : '#92400e'
                          }}>
                            {kat.persentase}%
                          </span>
                        </td>
                        <td style={{ padding: '5px 8px', color: '#475569', fontSize: '8.5px' }}>{kat.keterangan}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#ecfdf5', fontWeight: 800, borderTop: '2px solid #059669' }}>
                      <td colSpan={2} style={{ padding: '6px 8px', textAlign: 'right', textTransform: 'uppercase' }}>TOTAL REALISASI:</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right' }}>Rp {budgetConfig.paguAnggaran.toLocaleString('id-ID')}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', color: '#059669' }}>Rp {budgetConfig.realisasiAnggaran.toLocaleString('id-ID')}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', color: '#059669' }}>{persenSerapan}%</td>
                      <td style={{ padding: '6px 8px', color: '#065f46' }}>Akuntabilitas Dana Sah & Terverifikasi</td>
                    </tr>
                  </tfoot>
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
              <span>Sistem Informasi Manajemen Da'i & Amaliyah (SIMDDII) | Dokumen LPJ Resmi</span>
              <span style={{ fontWeight: 700, color: '#059669' }}>Halaman 1 dari 3</span>
            </div>
          </div>


          {/* =========================================================================
              LEMBAR 2: INFOGRAFIS ANGGARAN, SEBARAN REGIONAL & EVALUASI DAMPAK SOSIAL
             ========================================================================= */}
          <div 
            id="lpj-page-2"
            className="a4-page-sheet"
          >
            <div>
              {/* Mini Running Header Lembar 2 */}
              <div style={{ 
                borderBottom: '2px solid #059669', 
                paddingBottom: '6px', 
                marginBottom: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '9.5px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} color="#059669" />
                  <span style={{ fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>
                    SIMDDII - LAPORAN PERTANGGUNGJAWABAN (LPJ)
                  </span>
                  <span style={{ color: '#94a3b8' }}>| Infografis & Evaluasi Dampak</span>
                </div>
                <div style={{ color: '#64748b', fontFamily: 'monospace' }}>
                  Dokumen No: {budgetConfig.nomorLpj}
                </div>
              </div>

              {/* 1. INFOGRAFIS VISUAL REALISASI ANGGARAN */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <TrendingUp size={15} color="#059669" />
                  <h3 style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    A. Infografis Visual Alokasi & Tren Penyerapan Anggaran
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '10px' }}>
                  
                  {/* Visual Progress Bar per Pos Belanja */}
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 12px', backgroundColor: '#ffffff' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                      Realisasi Belanja vs Pagu per Pos Anggaran
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {kategoriAnggaran.map(kat => (
                        <div key={kat.id}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', marginBottom: '2px' }}>
                            <span style={{ fontWeight: 600 }}>{kat.nama}</span>
                            <span style={{ fontWeight: 700, color: kat.color }}>
                              Rp {(kat.realisasi / 1000000).toFixed(1)}M / {(kat.pagu / 1000000).toFixed(1)}M ({kat.persentase}%)
                            </span>
                          </div>
                          <div style={{ height: '7px', width: '100%', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ 
                              width: `${kat.persentase}%`, 
                              height: '100%', 
                              backgroundColor: kat.color,
                              borderRadius: '4px' 
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b', marginTop: '6px', borderTop: '1px dashed #e2e8f0', paddingTop: '4px' }}>
                      <span>Total Realisasi: <strong>Rp {budgetConfig.realisasiAnggaran.toLocaleString('id-ID')}</strong></span>
                      <span style={{ color: '#059669', fontWeight: 700 }}>Efisiensi Anggaran Terjaga</span>
                    </div>
                  </div>

                  {/* Sebaran Wilayah & Tren Bulanan */}
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 12px', backgroundColor: '#ffffff' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                      Sebaran Alokasi Dana per Wilayah
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <div style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%' }} />
                          <span>Jawa Barat (Bandung)</span>
                        </div>
                        <strong style={{ color: '#2563eb' }}>Rp 69.750.000 (62%)</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }} />
                          <span>Jawa Tengah (Surabaya)</span>
                        </div>
                        <strong style={{ color: '#059669' }}>Rp 42.750.000 (38%)</strong>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#0f172a', marginBottom: '3px' }}>
                        Realisasi Penyaluran per Bulan:
                      </div>
                      <div style={{ fontSize: '9px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {mockLpjMonthlyTrend.map(m => (
                          <div key={m.bulan} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{m.bulan}:</span>
                            <strong>Rp {m.realisasiRp.toLocaleString('id-ID')} ({m.kwhListrik} kWh)</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* 2. REKAPITULASI PENYALURAN TOKEN ENERGI PER REGIONAL */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Zap size={14} color="#059669" />
                  <h3 style={{ margin: 0, fontSize: '11.5px', fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    B. Rekapitulasi Penyaluran Token Listrik & Akumulasi Poin Warga
                  </h3>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#065f46', color: 'white' }}>
                      <th style={{ padding: '5px 8px' }}>Wilayah Binaan</th>
                      <th style={{ padding: '5px 8px' }}>Da'i Penanggung Jawab</th>
                      <th style={{ padding: '5px 8px', textAlign: 'center' }}>Warga Penerima</th>
                      <th style={{ padding: '5px 8px', textAlign: 'right' }}>Akumulasi Poin</th>
                      <th style={{ padding: '5px 8px', textAlign: 'right' }}>Nilai Insentif Token</th>
                      <th style={{ padding: '5px 8px', textAlign: 'right' }}>Kuota Energi (kWh)</th>
                      <th style={{ padding: '5px 8px', textAlign: 'center' }}>Efisiensi / Jiwa</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '5px 8px', fontWeight: 700, color: '#1e40af' }}>Jawa Barat (Bandung Raya)</td>
                      <td style={{ padding: '5px 8px' }}>Ustadz Ahmad, M.Ag.</td>
                      <td style={{ padding: '5px 8px', textAlign: 'center' }}>2 Rumah (Ibu Siti, Supriadi)</td>
                      <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 700, color: '#d97706' }}>46,500 Pts</td>
                      <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 700 }}>Rp 29.760.000</td>
                      <td style={{ padding: '5px 8px', textAlign: 'right', color: '#059669', fontWeight: 700 }}>775 kWh</td>
                      <td style={{ padding: '5px 8px', textAlign: 'center', color: '#059669' }}>Rp 38.400</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '5px 8px', fontWeight: 700, color: '#047857' }}>Jawa Tengah (Surabaya)</td>
                      <td style={{ padding: '5px 8px' }}>Ustadz Budi, S.Sos.I.</td>
                      <td style={{ padding: '5px 8px', textAlign: 'center' }}>1 Rumah (Bapak Joko)</td>
                      <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 700, color: '#d97706' }}>25,000 Pts</td>
                      <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 700 }}>Rp 18.240.000</td>
                      <td style={{ padding: '5px 8px', textAlign: 'right', color: '#059669', fontWeight: 700 }}>475 kWh</td>
                      <td style={{ padding: '5px 8px', textAlign: 'center', color: '#059669' }}>Rp 38.400</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#ecfdf5', fontWeight: 800 }}>
                      <td colSpan={2} style={{ padding: '5px 8px', textTransform: 'uppercase' }}>TOTAL PENYALURAN:</td>
                      <td style={{ padding: '5px 8px', textAlign: 'center' }}>3 Rumah Tangga</td>
                      <td style={{ padding: '5px 8px', textAlign: 'right', color: '#d97706' }}>71,500 Pts</td>
                      <td style={{ padding: '5px 8px', textAlign: 'right', color: '#059669' }}>Rp 48.000.000</td>
                      <td style={{ padding: '5px 8px', textAlign: 'right', color: '#059669' }}>1.250 kWh</td>
                      <td style={{ padding: '5px 8px', textAlign: 'center', color: '#059669' }}>Rp 38.400</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* 3. EVALUASI DAMPAK SOSIAL & LINGKUNGAN (ESG METRICS) */}
              <div style={{ 
                border: '1px solid #cbd5e1', 
                borderRadius: '8px', 
                padding: '10px 12px', 
                backgroundColor: '#ffffff' 
              }}>
                <div style={{ fontWeight: 700, color: '#065f46', fontSize: '11px', marginBottom: '6px' }}>
                  C. Evaluasi Dampak Sosial, Ekonomi & Lingkungan Hidup (ESG Impact)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(3, Math.max(1, esgImpacts.length))}, 1fr)`, gap: '8px', fontSize: '9.5px' }}>
                  {esgImpacts.map(impact => (
                    <div key={impact.id} style={{ backgroundColor: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: 700, color: impact.color || '#065f46', marginBottom: '2px' }}>
                        {impact.nomor}. {impact.judul}:
                      </div>
                      <p style={{ margin: 0, color: '#475569', lineHeight: '1.4' }}>
                        {impact.deskripsi}
                      </p>
                    </div>
                  ))}
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
              <span>Sistem Informasi Manajemen Da'i & Amaliyah (SIMDDII) | Dokumen LPJ Resmi</span>
              <span style={{ fontWeight: 700, color: '#059669' }}>Halaman 2 dari 3</span>
            </div>
          </div>


          {/* =========================================================================
              LEMBAR 3: BUKU KAS UMUM (LEDGER SPJ RINCI) & LEMBAR PENGESAHAN 3 PIHAK
             ========================================================================= */}
          <div 
            id="lpj-page-3"
            className="a4-page-sheet"
          >
            <div>
              {/* Mini Running Header Lembar 3 */}
              <div style={{ 
                borderBottom: '2px solid #059669', 
                paddingBottom: '6px', 
                marginBottom: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '9.5px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileSpreadsheet size={14} color="#059669" />
                  <span style={{ fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>
                    SIMDDII - BUKU KAS UMUM & LEMBAR PENGESAHAN LPJ
                  </span>
                  <span style={{ color: '#94a3b8' }}>| Jurnal Realisasi Belanja (SPJ)</span>
                </div>
                <div style={{ color: '#64748b', fontFamily: 'monospace' }}>
                  Dokumen No: {budgetConfig.nomorLpj}
                </div>
              </div>

              {/* 1. BUKU KAS UMUM / TABEL LEDGER SPJ RINCI */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <FileSpreadsheet size={14} color="#059669" />
                  <h3 style={{ margin: 0, fontSize: '11.5px', fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    A. Buku Kas Umum & Rincian Pengeluaran Terverifikasi (SPJ)
                  </h3>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#065f46', color: 'white' }}>
                      <th style={{ padding: '5px 6px', width: '22px', textAlign: 'center' }}>No</th>
                      <th style={{ padding: '5px 7px' }}>Nomor Bukti Kas</th>
                      <th style={{ padding: '5px 7px' }}>Tanggal</th>
                      <th style={{ padding: '5px 7px' }}>Pos Anggaran</th>
                      <th style={{ padding: '5px 7px' }}>Uraian Belanja / Transaksi</th>
                      <th style={{ padding: '5px 7px' }}>Penerima / Wilayah</th>
                      <th style={{ padding: '5px 7px', textAlign: 'right' }}>Nominal (Rp)</th>
                      <th style={{ padding: '5px 7px', textAlign: 'center' }}>Status SPJ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerItems.map((item, idx) => (
                      <tr 
                        key={item.id_spj}
                        style={{ 
                          backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                          borderBottom: '1px solid #cbd5e1'
                        }}
                      >
                        <td style={{ padding: '4.5px 6px', textAlign: 'center', fontWeight: 600 }}>{idx + 1}</td>
                        <td style={{ padding: '4.5px 7px', fontFamily: 'monospace', fontWeight: 700, color: '#065f46' }}>{item.id_spj}</td>
                        <td style={{ padding: '4.5px 7px', whiteSpace: 'nowrap' }}>{item.tanggal}</td>
                        <td style={{ padding: '4.5px 7px', fontWeight: 600 }}>{item.pos_anggaran}</td>
                        <td style={{ padding: '4.5px 7px', color: '#1e293b' }}>{item.uraian}</td>
                        <td style={{ padding: '4.5px 7px', color: '#475569' }}>{item.penerima} ({item.wilayah})</td>
                        <td style={{ padding: '4.5px 7px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                          Rp {item.nominal.toLocaleString('id-ID')}
                        </td>
                        <td style={{ padding: '4.5px 7px', textAlign: 'center' }}>
                          <span style={{ 
                            fontSize: '8px', 
                            fontWeight: 700, 
                            padding: '1px 5px', 
                            borderRadius: '8px', 
                            backgroundColor: '#d1fae5', 
                            color: '#065f46',
                            whiteSpace: 'nowrap'
                          }}>
                            ✓ {item.status_verifikasi}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#ecfdf5', fontWeight: 800, borderTop: '2px solid #059669' }}>
                      <td colSpan={6} style={{ padding: '6px 8px', textAlign: 'right', textTransform: 'uppercase' }}>
                        TOTAL PENGELUARAN TERVERIFIKASI AUDITOR:
                      </td>
                      <td style={{ padding: '6px 7px', textAlign: 'right', color: '#059669' }}>
                        Rp {ledgerItems.reduce((sum, item) => sum + item.nominal, 0).toLocaleString('id-ID')}
                      </td>
                      <td style={{ padding: '6px 7px', textAlign: 'center', color: '#065f46' }}>
                        100% Sah
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* 2. LEMBAR PENGESAHAN 3 PIHAK (RESMI DENGAN STEMPEL) */}
              <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '10px' }}>
                <div style={{ textAlign: 'center', fontSize: '10px', fontWeight: 700, color: '#065f46', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Lembar Pengesahan & Tanda Tangan Pejabat Berwenang
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  
                  {/* Pihak 1: Ketua Umum */}
                  <div style={{ textAlign: 'center', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>Mengetahui & Menyetujui,</div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#0f172a' }}>Ketua Umum Dewan Da'wah</div>
                    <div style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'cursive', fontSize: '16px', color: '#065f46' }}>Dr. Adian Husaini</span>
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 700, textDecoration: 'underline' }}>Dr. H. Adian Husaini, M.Si.</div>
                    <div style={{ fontSize: '8.5px', color: '#64748b' }}>Ketua Umum DDII Pusat</div>
                  </div>

                  {/* Stempel Basah Digital & QR Verifikasi */}
                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ 
                      width: '68px', 
                      height: '68px', 
                      borderRadius: '50%', 
                      border: '2px dashed #059669', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#059669',
                      padding: '3px'
                    }}>
                      <ShieldCheck size={22} />
                      <span style={{ fontSize: '6.5px', fontWeight: 800, textTransform: 'uppercase', textAlign: 'center', marginTop: '1px' }}>
                        AUDIT TERVERIFIKASI DDII
                      </span>
                    </div>
                    <span style={{ fontSize: '8px', color: '#059669', fontWeight: 700, marginTop: '2px' }}>Status Audit: WTP</span>
                  </div>

                  {/* Pihak 2: Auditor Keuangan */}
                  <div style={{ textAlign: 'center', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>Telah Diaudit & Sah,</div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#0f172a' }}>Auditor Keuangan Independen</div>
                    <div style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'cursive', fontSize: '16px', color: '#1e40af' }}>Siti Maryam, Ak.</span>
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 700, textDecoration: 'underline' }}>Dra. Hj. Siti Maryam, Ak., CA</div>
                    <div style={{ fontSize: '8.5px', color: '#64748b' }}>No. Izin Akuntan: AP-04812</div>
                  </div>

                </div>

                <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '8px', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '4px' }}>
                  Dokumen LPJ ini terbit secara sah melalui SIMDDII dan memiliki kekuatan pembuktian hukum formal sesuai standar akuntansi organisasi nirlaba (PSAK 109).
                </div>
              </div>

            </div>

            {/* Footer Halaman 3 */}
            <div style={{ 
              borderTop: '1px solid #cbd5e1', 
              paddingTop: '6px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              fontSize: '8.5px',
              color: '#64748b'
            }}>
              <span>Sistem Informasi Manajemen Da'i & Amaliyah (SIMDDII) | Dokumen LPJ Resmi</span>
              <span style={{ fontWeight: 700, color: '#059669' }}>Halaman 3 dari 3</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
