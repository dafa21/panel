import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  mockWarga, 
  mockDai, 
  mockHistory, 
  mockAmaliyah, 
  NILAI_KONVERSI 
} from '../db_mock';
import { usePv } from '../context/PvContext';
import { PvDetailModal } from '../components/PvDetailModal';
import { Card } from '../components/Card';
import { 
  Users, 
  Zap, 
  Sun, 
  Award, 
  TrendingUp, 
  Coins, 
  ChevronRight, 
  CheckCircle2, 
  Search, 
  ArrowUpRight,
  Sparkles,
  Layers,
  Filter,
  Camera
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

// Custom Map Marker Icons
const defaultIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const goldIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const pvIcon = new L.Icon({
  iconUrl: '/pv-marker.png',
  iconSize: [46, 35],
  iconAnchor: [23, 35],
  popupAnchor: [0, -35],
  className: 'pv-map-marker',
});

const CATEGORY_COLORS: Record<string, string> = {
  wajib: '#3b82f6',       // Blue
  sunnah: '#10b981',      // Emerald
  sosial: '#f59e0b',      // Amber
  dakwah: '#8b5cf6',      // Purple
  pendidikan: '#06b6d4',  // Cyan
  kebersihan: '#ec4899',  // Pink
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { pvList, isDetailModalOpen, selectedPv, openDetailModal, closeDetailModal } = usePv();
  const [filterDai, setFilterDai] = useState<string>('');
  const [mapLayerFilter, setMapLayerFilter] = useState<'all' | 'warga' | 'pv'>('all');
  const [chartMetric, setChartMetric] = useState<'all' | 'poin' | 'kwh'>('all');
  const [searchWarga, setSearchWarga] = useState<string>('');
  const [statusWargaFilter, setStatusWargaFilter] = useState<string>('all');

  // Filter Warga berdasarkan Da'i
  const filteredWarga = useMemo(() => {
    return filterDai 
      ? mockWarga.filter(w => w.id_dai === filterDai)
      : mockWarga;
  }, [filterDai]);

  // 1. Kalkulasi Rekapan Utama (KPI)
  const totalWarga = mockWarga.length;
  const totalPoin = mockWarga.reduce((sum, w) => sum + w.total_poin, 0);
  const totalRupiah = totalPoin * NILAI_KONVERSI;
  const totalKwhDidapatkan = mockHistory.reduce((sum, h) => sum + (h.kwh_meter || 0), 0);
  const totalPv = pvList.length;
  const totalKwhPvKapasitas = pvList.reduce((sum, p) => sum + p.total_kwh, 0);
  const totalRumahCovered = pvList.reduce((sum, p) => sum + p.jumlah_rumah, 0);

  // 2. Kalkulasi Data Grafik Perbandingan Harian
  const dailyChartData = useMemo(() => {
    const dateMap: { [date: string]: { poin: number; kwh: number; count: number } } = {};
    const sortedHistory = [...mockHistory].sort((a, b) => a.tanggal.localeCompare(b.tanggal));

    sortedHistory.forEach(trx => {
      const dateStr = trx.tanggal.split(' ')[0]; // Ambil YYYY-MM-DD
      const amaliyah = mockAmaliyah.find(a => a.id_amaliyah === trx.id_amaliyah);
      const poin = amaliyah?.poin || 0;
      const kwh = trx.kwh_meter || 0;

      if (!dateMap[dateStr]) {
        dateMap[dateStr] = { poin: 0, kwh: 0, count: 0 };
      }
      dateMap[dateStr].poin += poin;
      dateMap[dateStr].kwh += kwh;
      dateMap[dateStr].count += 1;
    });

    return Object.keys(dateMap).map(dateKey => {
      const parts = dateKey.split('-');
      const formattedLabel = `${parts[2]} Sep`; // '09 Sep', '10 Sep', dst.
      return {
        tanggalKey: dateKey,
        tanggal: formattedLabel,
        poin: dateMap[dateKey].poin,
        kwh: Number(dateMap[dateKey].kwh.toFixed(2)),
        transaksi: dateMap[dateKey].count
      };
    });
  }, []);

  // Statistik perbandingan harian
  const peakDay = useMemo(() => {
    if (dailyChartData.length === 0) return null;
    return [...dailyChartData].sort((a, b) => b.poin - a.poin)[0];
  }, [dailyChartData]);

  const avgDailyPoin = useMemo(() => {
    if (dailyChartData.length === 0) return 0;
    const sum = dailyChartData.reduce((acc, d) => acc + d.poin, 0);
    return Math.round(sum / dailyChartData.length);
  }, [dailyChartData]);

  // 3. Rekapan "Point Amaliyah Apa Aja"
  const amaliyahBreakdown = useMemo(() => {
    return mockAmaliyah.map(item => {
      const relevantHistory = mockHistory.filter(h => h.id_amaliyah === item.id_amaliyah);
      const count = relevantHistory.length;
      const totalPoinEarned = count * item.poin;
      const totalKwhEarned = relevantHistory.reduce((s, h) => s + (h.kwh_meter || 0), 0);
      return {
        ...item,
        frekuensi: count,
        totalPoin: totalPoinEarned,
        totalKwh: Number(totalKwhEarned.toFixed(2)),
      };
    }).sort((a, b) => b.totalPoin - a.totalPoin);
  }, []);

  const pieCategoryData = useMemo(() => {
    const wajibCount = mockHistory.filter(h => mockAmaliyah.find(a => a.id_amaliyah === h.id_amaliyah)?.kategori === 'wajib').length;
    const sunnahCount = mockHistory.filter(h => mockAmaliyah.find(a => a.id_amaliyah === h.id_amaliyah)?.kategori === 'sunnah').length;
    const sosialCount = mockHistory.filter(h => mockAmaliyah.find(a => a.id_amaliyah === h.id_amaliyah)?.kategori === 'sosial').length;
    const total = wajibCount + sunnahCount + sosialCount || 1;

    return [
      { name: 'Ibadah Wajib', value: wajibCount, percentage: Math.round((wajibCount / total) * 100), color: CATEGORY_COLORS.wajib },
      { name: 'Amalan Sunnah', value: sunnahCount, percentage: Math.round((sunnahCount / total) * 100), color: CATEGORY_COLORS.sunnah },
      { name: 'Aksi Sosial', value: sosialCount, percentage: Math.round((sosialCount / total) * 100), color: CATEGORY_COLORS.sosial },
    ];
  }, []);

  // 4. Direktori Warga Binaan untuk Bagian Bawah
  const wargaDirectoryList = useMemo(() => {
    return mockWarga.map(w => {
      const dai = mockDai.find(d => d.id_dai === w.id_dai);
      const wHistory = mockHistory.filter(h => h.id_warga === w.id_warga);
      const wKwh = wHistory.reduce((sum, h) => sum + (h.kwh_meter || 0), 0);
      const calculatedRupiah = w.total_poin * NILAI_KONVERSI;
      const isSiapRedeem = w.total_poin >= 20000;

      // Amaliyah paling sering
      const amaliyahCounts: { [id: string]: number } = {};
      wHistory.forEach(h => {
        amaliyahCounts[h.id_amaliyah] = (amaliyahCounts[h.id_amaliyah] || 0) + 1;
      });
      let topAmaliyahId = '';
      let maxCount = 0;
      Object.entries(amaliyahCounts).forEach(([id, cnt]) => {
        if (cnt > maxCount) {
          maxCount = cnt;
          topAmaliyahId = id;
        }
      });
      const topAmaliyah = mockAmaliyah.find(a => a.id_amaliyah === topAmaliyahId);

      return {
        ...w,
        daiNama: dai?.nama || 'Da\'i Pembina',
        daiRegional: dai?.regional || '-',
        totalKwh: Number(wKwh.toFixed(2)),
        totalRupiah: calculatedRupiah,
        isSiapRedeem,
        topAmaliyahNama: topAmaliyah?.nama || 'Aktivitas Ibadah',
        jumlahAktivitas: wHistory.length
      };
    }).filter(w => {
      const matchesSearch = w.nama.toLowerCase().includes(searchWarga.toLowerCase()) || 
                            w.id_pelanggan_pln.includes(searchWarga) ||
                            w.daiNama.toLowerCase().includes(searchWarga.toLowerCase());
      const matchesStatus = statusWargaFilter === 'all' 
        ? true 
        : statusWargaFilter === 'siap' 
          ? w.isSiapRedeem 
          : !w.isSiapRedeem;
      const matchesDai = filterDai ? w.id_dai === filterDai : true;

      return matchesSearch && matchesStatus && matchesDai;
    });
  }, [searchWarga, statusWargaFilter, filterDai]);

  return (
    <div className="page-container" style={{ maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* 1. Header Toolbar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '12px',
        paddingBottom: '4px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <Sparkles size={18} color="var(--color-accent)" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              SIMDDII Real-time GIS & Executive Analytics
            </span>
          </div>
          <h1 className="responsive-header-title">
            Integrasi Dashboard Pemantauan Nasional
          </h1>
          <p style={{ margin: '2px 0 0 0', color: 'var(--color-text-light)', fontSize: '13px' }}>
            Pemetaan Spasial Amaliyah Warga Binaan & Distribusi Energi Listrik PV Off-Grid
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--color-surface)', padding: '8px 14px', borderRadius: 'var(--radius-md)', border: 'var(--glass-border)' }}>
            <Filter size={16} color="var(--color-text-light)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-light)' }}>Da'i:</span>
            <select
              value={filterDai}
              onChange={(e) => setFilterDai(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">Semua Da'i (Nasional)</option>
              {mockDai.map(d => (
                <option key={d.id_dai} value={d.id_dai}>{d.nama} ({d.regional})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--color-surface)', padding: '8px 14px', borderRadius: 'var(--radius-md)', border: 'var(--glass-border)' }}>
            <Layers size={16} color="var(--color-text-light)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-light)' }}>Layer:</span>
            <select
              value={mapLayerFilter}
              onChange={(e) => setMapLayerFilter(e.target.value as any)}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">Semua Titik (Warga + PV)</option>
              <option value="warga">Hanya Warga Binaan</option>
              <option value="pv">Hanya PV Off-Grid</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Peta Luas & Bersih (Full Panoramic Map Container Tanpa Panel Samping) */}
      <Card style={{ padding: 0, overflow: 'hidden', position: 'relative', border: 'var(--glass-border)', boxShadow: 'var(--shadow-md)' }}>
        <div className="map-container-responsive" style={{ position: 'relative' }}>
          <MapContainer 
            center={[-4.5, 115.0]} 
            zoom={5} 
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Marker Warga Binaan */}
            {(mapLayerFilter === 'all' || mapLayerFilter === 'warga') && filteredWarga.map((warga) => {
              const dai = mockDai.find(d => d.id_dai === warga.id_dai);
              const isHighPoint = warga.total_poin >= 20000;
              
              return (
                <Marker 
                  key={warga.id_warga} 
                  position={[warga.latitude, warga.longitude]}
                  icon={isHighPoint ? goldIcon : defaultIcon}
                >
                  <Popup>
                    <div style={{ padding: '6px', minWidth: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Users size={16} color="var(--color-primary)" />
                          <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--color-primary)' }}>{warga.nama}</h4>
                        </div>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: 700, 
                          padding: '2px 8px', 
                          borderRadius: '12px',
                          backgroundColor: isHighPoint ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: isHighPoint ? '#059669' : '#d97706'
                        }}>
                          {isHighPoint ? 'Siap Redeem' : 'Proses'}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 8px', fontSize: '12px', marginBottom: '10px' }}>
                        <span style={{ color: 'var(--color-text-light)' }}>Da'i:</span>
                        <strong>{dai?.nama} ({dai?.regional})</strong>
                        
                        <span style={{ color: 'var(--color-text-light)' }}>Poin:</span>
                        <strong style={{ color: 'var(--color-accent)' }}>{warga.total_poin.toLocaleString()} pts</strong>

                        <span style={{ color: 'var(--color-text-light)' }}>PLN:</span>
                        <span>{warga.id_pelanggan_pln} ({warga.golongan_va} VA)</span>
                      </div>

                      <button
                        onClick={() => navigate(`/warga/${warga.id_warga}`)}
                        style={{
                          width: '100%',
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
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        Buka Dashboard Warga <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Marker PV Off-Grid */}
            {(mapLayerFilter === 'all' || mapLayerFilter === 'pv') && pvList.map((pv) => (
              <Marker 
                key={pv.id_pv} 
                position={[pv.latitude, pv.longitude]}
                icon={pvIcon}
              >
                <Popup>
                  <div style={{ padding: '6px', minWidth: '260px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sun size={18} color="#10b981" />
                        <h4 style={{ margin: 0, fontSize: '14px', color: '#059669', fontWeight: 700 }}>Instalasi PV Off-Grid</h4>
                      </div>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#059669'
                      }}>
                        {pv.status_operasional || 'Optimal'}
                      </span>
                    </div>

                    <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
                      {pv.nama_lokasi}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '3px 8px', fontSize: '11px', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--color-text-light)' }}>Kapasitas:</span>
                      <strong style={{ color: 'var(--color-primary)' }}>{pv.total_kwh} kWh ({pv.kapasitas_baterai_kwh || Math.round(pv.total_kwh * 0.8)} kWh Baterai)</strong>
                      
                      <span style={{ color: 'var(--color-text-light)' }}>Penerima:</span>
                      <strong>{pv.jumlah_rumah} Rumah • {pv.jumlah_kk || Math.round(pv.jumlah_rumah * 0.95)} KK ({pv.jumlah_jiwa || Math.round(pv.jumlah_rumah * 3.8)} Jiwa)</strong>
                      
                      <span style={{ color: 'var(--color-text-light)' }}>Amaliyah:</span>
                      <strong style={{ color: '#059669' }}>{pv.amaliyah_progress_persen || 88.5}% Tercapai</strong>

                      <span style={{ color: 'var(--color-text-light)' }}>Redeem:</span>
                      <strong style={{ color: 'var(--color-accent)' }}>Rp {(pv.total_rupiah_redeem || 250000).toLocaleString('id-ID')}</strong>
                    </div>

                    <div style={{ padding: '4px 6px', borderRadius: '4px', backgroundColor: '#f1f5f9', fontSize: '10px', color: '#64748b', marginBottom: '8px' }}>
                      📍 {pv.desa ? `${pv.desa}, Kec. ${pv.kecamatan}` : pv.nama_lokasi}
                    </div>

                    {/* BUTTON DETAIL TITIK KOORDINAT */}
                    <button
                      onClick={() => openDetailModal(pv)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Sparkles size={13} />
                      <span>Lihat Detail Lengkap (Galeri & Metrik)</span>
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Map Legend Overlay (Bottom Left) */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            right: '12px',
            maxWidth: 'fit-content',
            zIndex: 500,
            backgroundColor: 'var(--color-surface)',
            backdropFilter: 'var(--glass-backdrop)',
            WebkitBackdropFilter: 'var(--glass-backdrop)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            border: 'var(--glass-border)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '10px',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--color-text)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'inline-block' }}></span>
              <span>Warga Reguler</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }}></span>
              <span>Warga Siap Redeem</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <img src="/pv-marker.png" alt="PV" style={{ width: '18px', height: '14px', objectFit: 'contain' }} />
              <span>PV Off-Grid</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. REKAPAN UTAMA (KPI CARDS DI ATAS) */}
      <div>
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
              Rekapan Ringkasan Metrik Nasional
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-light)' }}>
              Akumulasi data warga binaan, konversi rupiah, dan perolehan kWh listrik
            </p>
          </div>
          <span style={{ 
            fontSize: '12px', 
            fontWeight: 600, 
            padding: '4px 10px', 
            borderRadius: 'var(--radius-full)', 
            backgroundColor: 'rgba(59, 130, 246, 0.1)', 
            color: 'var(--color-primary)' 
          }}>
            Terintegrasi Da'i & PV
          </span>
        </div>

        <div className="kpi-grid">
          {/* KPI 1: Total Warga Binaan */}
          <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }} className="card-hover">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
                Total Warga Binaan
              </span>
              <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.12)', color: 'var(--color-primary)' }}>
                <Users size={20} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text)' }}>
                {totalWarga} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-light)' }}>Jiwa</span>
              </div>
              <div style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <CheckCircle2 size={13} /> 100% Terverifikasi Da'i
              </div>
            </div>
          </Card>

          {/* KPI 2: Total Rupiah */}
          <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }} className="card-hover">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
                Total Rupiah (Insentif)
              </span>
              <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                <Coins size={20} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#059669' }}>
                Rp {totalRupiah.toLocaleString('id-ID')}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-light)', marginTop: '4px' }}>
                Setara kuota token listrik & voucher
              </div>
            </div>
          </Card>

          {/* KPI 3: Total kWh Didapatkan */}
          <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }} className="card-hover">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
                Total kWh Didapatkan
              </span>
              <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: 'var(--color-accent)' }}>
                <Zap size={20} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-accent)' }}>
                {totalKwhDidapatkan.toFixed(1)} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-light)' }}>kWh</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-light)', marginTop: '4px' }}>
                Terdistribusi ke kWh meter warga
              </div>
            </div>
          </Card>

          {/* KPI 4: Total Poin Amaliyah */}
          <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }} className="card-hover">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
                Total Poin Amaliyah
              </span>
              <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
                <Award size={20} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#8b5cf6' }}>
                {totalPoin.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-light)' }}>Pts</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-light)', marginTop: '4px' }}>
                Akumulasi seluruh amaliyah warga
              </div>
            </div>
          </Card>

          {/* KPI 5: Total Rumah Tercover PV */}
          <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }} className="card-hover">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
                Cakupan PV Off-Grid
              </span>
              <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(14, 165, 233, 0.12)', color: '#0ea5e9' }}>
                <Sun size={20} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#0284c7' }}>
                {totalRumahCovered} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-light)' }}>Rumah</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-light)', marginTop: '4px' }}>
                {totalPv} Titik • {totalKwhPvKapasitas} kWh Kapasitas
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 4. ANALYTICS & CHARTS: GRAFIK PERBANDINGAN HARIAN & POINT AMALIYAH APA AJA */}
      <div className="responsive-charts-grid">
        
        {/* KIRI: GRAFIK PERBANDINGAN HARIANNYA */}
        <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={20} color="var(--color-primary)" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--color-text)' }}>
                  Grafik Perbandingan Hariannya
                </h3>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-text-light)' }}>
                Perbandingan perolehan poin amaliyah & energi kWh harian (7 Hari Terakhir)
              </p>
            </div>

            {/* Toggle Metrik Chart */}
            <div style={{ display: 'flex', backgroundColor: 'var(--color-bg)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <button
                onClick={() => setChartMetric('all')}
                style={{
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: chartMetric === 'all' ? 'var(--color-primary)' : 'transparent',
                  color: chartMetric === 'all' ? 'white' : 'var(--color-text-light)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Semua
              </button>
              <button
                onClick={() => setChartMetric('poin')}
                style={{
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: chartMetric === 'poin' ? 'var(--color-primary)' : 'transparent',
                  color: chartMetric === 'poin' ? 'white' : 'var(--color-text-light)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Poin (Pts)
              </button>
              <button
                onClick={() => setChartMetric('kwh')}
                style={{
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: chartMetric === 'kwh' ? 'var(--color-primary)' : 'transparent',
                  color: chartMetric === 'kwh' ? 'white' : 'var(--color-text-light)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                kWh Meter
              </button>
            </div>
          </div>

          {/* Area Chart Container */}
          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="poinGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="kwhGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="tanggal" 
                  tick={{ fontSize: 12, fill: 'var(--color-text-light)' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: 'var(--color-text-light)' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-surface)', 
                    borderRadius: '10px', 
                    border: 'var(--glass-border)',
                    boxShadow: 'var(--shadow-md)',
                    color: 'var(--color-text)',
                    fontSize: '12px'
                  }} 
                />
                {(chartMetric === 'all' || chartMetric === 'poin') && (
                  <Area 
                    type="monotone" 
                    dataKey="poin" 
                    name="Poin Amaliyah (Pts)" 
                    stroke="#3b82f6" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#poinGradient)" 
                  />
                )}
                {(chartMetric === 'all' || chartMetric === 'kwh') && (
                  <Area 
                    type="monotone" 
                    dataKey="kwh" 
                    name="Energi (kWh)" 
                    stroke="#10b981" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#kwhGradient)" 
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Insights Banner */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '12px', 
            paddingTop: '16px', 
            borderTop: '1px solid rgba(0,0,0,0.06)' 
          }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-light)', textTransform: 'uppercase', fontWeight: 600 }}>Hari Tersibuk</span>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px' }}>
                {peakDay ? `${peakDay.tanggal} (${peakDay.poin} pts)` : '-'}
              </div>
            </div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(0,0,0,0.06)', borderRight: '1px solid rgba(0,0,0,0.06)' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-light)', textTransform: 'uppercase', fontWeight: 600 }}>Rata-rata / Hari</span>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>
                {avgDailyPoin.toLocaleString()} pts/hari
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-light)', textTransform: 'uppercase', fontWeight: 600 }}>Total Aktivitas</span>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-accent)', marginTop: '2px' }}>
                {mockHistory.length} Transaksi
              </div>
            </div>
          </div>
        </Card>

        {/* KANAN: POINT AMALIYAH APA AJA (RINCIAN AMALIYAH LENGKAP & DONUT CHART) */}
        <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} color="#8b5cf6" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--color-text)' }}>
                  Point Amaliyah Apa Aja
                </h3>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-text-light)' }}>
                Rincian jenis ibadah wajib, sunnah, dan sosial yang telah didapatkan
              </p>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.1)', padding: '4px 10px', borderRadius: '12px' }}>
              5 Ragam Amaliyah
            </span>
          </div>

          {/* Top Row: Donut Chart Category Distribution */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ width: '110px', height: '110px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieCategoryData}
                    innerRadius={32}
                    outerRadius={48}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieCategoryData.map((entry, index) => (
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

            {/* Category Legend & Percentage */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pieCategoryData.map((cat) => (
                <div key={cat.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: cat.color }}></div>
                    <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{cat.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--color-text-light)' }}>{cat.value}x disetor</span>
                    <strong style={{ color: cat.color }}>({cat.percentage}%)</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Amaliyah Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
            {amaliyahBreakdown.map((item) => {
              const catColor = CATEGORY_COLORS[item.kategori] || '#3b82f6';
              return (
                <div 
                  key={item.id_amaliyah}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface)',
                    border: 'var(--glass-border)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>
                        {item.nama}
                      </span>
                      <span style={{ 
                        fontSize: '10px', 
                        fontWeight: 700, 
                        textTransform: 'uppercase', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        backgroundColor: `${catColor}15`,
                        color: catColor
                      }}>
                        {item.kategori}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                      Standar Nilai: +{item.poin} Poin / aktivitas
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-accent)' }}>
                      +{item.totalPoin} <span style={{ fontSize: '11px', fontWeight: 500 }}>Pts</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                      {item.frekuensi} kali • {item.totalKwh} kWh
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* 5. OVERVIEW INFRASTRUKTUR PV OFF-GRID NASIONAL */}
      <Card style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sun size={20} color="#10b981" />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--color-text)' }}>
                Distribusi Infrastruktur PV Off-Grid Nasional
              </h3>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-text-light)' }}>
              Monitoring titik pembangkit surya komunal untuk suplai energi bersih warga binaan
            </p>
          </div>
          <button 
            onClick={() => navigate('/settings')}
            style={{
              padding: '6px 14px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#059669',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Kelola Titik PV <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {pvList.map((pv) => {
            const coverPhoto = pv.galeri_foto && pv.galeri_foto.length > 0
              ? pv.galeri_foto[0]
              : '/pv-photos/rooftop-1.jpg';

            return (
              <div 
                key={pv.id_pv}
                style={{
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface)',
                  border: 'var(--glass-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                {/* Foto Cover Wilayah */}
                <div 
                  style={{ height: '140px', width: '100%', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
                  onClick={() => openDetailModal(pv)}
                  title="Klik untuk membuka rincian dan foto wilayah ini"
                >
                  <img 
                    src={coverPhoto} 
                    alt={pv.nama_lokasi} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/pv-photos/rooftop-1.jpg';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    fontSize: '11px', 
                    fontWeight: 700, 
                    backgroundColor: 'rgba(16, 185, 129, 0.9)', 
                    color: 'white', 
                    padding: '3px 8px', 
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}>
                    <CheckCircle2 size={12} /> Normal Aktif
                  </div>

                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    backgroundColor: 'rgba(0,0,0,0.65)',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Camera size={11} /> {pv.galeri_foto?.length || 1} Foto Wilayah
                  </div>
                </div>

                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {pv.nama_lokasi}
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>
                      ID: {pv.id_pv} • {pv.desa || pv.dusun || 'Binaan'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', padding: '10px 0', borderTop: '1px solid rgba(0,0,0,0.06)', borderBottom: '1px solid rgba(0,0,0,0.06)', textAlign: 'center' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-light)', fontWeight: 600 }}>Kapasitas</span>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)', marginTop: '2px' }}>
                        {pv.total_kwh} <span style={{ fontSize: '10px' }}>kWh</span>
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-light)', fontWeight: 600 }}>Tercover</span>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                        {pv.jumlah_rumah} <span style={{ fontSize: '10px' }}>Rumah</span>
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-light)', fontWeight: 600 }}>Ketahanan</span>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-accent)', marginTop: '2px' }}>
                        {pv.ketahanan} <span style={{ fontSize: '10px' }}>{pv.satuan_ketahanan}</span>
                      </div>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-light)', fontStyle: 'italic', flex: 1 }}>
                    "{pv.detail}"
                  </p>

                  <button
                    onClick={() => openDetailModal(pv)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'rgba(59, 130, 246, 0.08)',
                      color: 'var(--color-primary)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      marginTop: 'auto'
                    }}
                  >
                    Buka Rincian & Foto Wilayah <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 6. REKAPAN NAMA-NAMA WARGA BINAAN (DI BAGIAN BAWAH) */}
      <div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '16px', 
          marginBottom: '16px' 
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={22} color="var(--color-primary)" />
              <h2 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                Direktori & Rekapan Warga Binaan
              </h2>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--color-text-light)' }}>
              Daftar nama warga binaan, rincian perolehan poin amaliyah, konversi rupiah, dan kuota kWh meter
            </p>
          </div>

          {/* Search & Filter Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="var(--color-text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text"
                placeholder="Cari nama warga / ID PLN..."
                value={searchWarga}
                onChange={(e) => setSearchWarga(e.target.value)}
                style={{
                  padding: '8px 12px 8px 36px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #cbd5e1',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: '13px',
                  outline: 'none',
                  minWidth: '220px'
                }}
              />
            </div>

            <select
              value={statusWargaFilter}
              onChange={(e) => setStatusWargaFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #cbd5e1',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">Semua Status</option>
              <option value="siap">Siap Redeem Token (≥20k)</option>
              <option value="proses">Dalam Proses</option>
            </select>
          </div>
        </div>

        {/* Warga Cards Grid View */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '16px' }}>
          {wargaDirectoryList.length === 0 ? (
            <Card style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1' }}>
              <p style={{ margin: 0, color: 'var(--color-text-light)' }}>Tidak ada warga binaan yang cocok dengan kriteria pencarian.</p>
            </Card>
          ) : (
            wargaDirectoryList.map((w) => (
              <Card 
                key={w.id_warga} 
                style={{ 
                  padding: '20px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '16px',
                  position: 'relative',
                  border: w.isSiapRedeem ? '1.5px solid rgba(245, 158, 11, 0.4)' : 'var(--glass-border)'
                }}
                className="card-hover"
              >
                {/* Warga Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '44px', 
                      height: '44px', 
                      borderRadius: '50%', 
                      backgroundColor: w.isSiapRedeem ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                      color: w.isSiapRedeem ? '#d97706' : 'var(--color-primary)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '16px'
                    }}>
                      {w.nama.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--color-text)' }}>
                        {w.nama}
                      </h4>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-light)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span>PLN: <strong>{w.id_pelanggan_pln}</strong></span>
                        <span>•</span>
                        <span>{w.golongan_va} VA</span>
                      </div>
                    </div>
                  </div>

                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    padding: '3px 8px', 
                    borderRadius: '12px',
                    backgroundColor: w.isSiapRedeem ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: w.isSiapRedeem ? '#059669' : '#d97706'
                  }}>
                    {w.isSiapRedeem ? '★ Siap Redeem' : 'Proses'}
                  </span>
                </div>

                {/* Da'i & Amaliyah Unggulan */}
                <div style={{ 
                  backgroundColor: 'var(--color-bg)', 
                  padding: '10px 12px', 
                  borderRadius: 'var(--radius-md)', 
                  fontSize: '12px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '4px' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-light)' }}>Da'i Pembimbing:</span>
                    <strong>{w.daiNama} ({w.daiRegional})</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-light)' }}>Amaliyah Terbanyak:</span>
                    <strong style={{ color: 'var(--color-primary)' }}>{w.topAmaliyahNama}</strong>
                  </div>
                </div>

                {/* Metrik Poin, Rupiah, dan kWh */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '8px', 
                  padding: '8px 0', 
                  textAlign: 'center',
                  borderTop: '1px solid rgba(0,0,0,0.06)',
                  borderBottom: '1px solid rgba(0,0,0,0.06)'
                }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-light)', fontWeight: 600 }}>Total Poin</span>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-accent)', marginTop: '2px' }}>
                      {w.total_poin.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ borderLeft: '1px solid rgba(0,0,0,0.06)', borderRight: '1px solid rgba(0,0,0,0.06)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-light)', fontWeight: 600 }}>Setara Rp</span>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                      Rp {w.totalRupiah.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-light)', fontWeight: 600 }}>kWh Meter</span>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px' }}>
                      {w.totalKwh} <span style={{ fontSize: '10px' }}>kWh</span>
                    </div>
                  </div>
                </div>

                {/* Aksi Button */}
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <button
                    onClick={() => navigate(`/warga/${w.id_warga}`)}
                    style={{
                      flex: 1,
                      padding: '8px 14px',
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    Buka Dashboard Warga <ArrowUpRight size={15} />
                  </button>

                  {w.isSiapRedeem && (
                    <button
                      onClick={() => navigate('/reward')}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: 'rgba(245, 158, 11, 0.12)',
                        color: '#d97706',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Redeem Token Sekarang"
                    >
                      <Coins size={15} />
                    </button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Modal Detail Titik Koordinat PV Off-Grid */}
      <PvDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        pv={selectedPv}
        onEditInSettings={(pv) => {
          navigate('/settings', { state: { editPvId: pv.id_pv } });
        }}
      />

    </div>
  );
};
