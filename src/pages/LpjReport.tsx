import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { useLpj } from '../context/LpjContext';
import { ReportModalLpj } from '../components/ReportModalLpj';
import { ModalAddSpj, ModalEditEsg, ModalEditBudget } from '../components/LpjInputModals';
import { 
  Download, 
  ShieldCheck, 
  Zap, 
  Coins, 
  Search, 
  Settings as SettingsIcon, 
  Sparkles, 
  DollarSign, 
  Users, 
  FileCheck,
  Plus,
  Trash2,
  Edit3
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie, 
  Legend
} from 'recharts';

export const LpjReport: React.FC = () => {
  const navigate = useNavigate();
  const { 
    budgetConfig, 
    kategoriAnggaran, 
    ledgerItems, 
    deleteLedgerItem, 
    esgImpacts 
  } = useLpj();

  // State Filter & Pencarian
  const [selectedPeriode, setSelectedPeriode] = useState('q3_2026');
  const [selectedWilayah, setSelectedWilayah] = useState('all');
  const [selectedPos, setSelectedPos] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // State Modals
  const [isModalLpjOpen, setIsModalLpjOpen] = useState(false);
  const [isAddSpjOpen, setIsAddSpjOpen] = useState(false);
  const [isEditEsgOpen, setIsEditEsgOpen] = useState(false);
  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false);
  const [deletingSpjId, setDeletingSpjId] = useState<string | null>(null);

  // Kalkulasi Keuangan
  const paguTotal = budgetConfig.paguAnggaran;
  const realisasiTotal = budgetConfig.realisasiAnggaran;
  const sisaKas = paguTotal - realisasiTotal;
  const persenSerapan = Math.min(100, Math.round((realisasiTotal / paguTotal) * 100));

  // Data Grafik 1: Pagu vs Realisasi per Kategori
  const barChartData = useMemo(() => {
    return kategoriAnggaran.map(k => ({
      name: k.nama.replace(' & ', '\n'),
      namaPendek: k.nama.length > 20 ? `${k.nama.slice(0, 18)}...` : k.nama,
      paguJuta: Number((k.pagu / 1000000).toFixed(1)),
      realisasiJuta: Number((k.realisasi / 1000000).toFixed(1)),
      persen: k.persentase,
      color: k.color
    }));
  }, [kategoriAnggaran]);

  // Data Grafik 2: Sebaran Regional
  const regionalData = useMemo(() => {
    return [
      { name: 'Jawa Barat (Bandung)', value: 69750000, percentage: 62, color: '#3b82f6' },
      { name: 'Jawa Tengah (Surabaya)', value: 42750000, percentage: 38, color: '#10b981' }
    ];
  }, []);

  // Filter Buku Kas Umum (Ledger) dari context dinamis
  const filteredLedger = useMemo(() => {
    return ledgerItems.filter(item => {
      const matchSearch = item.uraian.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.id_spj.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.penerima.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPos = selectedPos === 'all' || item.pos_anggaran.toLowerCase().includes(selectedPos.toLowerCase());
      const matchWil = selectedWilayah === 'all' || item.wilayah.toLowerCase().includes(selectedWilayah.toLowerCase());
      return matchSearch && matchPos && matchWil;
    });
  }, [ledgerItems, searchTerm, selectedPos, selectedWilayah]);

  return (
    <div className="page-container">
      
      {/* 1. HEADER HALAMAN LPJ */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '12px' 
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <ShieldCheck size={18} color="#059669" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              SIMDDII Financial Audit & Accountability Report
            </span>
          </div>
          <h1 className="responsive-header-title">
            Laporan Pertanggungjawaban (LPJ) & Akuntabilitas
          </h1>
          <p style={{ margin: '2px 0 0 0', color: 'var(--color-text-light)', fontSize: '13px' }}>
            Transparansi realisasi anggaran subsidi energi, audit pembukuan kas program, dan evaluasi capaian amaliyah binaan
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Pemilih Periode LPJ */}
          <select
            value={selectedPeriode}
            onChange={(e) => setSelectedPeriode(e.target.value)}
            style={{
              padding: '7px 10px',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid #cbd5e1',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="q3_2026">Kuartal III 2026 (Juli - Sept)</option>
            <option value="sem1_2026">Semester I 2026</option>
            <option value="full_2026">Tahun Anggaran Penuh 2026</option>
          </select>

          {/* Edit Anggaran Langsung di Menu LPJ */}
          <button
            onClick={() => setIsEditBudgetOpen(true)}
            style={{
              padding: '7px 12px',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid #cbd5e1',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            title="Input dan Sesuaikan Anggaran LPJ Langsung di Halaman Ini"
          >
            <Coins size={15} color="#d97706" /> Edit Anggaran LPJ
          </button>

          {/* Quick link ke Settings PV untuk edit angka */}
          <button
            onClick={() => navigate('/settings')}
            style={{
              padding: '7px 12px',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid #cbd5e1',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            title="Ubah Anggaran Pagu & Realisasi di Pengaturan PV"
          >
            <SettingsIcon size={15} color="var(--color-primary)" /> Edit di Setting PV
          </button>

          {/* Tombol Utama Download PDF LPJ */}
          <button
            onClick={() => setIsModalLpjOpen(true)}
            style={{
              padding: '7px 16px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)',
              transition: 'all 0.2s ease'
            }}
            className="card-hover"
          >
            <Download size={15} /> Download PDF LPJ Resmi (A4)
          </button>
        </div>
      </div>

      {/* 2. BANNER INFORMASI INTEGRASI DENGAN SETTING PV */}
      <div style={{ 
        padding: '10px 14px', 
        backgroundColor: 'rgba(5, 150, 105, 0.08)', 
        border: '1px solid rgba(5, 150, 105, 0.25)', 
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="#059669" />
          <span>
            Nilai <strong>Total Pagu Anggaran</strong>, <strong>Realisasi Dana</strong>, dan <strong>Target kWh</strong> tersinkronisasi otomatis dengan pengaturan di halaman <strong>PV Off-Grid</strong>.
          </span>
        </div>
        <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
          Periode: {budgetConfig.periodeAktif}
        </span>
      </div>

      {/* 3. 6 KPI KEUANGAN & REALISASI ENERGI */}
      <div className="kpi-grid">
        
        {/* 1. Total Pagu */}
        <Card style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }} className="card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
              Pagu Anggaran
            </span>
            <div style={{ padding: '5px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.12)', color: 'var(--color-primary)' }}>
              <Coins size={15} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text)' }}>
              Rp {paguTotal.toLocaleString('id-ID')}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-light)', marginTop: '2px' }}>
              Pagu DIPA Program Q3
            </div>
          </div>
        </Card>

        {/* 2. Realisasi Belanja */}
        <Card style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }} className="card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#059669', textTransform: 'uppercase' }}>
              Realisasi Belanja
            </span>
            <div style={{ padding: '5px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
              <FileCheck size={15} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669' }}>
              Rp {realisasiTotal.toLocaleString('id-ID')}
            </div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
              {persenSerapan}% Anggaran Terserap
            </div>
          </div>
        </Card>

        {/* 3. Sisa Saldo Kas */}
        <Card style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }} className="card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#d97706', textTransform: 'uppercase' }}>
              Sisa Kas Program
            </span>
            <div style={{ padding: '5px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#d97706' }}>
              <DollarSign size={15} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#d97706' }}>
              Rp {sisaKas.toLocaleString('id-ID')}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-light)', marginTop: '2px' }}>
              Siap Alokasi Q4 (25%)
            </div>
          </div>
        </Card>

        {/* 4. Total Listrik Tersalurkan */}
        <Card style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }} className="card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
              Listrik Tersalurkan
            </span>
            <div style={{ padding: '5px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' }}>
              <Zap size={15} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb' }}>
              {budgetConfig.targetKwh.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-light)' }}>kWh</span>
            </div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
              Terkonversi ke Meteran
            </div>
          </div>
        </Card>

        {/* 5. Efisiensi Biaya per Jiwa */}
        <Card style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }} className="card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
              Efisiensi Biaya
            </span>
            <div style={{ padding: '5px', borderRadius: '8px', backgroundColor: 'rgba(124, 58, 237, 0.12)', color: '#7c3aed' }}>
              <Users size={15} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#7c3aed' }}>
              Rp {budgetConfig.biayaPerJiwa.toLocaleString('id-ID')}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-light)', marginTop: '2px' }}>
              Per Warga / Bulan
            </div>
          </div>
        </Card>

        {/* 6. Opini Audit */}
        <Card style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }} className="card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#059669', textTransform: 'uppercase' }}>
              Opini Audit
            </span>
            <div style={{ padding: '5px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
              <ShieldCheck size={15} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
              WTP TERVERIFIKASI
            </div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
              Akuntabel & Syariah 100%
            </div>
          </div>
        </Card>

      </div>

      {/* 4. BAGIAN GRAFIK & ANALITIK DINAMIS (RESPONSIVE GRID) */}
      <div className="responsive-charts-grid">
        
        {/* Grafik 1: Pagu vs Realisasi per Pos Belanja */}
        <Card style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
                Realisasi vs Pagu Anggaran per Pos Belanja (Juta Rp)
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--color-text-light)' }}>
                Perbandingan penyerapan dana terhadap alokasi anggaran tiap komponen
              </p>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '3px 8px', borderRadius: '6px' }}>
              Total Serapan: {persenSerapan}%
            </span>
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="namaPendek" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(value: any, name: any) => [
                    `Rp ${value} Juta`, 
                    name === 'paguJuta' ? 'Pagu Anggaran' : 'Realisasi Belanja'
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="paguJuta" name="Pagu Anggaran" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="realisasiJuta" name="Realisasi Belanja" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Grafik 2: Donut Chart Sebaran Alokasi per Wilayah & Tren */}
        <Card style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
                Distribusi Serapan Anggaran & Kuota per Wilayah
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--color-text-light)' }}>
                Proporsi penyaluran bantuan energi regional Jawa Barat & Jawa Tengah
              </p>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '3px 8px', borderRadius: '6px' }}>
              2 Regional
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ height: '200px', width: '200px', margin: '0 auto' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={regionalData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {regionalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => `Rp ${Number(val).toLocaleString('id-ID')}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {regionalData.map(r => (
                <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: r.color }} />
                    <span style={{ fontWeight: 600 }}>{r.name}</span>
                  </div>
                  <strong style={{ color: r.color }}>{r.percentage}%</strong>
                </div>
              ))}

              <div style={{ marginTop: '8px', padding: '8px 10px', backgroundColor: 'var(--color-bg)', borderRadius: '8px', fontSize: '11px', color: 'var(--color-text-light)' }}>
                <span>Total Penyaluran: <strong>Rp 112.500.000</strong></span>
                <div style={{ marginTop: '2px' }}>Kuota Listrik: <strong>1.250 kWh Terkonversi</strong></div>
              </div>
            </div>
          </div>
        </Card>

      </div>

      {/* 5. EVALUASI DAMPAK SOSIAL & KEMANFAATAN ENERGI (ESG METRICS) */}
      <Card style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#059669" />
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
                Evaluasi Dampak Sosial, Ekonomi & Lingkungan (ESG Metrics)
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>
                Indikator capaian program terhadap pengentasan kemiskinan dan keberdayaan spiritual warga binaan
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsEditEsgOpen(true)}
            style={{
              padding: '6px 12px',
              backgroundColor: 'rgba(5, 150, 105, 0.1)',
              color: '#059669',
              border: '1px solid rgba(5, 150, 105, 0.3)',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <Edit3 size={14} /> Edit / Input Poin Dampak
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {esgImpacts.map((impact) => (
            <div 
              key={impact.id} 
              style={{ 
                padding: '12px', 
                backgroundColor: 'var(--color-bg)', 
                borderRadius: '8px', 
                border: '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, color: impact.color || '#059669' }}>
                {impact.nomor}. {impact.judul}:
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-light)', lineHeight: '1.4' }}>
                {impact.deskripsi}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* 6. TABEL BUKU KAS UMUM & JURNAL REALISASI BELANJA (SPJ LEDGER) */}
      <Card style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Toolbar Filter Tabel */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
              Buku Kas Umum & Jurnal Realisasi Belanja (SPJ Lengkap)
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>
              Menampilkan {filteredLedger.length} transaksi pengeluaran anggaran terverifikasi
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Tombol Input Transaksi SPJ Baru */}
            <button
              onClick={() => setIsAddSpjOpen(true)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(5, 150, 105, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              <Plus size={15} /> Input Bukti Kas SPJ Baru
            </button>

            {/* Search Box */}
            <div style={{ position: 'relative', width: '200px' }}>
              <Search size={14} color="var(--color-text-light)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text"
                placeholder="Cari uraian / nomor SPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px 6px 30px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #cbd5e1',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Filter Pos Belanja */}
            <select
              value={selectedPos}
              onChange={(e) => setSelectedPos(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #cbd5e1',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                fontSize: '12px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">Semua Pos Belanja</option>
              <option value="Subsidi Token">Subsidi Token Listrik</option>
              <option value="Kafalah">Kafalah Da'i Pembina</option>
              <option value="Pemeliharaan">Pemeliharaan PV Surya</option>
              <option value="Pembinaan">Pembinaan Amaliyah</option>
              <option value="Administrasi">Administrasi & Audit</option>
            </select>

            {/* Filter Wilayah */}
            <select
              value={selectedWilayah}
              onChange={(e) => setSelectedWilayah(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #cbd5e1',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                fontSize: '12px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">Semua Wilayah</option>
              <option value="Jawa Barat">Jawa Barat</option>
              <option value="Jateng">Jawa Tengah</option>
              <option value="Jakarta">Pusat / Nasional</option>
            </select>
          </div>
        </div>

        {/* Tabel Data Ledger */}
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(5, 150, 105, 0.08)', borderBottom: '1px solid #e2e8f0', color: 'var(--color-text-light)' }}>
                <th style={{ padding: '10px 12px', width: '38px', textAlign: 'center' }}>No</th>
                <th style={{ padding: '10px 12px' }}>Nomor Bukti SPJ</th>
                <th style={{ padding: '10px 12px' }}>Tanggal</th>
                <th style={{ padding: '10px 12px' }}>Pos Anggaran</th>
                <th style={{ padding: '10px 12px' }}>Uraian Pengeluaran</th>
                <th style={{ padding: '10px 12px' }}>Penerima / Wilayah</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Nominal (Rp)</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Status SPJ</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', width: '45px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredLedger.length > 0 ? (
                filteredLedger.map((item, idx) => (
                  <tr 
                    key={item.id_spj}
                    style={{ 
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: 'var(--color-text-light)' }}>
                      #{idx + 1}
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 700, color: '#059669' }}>
                      {item.id_spj}
                    </td>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                      {item.tanggal}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                      {item.pos_anggaran}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--color-text)' }}>
                      {item.uraian}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--color-text-light)' }}>
                      {item.penerima} ({item.wilayah})
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--color-text)' }}>
                      Rp {item.nominal.toLocaleString('id-ID')}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{ 
                        fontSize: '10px', 
                        fontWeight: 700, 
                        padding: '2px 8px', 
                        borderRadius: '10px', 
                        backgroundColor: 'rgba(16, 185, 129, 0.12)', 
                        color: '#059669',
                        whiteSpace: 'nowrap'
                      }}>
                        ✓ {item.status_verifikasi}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {deletingSpjId === item.id_spj ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            onClick={() => {
                              deleteLedgerItem(item.id_spj);
                              setDeletingSpjId(null);
                            }}
                            style={{
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              fontSize: '10px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                            title="Konfirmasi Hapus"
                          >
                            Hapus
                          </button>
                          <button
                            onClick={() => setDeletingSpjId(null)}
                            style={{
                              backgroundColor: '#e2e8f0',
                              color: '#475569',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              fontSize: '10px',
                              cursor: 'pointer'
                            }}
                            title="Batal"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingSpjId(item.id_spj)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'opacity 0.2s'
                          }}
                          title="Hapus Bukti Kas SPJ"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-light)' }}>
                    Tidak ada data transaksi pengeluaran yang sesuai filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: 'rgba(5, 150, 105, 0.05)', borderTop: '2px solid #059669', fontWeight: 700 }}>
                <td colSpan={6} style={{ padding: '10px 12px', textAlign: 'right', textTransform: 'uppercase' }}>
                  TOTAL REALISASI PENGELUARAN:
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: '#059669', fontSize: '13px' }}>
                  Rp {filteredLedger.reduce((sum, item) => sum + item.nominal, 0).toLocaleString('id-ID')}
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center', color: '#059669' }}>
                  100% Sah
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

      </Card>

      {/* 1. Modal Laporan PDF LPJ Resmi (Format A4 Multi-Page) */}
      <ReportModalLpj
        isOpen={isModalLpjOpen}
        onClose={() => setIsModalLpjOpen(false)}
      />

      {/* 2. Modal Input Transaksi SPJ Baru */}
      <ModalAddSpj
        isOpen={isAddSpjOpen}
        onClose={() => setIsAddSpjOpen(false)}
      />

      {/* 3. Modal Edit Poin-Poin Evaluasi Dampak (ESG Metrics) */}
      <ModalEditEsg
        isOpen={isEditEsgOpen}
        onClose={() => setIsEditEsgOpen(false)}
      />

      {/* 4. Modal Edit Parameter Anggaran LPJ */}
      <ModalEditBudget
        isOpen={isEditBudgetOpen}
        onClose={() => setIsEditBudgetOpen(false)}
      />

    </div>
  );
};

