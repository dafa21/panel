import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  User, 
  Zap, 
  ShieldCheck, 
  Calendar, 
  FileText
} from 'lucide-react';
import { type Warga, mockDai, mockHistory, mockAmaliyah, NILAI_KONVERSI } from '../db_mock';
import { downloadMultiPagePdf, printDocumentHd } from '../utils/pdfExport';

interface ReportModalWargaProps {
  isOpen: boolean;
  onClose: () => void;
  warga: Warga | null;
}

export const ReportModalWarga: React.FC<ReportModalWargaProps> = ({ isOpen, onClose, warga }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');

  if (!isOpen || !warga) return null;

  const dai = mockDai.find(d => d.id_dai === warga.id_dai);
  const rawHistory = mockHistory.filter(h => h.id_warga === warga.id_warga);

  const historyWithDetails = rawHistory.map((trx, idx) => {
    const amaliyah = mockAmaliyah.find(a => a.id_amaliyah === trx.id_amaliyah);
    return {
      ...trx,
      no: idx + 1,
      namaAmaliyah: amaliyah?.nama || 'Unknown',
      kategori: amaliyah?.kategori || 'wajib',
      poin: amaliyah?.poin || 0,
      nominal: (amaliyah?.poin || 0) * NILAI_KONVERSI
    };
  });

  const totalKwhMeter = Number(rawHistory.reduce((sum, h) => sum + (h.kwh_meter || 0), 0).toFixed(1));
  const totalRupiah = warga.total_poin * NILAI_KONVERSI;
  const isSiapRedeem = warga.total_poin >= 20000;
  const progressPercent = Math.min(100, Math.round((warga.total_poin / 20000) * 100));

  // Hitung Komposisi Amaliyah (Wajib vs Sunnah vs Sosial)
  let poinWajib = 0;
  let poinSunnah = 0;
  let poinSosial = 0;

  historyWithDetails.forEach(h => {
    if (h.kategori === 'wajib') poinWajib += h.poin;
    else if (h.kategori === 'sunnah') poinSunnah += h.poin;
    else if (h.kategori === 'sosial') poinSosial += h.poin;
  });

  const totalPoinRiwayat = poinWajib + poinSunnah + poinSosial || 1;
  const persenWajib = Math.round((poinWajib / totalPoinRiwayat) * 100);
  const persenSunnah = Math.round((poinSunnah / totalPoinRiwayat) * 100);
  const persenSosial = Math.round((poinSosial / totalPoinRiwayat) * 100);

  // Unduh PDF Multi-Page Pas A4
  const handleDownloadPdf = async () => {
    try {
      setIsExporting(true);
      const safeName = warga.nama.replace(/\s+/g, '_');
      const filename = `Rapor_Warga_${safeName}_${warga.id_warga}_${new Date().toISOString().slice(0, 10)}.pdf`;
      await downloadMultiPagePdf(['warga-page-1', 'warga-page-2'], filename, (msg) => {
        setExportProgress(msg);
      });
    } catch (err) {
      console.error(err);
      alert('Terjadi kendala saat memproses PDF. Silakan gunakan tombol Cetak / Simpan PDF HD.');
    } finally {
      setIsExporting(false);
      setExportProgress('');
    }
  };

  // Cetak / Simpan PDF HD
  const handlePrint = () => {
    const safeName = warga.nama.replace(/\s+/g, '_');
    printDocumentHd(`Rapor_Amaliyah_${safeName}_${warga.id_warga}`);
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
              <FileText size={20} color="#60a5fa" />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>Rapor PDF Warga: {warga.nama} (Format A4 - 2 Halaman)</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Dossier lengkap tertata presisi di lembar A4 tanpa potongan</div>
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
              LEMBAR HALAMAN 1: BIODATA LENGKAP, GEOSPASIAL, KPI & KOMPOSISI AMALIYAH
             ========================================================================= */}
          <div 
            id="warga-page-1"
            className="a4-page-sheet"
          >
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
                      fontWeight: 800
                    }}>
                      <Zap size={22} color="#facc15" />
                      <span style={{ fontSize: '9px', letterSpacing: '0.05em' }}>SIMDDII</span>
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                        DEWAN DA'WAH ISLAMIYAH INDONESIA (DDII)
                      </h2>
                      <h3 style={{ margin: '1px 0 0 0', fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                        PROGRAM INSENTIF ENERGI SURYA & LISTRIK MANDIRI UMMAT
                      </h3>
                      <p style={{ margin: '1px 0 0 0', fontSize: '10px', color: '#64748b' }}>
                        Pemberdayaan Spiritual & Bantuan Subsidi Kuota Listrik Melalui Amaliyah Ibadah Harian
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0', paddingLeft: '12px' }}>
                    <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>No. Registrasi Warga</div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#1e40af' }}>REG-DDII/{warga.id_warga}/2026</div>
                    <div style={{ fontSize: '9px', color: '#64748b', marginTop: '3px' }}>Tanggal Cetak</div>
                    <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#0f172a' }}>
                      {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. JUDUL DOKUMEN */}
              <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                <h1 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  RAPOR EVALUASI AMALIYAH & VERIFIKASI TOKEN LISTRIK
                </h1>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#2563eb', marginTop: '2px' }}>
                  DOSSIER PROFIL INDIVIDU & CAPAIAN IBADAH WARGA BINAAN
                </div>
              </div>

              {/* 3. BIODATA LENGKAP & KOORDINAT GEOSPASIAL ("semuanya tertulis disana") */}
              <div style={{ 
                border: '1px solid #cbd5e1', 
                borderRadius: '8px', 
                padding: '12px 16px', 
                backgroundColor: '#f8fafc',
                marginBottom: '16px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '10px' }}>
                  <User size={15} color="#2563eb" />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    Identitas Lengkap Warga Binaan & Data Geospasial Akurat
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', fontSize: '11px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ color: '#64748b', padding: '2px 0', width: '42%' }}>Nama Lengkap:</td>
                        <td style={{ fontWeight: 800, color: '#0f172a', fontSize: '12.5px' }}>{warga.nama}</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#64748b', padding: '2px 0' }}>ID Warga (SIMDDII):</td>
                        <td style={{ fontWeight: 700, color: '#1e40af' }}>{warga.id_warga}</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#64748b', padding: '2px 0' }}>ID Pelanggan PLN:</td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>{warga.id_pelanggan_pln}</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#64748b', padding: '2px 0' }}>Golongan Tarif:</td>
                        <td style={{ fontWeight: 700 }}>
                          <span style={{ 
                            padding: '1px 5px', 
                            borderRadius: '3px', 
                            backgroundColor: warga.golongan_va === '450' ? '#dbeafe' : '#d1fae5',
                            color: warga.golongan_va === '450' ? '#1d4ed8' : '#047857',
                            fontSize: '10px'
                          }}>
                            {warga.golongan_va} VA ({warga.golongan_va === '450' ? 'Subsidi Penuh' : 'Subsidi Terbatas'})
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ color: '#64748b', padding: '2px 0', width: '45%' }}>Da'i Pembimbing:</td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>{dai?.nama || '-'} ({dai?.id_dai})</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#64748b', padding: '2px 0' }}>Wilayah / Regional:</td>
                        <td style={{ fontWeight: 600 }}>{dai?.regional || '-'}</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#64748b', padding: '2px 0' }}>Koordinat Latitude:</td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#2563eb' }}>{warga.latitude.toFixed(6)}</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#64748b', padding: '2px 0' }}>Koordinat Longitude:</td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#2563eb' }}>{warga.longitude.toFixed(6)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. 4 KPI CARDS CAPAIAN WARGA */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '8px', 
                marginBottom: '16px' 
              }}>
                <div style={{ border: '1px solid #e2e8f0', padding: '8px 10px', borderRadius: '6px', backgroundColor: '#ffffff' }}>
                  <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Poin Amaliyah</span>
                  <div style={{ fontSize: '17px', fontWeight: 800, color: '#d97706', marginTop: '1px' }}>
                    {warga.total_poin.toLocaleString()} <span style={{ fontSize: '10px', fontWeight: 500, color: '#64748b' }}>Pts</span>
                  </div>
                  <div style={{ fontSize: '8.5px', color: '#059669', fontWeight: 600 }}>Akumulasi Resmi</div>
                </div>

                <div style={{ border: '1px solid #e2e8f0', padding: '8px 10px', borderRadius: '6px', backgroundColor: '#ffffff' }}>
                  <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Estimasi Nilai Rupiah</span>
                  <div style={{ fontSize: '17px', fontWeight: 800, color: '#059669', marginTop: '1px' }}>
                    Rp {totalRupiah.toLocaleString('id-ID')}
                  </div>
                  <div style={{ fontSize: '8.5px', color: '#64748b' }}>1 Poin = Rp 1 Insentif</div>
                </div>

                <div style={{ border: '1px solid #e2e8f0', padding: '8px 10px', borderRadius: '6px', backgroundColor: '#ffffff' }}>
                  <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Listrik Tercatat</span>
                  <div style={{ fontSize: '17px', fontWeight: 800, color: '#2563eb', marginTop: '1px' }}>
                    {totalKwhMeter} <span style={{ fontSize: '10px', fontWeight: 500, color: '#64748b' }}>kWh</span>
                  </div>
                  <div style={{ fontSize: '8.5px', color: '#64748b' }}>Meteran Prabayar</div>
                </div>

                <div style={{ 
                  border: `1px solid ${isSiapRedeem ? '#a7f3d0' : '#fde68a'}`, 
                  padding: '8px 10px', 
                  borderRadius: '6px', 
                  backgroundColor: isSiapRedeem ? '#ecfdf5' : '#fffbeb' 
                }}>
                  <span style={{ fontSize: '8.5px', fontWeight: 700, color: isSiapRedeem ? '#065f46' : '#92400e', textTransform: 'uppercase' }}>
                    Status Tukar Token
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: isSiapRedeem ? '#059669' : '#d97706', marginTop: '2px' }}>
                    {isSiapRedeem ? '✓ SIAP REDEEM' : 'DALAM PROSES'}
                  </div>
                  <div style={{ fontSize: '8.5px', color: isSiapRedeem ? '#065f46' : '#92400e', marginTop: '1px' }}>
                    {isSiapRedeem ? 'Ambang 20.000 Terpenuhi' : `${progressPercent}% dari target`}
                  </div>
                </div>
              </div>

              {/* 5. INFOGRAFIS KOMPOSISI IBADAH */}
              <div style={{ 
                border: '1px solid #cbd5e1', 
                borderRadius: '8px', 
                padding: '12px 14px', 
                backgroundColor: '#ffffff',
                marginBottom: '16px' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    Infografis Komposisi Ibadah Amaliyah
                  </div>
                  <div style={{ fontSize: '9.5px', color: '#64748b' }}>
                    Total {historyWithDetails.length} Transaksi Amaliyah Tercatat
                  </div>
                </div>

                <div style={{ height: '9px', width: '100%', backgroundColor: '#e2e8f0', borderRadius: '5px', display: 'flex', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{ width: `${persenWajib}%`, backgroundColor: '#3b82f6' }} title={`Wajib: ${persenWajib}%`} />
                  <div style={{ width: `${persenSunnah}%`, backgroundColor: '#10b981' }} title={`Sunnah: ${persenSunnah}%`} />
                  <div style={{ width: `${persenSosial}%`, backgroundColor: '#f59e0b' }} title={`Sosial: ${persenSosial}%`} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '2px' }} />
                    <div><strong>Ibadah Wajib:</strong> {poinWajib} Pts ({persenWajib}%)</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '2px' }} />
                    <div><strong>Ibadah Sunnah:</strong> {poinSunnah} Pts ({persenSunnah}%)</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#f59e0b', borderRadius: '2px' }} />
                    <div><strong>Sosial Warga:</strong> {poinSosial} Pts ({persenSosial}%)</div>
                  </div>
                </div>
              </div>

              {/* 6. CATATAN EVALUASI & MOTIVASI SPIRITUAL DA'I */}
              <div style={{ 
                border: '1px solid #cbd5e1', 
                borderRadius: '8px', 
                padding: '10px 14px', 
                backgroundColor: '#f8fafc' 
              }}>
                <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#1e3a8a', marginBottom: '3px' }}>
                  Catatan Evaluasi & Rekomendasi Da'i Pembina:
                </div>
                <p style={{ margin: 0, fontSize: '10px', color: '#334155', fontStyle: 'italic', lineHeight: '1.4' }}>
                  "{warga.nama} menunjukkan kedisiplinan dan keistiqomahan yang luar biasa dalam amaliyah harian, khususnya sholat berjamaah dan majelis taklim. Warga bersangkutan {isSiapRedeem ? 'telah melampaui ambang batas dan berhak atas kuota token listrik mandiri' : 'sedang dalam proses peningkatan poin amaliyah menuju ambang batas token'}. Semoga keberkahan senantiasa menyertai keluarga."
                </p>
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
              <span>Sistem Informasi Manajemen Da'i & Amaliyah (SIMDDII) | Dossier Resmi Warga</span>
              <span style={{ fontWeight: 700, color: '#1e40af' }}>Halaman 1 dari 2</span>
            </div>
          </div>


          {/* =========================================================================
              LEMBAR HALAMAN 2: LOG HARIAN AMALIYAH LENGKAP & LEMBAR PENGESAHAN (A4)
             ========================================================================= */}
          <div 
            id="warga-page-2"
            className="a4-page-sheet"
          >
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
                    SIMDDII - RAPOR WARGA BINAAN
                  </span>
                  <span style={{ color: '#94a3b8' }}>| {warga.nama} ({warga.id_warga})</span>
                </div>
                <div style={{ color: '#64748b', fontFamily: 'monospace' }}>
                  ID Pelanggan PLN: {warga.id_pelanggan_pln}
                </div>
              </div>

              {/* 1. TABEL RIWAYAT AMALIYAH HARIAN LENGKAP */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Calendar size={15} color="#2563eb" />
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    Log Riwayat Amaliyah Harian Terverifikasi
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1e3a8a', color: 'white' }}>
                      <th style={{ padding: '6px 5px', border: '1px solid #1e3a8a', textAlign: 'center', width: '24px' }}>No</th>
                      <th style={{ padding: '6px 7px', border: '1px solid #1e3a8a' }}>Tanggal & Jam</th>
                      <th style={{ padding: '6px 7px', border: '1px solid #1e3a8a' }}>Aktivitas Ibadah Amaliyah</th>
                      <th style={{ padding: '6px 5px', border: '1px solid #1e3a8a', textAlign: 'center' }}>Kategori</th>
                      <th style={{ padding: '6px 7px', border: '1px solid #1e3a8a', textAlign: 'right' }}>Poin</th>
                      <th style={{ padding: '6px 7px', border: '1px solid #1e3a8a', textAlign: 'right' }}>kWh Meter</th>
                      <th style={{ padding: '6px 7px', border: '1px solid #1e3a8a', textAlign: 'right' }}>Nominal Rp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyWithDetails.map((trx, idx) => (
                      <tr 
                        key={trx.id_trx}
                        style={{ 
                          backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                          borderBottom: '1px solid #cbd5e1'
                        }}
                      >
                        <td style={{ padding: '5px 5px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 600 }}>
                          {trx.no}
                        </td>
                        <td style={{ padding: '5px 7px', border: '1px solid #cbd5e1', whiteSpace: 'nowrap' }}>
                          {trx.tanggal}
                        </td>
                        <td style={{ padding: '5px 7px', border: '1px solid #cbd5e1', fontWeight: 600, color: '#1e40af' }}>
                          {trx.namaAmaliyah}
                        </td>
                        <td style={{ padding: '5px 5px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                          <span style={{
                            fontSize: '8px',
                            fontWeight: 700,
                            padding: '1px 4px',
                            borderRadius: '3px',
                            backgroundColor: trx.kategori === 'wajib' ? '#dbeafe' : trx.kategori === 'sunnah' ? '#d1fae5' : '#fef3c7',
                            color: trx.kategori === 'wajib' ? '#1d4ed8' : trx.kategori === 'sunnah' ? '#065f46' : '#92400e',
                            textTransform: 'uppercase'
                          }}>
                            {trx.kategori}
                          </span>
                        </td>
                        <td style={{ padding: '5px 7px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, color: '#d97706' }}>
                          +{trx.poin}
                        </td>
                        <td style={{ padding: '5px 7px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 600, color: '#059669' }}>
                          +{trx.kwh_meter} kWh
                        </td>
                        <td style={{ padding: '5px 7px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                          Rp {trx.nominal.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 800, borderTop: '2px solid #1e293b' }}>
                      <td colSpan={4} style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'right', textTransform: 'uppercase' }}>
                        TOTAL DARI LOG HARIAN:
                      </td>
                      <td style={{ padding: '6px 7px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#d97706' }}>
                        +{totalPoinRiwayat} Pts
                      </td>
                      <td style={{ padding: '6px 7px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#059669' }}>
                        +{totalKwhMeter} kWh
                      </td>
                      <td style={{ padding: '6px 7px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#1e40af' }}>
                        Rp {(totalPoinRiwayat * NILAI_KONVERSI).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* 2. REKAPITULASI PROGRAM INSENTIF */}
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 12px', backgroundColor: '#f8fafc', marginBottom: '16px', fontSize: '10px' }}>
                <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: '4px' }}>
                  Ketentuan Pencairan Token & Konversi Energi:
                </div>
                <p style={{ margin: '0 0 2px 0', color: '#475569' }}>
                  1. Setiap akumulasi poin amaliyah yang telah mencapai target batas minimal (20.000 Pts) dapat diajukan penukarannya menjadi kode token listrik prabayar PLN (16 digit angka stroom).
                </p>
                <p style={{ margin: '0 0 2px 0', color: '#475569' }}>
                  2. Besaran kuota listrik (kWh) yang didapat warga disesuaikan dengan golongan daya meteran terdaftar ({warga.golongan_va} VA) dan tarif subsidi pemerintah yang berlaku.
                </p>
                <p style={{ margin: 0, color: '#059669', fontWeight: 600 }}>
                  3. Verifikasi disahkan oleh Da'i Pembina Wilayah ({dai?.nama || 'Ustadz Pembina'}) dan tercatat permanen di cloud SIMDDII.
                </p>
              </div>

              {/* 3. LEMBAR PENGESAHAN RESMI (TANDA TANGAN & STEMPEL) */}
              <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '14px', marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  
                  {/* Tanda Tangan Warga */}
                  <div style={{ textAlign: 'center', width: '180px' }}>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Warga Binaan,</div>
                    <div style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'cursive', fontSize: '16px', color: '#0f172a' }}>{warga.nama}</span>
                    </div>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, textDecoration: 'underline' }}>{warga.nama}</div>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>ID: {warga.id_warga}</div>
                  </div>

                  {/* Stempel SIMDDII */}
                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                        TERVERIFIKASI DDII RESMI
                      </span>
                    </div>
                    <span style={{ fontSize: '8px', color: '#64748b', marginTop: '2px' }}>Audit Geospasial Valid</span>
                  </div>

                  {/* Tanda Tangan Da'i Pembina */}
                  <div style={{ textAlign: 'center', width: '180px' }}>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Da'i Pembina Wilayah,</div>
                    <div style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'cursive', fontSize: '16px', color: '#1e40af' }}>{dai?.nama || 'Ustadz Pembina'}</span>
                    </div>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, textDecoration: 'underline' }}>{dai?.nama || 'Ustadz Pembina'}, M.Ag.</div>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>Da'i Regional {dai?.regional || '-'}</div>
                  </div>

                </div>

                <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '8.5px', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '5px' }}>
                  Rapor ini sah dan terdaftar dalam Database Terpusat Sistem Informasi Manajemen Da'i & Amaliyah (SIMDDII) DDII Indonesia.
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
              <span>Sistem Informasi Manajemen Da'i & Amaliyah (SIMDDII) | Dossier Resmi Warga</span>
              <span style={{ fontWeight: 700, color: '#1e40af' }}>Halaman 2 dari 2</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
