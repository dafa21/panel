import React, { useState, useMemo } from 'react';
import { useAmaliyah } from '../context/AmaliyahContext';
import { type Amaliyah, mockWarga } from '../db_mock';
import { 
  Award, 
  Sparkles, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X, 
  Zap, 
  Users, 
  PieChart as PieChartIcon, 
  Clock, 
  Tag
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';

export const MasterAmaliyah: React.FC = () => {
  const { 
    amaliyahList, 
    trxList, 
    addAmaliyah, 
    updateAmaliyah, 
    deleteAmaliyah, 
    totalPoinDisalurkan,
    totalSetoran,
    totalWargaAktif,
    estimasiKwh,
    estimasiRupiah,
    kategoriDistribution,
    trendSetoran,
    topAmaliyahList,
    daiPerformanceList
  } = useAmaliyah();

  const [activeTab, setActiveTab] = useState<'analisis' | 'master' | 'riwayat'>('analisis');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState<string>('all');

  // Modal State Tambah / Edit Amaliyah
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState<Amaliyah['kategori']>('sunnah');
  const [poin, setPoin] = useState('30');
  const [deskripsi, setDeskripsi] = useState('');
  const [targetBulanan, setTargetBulanan] = useState('10');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Kategori badge colors
  const getKategoriBadge = (kat: string) => {
    switch (kat) {
      case 'wajib':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#059669', border: 'rgba(16, 185, 129, 0.3)', label: 'Wajib' };
      case 'sunnah':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#2563eb', border: 'rgba(59, 130, 246, 0.3)', label: 'Sunnah' };
      case 'sosial':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#d97706', border: 'rgba(245, 158, 11, 0.3)', label: 'Sosial' };
      case 'dakwah':
        return { bg: 'rgba(139, 92, 246, 0.15)', text: '#7c3aed', border: 'rgba(139, 92, 246, 0.3)', label: 'Dakwah' };
      case 'pendidikan':
        return { bg: 'rgba(6, 182, 212, 0.15)', text: '#0891b2', border: 'rgba(6, 182, 212, 0.3)', label: 'Pendidikan' };
      case 'kebersihan':
        return { bg: 'rgba(236, 72, 153, 0.15)', text: '#db2777', border: 'rgba(236, 72, 153, 0.3)', label: 'Kebersihan' };
      default:
        return { bg: 'rgba(100, 116, 139, 0.15)', text: '#475569', border: 'rgba(100, 116, 139, 0.3)', label: kat };
    }
  };

  // Filter Master List
  const filteredAmaliyah = useMemo(() => {
    return amaliyahList.filter(item => {
      const matchSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.deskripsi && item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchKat = filterKategori === 'all' || item.kategori === filterKategori;
      return matchSearch && matchKat;
    });
  }, [amaliyahList, searchTerm, filterKategori]);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setNama('');
    setKategori('sunnah');
    setPoin('30');
    setDeskripsi('');
    setTargetBulanan('10');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Amaliyah) => {
    setEditingId(item.id_amaliyah);
    setNama(item.nama);
    setKategori(item.kategori);
    setPoin(String(item.poin));
    setDeskripsi(item.deskripsi || '');
    setTargetBulanan(String(item.target_bulanan || 10));
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !poin) return;

    const poinNum = Number(poin) || 10;
    const targetNum = Number(targetBulanan) || 10;

    if (editingId) {
      updateAmaliyah(editingId, {
        nama: nama.trim(),
        kategori,
        poin: poinNum,
        deskripsi: deskripsi.trim(),
        target_bulanan: targetNum
      });
      setFeedbackMsg(`✓ Amaliyah "${nama.trim()}" berhasil diperbarui!`);
    } else {
      addAmaliyah({
        nama: nama.trim(),
        kategori,
        poin: poinNum,
        deskripsi: deskripsi.trim(),
        target_bulanan: targetNum,
        status_aktif: true
      });
      setFeedbackMsg(`✓ Jenis amaliyah baru "${nama.trim()}" berhasil ditambahkan ke master!`);
    }

    setIsModalOpen(false);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Yakin ingin menghapus jenis amaliyah "${name}" dari master?`)) {
      deleteAmaliyah(id);
      setFeedbackMsg(`✓ Amaliyah "${name}" berhasil dihapus.`);
      setTimeout(() => setFeedbackMsg(null), 3500);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* 1. Header Toolbar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        paddingBottom: '6px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <Sparkles size={18} color="#10b981" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              SIMDDII Spiritual Capital & Analytics Engine
            </span>
          </div>
          <h1 className="responsive-header-title">
            Master Data & Analisis Amaliyah Warga
          </h1>
          <p style={{ margin: '2px 0 0 0', color: 'var(--color-text-light)', fontSize: '13px' }}>
            Manajemen jenis kegiatan ibadah dinamis, evaluasi capaian poin, serta analisis dampak sosial energi warga
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={handleOpenAddModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
              transition: 'all 0.2s'
            }}
          >
            <Plus size={16} />
            <span>Tambah Jenis Amaliyah</span>
          </button>
        </div>
      </div>

      {/* Notifikasi Feedback */}
      {feedbackMsg && (
        <div style={{
          padding: '10px 16px',
          borderRadius: '10px',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#059669',
          fontSize: '13px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeInScale 0.2s ease-out'
        }}>
          <CheckCircle2 size={16} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* 2. Tab Navigasi Halaman */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        paddingBottom: '4px',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveTab('analisis')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'analisis' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
            color: activeTab === 'analisis' ? '#059669' : 'var(--color-text-light)',
            fontWeight: activeTab === 'analisis' ? 700 : 500,
            fontSize: '13px',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <PieChartIcon size={16} />
          <span>Dashboard Analisis Amaliyah</span>
        </button>

        <button
          onClick={() => setActiveTab('master')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'master' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
            color: activeTab === 'master' ? '#059669' : 'var(--color-text-light)',
            fontWeight: activeTab === 'master' ? 700 : 500,
            fontSize: '13px',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <Tag size={16} />
          <span>Kelola Master Data ({amaliyahList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('riwayat')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'riwayat' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
            color: activeTab === 'riwayat' ? '#059669' : 'var(--color-text-light)',
            fontWeight: activeTab === 'riwayat' ? 700 : 500,
            fontSize: '13px',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <Clock size={16} />
          <span>Log Setoran Terkini ({trxList.length})</span>
        </button>
      </div>

      {/* =========================================================
          TAB 1: DASHBOARD ANALISIS AMALIYAH (VISUAL CHARTS & KPIS)
          ========================================================= */}
      {activeTab === 'analisis' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 4 KPI CARDS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px'
          }}>
            {/* Card 1: Total Setoran */}
            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface)',
              border: 'var(--glass-border)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
                  Total Setoran Tercatat
                </span>
                <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text)' }}>
                {totalSetoran} <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-light)' }}>Kegiatan</span>
              </div>
              <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                ✓ Diverifikasi resmi oleh Da'i
              </span>
            </div>

            {/* Card 2: Total Poin Disalurkan */}
            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface)',
              border: 'var(--glass-border)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
                  Poin Terdistribusi
                </span>
                <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.12)', color: 'var(--color-primary)' }}>
                  <Award size={18} />
                </div>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary)' }}>
                {totalPoinDisalurkan.toLocaleString('id-ID')} <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-light)' }}>Pts</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                Setara Rp {estimasiRupiah.toLocaleString('id-ID')} subsidi
              </span>
            </div>

            {/* Card 3: Konversi Listrik kWh */}
            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface)',
              border: 'var(--glass-border)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
                  Dampak Energi Bersih
                </span>
                <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: 'var(--color-accent)' }}>
                  <Zap size={18} />
                </div>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-accent)' }}>
                {estimasiKwh} <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-light)' }}>kWh Listrik</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                Dihasilkan dari integrasi token mandiri
              </span>
            </div>

            {/* Card 4: Warga Aktif */}
            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface)',
              border: 'var(--glass-border)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
                  Warga Binaan Aktif
                </span>
                <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
                  <Users size={18} />
                </div>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#7c3aed' }}>
                {totalWargaAktif} <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-light)' }}>Jiwa</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                Tersebar di wilayah Jabar & Jatim
              </span>
            </div>
          </div>

          {/* ROW GRAFIK 1: DISTRIBUSI KATEGORI & TREN SETORAN */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '16px'
          }}>
            {/* Grafik Donut Kategori */}
            <div style={{
              padding: '18px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface)',
              border: 'var(--glass-border)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>
                    Distribusi Kategori Amaliyah
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>
                    Proporsi setoran berdasarkan rumpun ibadah warga
                  </span>
                </div>
              </div>

              <div style={{ height: '220px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={kategoriDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                    >
                      {kategoriDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: any) => [`${val} Kegiatan`, 'Jumlah Setoran']}
                      contentStyle={{ backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: 'var(--glass-border)', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend Manual Custom */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                {kategoriDistribution.map((kat) => (
                  <div key={kat.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: kat.color }}></span>
                    <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{kat.name}:</span>
                    <span style={{ color: 'var(--color-text-light)' }}>{kat.value} ({kat.poin} pts)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Grafik Area Tren Setoran */}
            <div style={{
              padding: '18px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface)',
              border: 'var(--glass-border)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>
                  Tren Setoran Amaliyah Harian
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>
                  Aktivitas verifikasi ibadah dari waktu ke waktu
                </span>
              </div>

              <div style={{ height: '250px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendSetoran}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="label" fontSize={11} stroke="var(--color-text-light)" />
                    <YAxis fontSize={11} stroke="var(--color-text-light)" allowDecimals={false} />
                    <Tooltip 
                      formatter={(value: any, name: any) => [value, name === 'count' ? 'Jumlah Setoran' : 'Poin']}
                      contentStyle={{ backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: 'var(--glass-border)', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ROW 2: LEADERBOARD AMALIYAH TERPOPULER & KINERJA DA'I */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '16px'
          }}>
            {/* Leaderboard Kegiatan Amaliyah Paling Populer */}
            <div style={{
              padding: '18px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface)',
              border: 'var(--glass-border)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>
                  🏆 Peringkat Amaliyah Paling Populer
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>
                  Kegiatan ibadah dengan frekuensi pelaksanaan tertinggi oleh warga binaan
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {topAmaliyahList.slice(0, 5).map((item, idx) => {
                  const badge = getKategoriBadge(item.amaliyah.kategori);
                  return (
                    <div key={item.amaliyah.id_amaliyah} style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-bg)',
                      border: '1px solid rgba(0,0,0,0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : 'rgba(0,0,0,0.1)',
                            color: idx < 3 ? 'white' : 'var(--color-text)',
                            fontSize: '11px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {idx + 1}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
                            {item.amaliyah.nama}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '6px',
                          backgroundColor: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`
                        }}>
                          {badge.label}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Progress Bar */}
                        <div style={{ flex: 1, height: '6px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                          <div style={{ width: `${item.persen}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '4px' }} />
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text)', minWidth: '60px', textAlign: 'right' }}>
                          {item.count}x ({item.totalPoin} pts)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performa Da'i & Wilayah Binaan */}
            <div style={{
              padding: '18px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface)',
              border: 'var(--glass-border)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>
                  👥 Distribusi Verifikasi Da'i Pembina
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>
                  Aktivitas pendampingan dan pembinaan warga di tiap regional
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {daiPerformanceList.map((dai) => (
                  <div key={dai.id_dai} style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
                        {dai.nama}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                        Regional {dai.regional} • ID: {dai.id_dai}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#10b981' }}>
                        {dai.totalSetoran} Setoran
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                        {dai.totalPoin.toLocaleString('id-ID')} Poin Tersalurkan
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: KELOLA MASTER DATA AMALIYAH (CRUD TABLE & SEARCH)
          ========================================================= */}
      {activeTab === 'master' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Baris Pencarian & Filter */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface)',
            border: 'var(--glass-border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--color-bg)',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: '340px'
              }}>
                <Search size={16} color="var(--color-text-light)" />
                <input
                  type="text"
                  placeholder="Cari nama atau deskripsi kegiatan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: '12px',
                    color: 'var(--color-text)',
                    outline: 'none',
                    width: '100%'
                  }}
                />
              </div>

              <select
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  fontSize: '12px',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Semua Kategori</option>
                <option value="wajib">Wajib</option>
                <option value="sunnah">Sunnah</option>
                <option value="sosial">Sosial</option>
                <option value="dakwah">Dakwah</option>
                <option value="pendidikan">Pendidikan</option>
                <option value="kebersihan">Kebersihan</option>
              </select>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>
              Menampilkan <strong>{filteredAmaliyah.length}</strong> dari {amaliyahList.length} jenis amaliyah
            </div>
          </div>

          {/* Tabel Master Amaliyah */}
          <div style={{
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface)',
            border: 'var(--glass-border)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', backgroundColor: 'var(--color-bg)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text)' }}>ID</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text)' }}>Nama Kegiatan Amaliyah</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text)' }}>Kategori</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text)' }}>Poin Reward</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text)' }}>Target Bulanan</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text)' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text)', textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAmaliyah.map((item) => {
                    const badge = getKategoriBadge(item.kategori);
                    return (
                      <tr key={item.id_amaliyah} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-primary)' }}>
                          {item.id_amaliyah}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{item.nama}</div>
                          {item.deskripsi && (
                            <div style={{ fontSize: '11px', color: 'var(--color-text-light)', marginTop: '2px' }}>
                              {item.deskripsi}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: badge.bg,
                            color: badge.text,
                            border: `1px solid ${badge.border}`
                          }}>
                            {badge.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontWeight: 800, color: '#10b981', fontSize: '14px' }}>
                            +{item.poin}
                          </span> <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>Pts</span>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--color-text)' }}>
                          {item.target_bulanan || 10}x / bulan
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            color: '#059669',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                            Aktif
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              style={{
                                padding: '5px 8px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                backgroundColor: 'var(--color-bg)',
                                color: 'var(--color-text)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                fontWeight: 600
                              }}
                              title="Edit jenis amaliyah ini"
                            >
                              <Edit3 size={13} color="var(--color-primary)" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.id_amaliyah, item.nama)}
                              style={{
                                padding: '5px 8px',
                                borderRadius: '6px',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                                color: '#ef4444',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                fontWeight: 600
                              }}
                              title="Hapus dari master data"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: LOG RIWAYAT SETORAN REALTIME
          ========================================================= */}
      {activeTab === 'riwayat' && (
        <div style={{
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-surface)',
          border: 'var(--glass-border)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>
              Log Aktivitas Verifikasi Setoran Amaliyah Seluruh Wilayah
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>
              Total {trxList.length} transaksi setoran amaliyah yang telah diverifikasi da'i
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', backgroundColor: 'var(--color-bg)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text)' }}>ID Trx</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text)' }}>Warga Binaan</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text)' }}>Kegiatan Amaliyah</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text)' }}>Poin</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text)' }}>Da'i Verifikator</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text)' }}>Waktu Setor</th>
                </tr>
              </thead>
              <tbody>
                {trxList.map((trx) => {
                  const amaliyahObj = amaliyahList.find(a => a.id_amaliyah === trx.id_amaliyah);
                  const wargaObj = mockWarga.find(w => w.id_warga === trx.id_warga);
                  const badge = amaliyahObj ? getKategoriBadge(amaliyahObj.kategori) : getKategoriBadge('wajib');

                  return (
                    <tr key={trx.id_trx} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-light)', fontSize: '11px' }}>
                        {trx.id_trx}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text)' }}>
                        {wargaObj?.nama || trx.id_warga}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                            {amaliyahObj?.nama || trx.id_amaliyah}
                          </span>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: badge.bg,
                            color: badge.text
                          }}>
                            {badge.label}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: '#10b981' }}>
                        +{amaliyahObj?.poin || 25} Pts
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--color-text-light)' }}>
                        {trx.id_dai === 'D01' ? 'Ustadz Ahmad' : 'Ustadz Budi'}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--color-text-light)', fontSize: '12px' }}>
                        {trx.tanggal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: TAMBAH / EDIT JENIS AMALIYAH BARU
          ========================================================= */}
      {isModalOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1200,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            overflowY: 'auto'
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: '540px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              animation: 'fadeInScale 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Award size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--color-text)' }}>
                    {editingId ? 'Edit Jenis Amaliyah' : 'Tambah Jenis Amaliyah Baru'}
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                    Akan langsung muncul di pilihan dropdown form input da'i
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  color: 'var(--color-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveModal} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Nama Amaliyah */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text)' }}>
                  Nama Kegiatan Amaliyah <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Sholat Tahajud Berjamaah"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Baris 2 Kolom: Kategori & Poin */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text)' }}>
                    Kategori Ibadah <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value as Amaliyah['kategori'])}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      fontSize: '13px',
                      outline: 'none',
                      cursor: 'pointer',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="wajib">Wajib</option>
                    <option value="sunnah">Sunnah</option>
                    <option value="sosial">Sosial / Gotong Royong</option>
                    <option value="dakwah">Dakwah / Majelis</option>
                    <option value="pendidikan">Pendidikan / Mengaji</option>
                    <option value="kebersihan">Kebersihan & Sanitasi</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text)' }}>
                    Poin Reward (Pts) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    placeholder="Contoh: 40"
                    value={poin}
                    onChange={(e) => setPoin(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Target Bulanan */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text)' }}>
                  Estimasi Target Bulanan (Kali per Bulan)
                </label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={targetBulanan}
                  onChange={(e) => setTargetBulanan(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text)' }}>
                  Deskripsi / Petunjuk Amaliyah
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan singkat kegiatan amaliyah untuk panduan da'i pembina..."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                    fontSize: '12px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Preview Live Dropdown */}
              <div style={{
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-bg)',
                border: '1px dashed rgba(16, 185, 129, 0.4)',
                fontSize: '11px',
                color: 'var(--color-text-light)'
              }}>
                <strong>Tampilan di Dropdown Form Da'i:</strong>
                <div style={{ marginTop: '4px', fontWeight: 700, color: 'var(--color-text)', fontSize: '12px' }}>
                  {nama || '(Nama Kegiatan)'} (+{poin || 0} Pts | {kategori.toUpperCase()})
                </div>
              </div>

              {/* Tombol Aksi */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: 'transparent',
                    color: 'var(--color-text)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#10b981',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  {editingId ? 'Simpan Perubahan' : 'Tambahkan ke Master'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
