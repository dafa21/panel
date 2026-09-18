import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { type PvOffGrid } from '../db_mock';
import { compressImage } from '../utils/imageCompressor';
import { 
  MapPin, 
  Save, 
  CheckCircle, 
  Navigation, 
  Sun, 
  Home, 
  Zap, 
  Sparkles, 
  Compass,
  Activity,
  ShieldCheck,
  FileSpreadsheet,
  Users,
  Coins,
  Eye,
  Edit3,
  Trash2,
  RotateCcw,
  Plus,
  Image as ImageIcon,
  Check,
  UploadCloud,
  Camera
} from 'lucide-react';
import { useLpj } from '../context/LpjContext';
import { usePv } from '../context/PvContext';
import { PvDetailModal } from '../components/PvDetailModal';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const defaultIcon = new L.Icon({
  iconUrl: '/pv-marker.png',
  iconSize: [46, 35],
  iconAnchor: [23, 35],
  popupAnchor: [0, -35],
  className: 'pv-map-marker',
});

// Helper component untuk update posisi marker saat klik peta
const MapClickHandler = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
    },
  });
  return null;
};

const PRESET_PHOTOS = [
  { url: '/pv-photos/rooftop-1.jpg', title: 'Panel Rooftop Balai Desa', desc: 'Panel terpasang di atap komunal desa' },
  { url: '/pv-photos/battery-1.jpg', title: 'Sentral Baterai & Inverter', desc: 'Rak Baterai LiFePO4 & Inverter Hybrid' },
  { url: '/pv-photos/ground-1.jpg', title: 'Array Microgrid Tanah Sawah', desc: 'Instalasi panel surya ground mount terintegrasi' },
  { url: '/pv-photos/meter-1.jpg', title: 'Smart Meter Prabayar Warga', desc: 'Meteran digital kWh distribusi ke rumah' }
];

export const Settings: React.FC = () => {
  const location = useLocation();
  const { 
    pvList, 
    addPv, 
    updatePv, 
    deletePv, 
    resetPvList, 
    isDetailModalOpen, 
    selectedPv, 
    openDetailModal, 
    closeDetailModal 
  } = usePv();

  // Mode Edit Titik PV yang sudah ada
  const [editingPvId, setEditingPvId] = useState<string | null>(null);

  // 1. Identitas & Deskripsi
  const [namaLokasi, setNamaLokasi] = useState('');
  const [detailLokasi, setDetailLokasi] = useState('');
  const [statusOperasional, setStatusOperasional] = useState<'Optimal' | 'Pemeliharaan' | 'Siaga'>('Optimal');
  const [tanggalPeresmian, setTanggalPeresmian] = useState('Januari 2026');

  // 2. Geotagging & Alamat Rinci
  const [manualLat, setManualLat] = useState<string>('-6.950000');
  const [manualLng, setManualLng] = useState<string>('107.500000');
  const [alamatLengkap, setAlamatLengkap] = useState('');
  const [dusun, setDusun] = useState('');
  const [desa, setDesa] = useState('');
  const [kecamatan, setKecamatan] = useState('');
  const [kabupaten, setKabupaten] = useState('');
  const [provinsi, setProvinsi] = useState('Jawa Barat');
  const [kodePos, setKodePos] = useState('');

  // 3. Spesifikasi Teknis Energi & Baterai
  const [totalKwh, setTotalKwh] = useState('20');
  const [kapasitasWp, setKapasitasWp] = useState('8000');
  const [kapasitasBateraiKwh, setKapasitasBateraiKwh] = useState('16');
  const [jenisBaterai, setJenisBaterai] = useState('Lithium Iron Phosphate (LiFePO4) 48V');
  const [inverterSpec, setInverterSpec] = useState('Hybrid Pure Sine Wave 6 kW Smart Grid');
  const [ketahanan, setKetahanan] = useState('24');
  const [satuanKetahanan, setSatuanKetahanan] = useState<'Jam' | 'Hari'>('Jam');
  const [rataProduksiHarian, setRataProduksiHarian] = useState('26');

  // 4. Penerima Manfaat
  const [jumlahRumah, setJumlahRumah] = useState('40');
  const [jumlahKk, setJumlahKk] = useState('38');
  const [jumlahJiwa, setJumlahJiwa] = useState('152');
  const [kwPerRumah, setKwPerRumah] = useState('0.5');

  // 5. Integrasi Amaliyah & Token
  const [namaDai, setNamaDai] = useState('Ustadz Ahmad');
  const [amaliyahProgressPersen, setAmaliyahProgressPersen] = useState('88.5');
  const [targetAmaliyahBulanan, setTargetAmaliyahBulanan] = useState('800');
  const [amaliyahTercapai, setAmaliyahTercapai] = useState('708');
  const [totalRupiahRedeem, setTotalRupiahRedeem] = useState('210000');
  const [totalKwhTerdistribusi, setTotalKwhTerdistribusi] = useState('71.2');

  // 6. Galeri Foto
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([
    '/pv-photos/rooftop-1.jpg',
    '/pv-photos/battery-1.jpg',
    '/pv-photos/meter-1.jpg'
  ]);
  const [customPhotoInput, setCustomPhotoInput] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSaved, setIsSaved] = useState(false);

  // State Pengaturan Pagu Anggaran & Parameter Keuangan LPJ
  const { budgetConfig, updateBudgetConfig } = useLpj();
  const [lpjPagu, setLpjPagu] = useState<string>(String(budgetConfig.paguAnggaran));
  const [lpjRealisasi, setLpjRealisasi] = useState<string>(String(budgetConfig.realisasiAnggaran));
  const [lpjKwh, setLpjKwh] = useState<string>(String(budgetConfig.targetKwh));
  const [lpjBiayaJiwa, setLpjBiayaJiwa] = useState<string>(String(budgetConfig.biayaPerJiwa));
  const [lpjStatusAudit, setLpjStatusAudit] = useState<string>(budgetConfig.statusAudit);
  const [isLpjSaved, setIsLpjSaved] = useState<boolean>(false);

  // Muat data ke formulir untuk mode edit
  const handleEditPv = (pv: PvOffGrid) => {
    setEditingPvId(pv.id_pv);
    setNamaLokasi(pv.nama_lokasi);
    setDetailLokasi(pv.detail);
    setStatusOperasional(pv.status_operasional || 'Optimal');
    setTanggalPeresmian(pv.tanggal_peresmian || 'Januari 2026');
    setManualLat(String(pv.latitude));
    setManualLng(String(pv.longitude));
    setAlamatLengkap(pv.alamat_lengkap || '');
    setDusun(pv.dusun || '');
    setDesa(pv.desa || '');
    setKecamatan(pv.kecamatan || '');
    setKabupaten(pv.kabupaten || '');
    setProvinsi(pv.provinsi || 'Jawa Barat');
    setKodePos(pv.kode_pos || '');
    setTotalKwh(String(pv.total_kwh));
    setKapasitasWp(String(pv.kapasitas_wp || pv.total_kwh * 400));
    setKapasitasBateraiKwh(String(pv.kapasitas_baterai_kwh || Math.round(pv.total_kwh * 0.8)));
    setJenisBaterai(pv.jenis_baterai || 'Lithium Iron Phosphate (LiFePO4) 48V');
    setInverterSpec(pv.inverter_spec || 'Pure Sine Wave Hybrid 10 kW');
    setKetahanan(String(pv.ketahanan));
    setSatuanKetahanan(pv.satuan_ketahanan || 'Jam');
    setRataProduksiHarian(String(pv.rata_produksi_harian_kwh || 35));
    setJumlahRumah(String(pv.jumlah_rumah));
    setJumlahKk(String(pv.jumlah_kk || Math.round(pv.jumlah_rumah * 0.95)));
    setJumlahJiwa(String(pv.jumlah_jiwa || Math.round(pv.jumlah_rumah * 3.8)));
    setKwPerRumah(String(pv.kw_per_rumah || 0.5));
    setNamaDai(pv.nama_dai || 'Ustadz Pembina');
    setAmaliyahProgressPersen(String(pv.amaliyah_progress_persen || 88.5));
    setTargetAmaliyahBulanan(String(pv.target_amaliyah_bulanan || 1000));
    setAmaliyahTercapai(String(pv.amaliyah_tercapai || 885));
    setTotalRupiahRedeem(String(pv.total_rupiah_redeem || 250000));
    setTotalKwhTerdistribusi(String(pv.total_kwh_terdistribusi || 85));
    setSelectedPhotos(pv.galeri_foto && pv.galeri_foto.length > 0 ? pv.galeri_foto : ['/pv-photos/rooftop-1.jpg']);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const resetForm = () => {
    setNamaLokasi('');
    setDetailLokasi('');
    setStatusOperasional('Optimal');
    setTanggalPeresmian('2026');
    setManualLat('-6.950000');
    setManualLng('107.500000');
    setAlamatLengkap('');
    setDusun('');
    setDesa('');
    setKecamatan('');
    setKabupaten('');
    setProvinsi('Jawa Barat');
    setKodePos('');
    setTotalKwh('20');
    setKapasitasWp('8000');
    setKapasitasBateraiKwh('16');
    setKetahanan('24');
    setSatuanKetahanan('Jam');
    setRataProduksiHarian('26');
    setJumlahRumah('40');
    setJumlahKk('38');
    setJumlahJiwa('152');
    setKwPerRumah('0.5');
    setNamaDai('Ustadz Ahmad');
    setAmaliyahProgressPersen('88.5');
    setTargetAmaliyahBulanan('800');
    setAmaliyahTercapai('708');
    setTotalRupiahRedeem('210000');
    setTotalKwhTerdistribusi('71.2');
    setSelectedPhotos(['/pv-photos/rooftop-1.jpg', '/pv-photos/battery-1.jpg']);
  };

  const handleCancelEdit = () => {
    setEditingPvId(null);
    resetForm();
  };

  // Cek jika navigasi membawa parameter editPvId dari Dashboard
  useEffect(() => {
    if (location.state && (location.state as any).editPvId) {
      const targetPv = pvList.find(p => p.id_pv === (location.state as any).editPvId);
      if (targetPv) {
        handleEditPv(targetPv);
      }
    }
  }, [location.state, pvList]);

  const handleSaveLpjBudget = () => {
    updateBudgetConfig({
      paguAnggaran: Number(lpjPagu) || 150000000,
      realisasiAnggaran: Number(lpjRealisasi) || 112500000,
      targetKwh: Number(lpjKwh) || 1250,
      biayaPerJiwa: Number(lpjBiayaJiwa) || 37500,
      statusAudit: lpjStatusAudit
    });
    setIsLpjSaved(true);
    setTimeout(() => setIsLpjSaved(false), 3000);
  };

  // 1. Hitung Metrik Dashboard PV Nasional
  const totalTitik = pvList.length;
  const totalKwhKapasitas = pvList.reduce((sum, p) => sum + p.total_kwh, 0);
  const totalRumahCovered = pvList.reduce((sum, p) => sum + p.jumlah_rumah, 0);
  const totalJiwaCovered = pvList.reduce((sum, p) => sum + (p.jumlah_jiwa || Math.round(p.jumlah_rumah * 3.8)), 0);

  // Validasi koordinat numerik
  const parsedLat = parseFloat(manualLat);
  const parsedLng = parseFloat(manualLng);
  const isValidCoord = !isNaN(parsedLat) && !isNaN(parsedLng);
  const mapCenter: [number, number] = isValidCoord ? [parsedLat, parsedLng] : [-6.950000, 107.500000];

  // Callback jika user klik pada peta Leaflet
  const handleMapSelect = (lat: number, lng: number) => {
    setManualLat(lat.toFixed(6));
    setManualLng(lng.toFixed(6));
  };

  const togglePhotoSelection = (url: string) => {
    setSelectedPhotos(prev => 
      prev.includes(url) 
        ? (prev.length > 1 ? prev.filter(p => p !== url) : prev) 
        : [...prev, url]
    );
  };

  const handleRemovePhoto = (urlToRemove: string) => {
    if (selectedPhotos.length <= 1) {
      alert('Setiap wilayah minimal harus memiliki 1 foto dokumentasi.');
      return;
    }
    setSelectedPhotos(prev => prev.filter(p => p !== urlToRemove));
  };

  // Handler Upload Foto dari Komputer / HP
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhoto(true);
    setUploadFeedback(null);

    const newCompressedPhotos: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const compressed = await compressImage(files[i]);
        newCompressedPhotos.push(compressed);
      } catch (err) {
        console.error('Gagal mengompres foto:', err);
      }
    }

    if (newCompressedPhotos.length > 0) {
      setSelectedPhotos(prev => [...newCompressedPhotos, ...prev]);
      setUploadFeedback(`✓ ${newCompressedPhotos.length} foto berhasil diunggah & tersimpan untuk wilayah ini!`);
      setTimeout(() => setUploadFeedback(null), 4000);
    }

    setIsUploadingPhoto(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddCustomPhoto = () => {
    if (!customPhotoInput.trim()) return;
    if (!selectedPhotos.includes(customPhotoInput.trim())) {
      setSelectedPhotos(prev => [...prev, customPhotoInput.trim()]);
    }
    setCustomPhotoInput('');
  };

  // Simpan data PV (Baru atau Update)
  const handleSave = () => {
    if (!namaLokasi || !isValidCoord || !totalKwh || !ketahanan || !jumlahRumah) return;

    const rumahNum = Number(jumlahRumah) || 30;
    const kkNum = Number(jumlahKk) || Math.round(rumahNum * 0.95);
    const jiwaNum = Number(jumlahJiwa) || Math.round(rumahNum * 3.8);
    const totalKwhNum = Number(totalKwh) || 15;
    const batKwhNum = Number(kapasitasBateraiKwh) || Math.round(totalKwhNum * 0.8);
    const rupiahRedeemNum = Number(totalRupiahRedeem) || 250000;
    const progressNum = Number(amaliyahProgressPersen) || 88.5;

    const pvDataPayload: Partial<PvOffGrid> = {
      nama_lokasi: namaLokasi,
      detail: detailLokasi || 'Instalasi sistem surya mandiri komunal untuk warga binaan dakwah.',
      latitude: parsedLat,
      longitude: parsedLng,
      alamat_lengkap: alamatLengkap || `${namaLokasi}, ${dusun || ''}, Desa ${desa || ''}, Kec. ${kecamatan || ''}, ${kabupaten || ''}, ${provinsi || ''}`,
      dusun: dusun || namaLokasi,
      desa: desa || 'Desa Binaan',
      kecamatan: kecamatan || 'Kecamatan Binaan',
      kabupaten: kabupaten || 'Kabupaten',
      provinsi: provinsi || 'Indonesia',
      kode_pos: kodePos || '00000',
      total_kwh: totalKwhNum,
      kapasitas_wp: Number(kapasitasWp) || (totalKwhNum * 400),
      kapasitas_baterai_kwh: batKwhNum,
      jenis_baterai: jenisBaterai,
      inverter_spec: inverterSpec,
      ketahanan: Number(ketahanan) || 24,
      satuan_ketahanan: satuanKetahanan,
      rata_produksi_harian_kwh: Number(rataProduksiHarian) || (totalKwhNum * 1.3),
      jumlah_rumah: rumahNum,
      jumlah_kk: kkNum,
      jumlah_jiwa: jiwaNum,
      kw_per_rumah: Number(kwPerRumah) || 0.5,
      id_dai_pembina: 'D01',
      nama_dai: namaDai || 'Ustadz Pembina Wilayah',
      amaliyah_progress_persen: progressNum,
      target_amaliyah_bulanan: Number(targetAmaliyahBulanan) || 1000,
      amaliyah_tercapai: Number(amaliyahTercapai) || Math.round(1000 * (progressNum / 100)),
      total_rupiah_redeem: rupiahRedeemNum,
      total_poin_terkonversi: rupiahRedeemNum,
      total_kwh_terdistribusi: Number(totalKwhTerdistribusi) || Math.round(rupiahRedeemNum / 2950),
      galeri_foto: selectedPhotos.length > 0 ? selectedPhotos : ['/pv-photos/rooftop-1.jpg'],
      tanggal_peresmian: tanggalPeresmian || '2026',
      status_operasional: statusOperasional,
      tingkat_kesehatan: 99.2,
      reduksi_co2_kg: Math.round(totalKwhNum * 35.6),
      penghematan_bbm_liter: Math.round(totalKwhNum * 12.8),
      catatan_maintenance: 'Sistem off-grid terpantau beroperasi stabil & efisiensi daya optimal.',
      tanggal_maintenance_terakhir: 'September 2026'
    };

    if (editingPvId) {
      updatePv(editingPvId, pvDataPayload);
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        setEditingPvId(null);
        resetForm();
      }, 2000);
    } else {
      const newId = `PV${String(pvList.length + 1).padStart(3, '0')}`;
      addPv({
        id_pv: newId,
        ...pvDataPayload as any
      });
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        resetForm();
      }, 2000);
    }
  };

  // Kalkulasi rasio beban instalasi baru
  const estimasiBebanKw = useMemo(() => {
    const rumah = parseFloat(jumlahRumah) || 0;
    const kw = parseFloat(kwPerRumah) || 0;
    return Number((rumah * kw).toFixed(1));
  }, [jumlahRumah, kwPerRumah]);

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
            <Sparkles size={18} color="#10b981" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              SIMDDII Renewable Solar Energy & Grid Infrastructure
            </span>
          </div>
          <h1 className="responsive-header-title">
            Pengaturan & Pemantauan PV Off-Grid
          </h1>
          <p style={{ margin: '2px 0 0 0', color: 'var(--color-text-light)', fontSize: '13px' }}>
            Manajemen titik pembangkit surya komunal, foto instalasi, integrasi amaliyah warga, dan kuota energi
          </p>
        </div>

        {/* Status Sistem Grid & Reset Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            backgroundColor: 'var(--color-surface)', 
            padding: '6px 12px', 
            borderRadius: 'var(--radius-md)',
            border: 'var(--glass-border)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
            <Activity size={15} color="#059669" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)' }}>
              Status Grid: <strong style={{ color: '#059669' }}>100% Normal</strong>
            </span>
          </div>

          <button
            onClick={() => {
              if (confirm('Kembalikan armada titik PV ke preset data bawaan?')) {
                resetPvList();
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #cbd5e1',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-light)',
              fontSize: '12px',
              cursor: 'pointer'
            }}
            title="Reset armada ke data awal"
          >
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </div>

      {/* 2. DASHBOARD KPI INFRASTRUKTUR PV NASIONAL */}
      <div className="kpi-grid">
        {/* Titik Pembangkit */}
        <Card style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }} className="card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
              Titik Pembangkit PV
            </span>
            <div style={{ padding: '5px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <Sun size={15} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#059669' }}>
              {totalTitik} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-light)' }}>Lokasi</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-light)', marginTop: '2px' }}>
              Pembangkit surya komunal
            </div>
          </div>
        </Card>

        {/* Total Kapasitas kWh */}
        <Card style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }} className="card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
              Kapasitas Terpasang
            </span>
            <div style={{ padding: '5px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.12)', color: 'var(--color-primary)' }}>
              <Zap size={15} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-primary)' }}>
              {totalKwhKapasitas} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-light)' }}>kWh</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-light)', marginTop: '2px' }}>
              Akumulasi energi pembangkit
            </div>
          </div>
        </Card>

        {/* Rumah Tercover */}
        <Card style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }} className="card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
              Rumah Tercover
            </span>
            <div style={{ padding: '5px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: 'var(--color-accent)' }}>
              <Home size={15} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-accent)' }}>
              {totalRumahCovered} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-light)' }}>Rumah</span>
            </div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
              Aliran listrik mandiri
            </div>
          </div>
        </Card>

        {/* Jiwa / Penerima Manfaat */}
        <Card style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }} className="card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
              Jiwa Penerima Manfaat
            </span>
            <div style={{ padding: '5px', borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
              <Users size={15} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#7c3aed' }}>
              {totalJiwaCovered} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-light)' }}>Jiwa</span>
            </div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
              Warga & santri terbantu
            </div>
          </div>
        </Card>
      </div>

      {/* 3. TATA LETAK 2 KOLOM (FORMULIR LENGKAP & ARMADA PV) */}
      <div className="responsive-two-col">
        
        {/* KOLOM KIRI: FORM REGISTRASI / EDIT INSTALASI PV */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Banner Status Edit */}
          {editingPvId && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              border: '1.5px solid var(--color-primary)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={18} color="var(--color-primary)" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)' }}>
                  Sedang Mengedit Titik PV: {editingPvId} - {namaLokasi}
                </span>
              </div>
              <button
                onClick={handleCancelEdit}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  border: '1px solid #cbd5e1',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Batal Edit (Ganti Tambah Baru)
              </button>
            </div>
          )}

          {isSaved && (
            <Card style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle color="#059669" size={24} />
              <div>
                <div style={{ color: '#059669', fontWeight: 700, fontSize: '15px' }}>
                  {editingPvId ? 'Perubahan Data PV Berhasil Disimpan!' : 'Instalasi PV Baru Berhasil Ditambahkan!'}
                </div>
                <span style={{ fontSize: '13px', color: '#065f46' }}>
                  Titik koordinat, galeri foto, spesifikasi kWh, dan data amaliyah telah tersinkronisasi ke Peta GIS.
                </span>
              </div>
            </Card>
          )}

          {/* 1. Identitas Lokasi & Nama Desa */}
          <Card style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="var(--color-primary)" />
                1. Identitas & Status Instalasi PV
              </h3>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
                {editingPvId ? 'Edit Data Terpasang' : 'Pembangkit Baru'}
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Input 
                label="Nama Lokasi / Proyek PV" 
                placeholder="Misal: Dusun Teratai Indah / Balai Desa Sukamaju"
                value={namaLokasi}
                onChange={(e) => setNamaLokasi(e.target.value)}
              />
              
              <div className="responsive-grid-2">
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '4px' }}>
                    Status Operasional Sistem
                  </label>
                  <select
                    value={statusOperasional}
                    onChange={(e) => setStatusOperasional(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #cbd5e1',
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      fontSize: '13px',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  >
                    <option value="Optimal">Optimal (100% Beroperasi Normal)</option>
                    <option value="Pemeliharaan">Pemeliharaan (Pembersihan / Servis)</option>
                    <option value="Siaga">Siaga (Cuaca Ekstrem / Backup)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '4px' }}>
                    Tanggal / Bulan Peresmian
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Februari 2026"
                    value={tanggalPeresmian}
                    onChange={(e) => setTanggalPeresmian(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #cbd5e1',
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      fontSize: '13px',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>Detail Medan & Deskripsi Proyek</label>
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
                    minHeight: '70px',
                    resize: 'vertical'
                  }}
                  placeholder="Catatan instalasi, medan lokasi balai desa, integrasi microgrid, penanggung jawab lapangan..."
                  value={detailLokasi}
                  onChange={(e) => setDetailLokasi(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* 2. Titik Koordinat Manual Latitude & Longitude & Alamat Detail */}
          <Card style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Compass size={18} color="#059669" />
                  2. Alamat Rinci & Koordinat Geotagging
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>
                  Ketik koordinat latitude/longitude manual atau klik langsung titik pada peta
                </span>
              </div>
              <span style={{ 
                fontSize: '11px', 
                fontWeight: 700, 
                backgroundColor: 'rgba(16, 185, 129, 0.15)', 
                color: '#059669', 
                padding: '3px 8px', 
                borderRadius: '8px' 
              }}>
                Bisa Ketik Manual
              </span>
            </div>

            {/* Input Manual Lat & Lng Box */}
            <div 
              className="responsive-grid-2"
              style={{ 
                padding: '12px', 
                backgroundColor: 'var(--color-bg)', 
                borderRadius: 'var(--radius-md)',
                border: '1.5px dashed #cbd5e1',
                marginBottom: '14px'
              }}
            >
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <Navigation size={13} color="var(--color-primary)" /> Latitude (Garis Lintang):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: -6.950000"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #cbd5e1',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    fontSize: '13px',
                    fontWeight: 600,
                    outline: 'none',
                    fontFamily: 'monospace'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <Navigation size={13} color="var(--color-accent)" /> Longitude (Garis Bujur):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 107.500000"
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #cbd5e1',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    fontSize: '13px',
                    fontWeight: 600,
                    outline: 'none',
                    fontFamily: 'monospace'
                  }}
                />
              </div>
            </div>

            {/* Input Alamat Rinci */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '3px' }}>
                  Alamat Lengkap (Jalan, RT/RW, Dusun):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Pasir Wangi No. 45, RT 02/RW 03, Dusun 3"
                  value={alamatLengkap}
                  onChange={(e) => setAlamatLengkap(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #cbd5e1',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-light)', display: 'block', marginBottom: '2px' }}>Dusun</label>
                  <input
                    type="text"
                    placeholder="Dusun 3"
                    value={dusun}
                    onChange={(e) => setDusun(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'var(--color-bg)', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-light)', display: 'block', marginBottom: '2px' }}>Desa / Kelurahan</label>
                  <input
                    type="text"
                    placeholder="Sukamaju"
                    value={desa}
                    onChange={(e) => setDesa(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'var(--color-bg)', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-light)', display: 'block', marginBottom: '2px' }}>Kecamatan</label>
                  <input
                    type="text"
                    placeholder="Cililin"
                    value={kecamatan}
                    onChange={(e) => setKecamatan(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'var(--color-bg)', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-light)', display: 'block', marginBottom: '2px' }}>Kab / Kota</label>
                  <input
                    type="text"
                    placeholder="Bandung Barat"
                    value={kabupaten}
                    onChange={(e) => setKabupaten(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'var(--color-bg)', fontSize: '12px' }}
                  />
                </div>
              </div>
            </div>

            {/* Peta Interaktif Sinkronisasi */}
            <div style={{ height: '200px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
              <MapContainer 
                center={mapCenter} 
                zoom={6} 
                style={{ height: '100%', width: '100%', zIndex: 0 }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onLocationSelect={handleMapSelect} />
                {isValidCoord && (
                  <Marker position={[parsedLat, parsedLng]} icon={defaultIcon} />
                )}
              </MapContainer>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-light)', marginTop: '6px', fontStyle: 'italic' }}>
              * Tip: Klik pada peta otomatis mengisi kolom input manual Latitude & Longitude di atas.
            </div>
          </Card>

          {/* 3. Spesifikasi Teknis Off-Grid & Baterai */}
          <Card style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="#f59e0b" />
              3. Spesifikasi Teknis Sistem Off-Grid & Baterai
            </h3>
            
            <div className="responsive-grid-2">
              {/* Total Kapasitas kWh */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '4px' }}>
                  Total Kapasitas Pembangkit (kWh)
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 50"
                  value={totalKwh}
                  onChange={(e) => setTotalKwh(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', backgroundColor: 'var(--color-bg)', fontSize: '13px', fontWeight: 600 }}
                />
              </div>

              {/* Kapasitas Peak Watt (Wp) */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '4px' }}>
                  Kapasitas Panel Peak (Wp)
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 18500"
                  value={kapasitasWp}
                  onChange={(e) => setKapasitasWp(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', backgroundColor: 'var(--color-bg)', fontSize: '13px', fontWeight: 600 }}
                />
              </div>

              {/* Kapasitas Baterai kWh */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '4px' }}>
                  Kapasitas Bank Baterai (kWh)
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 42"
                  value={kapasitasBateraiKwh}
                  onChange={(e) => setKapasitasBateraiKwh(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', backgroundColor: 'var(--color-bg)', fontSize: '13px', fontWeight: 600 }}
                />
              </div>

              {/* Ketahanan Sistem */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '4px' }}>
                  Ketahanan Cadangan Baterai
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="number"
                    placeholder="Contoh: 24"
                    value={ketahanan}
                    onChange={(e) => setKetahanan(e.target.value)}
                    style={{ flex: 1, padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', backgroundColor: 'var(--color-bg)', fontSize: '13px', fontWeight: 600 }}
                  />
                  <select
                    value={satuanKetahanan}
                    onChange={(e) => setSatuanKetahanan(e.target.value as any)}
                    style={{ padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', backgroundColor: 'var(--color-bg)', fontSize: '13px', fontWeight: 600 }}
                  >
                    <option value="Jam">Jam</option>
                    <option value="Hari">Hari</option>
                  </select>
                </div>
              </div>

              {/* Jenis Baterai */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '4px' }}>
                  Jenis Baterai Penyimpanan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Lithium Iron Phosphate (LiFePO4)"
                  value={jenisBaterai}
                  onChange={(e) => setJenisBaterai(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', backgroundColor: 'var(--color-bg)', fontSize: '13px' }}
                />
              </div>

              {/* Model Inverter */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '4px' }}>
                  Model Inverter Pembangkit
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Hybrid Pure Sine Wave 20 kW"
                  value={inverterSpec}
                  onChange={(e) => setInverterSpec(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', backgroundColor: 'var(--color-bg)', fontSize: '13px' }}
                />
              </div>
            </div>
          </Card>

          {/* 4. Penerima Manfaat & Alokasi Listrik (Orang, Rumah, KK) */}
          <Card style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="var(--color-primary)" />
              4. Penerima Manfaat (Orang, Rumah & KK yang Dibantu)
            </h3>

            <div className="responsive-grid-2">
              {/* Jumlah Orang / Jiwa yang Dibantu */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '4px' }}>
                  Berapa Orang / Jiwa yang Dibantu
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 376"
                  value={jumlahJiwa}
                  onChange={(e) => setJumlahJiwa(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', backgroundColor: 'var(--color-bg)', fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)' }}
                />
              </div>

              {/* Jumlah Rumah yang Dicover */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '4px' }}>
                  Berapa Rumah yang Dicover
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 100"
                  value={jumlahRumah}
                  onChange={(e) => setJumlahRumah(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', backgroundColor: 'var(--color-bg)', fontSize: '13px', fontWeight: 700, color: '#059669' }}
                />
              </div>

              {/* Berapa KK yang Dibantu */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '4px' }}>
                  Berapa KK yang Dibantu (Kepala Keluarga)
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 94"
                  value={jumlahKk}
                  onChange={(e) => setJumlahKk(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', backgroundColor: 'var(--color-bg)', fontSize: '13px', fontWeight: 700, color: 'var(--color-accent)' }}
                />
              </div>

              {/* Jatah Daya per Rumah */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '4px' }}>
                  Alokasi Daya per Rumah (kW)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Contoh: 0.5"
                  value={kwPerRumah}
                  onChange={(e) => setKwPerRumah(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', backgroundColor: 'var(--color-bg)', fontSize: '13px', fontWeight: 600 }}
                />
              </div>
            </div>
          </Card>

          {/* 5. Integrasi Capaian Amaliyah & Nilai Konversi Rupiah Token */}
          <Card style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Coins size={18} color="var(--color-accent)" />
              5. Integrasi Amaliyah & Konversi Rupiah Token
            </h3>

            <div className="responsive-grid-2">
              {/* Da'i Pembina */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '4px' }}>
                  Da'i Pembina Wilayah
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Ustadz Budi"
                  value={namaDai}
                  onChange={(e) => setNamaDai(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', backgroundColor: 'var(--color-bg)', fontSize: '13px', fontWeight: 600 }}
                />
              </div>

              {/* Progres Amaliyah (%) */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '4px' }}>
                  Progres Capaian Amaliyah (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Contoh: 91.2"
                  value={amaliyahProgressPersen}
                  onChange={(e) => setAmaliyahProgressPersen(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', backgroundColor: 'var(--color-bg)', fontSize: '13px', fontWeight: 700, color: '#059669' }}
                />
              </div>

              {/* Rupiah yang Sudah Dikonversi dari Redeem Token Amaliyah */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '4px' }}>
                  Total Rupiah Konversi Redeem Token (Rp)
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 485000"
                  value={totalRupiahRedeem}
                  onChange={(e) => setTotalRupiahRedeem(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', backgroundColor: 'var(--color-bg)', fontSize: '13px', fontWeight: 700, color: 'var(--color-accent)' }}
                />
              </div>

              {/* Total kWh Tersalurkan dari Token */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '4px' }}>
                  Total Kuota kWh Tersalurkan
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Contoh: 165.2"
                  value={totalKwhTerdistribusi}
                  onChange={(e) => setTotalKwhTerdistribusi(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', backgroundColor: 'var(--color-bg)', fontSize: '13px', fontWeight: 600 }}
                />
              </div>
            </div>
          </Card>

          {/* 6. Galeri Gambar-Gambar Panel Surya yang Sudah Dibangun */}
          <Card style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ImageIcon size={18} color="var(--color-primary)" />
                  6. Galeri Foto Panel Surya yang Sudah Dibangun
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>
                  Setiap wilayah memiliki foto dokumentasi masing-masing yang tersimpan di database
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)', backgroundColor: 'rgba(59, 130, 246, 0.12)', padding: '3px 10px', borderRadius: '8px' }}>
                  Wilayah: {namaLokasi || 'Titik Baru'}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '3px 10px', borderRadius: '8px' }}>
                  {selectedPhotos.length} Foto Aktif
                </span>
              </div>
            </div>

            {/* Info Kotak Penjelas Per-Wilayah */}
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(59, 130, 246, 0.06)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              marginBottom: '14px',
              fontSize: '12px',
              color: 'var(--color-text)'
            }}>
              💡 <strong>Foto Tersimpan Khusus Wilayah:</strong> Foto yang diupload atau dipilih di bawah ini terikat khusus dengan <strong>{namaLokasi || 'wilayah ini'}</strong>. Wilayah lain akan memiliki foto masing-masing saat dibuka.
            </div>

            {/* Dropzone Upload Foto dari Perangkat (File Input) */}
            <div 
              style={{
                border: '2px dashed var(--color-primary)',
                borderRadius: '12px',
                padding: '18px 16px',
                textAlign: 'center',
                backgroundColor: isUploadingPhoto ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.03)',
                marginBottom: '16px',
                cursor: isUploadingPhoto ? 'wait' : 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => !isUploadingPhoto && fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                multiple 
                style={{ display: 'none' }} 
                onChange={handleFileUpload} 
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <UploadCloud size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {isUploadingPhoto ? 'Mengompres & Mengunggah Foto...' : 'Upload Foto Lapangan dari Komputer / HP'}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                    Mendukung JPG, PNG, WebP • Otomatis dioptimasi dan disimpan ke database untuk {namaLokasi || 'wilayah ini'}
                  </span>
                </div>
              </div>
            </div>

            {/* Notifikasi Sukses Upload */}
            {uploadFeedback && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#059669',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle size={16} />
                <span>{uploadFeedback}</span>
              </div>
            )}

            {/* Foto yang Saat Ini Terpilih & Terikat dengan Wilayah Ini */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Camera size={14} color="var(--color-primary)" />
                Foto Dokumentasi Terpasang di {namaLokasi || 'Wilayah Ini'} ({selectedPhotos.length}):
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                {selectedPhotos.map((photoUrl, idx) => (
                  <div
                    key={idx}
                    style={{
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '2px solid #10b981',
                      backgroundColor: 'var(--color-bg)',
                      position: 'relative',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                    }}
                  >
                    <div style={{ height: '115px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                      <img 
                        src={photoUrl} 
                        alt={`Foto Wilayah ${idx + 1}`} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/pv-photos/rooftop-1.jpg';
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 700
                      }}>
                        Foto #{idx + 1}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePhoto(photoUrl);
                        }}
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(239, 68, 68, 0.9)',
                          color: 'white',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                        title="Hapus foto ini dari wilayah ini"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div style={{ padding: '6px 8px', fontSize: '11px', color: 'var(--color-text-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#059669' }}>Tersimpan Aktif</span>
                      <span style={{ fontSize: '10px' }}>{photoUrl.startsWith('data:') ? 'Foto Upload' : 'Foto Galeri'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pilihan Tambahan dari Koleksi Preset */}
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '14px', marginBottom: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-light)', marginBottom: '8px' }}>
                Atau pilih dari katalog foto standar terpasang:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                {PRESET_PHOTOS.map((item) => {
                  const isSelected = selectedPhotos.includes(item.url);
                  return (
                    <div
                      key={item.url}
                      onClick={() => togglePhotoSelection(item.url)}
                      style={{
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: isSelected ? '2px solid #10b981' : '1px solid #cbd5e1',
                        backgroundColor: 'var(--color-bg)',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                    >
                      <div style={{ height: '85px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                        <img src={item.url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {isSelected && (
                          <div style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: '#10b981',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Check size={12} />
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '6px 8px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text)' }}>
                          {item.title}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Input URL Foto Tambahan */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Atau masukkan URL foto kustom..."
                value={customPhotoInput}
                onChange={(e) => setCustomPhotoInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #cbd5e1',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '12px'
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomPhoto}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Plus size={14} /> Tambah URL
              </button>
            </div>
          </Card>

          {/* Tombol Simpan / Perbarui */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button 
              fullWidth 
              style={{ 
                padding: '16px', 
                fontSize: '15px', 
                borderRadius: 'var(--radius-md)',
                backgroundColor: editingPvId ? '#059669' : undefined
              }}
              onClick={handleSave}
              disabled={!namaLokasi || !isValidCoord || !totalKwh || !ketahanan || !jumlahRumah}
            >
              <Save size={18} />
              {editingPvId ? 'Simpan Perubahan Spesifikasi Titik PV' : 'Simpan Instalasi PV Off-Grid Baru'}
            </Button>

            {editingPvId && (
              <button
                onClick={handleCancelEdit}
                style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: 'var(--color-text)'
                }}
              >
                Batal
              </button>
            )}
          </div>

        </div>

        {/* KOLOM KANAN: MONITORING ARMADA PV AKTIF & RASIO ENERGI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Widget 1: Monitoring Armada Pembangkit PV Aktif */}
          <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sun size={18} color="#059669" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--color-text)' }}>
                  Armada Pembangkit Terpasang ({pvList.length})
                </h3>
              </div>
              <span style={{ fontSize: '11px', color: '#059669', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '8px', fontWeight: 600 }}>
                Live Database
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pvList.map((pv) => (
                <div 
                  key={pv.id_pv}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg)',
                    border: editingPvId === pv.id_pv ? '2px solid var(--color-primary)' : '1px solid rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-primary)' }}>
                        {pv.nama_lokasi}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                        ID: {pv.id_pv} • Lat: {pv.latitude.toFixed(4)}, Lng: {pv.longitude.toFixed(4)}
                      </span>
                    </div>
                    <span style={{ 
                      fontSize: '10px', 
                      fontWeight: 700, 
                      padding: '2px 6px', 
                      borderRadius: '10px', 
                      backgroundColor: 'rgba(16, 185, 129, 0.15)', 
                      color: '#059669' 
                    }}>
                      ✓ {pv.status_operasional || 'Normal'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', textAlign: 'center', backgroundColor: 'var(--color-surface)', padding: '8px', borderRadius: '6px' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--color-text-light)' }}>Kapasitas</span>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>
                        {pv.total_kwh} <span style={{ fontSize: '10px' }}>kWh</span>
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--color-text-light)' }}>Tercover</span>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#059669' }}>
                        {pv.jumlah_rumah} <span style={{ fontSize: '10px' }}>Rumah</span>
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--color-text-light)' }}>Dibantu</span>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-accent)' }}>
                        {pv.jumlah_jiwa || Math.round(pv.jumlah_rumah * 3.8)} <span style={{ fontSize: '10px' }}>Jiwa</span>
                      </div>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-text-light)', fontStyle: 'italic' }}>
                    "{pv.detail}"
                  </p>

                  {/* Tombol Aksi Armada PV */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                    <button
                      onClick={() => openDetailModal(pv)}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid #cbd5e1',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--color-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Eye size={13} /> Lihat Detail
                    </button>

                    <button
                      onClick={() => handleEditPv(pv)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid #cbd5e1',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--color-text)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Edit3 size={13} /> Edit
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Hapus titik pembangkit ${pv.nama_lokasi} (${pv.id_pv})?`)) {
                          deletePv(pv.id_pv);
                        }
                      }}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#ef4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Widget 2: Kalkulator Rasio Beban Instalasi Baru */}
          <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="var(--color-accent)" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--color-text)' }}>
                Kalkulator Rasio Beban Energi
              </h3>
            </div>

            <div style={{ backgroundColor: 'var(--color-bg)', padding: '12px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-light)' }}>Total Beban Konsumsi:</span>
                <strong style={{ color: 'var(--color-text)' }}>
                  {estimasiBebanKw} kW ({jumlahRumah || 0} Rumah × {kwPerRumah || 0.5} kW)
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-light)' }}>Daya Pembangkit Diinput:</span>
                <strong style={{ color: 'var(--color-primary)' }}>
                  {totalKwh || 0} kWh
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '6px' }}>
                <span style={{ color: 'var(--color-text-light)' }}>Margin Cadangan Baterai:</span>
                <strong style={{ color: '#059669' }}>
                  Optimal ({ketahanan || 0} {satuanKetahanan})
                </strong>
              </div>
            </div>
          </Card>

          {/* Widget 3: Panduan SOP Perawatan Sistem PV */}
          <Card style={{ padding: '16px', backgroundColor: 'var(--color-surface)', border: 'var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShieldCheck size={16} color="#059669" />
              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
                SOP Pemeliharaan Rutin Panel & Baterai
              </h4>
            </div>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: 'var(--color-text-light)', lineHeight: '1.6' }}>
              <li>Bersihkan permukaan modul panel surya dari debu dan dedaunan setiap 2 minggu sekali.</li>
              <li>Periksa konektor MC4 dan kencangkan baut instalasi rangka penyangga.</li>
              <li>Pantau lampu indikator Solar Charge Controller (SCC) dan inverter secara berkala.</li>
            </ul>
          </Card>

          {/* Widget 4: PENGATURAN ANGGARAN & REALISASI LPJ */}
          <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid rgba(5, 150, 105, 0.3)', backgroundColor: 'var(--color-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSpreadsheet size={20} color="#059669" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#059669' }}>
                    Pengaturan Anggaran LPJ Program
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                    Nilai ini otomatis terhubung ke Dashboard & Dokumen PDF LPJ
                  </span>
                </div>
              </div>
              {isLpjSaved && (
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', backgroundColor: '#d1fae5', padding: '2px 8px', borderRadius: '12px' }}>
                  ✓ Tersimpan!
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '3px' }}>
                  Total Pagu Anggaran Program (Rp)
                </label>
                <input
                  type="number"
                  value={lpjPagu}
                  onChange={(e) => setLpjPagu(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', backgroundColor: 'var(--color-bg)', fontSize: '13px', fontWeight: 700, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '3px' }}>
                  Target Realisasi Anggaran (Rp)
                </label>
                <input
                  type="number"
                  value={lpjRealisasi}
                  onChange={(e) => setLpjRealisasi(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', backgroundColor: 'var(--color-bg)', fontSize: '13px', fontWeight: 700, outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '3px' }}>
                    Target Listrik (kWh)
                  </label>
                  <input
                    type="number"
                    value={lpjKwh}
                    onChange={(e) => setLpjKwh(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', backgroundColor: 'var(--color-bg)', fontSize: '13px', fontWeight: 700, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '3px' }}>
                    Biaya per Jiwa (Rp)
                  </label>
                  <input
                    type="number"
                    value={lpjBiayaJiwa}
                    onChange={(e) => setLpjBiayaJiwa(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', backgroundColor: 'var(--color-bg)', fontSize: '13px', fontWeight: 700, outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '3px' }}>
                  Status Opini Audit LPJ
                </label>
                <select
                  value={lpjStatusAudit}
                  onChange={(e) => setLpjStatusAudit(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', backgroundColor: 'var(--color-bg)', fontSize: '12px', outline: 'none', fontWeight: 600, cursor: 'pointer' }}
                >
                  <option value="Wajar Tanpa Pengecualian (WTP) - Terverifikasi Digital">Wajar Tanpa Pengecualian (WTP)</option>
                  <option value="Wajar Dengan Pengecualian (WDP)">Wajar Dengan Pengecualian (WDP)</option>
                  <option value="Dalam Proses Audit Akuntan Publik">Dalam Proses Audit Akuntan Publik</option>
                </select>
              </div>

              <Button
                onClick={handleSaveLpjBudget}
                style={{
                  marginTop: '6px',
                  backgroundColor: '#059669',
                  color: 'white',
                  fontWeight: 700,
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
                fullWidth
              >
                <Save size={16} /> Simpan Pengaturan Anggaran LPJ
              </Button>
            </div>
          </Card>

        </div>

      </div>

      {/* Modal Detail Spesifikasi Titik PV */}
      <PvDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        pv={selectedPv}
        onEditInSettings={(pv) => {
          handleEditPv(pv);
        }}
      />

    </div>
  );
};
