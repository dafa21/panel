import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { 
  mockWarga, 
  mockDai, 
  mockHistory, 
  mockAmaliyah, 
  NILAI_KONVERSI 
} from '../db_mock';
import { 
  Search, 
  Users, 
  Award, 
  Coins, 
  Zap, 
  CheckCircle2, 
  ArrowUpDown, 
  Download, 
  Eye, 
  Gift, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles,
  FileText
} from 'lucide-react';
import { ReportModalRekapan } from '../components/ReportModalRekapan';
import { ReportModalWarga } from '../components/ReportModalWarga';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';

export const History: React.FC = () => {
  const navigate = useNavigate();

  // Filter and Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDai, setFilterDai] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGolongan, setFilterGolongan] = useState('all');
  const [sortBy, setSortBy] = useState<'poin_desc' | 'poin_asc' | 'nama_asc' | 'kwh_desc'>('poin_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // State Modal PDF Dokumen
  const [isRekapanModalOpen, setIsRekapanModalOpen] = useState(false);
  const [selectedWargaForPdf, setSelectedWargaForPdf] = useState<any | null>(null);

  // 1. Hitung Metrik Dashboard Rekapan Warga
  const totalWarga = mockWarga.length;
  const totalPoin = mockWarga.reduce((sum, w) => sum + w.total_poin, 0);
  const totalRupiah = totalPoin * NILAI_KONVERSI;
  const totalKwhMeter = mockHistory.reduce((sum, h) => sum + (h.kwh_meter || 0), 0);
  const siapRedeemWarga = mockWarga.filter(w => w.total_poin >= 20000);
  const siapRedeemCount = siapRedeemWarga.length;
  const avgPoin = totalWarga > 0 ? Math.round(totalPoin / totalWarga) : 0;

  // 2. Data untuk Chart Leaderboard Poin Warga
  const rankingBarData = useMemo(() => {
    return [...mockWarga]
      .sort((a, b) => b.total_poin - a.total_poin)
      .map(w => ({
        id: w.id_warga,
        nama: w.nama.replace('Bapak ', '').replace('Ibu ', ''),
        namaLengkap: w.nama,
        poin: w.total_poin,
        rupiah: w.total_poin * NILAI_KONVERSI,
        isSiap: w.total_poin >= 20000
      }));
  }, []);

  // 3. Data untuk Donut Chart Golongan Daya & Wilayah
  const dayaDistributionData = useMemo(() => {
    const va450 = mockWarga.filter(w => w.golongan_va === '450').length;
    const va900 = mockWarga.filter(w => w.golongan_va === '900').length;
    const total = va450 + va900 || 1;

    return [
      { name: '450 VA (Subsidi Penuh)', value: va450, percentage: Math.round((va450 / total) * 100), color: '#3b82f6' },
      { name: '900 VA (Subsidi Terbatas)', value: va900, percentage: Math.round((va900 / total) * 100), color: '#10b981' }
    ];
  }, []);

  // 4. Data Warga yang Diperkaya (Enriched Warga List)
  const enrichedWargaList = useMemo(() => {
    const list = mockWarga.map(w => {
      const dai = mockDai.find(d => d.id_dai === w.id_dai);
      const wHistory = mockHistory.filter(h => h.id_warga === w.id_warga);
      const wKwh = wHistory.reduce((sum, h) => sum + (h.kwh_meter || 0), 0);
      const wRupiah = w.total_poin * NILAI_KONVERSI;
      const isSiap = w.total_poin >= 20000;

      // Hitung amaliyah favorit/terbanyak
      const counts: { [id: string]: number } = {};
      wHistory.forEach(h => {
        counts[h.id_amaliyah] = (counts[h.id_amaliyah] || 0) + 1;
      });
      let topAmaliyahId = '';
      let maxCount = 0;
      Object.entries(counts).forEach(([id, cnt]) => {
        if (cnt > maxCount) {
          maxCount = cnt;
          topAmaliyahId = id;
        }
      });
      const topAmaliyah = mockAmaliyah.find(a => a.id_amaliyah === topAmaliyahId);

      // Persentase menuju ambang batas 20.000 Pts
      const targetPoin = 20000;
      const progressPercent = Math.min(100, Math.round((w.total_poin / targetPoin) * 100));

      return {
        ...w,
        daiNama: dai?.nama || '-',
        daiRegional: dai?.regional || '-',
        totalKwh: Number(wKwh.toFixed(2)),
        totalRupiah: wRupiah,
        isSiapRedeem: isSiap,
        topAmaliyahNama: topAmaliyah?.nama || 'Aktivitas Ibadah',
        progressPercent,
        historyCount: wHistory.length
      };
    });

    // Filtering
    const filtered = list.filter(w => {
      const matchSearch = w.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          w.id_pelanggan_pln.includes(searchTerm) ||
                          w.id_warga.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          w.daiNama.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDai = filterDai ? w.id_dai === filterDai : true;
      const matchStatus = filterStatus === 'all' 
        ? true 
        : filterStatus === 'siap' 
          ? w.isSiapRedeem 
          : !w.isSiapRedeem;
      const matchGolongan = filterGolongan === 'all' ? true : w.golongan_va === filterGolongan;

      return matchSearch && matchDai && matchStatus && matchGolongan;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'poin_desc') return b.total_poin - a.total_poin;
      if (sortBy === 'poin_asc') return a.total_poin - b.total_poin;
      if (sortBy === 'nama_asc') return a.nama.localeCompare(b.nama);
      if (sortBy === 'kwh_desc') return b.totalKwh - a.totalKwh;
      return 0;
    });

    return filtered;
  }, [searchTerm, filterDai, filterStatus, filterGolongan, sortBy]);

  // Pagination
  const totalPages = Math.ceil(enrichedWargaList.length / itemsPerPage) || 1;
  const paginatedWarga = enrichedWargaList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Fungsi Ekspor CSV
  const handleExportCSV = () => {
    const headers = ['ID Warga', 'Nama Warga', 'ID Pelanggan PLN', 'Golongan Daya', 'Da\'i Pembina', 'Regional', 'Total Poin', 'Setara Rp', 'Total kWh Meter', 'Status Redeem'];
    const rows = enrichedWargaList.map(w => [
      w.id_warga,
      `"${w.nama}"`,
      `'${w.id_pelanggan_pln}`,
      `${w.golongan_va} VA`,
      `"${w.daiNama}"`,
      `"${w.daiRegional}"`,
      w.total_poin,
      w.totalRupiah,
      w.totalKwh,
      w.isSiapRedeem ? 'Siap Redeem' : 'Dalam Proses'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekap_Warga_SIMDDII_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-container">

      {/* 1. Header Ringkas & Compact */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '12px' 
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <Sparkles size={18} color="var(--color-accent)" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              SIMDDII Citizen Directory & Performance Tracker
            </span>
          </div>
          <h1 className="responsive-header-title">
            Database & Rekapan Warga Binaan
          </h1>
          <p style={{ margin: '2px 0 0 0', color: 'var(--color-text-light)', fontSize: '13px' }}>
            Pemantauan performa akumulasi poin amaliyah, konversi nominal rupiah, dan kuota kWh listrik meteran prabayar warga
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsRekapanModalOpen(true)}
            style={{
              padding: '7px 14px',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
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
            <FileText size={15} /> Download PDF Rekapan
          </button>

          <button
            onClick={handleExportCSV}
            style={{
              padding: '7px 14px',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-primary)',
              border: '1px solid var(--color-primary)',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
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
            <Download size={15} /> Ekspor Rekapan (.CSV)
          </button>
        </div>
      </div>

      {/* 2. DASHBOARD KPI WARGA BINAAN (COMPACT ROW) */}
      <div className="kpi-grid">
        {/* Total Warga */}
        <Card style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }} className="card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
              Warga Binaan
            </span>
            <div style={{ padding: '5px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.12)', color: 'var(--color-primary)' }}>
              <Users size={15} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text)' }}>
              {totalWarga} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-light)' }}>Jiwa</span>
            </div>
            <div style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <CheckCircle2 size={12} /> 100% Aktif
            </div>
          </div>
        </Card>

        {/* Total Poin & Rata-rata */}
        <Card style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }} className="card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
              Akumulasi Poin
            </span>
            <div style={{ padding: '5px', borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
              <Award size={15} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#8b5cf6' }}>
              {totalPoin.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-light)' }}>Pts</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-light)', marginTop: '2px' }}>
              Rata-rata: ~{avgPoin.toLocaleString()} pts
            </div>
          </div>
        </Card>

        {/* Total Rupiah */}
        <Card style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }} className="card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
              Nilai Rupiah
            </span>
            <div style={{ padding: '5px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <Coins size={15} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#059669' }}>
              Rp {totalRupiah.toLocaleString('id-ID')}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-light)', marginTop: '2px' }}>
              1 Poin = Rp 1 Insentif
            </div>
          </div>
        </Card>

        {/* Total kWh Meter */}
        <Card style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }} className="card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
              Listrik Terverifikasi
            </span>
            <div style={{ padding: '5px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: 'var(--color-accent)' }}>
              <Zap size={15} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-accent)' }}>
              {totalKwhMeter.toFixed(1)} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-light)' }}>kWh</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-light)', marginTop: '2px' }}>
              Meteran prabayar
            </div>
          </div>
        </Card>

        {/* Siap Redeem Token */}
        <Card style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }} className="card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
              Kelayakan Redeem
            </span>
            <div style={{ padding: '5px', borderRadius: '8px', backgroundColor: 'rgba(14, 165, 233, 0.12)', color: '#0ea5e9' }}>
              <Gift size={15} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#0284c7' }}>
              {siapRedeemCount} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-light)' }}>/ {totalWarga} Siap</span>
            </div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
              Ambang ≥ 20.000 Pts
            </div>
          </div>
        </Card>
      </div>

      {/* 3. WIDGET GRAFIK ANALITIK COMPACT (RESPONSIF) */}
      <div className="responsive-charts-grid">
        
        {/* Widget 1: Leaderboard Poin Antar Warga */}
        <Card style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={16} color="var(--color-primary)" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>
                  Peringkat Poin Warga Binaan
                </h3>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>
                Perbandingan poin terhadap target ambang batas redeem (20.000 Pts)
              </span>
            </div>
            <span style={{ 
              fontSize: '11px', 
              fontWeight: 700, 
              padding: '2px 8px', 
              borderRadius: '10px', 
              backgroundColor: 'rgba(16, 185, 129, 0.15)', 
              color: '#059669' 
            }}>
              Ambang: 20.000
            </span>
          </div>

          <div style={{ height: '150px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rankingBarData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-text-light)' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="nama" type="category" tick={{ fontSize: 12, fill: 'var(--color-text)', fontWeight: 600 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip 
                  formatter={(val: any) => [`${Number(val).toLocaleString()} Pts (Rp ${Number(val).toLocaleString('id-ID')})`, 'Total Poin']}
                  contentStyle={{ 
                    backgroundColor: 'var(--color-surface)', 
                    borderRadius: '8px', 
                    border: 'var(--glass-border)',
                    boxShadow: 'var(--shadow-md)',
                    fontSize: '12px',
                    color: 'var(--color-text)'
                  }} 
                />
                <Bar dataKey="poin" radius={[0, 6, 6, 0]} barSize={18}>
                  {rankingBarData.map((entry) => (
                    <Cell key={entry.id} fill={entry.isSiap ? '#10b981' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--color-text-light)', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
              <span>Siap Tukar Token Listrik (≥20k)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></div>
              <span>Proses Pengumpulan Poin</span>
            </div>
          </div>
        </Card>

        {/* Widget 2: Distribusi Golongan Listrik & Regional Da'i */}
        <Card style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#0ea5e9" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>
                  Distribusi Golongan Daya & Wilayah
                </h3>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>
                Segmentasi sambungan PLN meteran dan sebaran Da'i pembina
              </span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-light)' }}>
              2 Regional Da'i
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', height: '150px' }}>
            <div style={{ width: '130px', height: '100%', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dayaDistributionData}
                    innerRadius={36}
                    outerRadius={56}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {dayaDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-surface)', 
                      borderRadius: '8px', 
                      border: 'none',
                      boxShadow: 'var(--shadow-md)',
                      fontSize: '11px' 
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {dayaDistributionData.map((d) => (
                <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: d.color }}></div>
                    <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{d.name}</span>
                  </div>
                  <strong style={{ color: d.color }}>{d.value} Warga ({d.percentage}%)</strong>
                </div>
              ))}

              <div style={{ 
                marginTop: '4px', 
                padding: '8px 10px', 
                backgroundColor: 'var(--color-bg)', 
                borderRadius: '8px', 
                fontSize: '11px',
                display: 'flex',
                justifyContent: 'space-between',
                color: 'var(--color-text-light)'
              }}>
                <span>Da'i Jabar: <strong>Ustadz Ahmad (2)</strong></span>
                <span>Da'i Jateng: <strong>Ustadz Budi (1)</strong></span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--color-text-light)', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Target Subsidi Tepat Sasaran</span>
            <span style={{ color: '#059669', fontWeight: 600 }}>Terverifikasi ID Pelanggan PLN</span>
          </div>
        </Card>
      </div>

      {/* 4. TOOLBAR FILTER & SEARCH CANGGIH */}
      <Card style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 280px', minWidth: '240px' }}>
            <Search size={16} color="var(--color-text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Cari nama warga, ID PLN, ID Warga, atau Da'i..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #cbd5e1',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                outline: 'none',
                fontSize: '13px',
                fontFamily: 'var(--font-family)',
              }}
            />
          </div>

          {/* Filter Da'i */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-light)' }}>Da'i:</span>
            <select
              value={filterDai}
              onChange={(e) => {
                setFilterDai(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #cbd5e1',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">Semua Da'i</option>
              {mockDai.map(d => (
                <option key={d.id_dai} value={d.id_dai}>{d.nama}</option>
              ))}
            </select>
          </div>

          {/* Filter Status Redeem */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-light)' }}>Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #cbd5e1',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">Semua Status</option>
              <option value="siap">Siap Redeem (≥20k)</option>
              <option value="proses">Dalam Proses</option>
            </select>
          </div>

          {/* Filter Golongan PLN */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-light)' }}>Daya:</span>
            <select
              value={filterGolongan}
              onChange={(e) => {
                setFilterGolongan(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #cbd5e1',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">Semua Daya</option>
              <option value="450">450 VA</option>
              <option value="900">900 VA</option>
            </select>
          </div>

          {/* Sort Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowUpDown size={14} color="var(--color-text-light)" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #cbd5e1',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="poin_desc">Poin Tertinggi</option>
              <option value="poin_asc">Poin Terendah</option>
              <option value="kwh_desc">kWh Terbanyak</option>
              <option value="nama_asc">Nama Warga (A-Z)</option>
            </select>
          </div>

        </div>
      </Card>

      {/* 5. TABEL REKAPAN LENGKAP & COMPACT (FULL WIDTH) */}
      <Card style={{ padding: 0, overflow: 'hidden', border: 'var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ 
                backgroundColor: 'rgba(59, 130, 246, 0.05)', 
                borderBottom: '1px solid #e2e8f0',
                color: 'var(--color-text-light)'
              }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, textTransform: 'uppercase', fontSize: '11px', width: '50px' }}>No</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textTransform: 'uppercase', fontSize: '11px' }}>Warga Binaan</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textTransform: 'uppercase', fontSize: '11px' }}>ID PLN (Daya)</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textTransform: 'uppercase', fontSize: '11px' }}>Da'i Pembimbing</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textTransform: 'uppercase', fontSize: '11px' }}>Amaliyah Favorit</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textTransform: 'uppercase', fontSize: '11px', textAlign: 'right' }}>Total Poin</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textTransform: 'uppercase', fontSize: '11px', textAlign: 'right' }}>Setara Rp</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textTransform: 'uppercase', fontSize: '11px', textAlign: 'right' }}>kWh Listrik</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textTransform: 'uppercase', fontSize: '11px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textTransform: 'uppercase', fontSize: '11px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedWarga.length > 0 ? (
                paginatedWarga.map((warga, index) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr 
                      key={warga.id_warga} 
                      style={{ 
                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                        backgroundColor: warga.isSiapRedeem ? 'rgba(245, 158, 11, 0.02)' : 'transparent',
                        transition: 'background 0.2s ease'
                      }}
                    >
                      {/* No */}
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--color-text-light)' }}>
                        #{globalIndex}
                      </td>

                      {/* Profil Warga */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '50%', 
                            backgroundColor: warga.isSiapRedeem ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                            color: warga.isSiapRedeem ? '#d97706' : 'var(--color-primary)',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '13px'
                          }}>
                            {warga.nama.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '14px' }}>
                              {warga.nama}
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                              ID: {warga.id_warga}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* ID PLN & Daya */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                          {warga.id_pelanggan_pln}
                        </div>
                        <span style={{ 
                          fontSize: '10px', 
                          fontWeight: 700, 
                          padding: '1px 6px', 
                          borderRadius: '4px',
                          backgroundColor: warga.golongan_va === '450' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          color: warga.golongan_va === '450' ? '#2563eb' : '#059669',
                          display: 'inline-block',
                          marginTop: '2px'
                        }}>
                          {warga.golongan_va} VA
                        </span>
                      </td>

                      {/* Da'i Pembina */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                          {warga.daiNama}
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                          {warga.daiRegional}
                        </span>
                      </td>

                      {/* Amaliyah Terbanyak */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 500, color: 'var(--color-primary)' }}>
                          {warga.topAmaliyahNama}
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                          {warga.historyCount} kali disetor
                        </span>
                      </td>

                      {/* Total Poin */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-accent)' }}>
                          {warga.total_poin.toLocaleString()}
                        </div>
                        {/* Mini progress bar */}
                        <div style={{ width: '80px', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginLeft: 'auto', marginTop: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${warga.progressPercent}%`, height: '100%', backgroundColor: warga.isSiapRedeem ? '#10b981' : '#3b82f6', borderRadius: '4px' }} />
                        </div>
                      </td>

                      {/* Setara Rp */}
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                        Rp {warga.totalRupiah.toLocaleString('id-ID')}
                      </td>

                      {/* kWh Listrik */}
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--color-primary)' }}>
                        {warga.totalKwh} <span style={{ fontSize: '11px', fontWeight: 400 }}>kWh</span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: 700, 
                          padding: '3px 8px', 
                          borderRadius: '12px',
                          backgroundColor: warga.isSiapRedeem ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: warga.isSiapRedeem ? '#059669' : '#d97706',
                          whiteSpace: 'nowrap'
                        }}>
                          {warga.isSiapRedeem ? '★ Siap Redeem' : 'Proses'}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <button
                            onClick={() => navigate(`/warga/${warga.id_warga}`)}
                            style={{
                              padding: '6px 10px',
                              backgroundColor: 'var(--color-primary)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.2s ease'
                            }}
                            title="Buka Dashboard Profil Warga"
                          >
                            <Eye size={13} /> Detail
                          </button>

                          <button
                            onClick={() => setSelectedWargaForPdf(warga)}
                            style={{
                              padding: '6px 9px',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              color: '#dc2626',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              transition: 'all 0.2s ease'
                            }}
                            title="Unduh Dokumen Rapor PDF Warga Ini"
                          >
                            <FileText size={13} /> PDF
                          </button>

                          {warga.isSiapRedeem && (
                            <button
                              onClick={() => navigate('/reward')}
                              style={{
                                padding: '6px 8px',
                                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                color: '#d97706',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px'
                              }}
                              title="Tukar Token Listrik Sekarang"
                            >
                              <Coins size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-light)' }}>
                    <Users size={32} style={{ margin: '0 auto 8px auto', opacity: 0.4 }} />
                    <p style={{ margin: 0, fontSize: '14px' }}>Tidak ada warga binaan yang sesuai dengan filter pencarian.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Footer Stats */}
        <div style={{ 
          padding: '12px 16px', 
          backgroundColor: 'var(--color-surface)', 
          borderTop: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>
            Menampilkan <strong>{paginatedWarga.length}</strong> dari <strong>{enrichedWargaList.length}</strong> warga binaan
          </span>

          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: currentPage === i + 1 ? 'var(--color-primary)' : 'rgba(0,0,0,0.05)',
                    color: currentPage === i + 1 ? 'white' : 'var(--color-text)',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Modal Laporan PDF Rekapan Keseluruhan */}
      <ReportModalRekapan 
        isOpen={isRekapanModalOpen} 
        onClose={() => setIsRekapanModalOpen(false)} 
      />

      {/* Modal Laporan Rapor PDF Per Warga */}
      <ReportModalWarga
        isOpen={!!selectedWargaForPdf}
        onClose={() => setSelectedWargaForPdf(null)}
        warga={selectedWargaForPdf}
      />

    </div>
  );
};
