import React, { useState } from 'react';
import { X, Save, Plus, Trash2, FileSpreadsheet, Sparkles, Coins, CheckCircle } from 'lucide-react';
import { useLpj } from '../context/LpjContext';
import { type LpjLedgerItem, type LpjEsgImpact } from '../lpj_mock';

// =========================================================================
// 1. MODAL INPUT TRANSAKSI SPJ BARU (BUKU KAS UMUM)
// =========================================================================
interface ModalAddSpjProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalAddSpj: React.FC<ModalAddSpjProps> = ({ isOpen, onClose }) => {
  const { ledgerItems, addLedgerItem } = useLpj();

  const nextNumber = String(ledgerItems.length + 1).padStart(3, '0');
  const [idSpj, setIdSpj] = useState(`SPJ/2026/09/${nextNumber}`);
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [posAnggaran, setPosAnggaran] = useState('Subsidi Token Listrik');
  const [uraian, setUraian] = useState('');
  const [penerima, setPenerima] = useState('');
  const [wilayah, setWilayah] = useState('Jawa Barat');
  const [nominal, setNominal] = useState('');
  const [statusVerifikasi, setStatusVerifikasi] = useState('Terverifikasi Valid');
  const [buktiDokumen, setBuktiDokumen] = useState('Kuitansi & Bukti Stroom PLN');
  const [autoSync, setAutoSync] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uraian || !nominal || !penerima) return;

    const newItem: LpjLedgerItem = {
      id_spj: idSpj || `SPJ/2026/09/${nextNumber}`,
      tanggal: tanggal || new Date().toISOString().slice(0, 10),
      pos_anggaran: posAnggaran,
      uraian,
      penerima,
      wilayah,
      nominal: Number(nominal) || 0,
      status_verifikasi: statusVerifikasi,
      bukti_dokumen: buktiDokumen || 'Bukti Transaksi Resmi'
    };

    addLedgerItem(newItem, autoSync);
    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      // Reset form
      setUraian('');
      setPenerima('');
      setNominal('');
    }, 1200);
  };

  return (
    <div className="report-modal-backdrop" style={{ zIndex: 9999 }}>
      <div 
        style={{
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          width: '100%',
          maxWidth: '560px',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          border: 'var(--glass-border)',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(5, 150, 105, 0.15)', color: '#059669' }}>
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--color-text)' }}>
                Input Bukti Kas / Transaksi SPJ Baru
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                Transaksi akan otomatis masuk ke Buku Kas Umum & Dokumen PDF LPJ
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)' }}
          >
            <X size={20} />
          </button>
        </div>

        {isSuccess && (
          <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
            <CheckCircle size={18} /> Transaksi SPJ berhasil dicatat dan terintegrasi!
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Nomor Bukti Kas (SPJ)
              </label>
              <input
                type="text"
                value={idSpj}
                onChange={(e) => setIdSpj(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  fontWeight: 700
                }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Tanggal Transaksi
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  fontSize: '12px'
                }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Pos Anggaran Belanja
            </label>
            <select
              value={posAnggaran}
              onChange={(e) => setPosAnggaran(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              <option value="Subsidi Token Listrik">Subsidi Token Listrik Warga</option>
              <option value="Kafalah & Operasional Da'i">Kafalah & Operasional Da'i Pembina</option>
              <option value="Pemeliharaan PV Surya">Pemeliharaan & Komponen PV Off-Grid</option>
              <option value="Pembinaan Amaliyah">Pembinaan Amaliyah & Majelis Taklim</option>
              <option value="Administrasi & Audit">Administrasi, Audit & Sistem Cloud</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Uraian Pengeluaran Belanja
            </label>
            <input
              type="text"
              placeholder="Contoh: Penyaluran voucher token listrik amaliyah tahap 4"
              value={uraian}
              onChange={(e) => setUraian(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                fontSize: '12px'
              }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Penerima Manfaat / Rekanan
              </label>
              <input
                type="text"
                placeholder="Contoh: Ibu Siti & Bpk Supriadi"
                value={penerima}
                onChange={(e) => setPenerima(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  fontSize: '12px'
                }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Wilayah Alokasi
              </label>
              <input
                type="text"
                placeholder="Contoh: Jawa Barat (Bandung)"
                value={wilayah}
                onChange={(e) => setWilayah(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  fontSize: '12px'
                }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Nominal Transaksi (Rp)
              </label>
              <input
                type="number"
                placeholder="Contoh: 15000000"
                value={nominal}
                onChange={(e) => setNominal(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: 'var(--color-bg)',
                  color: '#059669',
                  fontSize: '13px',
                  fontWeight: 700
                }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Status Verifikasi SPJ
              </label>
              <select
                value={statusVerifikasi}
                onChange={(e) => setStatusVerifikasi(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                <option value="Terverifikasi Valid">Terverifikasi Valid</option>
                <option value="Terverifikasi Transfer">Terverifikasi Transfer</option>
                <option value="Terverifikasi Berita Acara">Terverifikasi Berita Acara</option>
                <option value="Terverifikasi Faktur">Terverifikasi Faktur</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Bukti Dokumen Pendukung
            </label>
            <input
              type="text"
              placeholder="Contoh: Kuitansi Bermeterai & Bukti Stroom PLN"
              value={buktiDokumen}
              onChange={(e) => setBuktiDokumen(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                fontSize: '12px'
              }}
            />
          </div>

          {/* Opsi Auto Sync */}
          <div style={{ backgroundColor: 'rgba(5, 150, 105, 0.08)', padding: '10px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="autoSync"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="autoSync" style={{ fontSize: '12px', cursor: 'pointer', color: 'var(--color-text)' }}>
              <strong>Sinkronkan otomatis:</strong> Tambahkan nominal ke akumulasi realisasi anggaran program & pos belanja
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: 'transparent',
                color: 'var(--color-text)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#059669',
                color: 'white',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Save size={16} /> Simpan Transaksi SPJ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =========================================================================
// 2. MODAL EDIT & INPUT POIN-POIN DAMPAK (ESG METRICS)
// =========================================================================
interface ModalEditEsgProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalEditEsg: React.FC<ModalEditEsgProps> = ({ isOpen, onClose }) => {
  const { esgImpacts, updateEsgImpact, addEsgImpact, deleteEsgImpact } = useLpj();
  const [localImpacts, setLocalImpacts] = useState<LpjEsgImpact[]>(esgImpacts);
  const [isSaved, setIsSaved] = useState(false);

  // Sync saat modal dibuka
  React.useEffect(() => {
    if (isOpen) {
      setLocalImpacts(esgImpacts);
    }
  }, [isOpen, esgImpacts]);

  if (!isOpen) return null;

  const handleFieldChange = (id: string, field: keyof LpjEsgImpact, value: any) => {
    setLocalImpacts(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleAddNewPoint = () => {
    const newId = `esg-${Date.now()}`;
    const newImpact: LpjEsgImpact = {
      id: newId,
      nomor: localImpacts.length + 1,
      judul: 'Dampak Kesejahteraan Baru',
      highlight: 'Capaian terukur',
      deskripsi: 'Penjelasan dampak nyata dari program energi mandiri terhadap warga binaan.',
      kategori: 'lainnya',
      color: '#8b5cf6'
    };
    setLocalImpacts(prev => [...prev, newImpact]);
  };

  const handleDeletePoint = (id: string) => {
    setLocalImpacts(prev => prev.filter(i => i.id !== id).map((item, idx) => ({ ...item, nomor: idx + 1 })));
    deleteEsgImpact(id);
  };

  const handleSaveAll = () => {
    localImpacts.forEach(item => {
      const existing = esgImpacts.find(e => e.id === item.id);
      if (existing) {
        updateEsgImpact(item.id, item);
      } else {
        addEsgImpact(item);
      }
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="report-modal-backdrop" style={{ zIndex: 9999 }}>
      <div 
        style={{
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          width: '100%',
          maxWidth: '680px',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          border: 'var(--glass-border)',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(5, 150, 105, 0.15)', color: '#059669' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--color-text)' }}>
                Input & Edit Poin-Poin Evaluasi Dampak (ESG Metrics)
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                Poin-poin ini terintegrasi langsung di Dashboard LPJ dan Lembar 2 Dokumen PDF Resmi
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)' }}
          >
            <X size={20} />
          </button>
        </div>

        {isSaved && (
          <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
            <CheckCircle size={18} /> Perubahan poin dampak berhasil disimpan & terintegrasi!
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
          {localImpacts.map((item, index) => (
            <div 
              key={item.id}
              style={{
                padding: '14px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-bg)',
                border: '1px solid #cbd5e1',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: item.color || '#059669' }}>
                  Poin #{index + 1}:
                </span>
                {localImpacts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeletePoint(item.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    title="Hapus poin ini"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                    Judul Dampak
                  </label>
                  <input
                    type="text"
                    value={item.judul}
                    onChange={(e) => handleFieldChange(item.id, 'judul', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text)',
                      fontSize: '12px',
                      fontWeight: 600
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                    Highlight / Angka Utama
                  </label>
                  <input
                    type="text"
                    value={item.highlight}
                    onChange={(e) => handleFieldChange(item.id, 'highlight', e.target.value)}
                    placeholder="Misal: 42.5% atau 92%"
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text)',
                      fontSize: '12px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                  Deskripsi & Narasi Evaluasi Lengkap
                </label>
                <textarea
                  rows={3}
                  value={item.deskripsi}
                  onChange={(e) => handleFieldChange(item.id, 'deskripsi', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    fontSize: '12px',
                    lineHeight: '1.4',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddNewPoint}
            style={{
              padding: '8px 14px',
              backgroundColor: 'transparent',
              border: '1.5px dashed #cbd5e1',
              borderRadius: '8px',
              color: '#059669',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Plus size={15} /> Tambah Poin Dampak Evaluasi Baru
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: 'transparent',
              color: 'var(--color-text)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#059669',
              color: 'white',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Save size={16} /> Simpan Semua Poin Dampak
          </button>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 3. MODAL EDIT PARAMETER ANGGARAN & TARGET LPJ
// =========================================================================
interface ModalEditBudgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalEditBudget: React.FC<ModalEditBudgetProps> = ({ isOpen, onClose }) => {
  const { budgetConfig, updateBudgetConfig } = useLpj();

  const [pagu, setPagu] = useState(String(budgetConfig.paguAnggaran));
  const [realisasi, setRealisasi] = useState(String(budgetConfig.realisasiAnggaran));
  const [kwh, setKwh] = useState(String(budgetConfig.targetKwh));
  const [biayaJiwa, setBiayaJiwa] = useState(String(budgetConfig.biayaPerJiwa));
  const [statusAudit, setStatusAudit] = useState(budgetConfig.statusAudit);
  const [periode, setPeriode] = useState(budgetConfig.periodeAktif);
  const [nomorLpj, setNomorLpj] = useState(budgetConfig.nomorLpj);
  const [isSaved, setIsSaved] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setPagu(String(budgetConfig.paguAnggaran));
      setRealisasi(String(budgetConfig.realisasiAnggaran));
      setKwh(String(budgetConfig.targetKwh));
      setBiayaJiwa(String(budgetConfig.biayaPerJiwa));
      setStatusAudit(budgetConfig.statusAudit);
      setPeriode(budgetConfig.periodeAktif);
      setNomorLpj(budgetConfig.nomorLpj);
    }
  }, [isOpen, budgetConfig]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBudgetConfig({
      paguAnggaran: Number(pagu) || 150000000,
      realisasiAnggaran: Number(realisasi) || 112500000,
      targetKwh: Number(kwh) || 1250,
      biayaPerJiwa: Number(biayaJiwa) || 37500,
      statusAudit,
      periodeAktif: periode,
      nomorLpj
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="report-modal-backdrop" style={{ zIndex: 9999 }}>
      <div 
        style={{
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          width: '100%',
          maxWidth: '560px',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          border: 'var(--glass-border)',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--color-primary)' }}>
              <Coins size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--color-text)' }}>
                Pengaturan Parameter Anggaran LPJ
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                Tersinkronisasi otomatis dengan Dashboard, Settings PV, dan Dokumen PDF
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)' }}
          >
            <X size={20} />
          </button>
        </div>

        {isSaved && (
          <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
            <CheckCircle size={18} /> Parameter anggaran berhasil diperbarui & tersinkronisasi!
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Total Pagu Anggaran Program (Rp)
            </label>
            <input
              type="number"
              value={pagu}
              onChange={(e) => setPagu(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                fontSize: '13px',
                fontWeight: 700
              }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Realisasi Belanja Terserap (Rp)
            </label>
            <input
              type="number"
              value={realisasi}
              onChange={(e) => setRealisasi(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: 'var(--color-bg)',
                color: '#059669',
                fontSize: '13px',
                fontWeight: 700
              }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Target Listrik (kWh)
              </label>
              <input
                type="number"
                value={kwh}
                onChange={(e) => setKwh(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  fontSize: '13px',
                  fontWeight: 700
                }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Biaya per Jiwa (Rp)
              </label>
              <input
                type="number"
                value={biayaJiwa}
                onChange={(e) => setBiayaJiwa(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  fontSize: '13px',
                  fontWeight: 700
                }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Status Opini Audit
            </label>
            <select
              value={statusAudit}
              onChange={(e) => setStatusAudit(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              <option value="Wajar Tanpa Pengecualian (WTP) - Terverifikasi Digital">Wajar Tanpa Pengecualian (WTP)</option>
              <option value="Wajar Dengan Pengecualian (WDP)">Wajar Dengan Pengecualian (WDP)</option>
              <option value="Dalam Proses Audit Akuntan Publik">Dalam Proses Audit Akuntan Publik</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Nomor Surat LPJ
              </label>
              <input
                type="text"
                value={nomorLpj}
                onChange={(e) => setNomorLpj(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  fontSize: '12px',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Nama Periode
              </label>
              <input
                type="text"
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  fontSize: '12px'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: 'transparent',
                color: 'var(--color-text)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: 'white',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Save size={16} /> Simpan Pengaturan LPJ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
