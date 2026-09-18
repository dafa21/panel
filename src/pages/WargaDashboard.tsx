import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { mockWarga, mockHistory, mockAmaliyah, NILAI_KONVERSI } from '../db_mock';
import { ArrowLeft, User, Zap, Coins, Award, Calendar, FileText } from 'lucide-react';
import { ReportModalWarga } from '../components/ReportModalWarga';

export const WargaDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [filterDate, setFilterDate] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // 1. Fetch Warga Data
  const warga = mockWarga.find(w => w.id_warga === id);

  if (!warga) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--color-primary)' }}>Warga tidak ditemukan</h2>
        <button 
          onClick={() => navigate('/history')}
          style={{ padding: '10px 20px', marginTop: '16px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
        >
          Kembali ke Rekapan
        </button>
      </div>
    );
  }

  // 2. Fetch History and Calculate Stats
  const rawHistory = mockHistory.filter(h => h.id_warga === id);
  
  // Apply Date Filter if selected
  const filteredHistory = filterDate 
    ? rawHistory.filter(h => h.tanggal.startsWith(filterDate))
    : rawHistory;

  const historyWithDetails = filteredHistory.map(trx => {
    const amaliyah = mockAmaliyah.find(a => a.id_amaliyah === trx.id_amaliyah);
    return {
      ...trx,
      namaAmaliyah: amaliyah?.nama || 'Unknown',
      kategori: amaliyah?.kategori || 'wajib',
      poin: amaliyah?.poin || 0,
      nominal: (amaliyah?.poin || 0) * NILAI_KONVERSI
    };
  });

  const totalKwhMeter = rawHistory.reduce((sum, h) => sum + (h.kwh_meter || 0), 0);
  // Perbaikan bug: hitung estimasi rupiah konsisten dari total_poin riil warga (bukan hanya 7 baris contoh log)
  const totalRupiah = warga.total_poin * NILAI_KONVERSI;

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Top Navigation & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <button 
          onClick={() => navigate('/history')}
          style={{ 
            background: 'none', border: 'none', color: 'var(--color-text-light)', cursor: 'pointer', 
            display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, padding: 0 
          }}
        >
          <ArrowLeft size={16} /> Kembali ke Database
        </button>

        <button
          onClick={() => setIsReportModalOpen(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s ease'
          }}
          className="card-hover"
        >
          <FileText size={16} /> Unduh Rapor PDF Warga
        </button>
      </div>

      {/* Header Profile */}
      <Card style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px', backgroundColor: 'var(--color-primary)', color: 'white' }}>
        <div style={{ 
          width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <User size={28} color="white" />
        </div>
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: 700 }}>{warga.nama}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '13px', opacity: 0.9 }}>
            <span>ID: <strong>{warga.id_warga}</strong></span>
            <span>ID PLN: <strong>{warga.id_pelanggan_pln} ({warga.golongan_va} VA)</strong></span>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="kpi-grid">
        <Card style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '10px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px' }}>
            <Award size={24} color="var(--color-accent)" />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-light)', fontWeight: 600, textTransform: 'uppercase' }}>Total Poin Amaliyah</span>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text)' }}>
              {warga.total_poin.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-light)' }}>Pts</span>
            </div>
          </div>
        </Card>

        <Card style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px' }}>
            <Zap size={24} color="#10b981" />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-light)', fontWeight: 600, textTransform: 'uppercase' }}>Listrik Didapat</span>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>
              {totalKwhMeter.toFixed(1)} <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-light)' }}>kWh</span>
            </div>
          </div>
        </Card>

        <Card style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '10px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '10px' }}>
            <Coins size={24} color="#f59e0b" />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-light)', fontWeight: 600, textTransform: 'uppercase' }}>Estimasi Rupiah</span>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text)' }}>
              Rp {totalRupiah.toLocaleString('id-ID')}
            </div>
          </div>
        </Card>
      </div>

      {/* History Table Section */}
      <h3 style={{ fontSize: '18px', color: 'var(--color-primary)' }}>Rekapan Amaliyah Harian</h3>
      
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {/* Table Toolbar / Filter */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--color-surface)' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>
            Menampilkan {historyWithDetails.length} transaksi
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={15} color="var(--color-text-light)" />
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{
                padding: '6px 10px',
                border: '1px solid #cbd5e1',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                fontFamily: 'var(--font-family)',
                fontSize: '12px',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)'
              }}
            />
            {filterDate && (
              <button 
                onClick={() => setFilterDate('')}
                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>Tanggal & Waktu</th>
                <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>Aktivitas Amaliyah</th>
                <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase', textAlign: 'right' }}>Poin</th>
                <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase', textAlign: 'right' }}>kWh Meter</th>
                <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase', textAlign: 'right' }}>Nominal Rupiah</th>
              </tr>
            </thead>
            <tbody>
              {historyWithDetails.length > 0 ? (
                historyWithDetails.map((history) => (
                  <tr key={history.id_trx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px', fontSize: '14px', color: 'var(--color-text)' }}>
                      {history.tanggal}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: 500, color: 'var(--color-primary)' }}>
                      {history.namaAmaliyah}
                      <span style={{ 
                        marginLeft: '8px', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', 
                        backgroundColor: '#e2e8f0', color: 'var(--color-text-light)', textTransform: 'capitalize' 
                      }}>
                        {history.kategori}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: 'var(--color-accent)', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        <Award size={14} /> +{history.poin}
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#10b981', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        <Zap size={14} /> +{history.kwh_meter}
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: 700, color: 'var(--color-text)', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        <Coins size={14} color="#f59e0b" /> Rp {history.nominal.toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-light)' }}>
                    <FileText size={32} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
                    <p>Tidak ada riwayat amaliyah untuk tanggal tersebut.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Modal Cetak & Download Dokumen Rapor PDF Warga */}
      <ReportModalWarga
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        warga={warga}
      />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
