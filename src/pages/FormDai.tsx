import React, { useState, useMemo } from 'react';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Button } from '../components/Button';
import { useAmaliyah } from '../context/AmaliyahContext';
import { 
  mockWarga, 
  mockDai, 
  mockHistory, 
  NILAI_KONVERSI, 
  type Warga, 
  type TrxAmaliyah 
} from '../db_mock';
import { 
  Save, 
  CheckCircle, 
  UserPlus, 
  ClipboardList, 
  Navigation, 
  Users, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  Sparkles, 
  CheckSquare, 
  Square, 
  Clock, 
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const defaultIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const LocationMarker = ({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={defaultIcon} />
  );
};

export const FormDai: React.FC = () => {
  const { amaliyahList } = useAmaliyah();
  const [activeTab, setActiveTab] = useState<'lama' | 'baru'>('lama');

  // State Warga Lama (Amaliyah Masal)
  const [selectedAmaliyah, setSelectedAmaliyah] = useState('');
  const [wargaChecked, setWargaChecked] = useState<Record<string, boolean>>({});
  const [filterDaiChecklist, setFilterDaiChecklist] = useState('');
  const [isSavedLama, setIsSavedLama] = useState(false);
  
  // Search & Pagination State
  const [searchWarga, setSearchWarga] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // State Warga Baru
  const [namaBaru, setNamaBaru] = useState('');
  const [nikBaru, setNikBaru] = useState('');
  const [plnBaru, setPlnBaru] = useState('');
  const [dayaBaru, setDayaBaru] = useState('900');
  const [daiBaru, setDaiBaru] = useState('D01');
  const [alamatBaru, setAlamatBaru] = useState('');
  const [pekerjaanBaru, setPekerjaanBaru] = useState('');
  const [mapPosition, setMapPosition] = useState<L.LatLng | null>(null);
  const [isSavedBaru, setIsSavedBaru] = useState(false);

  // Local state for dynamic transaction feed and warga
  const [historyList, setHistoryList] = useState<TrxAmaliyah[]>(mockHistory);
  const [wargaList, setWargaList] = useState<Warga[]>(mockWarga);

  // 1. Dashboard KPI Data
  const totalLaporan = historyList.length;
  const totalPoinTersalurkan = historyList.reduce((sum, h) => {
    const a = amaliyahList.find(item => item.id_amaliyah === h.id_amaliyah);
    return sum + (a?.poin || 0);
  }, 0);
  const totalWargaAktif = wargaList.length;
  const totalDaiBertugas = mockDai.length;

  // Selected Amaliyah Object
  const amaliyahObj = useMemo(() => {
    return amaliyahList.find(a => a.id_amaliyah === selectedAmaliyah);
  }, [selectedAmaliyah, amaliyahList]);

  // Selected Citizens
  const totalWargaTerpilih = Object.values(wargaChecked).filter(Boolean).length;
  const totalEstimasiPoin = (amaliyahObj?.poin || 0) * totalWargaTerpilih;
  const totalEstimasiRupiah = totalEstimasiPoin * NILAI_KONVERSI;
  const totalEstimasiKwh = Number((totalWargaTerpilih * 1.2).toFixed(1));

  // Filter Warga for Checklist
  const filteredWarga = useMemo(() => {
    return wargaList.filter(w => {
      const matchSearch = w.nama.toLowerCase().includes(searchWarga.toLowerCase()) || 
                          w.id_warga.toLowerCase().includes(searchWarga.toLowerCase()) ||
                          w.id_pelanggan_pln.includes(searchWarga);
      const matchDai = filterDaiChecklist ? w.id_dai === filterDaiChecklist : true;
      return matchSearch && matchDai;
    });
  }, [wargaList, searchWarga, filterDaiChecklist]);

  const totalPages = Math.ceil(filteredWarga.length / itemsPerPage) || 1;
  const paginatedWarga = filteredWarga.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Toggle selection
  const handleToggleWarga = (id: string) => {
    setWargaChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Select All in filtered list
  const handleSelectAll = () => {
    const newChecked: Record<string, boolean> = { ...wargaChecked };
    filteredWarga.forEach(w => {
      newChecked[w.id_warga] = true;
    });
    setWargaChecked(newChecked);
  };

  // Deselect All
  const handleDeselectAll = () => {
    setWargaChecked({});
  };

  // Save Amaliyah Masal
  const handleSaveLama = () => {
    if (!selectedAmaliyah || totalWargaTerpilih === 0) return;

    const selectedIds = Object.keys(wargaChecked).filter(id => wargaChecked[id]);
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newTrxList: TrxAmaliyah[] = selectedIds.map((wId, idx) => ({
      id_trx: `TRX${Date.now().toString().slice(-4)}${idx}`,
      id_dai: wargaList.find(w => w.id_warga === wId)?.id_dai || 'D01',
      id_warga: wId,
      id_amaliyah: selectedAmaliyah,
      tanggal: dateStr,
      latitude: wargaList.find(w => w.id_warga === wId)?.latitude || -6.9147,
      longitude: wargaList.find(w => w.id_warga === wId)?.longitude || 107.6098,
      kwh_meter: 1.2
    }));

    // Update history list and add points to citizens
    setHistoryList(prev => [...newTrxList, ...prev]);
    setWargaList(prev => prev.map(w => {
      if (selectedIds.includes(w.id_warga)) {
        return {
          ...w,
          total_poin: w.total_poin + (amaliyahObj?.poin || 0)
        };
      }
      return w;
    }));

    setIsSavedLama(true);
    setTimeout(() => {
      setIsSavedLama(false);
      setSelectedAmaliyah('');
      setWargaChecked({});
      setCurrentPage(1);
      setSearchWarga('');
    }, 2500);
  };

  // Save Warga Baru
  const handleSaveBaru = () => {
    if (!namaBaru || !nikBaru || !mapPosition) return;

    const newId = `W${String(wargaList.length + 1).padStart(3, '0')}`;
    const newCitizen: Warga = {
      id_warga: newId,
      nama: namaBaru,
      id_dai: daiBaru,
      id_pelanggan_pln: plnBaru || '112233449999',
      golongan_va: dayaBaru,
      latitude: mapPosition.lat,
      longitude: mapPosition.lng,
      total_poin: 0
    };

    setWargaList(prev => [...prev, newCitizen]);
    setIsSavedBaru(true);
    setTimeout(() => {
      setIsSavedBaru(false);
      setNamaBaru('');
      setNikBaru('');
      setPlnBaru('');
      setAlamatBaru('');
      setPekerjaanBaru('');
      setMapPosition(null);
    }, 2500);
  };

  // 5 Transaksi Terkini
  const recentTransactions = useMemo(() => {
    return [...historyList]
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
      .slice(0, 5)
      .map(t => {
        const w = wargaList.find(item => item.id_warga === t.id_warga);
        const a = amaliyahList.find((item: any) => item.id_amaliyah === t.id_amaliyah);
        return {
          ...t,
          wargaNama: w?.nama || t.id_warga,
          amaliyahNama: a?.nama || t.id_amaliyah,
          poin: a?.poin || 0,
          kategori: a?.kategori || 'wajib'
        };
      });
  }, [historyList, wargaList]);

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
              SIMDDII Da'i Field Verification & Reporting Hub
            </span>
          </div>
          <h1 className="responsive-header-title">
            Form Data & Laporan Da'i
          </h1>
          <p style={{ margin: '2px 0 0 0', color: 'var(--color-text-light)', fontSize: '13px' }}>
            Pencatatan amaliyah masal warga binaan dan registrasi warga baru dengan pemetaan geotagging
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ 
          display: 'flex', 
          gap: '6px', 
          backgroundColor: 'var(--color-surface)', 
          padding: '4px', 
          borderRadius: 'var(--radius-md)',
          border: 'var(--glass-border)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <button
            onClick={() => setActiveTab('lama')}
            style={{
              padding: '7px 14px',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              backgroundColor: activeTab === 'lama' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'lama' ? 'white' : 'var(--color-text-light)',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <ClipboardList size={15} /> Lapor Amaliyah Masal
          </button>
          <button
            onClick={() => setActiveTab('baru')}
            style={{
              padding: '7px 14px',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              backgroundColor: activeTab === 'baru' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'baru' ? 'white' : 'var(--color-text-light)',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <UserPlus size={15} /> Tambah Warga Baru
          </button>
        </div>
      </div>

      {/* 2. DASHBOARD KPI PELAPORAN DA'I (COMPACT ROW) */}
      <div className="kpi-grid">
        {/* Total Laporan */}
        <Card style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }} className="card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
              Total Laporan
            </span>
            <div style={{ padding: '5px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.12)', color: 'var(--color-primary)' }}>
              <ClipboardList size={15} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text)' }}>
              {totalLaporan} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-light)' }}>Setoran</span>
            </div>
            <div style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <ShieldCheck size={12} /> Validasi Da'i Resmi
            </div>
          </div>
        </Card>

        {/* Total Poin Tersalurkan */}
        <Card style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }} className="card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
              Poin Disalurkan
            </span>
            <div style={{ padding: '5px', borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
              <Award size={15} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#8b5cf6' }}>
              {totalPoinTersalurkan.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-light)' }}>Pts</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-light)', marginTop: '2px' }}>
              Setara Rp {totalPoinTersalurkan.toLocaleString('id-ID')}
            </div>
          </div>
        </Card>

        {/* Warga Binaan Aktif */}
        <Card style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }} className="card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
              Warga Aktif
            </span>
            <div style={{ padding: '5px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <Users size={15} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#059669' }}>
              {totalWargaAktif} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-light)' }}>Jiwa</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-light)', marginTop: '2px' }}>
              2 Regional Da'i
            </div>
          </div>
        </Card>

        {/* Da'i Bertugas */}
        <Card style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }} className="card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
              Da'i Pembimbing
            </span>
            <div style={{ padding: '5px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: 'var(--color-accent)' }}>
              <Sparkles size={15} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-accent)' }}>
              {totalDaiBertugas} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-light)' }}>Ustadz</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-light)', marginTop: '2px' }}>
              Jabar & Jateng
            </div>
          </div>
        </Card>
      </div>

      {/* 3. TATA LETAK 2 KOLOM (RESPONSIF: 1 KOLOM DI HP, 2 KOLOM DI LAPTOP) */}
      <div className="responsive-two-col-form">
        
        {/* KOLOM KIRI: FORM AKTIF */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {activeTab === 'lama' ? (
            /* TAB 1: FORM AMALIYAH MASAL */
            <>
              {isSavedLama && (
                <Card style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle color="#059669" size={24} />
                  <div>
                    <div style={{ color: '#059669', fontWeight: 700, fontSize: '15px' }}>
                      Laporan Amaliyah Massal Berhasil Disimpan!
                    </div>
                    <span style={{ fontSize: '13px', color: '#065f46' }}>
                      Poin berhasil disalurkan ke {totalWargaTerpilih} warga binaan dan tercatat di histori.
                    </span>
                  </div>
                </Card>
              )}

              {/* Langkah 1: Pilih Jenis Amaliyah */}
              <Card style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                    1. Pilih Jenis Amaliyah yang Dilakukan
                  </h3>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: '8px' }}>
                    Wajib • Sunnah • Sosial
                  </span>
                </div>

                <Select
                  label="Pilih nama kegiatan amaliyah"
                  options={[
                    { value: '', label: '-- Pilih Opsi Amaliyah --' },
                    ...amaliyahList.map((a: any) => ({ 
                      value: a.id_amaliyah, 
                      label: `${a.nama} (+${a.poin} Pts | ${a.kategori.toUpperCase()})` 
                    }))
                  ]}
                  value={selectedAmaliyah}
                  onChange={(e) => setSelectedAmaliyah(e.target.value)}
                  style={{ marginBottom: '12px' }}
                />

                {amaliyahObj && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '10px 14px', 
                    backgroundColor: 'var(--color-bg)', 
                    borderRadius: 'var(--radius-md)', 
                    fontSize: '13px' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{amaliyahObj.nama}</span>
                      <span style={{ 
                        fontSize: '10px', 
                        fontWeight: 700, 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        backgroundColor: amaliyahObj.kategori === 'wajib' ? 'rgba(59, 130, 246, 0.15)' : amaliyahObj.kategori === 'sunnah' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: amaliyahObj.kategori === 'wajib' ? '#2563eb' : amaliyahObj.kategori === 'sunnah' ? '#059669' : '#d97706',
                        textTransform: 'uppercase'
                      }}>
                        {amaliyahObj.kategori}
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--color-accent)' }}>
                      +{amaliyahObj.poin} Poin / Jiwa
                    </div>
                  </div>
                )}
              </Card>

              {/* Langkah 2: Checklist Warga Binaan */}
              <Card style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                      2. Checklist Warga Binaan yang Hadir
                    </h3>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>
                      Centang satu per satu atau gunakan tombol pilih masal
                    </span>
                  </div>

                  {totalWargaTerpilih > 0 && (
                    <span style={{ 
                      fontSize: '12px', 
                      fontWeight: 700, 
                      backgroundColor: 'rgba(59, 130, 246, 0.15)', 
                      color: 'var(--color-primary)', 
                      padding: '4px 10px', 
                      borderRadius: 'var(--radius-full)' 
                    }}>
                      {totalWargaTerpilih} Warga Terpilih
                    </span>
                  )}
                </div>

                {/* Toolbar Filter & Quick Selection */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                  {/* Search Warga */}
                  <div style={{ position: 'relative', flex: '1 1 200px' }}>
                    <Search size={15} color="var(--color-text-light)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder="Cari nama atau ID PLN warga..."
                      value={searchWarga}
                      onChange={(e) => {
                        setSearchWarga(e.target.value);
                        setCurrentPage(1);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 10px 8px 32px',
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
                  <select
                    value={filterDaiChecklist}
                    onChange={(e) => {
                      setFilterDaiChecklist(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: '7px 10px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #cbd5e1',
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      fontSize: '12px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Semua Da'i</option>
                    {mockDai.map(d => (
                      <option key={d.id_dai} value={d.id_dai}>{d.nama}</option>
                    ))}
                  </select>

                  {/* Quick Buttons */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      style={{
                        padding: '6px 10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: 'var(--color-primary)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <CheckSquare size={13} /> Pilih Semua
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAll}
                      style={{
                        padding: '6px 10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        color: 'var(--color-text-light)',
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Square size={13} /> Batal
                    </button>
                  </div>
                </div>

                {/* Grid Checklist Warga */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                  {paginatedWarga.length > 0 ? (
                    paginatedWarga.map((warga) => {
                      const isChecked = !!wargaChecked[warga.id_warga];
                      return (
                        <div 
                          key={warga.id_warga}
                          onClick={() => handleToggleWarga(warga.id_warga)}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: isChecked ? 'rgba(59, 130, 246, 0.1)' : 'var(--color-surface)',
                            border: `1.5px solid ${isChecked ? 'var(--color-primary)' : 'rgba(0,0,0,0.08)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: isChecked ? 'var(--shadow-sm)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '50%', 
                              backgroundColor: isChecked ? 'var(--color-primary)' : 'rgba(0,0,0,0.06)',
                              color: isChecked ? 'white' : 'var(--color-text)',
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '12px'
                            }}>
                              {warga.nama.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '13px', color: isChecked ? 'var(--color-primary)' : 'var(--color-text)' }}>
                                {warga.nama}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                                {warga.id_pelanggan_pln} ({warga.golongan_va} VA)
                              </div>
                            </div>
                          </div>

                          <div style={{ 
                            width: '20px', 
                            height: '20px', 
                            borderRadius: '5px', 
                            border: `2px solid ${isChecked ? 'var(--color-primary)' : '#cbd5e1'}`,
                            backgroundColor: isChecked ? 'var(--color-primary)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                          }}>
                            {isChecked && <CheckCircle size={14} color="#fff" />}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ gridColumn: '1 / -1', padding: '24px', textAlign: 'center', color: 'var(--color-text-light)', fontSize: '13px' }}>
                      Tidak ada warga binaan yang cocok dengan pencarian.
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      style={{
                        padding: '6px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        backgroundColor: 'var(--color-bg)',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        opacity: currentPage === 1 ? 0.4 : 1,
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                    >
                      <ChevronLeft size={14} /> Prev
                    </button>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-light)' }}>
                      Halaman {currentPage} dari {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: '6px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        backgroundColor: 'var(--color-bg)',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        opacity: currentPage === totalPages ? 0.4 : 1,
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </Card>

              {/* Submit Button */}
              <Button 
                fullWidth 
                style={{ padding: '16px', fontSize: '15px', borderRadius: 'var(--radius-md)' }}
                onClick={handleSaveLama}
                disabled={!selectedAmaliyah || totalWargaTerpilih === 0}
              >
                <Save size={18} />
                Simpan & Salurkan Poin Amaliyah ({totalWargaTerpilih} Warga Terpilih)
              </Button>
            </>
          ) : (
            /* TAB 2: FORM WARGA BARU */
            <>
              {isSavedBaru && (
                <Card style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle color="var(--color-primary)" size={24} />
                  <div>
                    <div style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '15px' }}>
                      Warga Binaan Baru Berhasil Didaftarkan!
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-light)' }}>
                      Data spasial geotagging dan sambungan PLN telah tersimpan di sistem SIMDDII.
                    </span>
                  </div>
                </Card>
              )}

              <Card style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--color-text)' }}>
                  Informasi Identitas & Sambungan PLN Warga
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <Input 
                    label="Nama Lengkap Warga" 
                    placeholder="Contoh: Bapak Ahmad Fauzi"
                    value={namaBaru}
                    onChange={(e) => setNamaBaru(e.target.value)}
                  />
                  <Input 
                    label="Nomor Induk Kependudukan (NIK)" 
                    type="number"
                    placeholder="16 digit nomor KTP"
                    value={nikBaru}
                    onChange={(e) => setNikBaru(e.target.value)}
                  />
                  <Input 
                    label="ID Pelanggan PLN Prabayar" 
                    placeholder="12 digit nomor meteran PLN"
                    value={plnBaru}
                    onChange={(e) => setPlnBaru(e.target.value)}
                  />
                  <Select 
                    label="Golongan Daya Listrik"
                    options={[
                      { value: '450', label: '450 VA (Subsidi Penuh)' },
                      { value: '900', label: '900 VA (Subsidi Terbatas)' }
                    ]}
                    value={dayaBaru}
                    onChange={(e) => setDayaBaru(e.target.value)}
                  />
                  <Select 
                    label="Da'i Pembimbing Wilayah"
                    options={mockDai.map(d => ({ value: d.id_dai, label: `${d.nama} (${d.regional})` }))}
                    value={daiBaru}
                    onChange={(e) => setDaiBaru(e.target.value)}
                  />
                  <Input 
                    label="Pekerjaan / Aktivitas Harian" 
                    placeholder="Contoh: Petani / Wiraswasta"
                    value={pekerjaanBaru}
                    onChange={(e) => setPekerjaanBaru(e.target.value)}
                  />
                  <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>Alamat Lengkap</label>
                    <textarea
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #cbd5e1',
                        backgroundColor: 'var(--color-bg)',
                        color: 'var(--color-text)',
                        outline: 'none',
                        fontSize: '13px',
                        fontFamily: 'var(--font-family)',
                        minHeight: '80px',
                        resize: 'vertical'
                      }}
                      placeholder="Nama dusun, RT/RW, dan patokan rumah warga"
                      value={alamatBaru}
                      onChange={(e) => setAlamatBaru(e.target.value)}
                    />
                  </div>
                </div>
              </Card>

              {/* Titik Lokasi Geotagging Peta */}
              <Card style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                      Penentuan Titik Lokasi Rumah (Geotagging)
                    </h3>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>
                      Klik pada peta untuk menancapkan pin lokasi koordinat GPS rumah warga
                    </span>
                  </div>
                  {mapPosition && (
                    <span style={{ fontSize: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#059669', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                      ✓ Titik Koordinat Terkunci
                    </span>
                  )}
                </div>

                <div style={{ height: '240px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                  <MapContainer 
                    center={[-6.9147, 107.6098]} 
                    zoom={9} 
                    style={{ height: '100%', width: '100%', zIndex: 0 }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={mapPosition} setPosition={setMapPosition} />
                  </MapContainer>
                </div>

                {mapPosition && (
                  <div style={{ marginTop: '12px', display: 'flex', gap: '16px', backgroundColor: 'var(--color-bg)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px dashed #cbd5e1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={15} color="var(--color-primary)" />
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>Lat: {mapPosition.lat.toFixed(6)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Navigation size={15} color="var(--color-accent)" />
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>Lng: {mapPosition.lng.toFixed(6)}</span>
                    </div>
                  </div>
                )}
              </Card>

              {/* Submit Button */}
              <Button 
                fullWidth 
                style={{ padding: '16px', fontSize: '15px', borderRadius: 'var(--radius-md)' }}
                onClick={handleSaveBaru}
                disabled={!namaBaru || !nikBaru || !mapPosition}
              >
                <UserPlus size={18} />
                Simpan & Daftarkan Warga Binaan Baru
              </Button>
            </>
          )}

        </div>

        {/* KOLOM KANAN: LIVE SUMMARY KALKULATOR POIN & ACTIVITY FEED TERKINI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Widget 1: Live Kalkulasi & Estimasi Poin Masal */}
          <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="var(--color-accent)" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--color-text)' }}>
                  Kalkulator Poin Real-time
                </h3>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#059669', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '8px' }}>
                Simulasi Otomatis
              </span>
            </div>

            <div style={{ 
              backgroundColor: 'var(--color-bg)', 
              borderRadius: 'var(--radius-md)', 
              padding: '14px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px',
              fontSize: '13px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-light)' }}>Kegiatan Amaliyah:</span>
                <strong style={{ color: 'var(--color-text)', textAlign: 'right' }}>
                  {amaliyahObj?.nama || 'Belum dipilih'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-light)' }}>Poin per Jiwa:</span>
                <strong style={{ color: 'var(--color-accent)' }}>
                  +{amaliyahObj?.poin || 0} Pts
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-light)' }}>Warga Terchecklist:</span>
                <strong style={{ color: 'var(--color-primary)' }}>
                  {totalWargaTerpilih} Orang
                </strong>
              </div>
            </div>

            {/* Total Highlight */}
            <div style={{ 
              padding: '14px', 
              borderRadius: 'var(--radius-md)', 
              backgroundColor: 'rgba(59, 130, 246, 0.08)', 
              border: '1px solid rgba(59, 130, 246, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-light)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Total Poin Dihasilkan
                </span>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px' }}>
                  +{totalEstimasiPoin.toLocaleString()} <span style={{ fontSize: '12px' }}>Pts</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-light)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Setara Rupiah
                </span>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                  Rp {totalEstimasiRupiah.toLocaleString('id-ID')}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-accent)', fontWeight: 500 }}>
                  ~{totalEstimasiKwh} kWh Energi
                </div>
              </div>
            </div>
          </Card>

          {/* Widget 2: Riwayat Setoran Terkini (Activity Feed Da'i) */}
          <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="var(--color-primary)" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--color-text)' }}>
                  Riwayat Setoran Terkini
                </h3>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                5 Transaksi Terbaru
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentTransactions.map((trx) => (
                <div 
                  key={trx.id_trx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid rgba(0,0,0,0.04)',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                      {trx.wargaNama}
                    </div>
                    <div style={{ color: 'var(--color-text-light)', fontSize: '11px' }}>
                      {trx.amaliyahNama} • {trx.tanggal}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-accent)' }}>
                      +{trx.poin} Pts
                    </div>
                    <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 600 }}>
                      +{trx.kwh_meter} kWh
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Widget 3: Panduan SOP Verifikasi Lapangan Da'i */}
          <Card style={{ padding: '16px', backgroundColor: 'var(--color-surface)', border: 'var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShieldCheck size={16} color="#059669" />
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>
                Panduan Verifikasi Da'i Lapangan
              </h4>
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--color-text-light)', lineHeight: '1.6' }}>
              <li>Pastikan ibadah sholat 5 waktu disetor berdasarkan absensi jamaah di masjid/musholla desa.</li>
              <li>Kegiatan tadarus tilawah diverifikasi minimal capaian 1 juz.</li>
              <li>Poin yang diverifikasi otomatis langsung menambah kuota token listrik warga binaan.</li>
            </ul>
          </Card>

        </div>

      </div>

    </div>
  );
};
