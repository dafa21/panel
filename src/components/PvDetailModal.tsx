import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { type PvOffGrid, mockWarga } from '../db_mock';
import { 
  Sun, 
  Zap, 
  Battery, 
  Home, 
  Users, 
  CheckCircle2, 
  MapPin, 
  Copy, 
  ExternalLink, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  Award, 
  Coins, 
  Leaf, 
  Clock, 
  ShieldCheck, 
  Edit3, 
  Maximize2,
  HeartHandshake,
  Camera,
  Image as ImageIcon,
  UploadCloud
} from 'lucide-react';

interface PvDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  pv: PvOffGrid | null;
  onEditInSettings?: (pv: PvOffGrid) => void;
}

export const PvDetailModal: React.FC<PvDetailModalProps> = ({
  isOpen,
  onClose,
  pv,
  onEditInSettings
}) => {
  const navigate = useNavigate();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Selalu scroll ke bagian atas saat modal dibuka agar foto langsung terlihat
  useEffect(() => {
    if (isOpen) {
      setActivePhotoIndex(0);
      if (bodyRef.current) {
        bodyRef.current.scrollTop = 0;
      }
    }
  }, [isOpen, pv?.id_pv]);

  if (!isOpen || !pv) return null;

  const photos = pv.galeri_foto && pv.galeri_foto.length > 0
    ? pv.galeri_foto
    : ['/pv-photos/rooftop-1.jpg'];

  const handleNextPhoto = () => {
    setActivePhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = () => {
    setActivePhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleCopyCoordinates = () => {
    const coordText = `${pv.latitude.toFixed(6)}, ${pv.longitude.toFixed(6)}`;
    navigator.clipboard.writeText(coordText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2200);
  };

  const handleOpenGoogleMaps = () => {
    window.open(`https://www.google.com/maps?q=${pv.latitude},${pv.longitude}`, '_blank');
  };

  const handleEditClick = () => {
    onClose();
    if (onEditInSettings) {
      onEditInSettings(pv);
    } else {
      navigate('/settings', { state: { editPvId: pv.id_pv } });
    }
  };

  // Label foto deskriptif
  const getPhotoLabel = (index: number) => {
    const labels = [
      'Foto Utama Modul Panel Surya Komunal',
      'Sentral Ruang Baterai LiFePO4 & Inverter Hybrid',
      'Rangka Array Pembangkit Surya Terpasang',
      'Smart Meter Digital Prabayar Rumah Warga'
    ];
    return labels[index % labels.length];
  };

  // Filter warga binaan terhubung
  const linkedWargaList = mockWarga.filter(w => 
    pv.warga_terhubung_ids?.includes(w.id_warga) || w.id_dai === pv.id_dai_pembina
  );

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div 
        className="pv-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header Modal Responsif */}
        <div className="pv-modal-header">
          {/* Row 1: Icon + Title + Status Badges di kiri, Tombol Tutup (X) di kanan */}
          <div className="pv-modal-header-top">
            <div className="pv-modal-title-group">
              <div style={{
                width: '38px',
                height: '38px',
                minWidth: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 3px 8px rgba(16, 185, 129, 0.3)'
              }}>
                <Sun size={20} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', minWidth: 0, flex: 1 }}>
                <h2 className="pv-modal-title">
                  {pv.nama_lokasi}
                </h2>
                <div className="pv-modal-badges">
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#059669',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                    {pv.status_operasional || 'Optimal'}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                    color: 'var(--color-primary)',
                    whiteSpace: 'nowrap'
                  }}>
                    ID: {pv.id_pv}
                  </span>
                </div>
              </div>
            </div>

            {/* Tombol Tutup (X) selalu aman di pojok kanan atas */}
            <button
              onClick={onClose}
              style={{
                width: '34px',
                height: '34px',
                minWidth: '34px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                color: 'var(--color-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.15s'
              }}
              title="Tutup Modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Row 2: Subtitle Alamat Lengkap & Aksi Cepat */}
          <div className="pv-modal-header-bottom">
            <p className="pv-modal-subtitle">
              <MapPin size={12} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '4px', color: 'var(--color-primary)' }} />
              {pv.dusun}, {pv.desa}, Kec. {pv.kecamatan}, {pv.kabupaten} • <span style={{ opacity: 0.85 }}>Peresmian: {pv.tanggal_peresmian || '2026'}</span>
            </p>

            <div className="pv-modal-actions">
              <button
                onClick={() => {
                  if (photos.length > 0) {
                    setLightboxImage(photos[activePhotoIndex]);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  color: '#059669',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
                title="Perbesar Foto Dokumentasi Lapangan"
              >
                <Camera size={13} />
                <span>{photos.length} Foto Wilayah</span>
              </button>
              <button
                onClick={handleEditClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 11px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s'
                }}
                title="Edit data ini di menu Setting PV"
              >
                <Edit3 size={13} color="var(--color-primary)" />
                <span>Edit di Setting PV</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Body Konten (Scrollable) */}
        <div 
          ref={bodyRef}
          style={{ padding: '20px 22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          
          {/* A. GALERI GAMBAR PANEL SURYA YANG SUDAH DIBANGUN */}
          <div style={{
            borderRadius: '14px',
            overflow: 'hidden',
            backgroundColor: '#0f172a',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            position: 'relative'
          }}>
            {/* Foto Utama Slider */}
            <div style={{ position: 'relative', height: '320px', width: '100%', overflow: 'hidden' }}>
              <img
                src={photos[activePhotoIndex]}
                alt={`Panel Surya ${pv.nama_lokasi}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  cursor: 'zoom-in',
                  transition: 'transform 0.3s ease'
                }}
                onClick={() => setLightboxImage(photos[activePhotoIndex])}
              />

              {/* Overlay Gradient & Badge Informasi Foto */}
              <div style={{
                position: 'absolute',
                inset: '0',
                background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0) 45%)',
                pointerEvents: 'none'
              }} />

              {/* Tag Foto */}
              <div style={{
                position: 'absolute',
                bottom: '14px',
                left: '16px',
                right: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                pointerEvents: 'auto'
              }}>
                <div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'rgba(16, 185, 129, 0.9)',
                    color: 'white',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 700,
                    marginBottom: '4px'
                  }}>
                    <CheckCircle2 size={13} /> Panel Surya Terpasang & Beroperasi
                  </div>
                  <h4 style={{ margin: 0, color: 'white', fontSize: '14px', fontWeight: 600 }}>
                    {getPhotoLabel(activePhotoIndex)}
                  </h4>
                </div>

                <button
                  onClick={() => setLightboxImage(photos[activePhotoIndex])}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(4px)',
                    color: 'white',
                    border: 'none',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Maximize2 size={13} /> Perbesar Foto
                </button>
              </div>

              {/* Tombol Navigasi Carousel */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={handlePrevPhoto}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={handleNextPhoto}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Strip Thumbnail Foto */}
            {photos.length > 1 && (
              <div style={{
                display: 'flex',
                gap: '8px',
                padding: '10px 14px',
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                overflowX: 'auto'
              }}>
                {photos.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIndex(idx)}
                    style={{
                      width: '64px',
                      height: '46px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      border: activePhotoIndex === idx ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.2)',
                      padding: 0,
                      cursor: 'pointer',
                      opacity: activePhotoIndex === idx ? 1 : 0.6,
                      flexShrink: 0
                    }}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* B. 4 KARTU METRIK UTAMA (ORANG DIBANTU, RUMAH DICOVER, KK, TOTAL KWH) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px'
          }}>
            {/* 1. Berapa Orang yang Dibantu */}
            <div style={{
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
                  Orang yang Dibantu
                </span>
                <div style={{ padding: '5px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.12)', color: 'var(--color-primary)' }}>
                  <Users size={16} />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary)' }}>
                {pv.jumlah_jiwa || Math.round(pv.jumlah_rumah * 3.8)} <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-light)' }}>Jiwa</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                Warga binaan penerima manfaat
              </span>
            </div>

            {/* 2. Berapa Rumah yang Dicover */}
            <div style={{
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
                  Rumah Dicover
                </span>
                <div style={{ padding: '5px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                  <Home size={16} />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669' }}>
                {pv.jumlah_rumah} <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-light)' }}>Rumah</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                Alokasi: {pv.kw_per_rumah || 0.5} kW per rumah
              </span>
            </div>

            {/* 3. Berapa KK yang Dibantu */}
            <div style={{
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
                  KK yang Dibantu
                </span>
                <div style={{ padding: '5px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: 'var(--color-accent)' }}>
                  <HeartHandshake size={16} />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-accent)' }}>
                {pv.jumlah_kk || Math.round(pv.jumlah_rumah * 0.95)} <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-light)' }}>KK</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                Kepala keluarga dhuafa & binaan
              </span>
            </div>

            {/* 4. Berapa kWh-nya (Kapasitas & Baterai) */}
            <div style={{
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
                  Kapasitas Total
                </span>
                <div style={{ padding: '5px', borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
                  <Zap size={16} />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#7c3aed' }}>
                {pv.total_kwh} <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-light)' }}>kWh</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                Baterai: {pv.kapasitas_baterai_kwh || Math.round(pv.total_kwh * 0.8)} kWh ({pv.ketahanan} {pv.satuan_ketahanan})
              </span>
            </div>
          </div>

          {/* C. DUA KOLOM: PROGRES AMALIYAH & REDEEM TOKEN RUPIAH */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '14px'
          }}>
            {/* Kolom 1: Capaian Progres Amaliyah (%) */}
            <div style={{
              padding: '16px',
              borderRadius: '14px',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} color="#059669" />
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>
                    Progres Amaliyah Warga
                  </h4>
                </div>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#059669',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  padding: '3px 10px',
                  borderRadius: '12px'
                }}>
                  {pv.amaliyah_progress_persen || 88.5}% Selesai
                </span>
              </div>

              {/* Progress Bar Visual */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--color-text-light)' }}>Realisasi vs Target Bulanan:</span>
                  <strong style={{ color: 'var(--color-text)' }}>
                    {pv.amaliyah_tercapai || 850} / {pv.target_amaliyah_bulanan || 1000} Kegiatan
                  </strong>
                </div>
                <div style={{
                  height: '10px',
                  width: '100%',
                  borderRadius: '6px',
                  backgroundColor: '#e2e8f0',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, pv.amaliyah_progress_persen || 88.5)}%`,
                    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                    borderRadius: '6px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                fontSize: '11px',
                textAlign: 'center'
              }}>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.08)' }}>
                  <span style={{ color: 'var(--color-text-light)', display: 'block' }}>Sholat Jamaah</span>
                  <strong style={{ color: 'var(--color-primary)', fontSize: '13px' }}>96.2%</strong>
                </div>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.08)' }}>
                  <span style={{ color: 'var(--color-text-light)', display: 'block' }}>Tilawah Al-Qur'an</span>
                  <strong style={{ color: '#059669', fontSize: '13px' }}>84.8%</strong>
                </div>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.08)' }}>
                  <span style={{ color: 'var(--color-text-light)', display: 'block' }}>Sosial & Desa</span>
                  <strong style={{ color: 'var(--color-accent)', fontSize: '13px' }}>87.0%</strong>
                </div>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} color="#059669" />
                <span>Da'i Pembina: <strong>{pv.nama_dai || 'Ustadz Pembina Regional'}</strong></span>
              </div>
            </div>

            {/* Kolom 2: Berapa Rupiah yang Dikonversi dari Redeem Token Amaliyah */}
            <div style={{
              padding: '16px',
              borderRadius: '14px',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Coins size={18} color="var(--color-accent)" />
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>
                    Konversi Rupiah Token Amaliyah
                  </h4>
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--color-accent)',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  padding: '3px 8px',
                  borderRadius: '10px'
                }}>
                  Token Ter-Redeem
                </span>
              </div>

              <div style={{
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-surface)',
                border: '1px dashed #cbd5e1',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                  Total Rupiah Diklaim Warga Titik Ini:
                </span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text)' }}>
                  Rp {(pv.total_rupiah_redeem || 250000).toLocaleString('id-ID')}
                </div>
                <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={13} />
                  Setara {(pv.total_poin_terkonversi || pv.total_rupiah_redeem || 250000).toLocaleString('id-ID')} Poin Amaliyah
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'var(--color-surface)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-light)', display: 'block' }}>kWh Tersalurkan</span>
                  <strong style={{ color: 'var(--color-primary)', fontSize: '14px' }}>
                    {pv.total_kwh_terdistribusi || 85.5} kWh
                  </strong>
                </div>
                <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'var(--color-surface)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-light)', display: 'block' }}>Subsidi Listrik</span>
                  <strong style={{ color: '#059669', fontSize: '14px' }}>100% Bebas Biaya</strong>
                </div>
              </div>

              <span style={{ fontSize: '11px', color: 'var(--color-text-light)', fontStyle: 'italic' }}>
                * Warga menukarkan poin ibadah dan kebaikan menjadi kuota kWh meteran prabayar secara mandiri.
              </span>
            </div>
          </div>

          {/* D. ALAMAT DETAIL & TITIK KOORDINAT GEOTAGGING */}
          <div style={{
            padding: '16px',
            borderRadius: '14px',
            backgroundColor: 'var(--color-bg)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="var(--color-primary)" />
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>
                  Alamat Rinci & Koordinat Geospasial
                </h4>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleCopyCoordinates}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Copy size={13} />
                  {isCopied ? '✓ Tersalin!' : 'Salin Koordinat'}
                </button>
                <button
                  onClick={handleOpenGoogleMaps}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <ExternalLink size={13} /> Buka Google Maps
                </button>
              </div>
            </div>

            {/* Teks Alamat Lengkap */}
            <div style={{
              padding: '12px 14px',
              borderRadius: '10px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              fontSize: '13px',
              lineHeight: '1.5',
              color: 'var(--color-text)'
            }}>
              <strong>{pv.alamat_lengkap || `${pv.nama_lokasi}, ${pv.desa || ''}, ${pv.kecamatan || ''}, ${pv.kabupaten || ''}`}</strong>
            </div>

            {/* D.1. Dokumentasi Foto Lapangan Spesifik Wilayah Ini (Tampil Langsung di Area Alamat/Spesifikasi) */}
            <div style={{
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ padding: '5px', borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.12)', color: 'var(--color-primary)' }}>
                    <ImageIcon size={15} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
                      Dokumentasi Foto Fisik Lapangan: {pv.nama_lokasi}
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                      {photos.length} foto instalasi khusus wilayah ini
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleEditClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    color: 'var(--color-primary)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  title="Upload atau kelola foto untuk wilayah ini di Setting PV"
                >
                  <UploadCloud size={13} /> + Upload Foto Wilayah Ini
                </button>
              </div>

              {/* Grid Mini Thumbnail Foto Wilayah */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '8px'
              }}>
                {photos.map((photoUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setActivePhotoIndex(idx);
                      setLightboxImage(photoUrl);
                    }}
                    style={{
                      height: '92px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      position: 'relative',
                      cursor: 'pointer',
                      border: activePhotoIndex === idx ? '2px solid var(--color-primary)' : '1px solid rgba(0,0,0,0.1)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      transition: 'transform 0.15s ease'
                    }}
                    title={`Klik untuk memperbesar foto ${idx + 1}`}
                  >
                    <img
                      src={photoUrl}
                      alt={`Dokumentasi ${pv.nama_lokasi} - ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/pv-photos/rooftop-1.jpg';
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '4px',
                      right: '4px',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '9px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}>
                      <Maximize2 size={9} /> #{idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid Detail Wilayah & Koordinat */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '10px',
              fontSize: '12px'
            }}>
              <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'var(--color-surface)' }}>
                <span style={{ fontSize: '10px', color: 'var(--color-text-light)', display: 'block' }}>Latitude (Lintang)</span>
                <code style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)' }}>{pv.latitude.toFixed(6)}</code>
              </div>
              <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'var(--color-surface)' }}>
                <span style={{ fontSize: '10px', color: 'var(--color-text-light)', display: 'block' }}>Longitude (Bujur)</span>
                <code style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-accent)' }}>{pv.longitude.toFixed(6)}</code>
              </div>
              <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'var(--color-surface)' }}>
                <span style={{ fontSize: '10px', color: 'var(--color-text-light)', display: 'block' }}>Kecamatan & Kab/Kota</span>
                <strong>{pv.kecamatan || '-'}, {pv.kabupaten || '-'}</strong>
              </div>
              <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'var(--color-surface)' }}>
                <span style={{ fontSize: '10px', color: 'var(--color-text-light)', display: 'block' }}>Provinsi & Pos</span>
                <strong>{pv.provinsi || '-'} {pv.kode_pos ? `(${pv.kode_pos})` : ''}</strong>
              </div>
            </div>
          </div>

          {/* E. SPESIFIKASI TEKNIK INFRASTRUKTUR & DAMPAK LINGKUNGAN (ESG) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '14px'
          }}>
            {/* Spesifikasi Mesin & Baterai */}
            <div style={{
              padding: '16px',
              borderRadius: '14px',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Battery size={18} color="#10b981" />
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>
                  Spesifikasi Teknis Sistem Off-Grid
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '4px' }}>
                  <span style={{ color: 'var(--color-text-light)' }}>Kapasitas Array Panel:</span>
                  <strong>{pv.kapasitas_wp ? `${(pv.kapasitas_wp / 1000).toFixed(1)} kWp (${pv.kapasitas_wp} Wp)` : `${pv.total_kwh} kWh Eq.`}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '4px' }}>
                  <span style={{ color: 'var(--color-text-light)' }}>Bank Baterai Cadangan:</span>
                  <strong>{pv.kapasitas_baterai_kwh || Math.round(pv.total_kwh * 0.8)} kWh ({pv.jenis_baterai || 'Lithium LiFePO4'})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '4px' }}>
                  <span style={{ color: 'var(--color-text-light)' }}>Inverter Pembangkit:</span>
                  <strong>{pv.inverter_spec || 'Pure Sine Wave Smart Inverter'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '4px' }}>
                  <span style={{ color: 'var(--color-text-light)' }}>Rata-rata Produksi:</span>
                  <strong style={{ color: '#059669' }}>{pv.rata_produksi_harian_kwh || 35.5} kWh / hari</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-light)' }}>Kesehatan Sistem (Health):</span>
                  <strong style={{ color: '#059669' }}>{pv.tingkat_kesehatan || 99.1}% (Sangat Baik)</strong>
                </div>
              </div>
            </div>

            {/* Dampak Lingkungan (ESG) & Log Maintenance */}
            <div style={{
              padding: '16px',
              borderRadius: '14px',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Leaf size={18} color="#059669" />
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>
                  Dampak Lingkungan (ESG) & Pemeliharaan
                </h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', textAlign: 'center' }}>
                <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-light)' }}>Reduksi Emisi CO₂</span>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#059669' }}>
                    {pv.reduksi_co2_kg || 1250} <span style={{ fontSize: '11px' }}>kg</span>
                  </div>
                </div>
                <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-light)' }}>Hemat BBM Solar Genset</span>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-primary)' }}>
                    {pv.penghematan_bbm_liter || 450} <span style={{ fontSize: '11px' }}>Liter</span>
                  </div>
                </div>
              </div>

              <div style={{
                marginTop: '4px',
                padding: '8px 10px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid rgba(0,0,0,0.05)',
                fontSize: '11px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-text-light)', marginBottom: '3px' }}>
                  <Clock size={12} /> Log Servis: <strong>{pv.tanggal_maintenance_terakhir || 'Bulan Ini'}</strong>
                </div>
                <p style={{ margin: 0, color: 'var(--color-text)', fontStyle: 'italic' }}>
                  "{pv.catatan_maintenance || 'Pembersihan modul berkala & pengecekan string inverter aman.'}"
                </p>
              </div>
            </div>
          </div>

          {/* F. DAFTAR WARGA BINAAN DI LOKASI INI */}
          {linkedWargaList.length > 0 && (
            <div style={{
              padding: '16px',
              borderRadius: '14px',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid rgba(0, 0, 0, 0.08)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={16} color="var(--color-primary)" />
                  Warga Binaan Terhubung di Zona Ini ({linkedWargaList.length})
                </h4>
                <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                  Penerima kuota listrik & binaan amaliyah
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                {linkedWargaList.map((w) => (
                  <div
                    key={w.id_warga}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid rgba(0, 0, 0, 0.06)',
                      minWidth: '200px',
                      flexShrink: 0
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-text)' }}>
                      {w.nama}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-light)', marginTop: '2px' }}>
                      PLN: {w.id_pelanggan_pln} ({w.golongan_va} VA)
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent)' }}>
                        {w.total_poin.toLocaleString()} pts
                      </span>
                      <button
                        onClick={() => {
                          onClose();
                          navigate(`/warga/${w.id_warga}`);
                        }}
                        style={{
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: 'var(--color-primary)',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        Lihat Profil →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* 3. Footer Modal */}
        <div style={{
          padding: '14px 22px',
          borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          backgroundColor: 'var(--color-surface)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ fontSize: '12px', color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#10b981" />
            <span>Terintegrasi Database Simddii GIS & Amaliyah Nasional</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleEditClick}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Edit3 size={15} color="var(--color-primary)" />
              Ubah Data di Setting PV
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Preview Perbesar Gambar */}
      {lightboxImage && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1300,
            backgroundColor: 'rgba(0, 0, 0, 0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={24} />
          </button>
          <img
            src={lightboxImage}
            alt="Perbesar"
            style={{
              maxWidth: '92vw',
              maxHeight: '90vh',
              borderRadius: '8px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
              objectFit: 'contain'
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
