import React, { useState, useMemo } from 'react';
import { Card } from '../components/Card';
import { Select } from '../components/Select';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { 
  mockWarga, 
  AMBANG_BATAS_REDEEM, 
  NILAI_KONVERSI, 
  mockTrxRedeem, 
  mockDai,
  type TrxRedeem 
} from '../db_mock';
import { 
  Zap, 
  Coins, 
  History as HistoryIcon, 
  CheckCircle, 
  Sparkles, 
  Copy, 
  Check, 
  Sliders, 
  Users, 
  Info,
  Server
} from 'lucide-react';

export const Reward: React.FC = () => {
  const [selectedWarga, setSelectedWarga] = useState('W002'); // Default to Ibu Siti (siap redeem)
  const [selectedNominal, setSelectedNominal] = useState<number>(20000);
  const [tokenResult, setTokenResult] = useState<string | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [filterHistoryMode, setFilterHistoryMode] = useState<'selected' | 'all'>('selected');

  // Manual Setting Tarif Listrik & Daya (Permintaan Pengguna: "450va dan 900va bisa di edit berapa pun ya mengikuti settingan di awal perumah jadi nanti hasil konversinya mengikuti ya")
  const [isManualTarif, setIsManualTarif] = useState(true); // Default terbuka agar langsung terlihat
  const [labelVa1, setLabelVa1] = useState<string>('450');
  const [labelVa2, setLabelVa2] = useState<string>('900');
  const [customTarif450, setCustomTarif450] = useState<number>(415); // Standar subsidi 450 VA ~ Rp 415/kWh
  const [customTarif900, setCustomTarif900] = useState<number>(1352); // Standar subsidi 900 VA ~ Rp 1.352/kWh

  // State lokal untuk kustomisasi daya per rumah warga binaan (bisa diedit berapa pun per rumah)
  const [citizenCustomDaya, setCitizenCustomDaya] = useState<Record<string, string>>({});
  // State lokal untuk override tarif langsung per rumah jika ingin diedit manual angka berapa pun
  const [customTarifOverride, setCustomTarifOverride] = useState<Record<string, number>>({});

  // State lokal untuk menyimpan riwayat redeem dan pemotongan poin selama session berjalan
  const [localRedeemHistory, setLocalRedeemHistory] = useState<TrxRedeem[]>(mockTrxRedeem);
  const [localPoinDeducted, setLocalPoinDeducted] = useState<Record<string, number>>({});

  const warga = useMemo(() => {
    return mockWarga.find(w => w.id_warga === selectedWarga);
  }, [selectedWarga]);

  const dai = useMemo(() => {
    return mockDai.find(d => d.id_dai === warga?.id_dai);
  }, [warga]);

  // Hitung poin aktual (poin awal database - poin yang di redeem di sesi ini)
  const poinAktual = warga ? Math.max(0, warga.total_poin - (localPoinDeducted[warga.id_warga] || 0)) : 0;
  const saldoRupiah = poinAktual * NILAI_KONVERSI;

  // Cek apakah poin mencukupi untuk nominal yang dipilih
  const poinDibutuhkan = selectedNominal / NILAI_KONVERSI;
  const canRedeem = poinAktual >= poinDibutuhkan;
  const progressPercentage = Math.min(100, Math.round((saldoRupiah / selectedNominal) * 100));

  // 1. Dashboard KPI Metrics
  const totalPoinTersedia = mockWarga.reduce((sum, w) => {
    const sisa = Math.max(0, w.total_poin - (localPoinDeducted[w.id_warga] || 0));
    return sum + sisa;
  }, 0);
  const totalSaldoRpTersedia = totalPoinTersedia * NILAI_KONVERSI;
  const totalTokenDikeluarkanRp = localRedeemHistory.reduce((sum, r) => sum + r.nominal_rp, 0);
  const wargaSiapRedeemCount = mockWarga.filter(w => {
    const sisa = Math.max(0, w.total_poin - (localPoinDeducted[w.id_warga] || 0));
    return sisa >= 20000;
  }).length;

  // 2. Daya Aktif Rumah Warga (Mengikuti settingan awal di database, namun bisa di-edit berapa pun)
  const activeDayaVa = useMemo(() => {
    if (!warga) return '450';
    return citizenCustomDaya[warga.id_warga] !== undefined 
      ? citizenCustomDaya[warga.id_warga] 
      : warga.golongan_va;
  }, [warga, citizenCustomDaya]);

  // 3. Kalkulasi Estimasi Tarif Listrik PLN (Dapat Di-Setting Manual Berapa Pun)
  const activeTarifPerKwh = useMemo(() => {
    if (!warga) return 415;
    // Jika ada override tarif langsung khusus warga ini
    if (customTarifOverride[warga.id_warga] !== undefined && customTarifOverride[warga.id_warga] > 0) {
      return customTarifOverride[warga.id_warga];
    }
    // Jika daya persis sama dengan label golongan 1 (default 450)
    if (activeDayaVa === labelVa1) return customTarif450;
    // Jika daya persis sama dengan label golongan 2 (default 900)
    if (activeDayaVa === labelVa2) return customTarif900;
    
    // Jika daya custom lain (misal 1300 atau angka bebas)
    const numDaya = parseFloat(activeDayaVa);
    const numTier1 = parseFloat(labelVa1 || '450');
    if (!isNaN(numDaya) && numDaya <= numTier1) return customTarif450;
    return customTarif900;
  }, [warga, customTarifOverride, activeDayaVa, labelVa1, labelVa2, customTarif450, customTarif900]);

  const estimasiKwhDidapat = useMemo(() => {
    if (activeTarifPerKwh <= 0) return 0;
    // Estimasi kWh = Nominal Voucher / Tarif per kWh
    return Number((selectedNominal / activeTarifPerKwh).toFixed(2));
  }, [selectedNominal, activeTarifPerKwh]);

  // Handler Update Daya Per Rumah Warga
  const handleUpdateDayaWarga = (newVa: string) => {
    if (!warga) return;
    setCitizenCustomDaya(prev => ({
      ...prev,
      [warga.id_warga]: newVa
    }));
    // Reset override tarif langsung agar otomatis sinkron ke tarif daya baru
    setCustomTarifOverride(prev => {
      const updated = { ...prev };
      delete updated[warga.id_warga];
      return updated;
    });
  };

  // Handler Update Tarif Langsung Per Rumah Warga
  const handleUpdateTarifLangsung = (newTarif: number) => {
    if (!warga) return;
    setCustomTarifOverride(prev => ({
      ...prev,
      [warga.id_warga]: newTarif
    }));
  };

  // Handle Redeem Token
  const handleRedeem = () => {
    if (!warga || !canRedeem) return;
    setIsRedeeming(true);

    // Simulasi hit API Gateway PPOB PLN
    setTimeout(() => {
      setIsRedeeming(false);
      
      // Generate 20 digit token PLN realistis (5 blok x 4 digit)
      const tokenChunks = Array.from({ length: 5 }, () => Math.floor(1000 + Math.random() * 9000).toString());
      const newToken = tokenChunks.join(' - ');
      setTokenResult(newToken);

      // Simpan ke history lokal
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const newHistoryItem: TrxRedeem = {
        id_redeem: `RDM-${Date.now().toString().slice(-6)}`,
        id_warga: warga.id_warga,
        tanggal: dateStr,
        nominal_rp: selectedNominal,
        poin_dipotong: poinDibutuhkan,
        status: 'Sukses',
        token_pln: newToken
      };

      setLocalRedeemHistory(prev => [newHistoryItem, ...prev]);
      
      // Potong saldo poin lokal
      setLocalPoinDeducted(prev => ({
        ...prev,
        [warga.id_warga]: (prev[warga.id_warga] || 0) + poinDibutuhkan
      }));

    }, 1800);
  };

  // Handle Copy Token to Clipboard
  const handleCopyToken = (tokenToCopy: string) => {
    navigator.clipboard.writeText(tokenToCopy.replace(/\s/g, ''));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Filter list histori transaksi
  const displayedHistory = useMemo(() => {
    if (filterHistoryMode === 'selected') {
      return localRedeemHistory.filter(h => h.id_warga === selectedWarga);
    }
    return localRedeemHistory;
  }, [localRedeemHistory, filterHistoryMode, selectedWarga]);

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
              SIMDDII Real-time PPOB Token Generator & Conversion Gateway
            </span>
          </div>
          <h1 className="responsive-header-title">
            Mesin Konversi Token & Reward
          </h1>
          <p style={{ margin: '2px 0 0 0', color: 'var(--color-text-light)', fontSize: '13px' }}>
            Penukaran saldo poin amaliyah warga binaan menjadi Token Listrik PLN Prabayar 20 digit secara langsung
          </p>
        </div>

        {/* Server Status Badge */}
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
          <Server size={15} color="var(--color-primary)" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)' }}>
            Gateway PLN: <strong style={{ color: '#059669' }}>Online</strong>
          </span>
        </div>
      </div>

      {/* 2. DASHBOARD KPI REWARD NASIONAL (COMPACT ROW) */}
      <div className="kpi-grid">
        {/* Total Poin Tersedia */}
        <Card style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }} className="card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
              Poin Tersedia
            </span>
            <div style={{ padding: '5px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.12)', color: 'var(--color-primary)' }}>
              <Coins size={15} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text)' }}>
              {totalPoinTersedia.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-light)' }}>Pts</span>
            </div>
            <div style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <CheckCircle size={12} /> Saldo Aktif Warga
            </div>
          </div>
        </Card>

        {/* Nilai Rupiah Siap Klaim */}
        <Card style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }} className="card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
              Saldo Siap Klaim
            </span>
            <div style={{ padding: '5px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <Zap size={15} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#059669' }}>
              Rp {totalSaldoRpTersedia.toLocaleString('id-ID')}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-light)', marginTop: '2px' }}>
              1 Poin = Rp 1 Insentif
            </div>
          </div>
        </Card>

        {/* Token Diterbitkan */}
        <Card style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }} className="card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
              Token Terbit
            </span>
            <div style={{ padding: '5px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: 'var(--color-accent)' }}>
              <HistoryIcon size={15} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-accent)' }}>
              Rp {totalTokenDikeluarkanRp.toLocaleString('id-ID')}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-light)', marginTop: '2px' }}>
              {localRedeemHistory.length} Transaksi PPOB
            </div>
          </div>
        </Card>

        {/* Warga Siap Redeem */}
        <Card style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }} className="card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
              Warga Siap Redeem
            </span>
            <div style={{ padding: '5px', borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
              <Users size={15} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#8b5cf6' }}>
              {wargaSiapRedeemCount} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-light)' }}>Jiwa</span>
            </div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
              Ambang ≥ 20.000 Pts
            </div>
          </div>
        </Card>
      </div>

      {/* 3. TATA LETAK 2 KOLOM (RESPONSIF: 1 KOLOM DI HP, 2 KOLOM DI LAPTOP) */}
      <div className="responsive-two-col">
        
        {/* KOLOM KIRI: MESIN KONVERSI & PROFIL WARGA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Card Pemilih Profil Warga */}
          <Card style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                1. Pilih Profil Warga Binaan
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                Klik tombol cepat atau pilih dropdown
              </span>
            </div>

            {/* Quick Pills Selector */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
              {mockWarga.map((w) => {
                const sisa = Math.max(0, w.total_poin - (localPoinDeducted[w.id_warga] || 0));
                const isSelected = selectedWarga === w.id_warga;
                const isEligible = sisa >= 20000;
                return (
                  <button
                    key={w.id_warga}
                    type="button"
                    onClick={() => {
                      setSelectedWarga(w.id_warga);
                      setTokenResult(null);
                    }}
                    style={{
                      padding: '7px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'rgba(0,0,0,0.08)'}`,
                      backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'var(--color-bg)',
                      color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>{w.nama}</span>
                    <span style={{ 
                      fontSize: '10px', 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      backgroundColor: isEligible ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0,0,0,0.06)',
                      color: isEligible ? '#059669' : 'var(--color-text-light)'
                    }}>
                      {sisa.toLocaleString()} pts
                    </span>
                  </button>
                );
              })}
            </div>

            <Select
              label="Atau pilih melalui daftar dropdown:"
              options={[
                { value: '', label: '-- Pilih Warga Binaan --' },
                ...mockWarga.map(w => {
                  const sisa = Math.max(0, w.total_poin - (localPoinDeducted[w.id_warga] || 0));
                  return { 
                    value: w.id_warga, 
                    label: `${w.nama} (ID: ${w.id_warga}) - Saldo: ${sisa.toLocaleString()} Pts` 
                  };
                })
              ]}
              value={selectedWarga}
              onChange={(e) => {
                setSelectedWarga(e.target.value);
                setTokenResult(null);
              }}
              style={{ marginBottom: 0 }}
            />

            {/* Identitas Detail Warga Terpilih */}
            {warga && (
              <div style={{ 
                marginTop: '16px', 
                padding: '12px 16px', 
                backgroundColor: 'var(--color-bg)', 
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
                fontSize: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    width: '38px', 
                    height: '38px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--color-primary)', 
                    color: 'white', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontWeight: 700 
                  }}>
                    {warga.nama.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text)' }}>
                      {warga.nama}
                    </div>
                    <span style={{ color: 'var(--color-text-light)' }}>
                      ID PLN: <strong>{warga.id_pelanggan_pln}</strong> • Pembina: {dai?.nama}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {/* Badge Daya per Rumah yang Bisa Diedit Langsung */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid #cbd5e1',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-light)', fontWeight: 600 }}>Daya:</span>
                    <input
                      type="text"
                      value={activeDayaVa}
                      onChange={(e) => handleUpdateDayaWarga(e.target.value)}
                      title="Ketik untuk mengedit daya rumah warga ini ke nilai berapa pun"
                      placeholder="450"
                      style={{
                        width: '50px',
                        padding: '1px 4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: activeDayaVa === labelVa1 ? '#2563eb' : '#059669',
                        borderRadius: '4px',
                        border: '1px solid var(--color-primary)',
                        backgroundColor: 'var(--color-bg)',
                        textAlign: 'center',
                        outline: 'none'
                      }}
                    />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text)' }}>VA</span>
                  </div>

                  <span style={{ 
                    padding: '3px 8px', 
                    borderRadius: '6px', 
                    backgroundColor: poinAktual >= 20000 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: poinAktual >= 20000 ? '#059669' : '#d97706',
                    fontWeight: 700,
                    fontSize: '11px'
                  }}>
                    {poinAktual >= 20000 ? 'Siap Redeem' : 'Proses'}
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Card Mesin Konversi Poin & Eksekusi Redeem */}
          {warga && (
            <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                    2. Saldo Poin & Pilihan Nominal Klaim
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>
                    Pilih nominal token yang ingin ditukarkan untuk warga ini
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-light)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Saldo Poin Tersedia
                  </span>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary)' }}>
                    {poinAktual.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 600 }}>Pts</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                    Ekuivalen: Rp {saldoRupiah.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {/* Pilihan Nominal Voucher Token Listrik */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>
                  Pilih Nominal Token PLN:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {AMBANG_BATAS_REDEEM.map((nominal) => {
                    const isSelected = selectedNominal === nominal;
                    const isEnough = saldoRupiah >= nominal;
                    return (
                      <div
                        key={nominal}
                        onClick={() => setSelectedNominal(nominal)}
                        style={{
                          padding: '14px 10px',
                          borderRadius: 'var(--radius-md)',
                          border: `2px solid ${isSelected ? 'var(--color-primary)' : 'rgba(0,0,0,0.08)'}`,
                          backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'var(--color-surface)',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? 'var(--shadow-sm)' : 'none'
                        }}
                      >
                        <div style={{ fontSize: '16px', fontWeight: 700, color: isSelected ? 'var(--color-primary)' : 'var(--color-text)' }}>
                          Rp {(nominal / 1000).toLocaleString()}k
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-light)', marginTop: '2px' }}>
                          {nominal.toLocaleString()} Pts
                        </div>
                        <span style={{ 
                          fontSize: '10px', 
                          fontWeight: 700, 
                          display: 'inline-block',
                          marginTop: '6px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: isEnough ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                          color: isEnough ? '#059669' : '#dc2626'
                        }}>
                          {isEnough ? '✓ Poin Cukup' : 'Kurang'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Progress Bar Poin Menuju Nominal Terpilih */}
              <div style={{ backgroundColor: 'var(--color-bg)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <ProgressBar 
                  progress={progressPercentage} 
                  label={`Kecukupan Saldo untuk Klaim Rp ${(selectedNominal / 1000).toLocaleString()}k (${progressPercentage}%)`} 
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: 'var(--color-text-light)' }}>
                  <span>Poin Diperlukan: <strong>{poinDibutuhkan.toLocaleString()} Pts</strong></span>
                  <span>Sisa Saldo: <strong>Rp {Math.max(0, saldoRupiah - selectedNominal).toLocaleString('id-ID')}</strong></span>
                </div>
              </div>

              {/* Tombol Eksekusi atau Hasil Token */}
              {!tokenResult ? (
                <Button
                  fullWidth
                  onClick={handleRedeem}
                  disabled={!canRedeem || isRedeeming}
                  style={{
                    padding: '16px',
                    fontSize: '15px',
                    backgroundColor: canRedeem ? '#10b981' : 'rgba(0,0,0,0.1)',
                    color: canRedeem ? 'white' : 'var(--color-text-light)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: canRedeem ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  {isRedeeming ? 'Menghubungi Server PPOB PLN & Memproses Token...' : (canRedeem ? `Redeem Token PLN Rp ${(selectedNominal / 1000).toLocaleString()}k Sekarang` : 'Poin Belum Mencukupi untuk Nominal Ini')}
                </Button>
              ) : (
                /* Box Hasil Token 20 Digit */
                <div style={{ 
                  padding: '18px', 
                  backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1.5px solid rgba(16, 185, 129, 0.3)', 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  animation: 'fadeIn 0.3s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={20} color="#059669" />
                      <span style={{ fontWeight: 700, color: '#059669', fontSize: '14px' }}>
                        Token Listrik Berhasil Diterbitkan!
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                      Meter: {warga.id_pelanggan_pln}
                    </span>
                  </div>

                  {/* 20 Digit Code Box */}
                  <div style={{ 
                    padding: '14px', 
                    backgroundColor: 'var(--color-surface)', 
                    borderRadius: 'var(--radius-md)', 
                    border: '2px dashed #10b981',
                    textAlign: 'center'
                  }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                      20 Digit Nomor Token PLN Prabayar
                    </span>
                    <div style={{ 
                      fontSize: 'clamp(15px, 4.5vw, 22px)', 
                      fontWeight: 800, 
                      letterSpacing: 'clamp(0.5px, 1vw, 2px)', 
                      color: '#059669', 
                      fontFamily: 'monospace',
                      marginTop: '4px',
                      wordBreak: 'break-all'
                    }}>
                      {tokenResult}
                    </div>
                  </div>

                  {/* Action Buttons: Copy & Tutup */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleCopyToken(tokenResult)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      {isCopied ? <Check size={16} /> : <Copy size={16} />}
                      {isCopied ? 'Kode Berhasil Disalin!' : 'Salin Kode Token'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setTokenResult(null)}
                      style={{
                        padding: '10px 16px',
                        backgroundColor: 'transparent',
                        color: 'var(--color-text-light)',
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              )}
            </Card>
          )}

        </div>

        {/* KOLOM KANAN: ESTIMASI KWH DENGAN SETTING MANUAL & LOG RIWAYAT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Widget 1: Simulasi Estimasi Tambahan kWh PLN (Bisa di-Setting Manual) */}
          <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} color="var(--color-accent)" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--color-text)' }}>
                  Simulasi Estimasi Tambahan kWh
                </h3>
              </div>
              
              {/* Tombol Toggle Setting Manual */}
              <button
                type="button"
                onClick={() => setIsManualTarif(!isManualTarif)}
                style={{
                  padding: '4px 10px',
                  backgroundColor: isManualTarif ? 'var(--color-primary)' : 'rgba(59, 130, 246, 0.1)',
                  color: isManualTarif ? 'white' : 'var(--color-primary)',
                  border: '1px solid var(--color-primary)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Sliders size={12} /> {isManualTarif ? 'Tutup Setting' : 'Setting Manual'}
              </button>
            </div>

            {/* Panel Input Setting Manual Daya & Tarif (Bisa Diedit Berapa Pun Mengikuti Settingan Rumah) */}
            {isManualTarif && (
              <div style={{ 
                padding: '14px', 
                backgroundColor: 'var(--color-bg)', 
                borderRadius: 'var(--radius-md)', 
                border: '1.5px dashed var(--color-primary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                fontSize: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sliders size={14} /> Parameter Daya & Tarif (Bisa Diedit Bebas Berapa Pun):
                  </div>
                  <span style={{ fontSize: '10px', color: '#059669', fontWeight: 600, backgroundColor: 'rgba(16, 185, 129, 0.12)', padding: '2px 6px', borderRadius: '6px' }}>
                    Mengikuti Settingan Rumah
                  </span>
                </div>

                {/* 1. Setting Daya Rumah Terpilih */}
                <div style={{ padding: '10px 12px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)' }}>
                        Daya Rumah {warga?.nama || 'Warga'}:
                      </span>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                        Setting awal database: <strong>{warga?.golongan_va || '450'} VA</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="text"
                        value={activeDayaVa}
                        onChange={(e) => handleUpdateDayaWarga(e.target.value)}
                        placeholder="Contoh: 450"
                        style={{
                          width: '80px',
                          padding: '5px 8px',
                          borderRadius: '6px',
                          border: '1.5px solid var(--color-primary)',
                          backgroundColor: 'var(--color-bg)',
                          color: 'var(--color-text)',
                          fontSize: '13px',
                          fontWeight: 700,
                          textAlign: 'center',
                          outline: 'none'
                        }}
                      />
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)' }}>VA</span>
                    </div>
                  </div>

                  {/* Tombol Cepat Pilihan Daya */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-light)', alignSelf: 'center' }}>Pilihan Cepat:</span>
                    {['450', '900', '1300', '2200'].map(va => (
                      <button
                        key={va}
                        type="button"
                        onClick={() => handleUpdateDayaWarga(va)}
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: activeDayaVa === va ? '1.5px solid var(--color-primary)' : '1px solid #cbd5e1',
                          backgroundColor: activeDayaVa === va ? 'rgba(59, 130, 246, 0.15)' : 'var(--color-bg)',
                          color: activeDayaVa === va ? 'var(--color-primary)' : 'var(--color-text)',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {va} VA
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Pengaturan Tarif Golongan 1 & Golongan 2 (Label VA & Angka Tarif Bisa Diedit) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ padding: '8px 10px', backgroundColor: 'var(--color-surface)', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <label style={{ color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', fontSize: '11px' }}>
                      Tarif Golongan 
                      <input 
                        type="text" 
                        value={labelVa1} 
                        onChange={(e) => setLabelVa1(e.target.value)} 
                        style={{ width: '42px', padding: '1px 4px', fontSize: '11px', fontWeight: 700, borderRadius: '4px', border: '1px solid #cbd5e1', textAlign: 'center' }} 
                      /> VA:
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>Rp</span>
                      <input 
                        type="number"
                        value={customTarif450}
                        onChange={(e) => setCustomTarif450(Number(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '5px 8px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: 'var(--color-bg)',
                          color: 'var(--color-text)',
                          fontSize: '12px',
                          outline: 'none',
                          fontWeight: 600
                        }}
                      />
                      <span style={{ fontSize: '10px', color: 'var(--color-text-light)' }}>/kWh</span>
                    </div>
                  </div>

                  <div style={{ padding: '8px 10px', backgroundColor: 'var(--color-surface)', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <label style={{ color: 'var(--color-text-light)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', fontSize: '11px' }}>
                      Tarif Golongan 
                      <input 
                        type="text" 
                        value={labelVa2} 
                        onChange={(e) => setLabelVa2(e.target.value)} 
                        style={{ width: '42px', padding: '1px 4px', fontSize: '11px', fontWeight: 700, borderRadius: '4px', border: '1px solid #cbd5e1', textAlign: 'center' }} 
                      /> VA:
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>Rp</span>
                      <input 
                        type="number"
                        value={customTarif900}
                        onChange={(e) => setCustomTarif900(Number(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '5px 8px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: 'var(--color-bg)',
                          color: 'var(--color-text)',
                          fontSize: '12px',
                          outline: 'none',
                          fontWeight: 600
                        }}
                      />
                      <span style={{ fontSize: '10px', color: 'var(--color-text-light)' }}>/kWh</span>
                    </div>
                  </div>
                </div>

                {/* 3. Tarif Aktif Diterapkan untuk Rumah Ini (Bisa Diedit Bebas) */}
                <div style={{ 
                  padding: '8px 12px', 
                  backgroundColor: 'var(--color-surface)', 
                  borderRadius: '6px', 
                  border: '1.5px solid rgba(16, 185, 129, 0.4)', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--color-text)', fontWeight: 700 }}>
                      Tarif Aktif Digunakan Saat Ini:
                    </span>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                      Daya rumah {activeDayaVa} VA
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)' }}>Rp</span>
                    <input
                      type="number"
                      value={activeTarifPerKwh}
                      onChange={(e) => handleUpdateTarifLangsung(Number(e.target.value))}
                      title="Ketik untuk mengubah tarif per kWh rumah ini ke angka berapa pun"
                      style={{
                        width: '90px',
                        padding: '5px 8px',
                        borderRadius: '6px',
                        border: '1px solid #10b981',
                        backgroundColor: 'var(--color-bg)',
                        color: '#059669',
                        fontSize: '13px',
                        fontWeight: 800,
                        textAlign: 'center',
                        outline: 'none'
                      }}
                    />
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-light)' }}>/kWh</span>
                  </div>
                </div>

                <span style={{ fontSize: '11px', color: 'var(--color-text-light)', fontStyle: 'italic' }}>
                  * Mengubah angka daya (VA) atau tarif (Rp/kWh) di atas akan langsung mengkalkulasi ulang kuota energi kWh di bawah secara otomatis.
                </span>
              </div>
            )}

            {/* Hasil Perhitungan Estimasi kWh (Otomatis Mengikuti Perubahan Nilai) */}
            <div style={{ 
              padding: '14px', 
              borderRadius: 'var(--radius-md)', 
              backgroundColor: 'var(--color-bg)', 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-light)', fontWeight: 600 }}>
                  Estimasi Energi Tambahan:
                </span>
                <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary)', marginTop: '2px' }}>
                  ~{estimasiKwhDidapat} <span style={{ fontSize: '14px', fontWeight: 600 }}>kWh</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>
                  Golongan Rumah: <strong>{activeDayaVa} VA</strong> @ Rp {activeTarifPerKwh}/kWh
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--color-text-light)' }}>
                <div>Nominal Voucher: <strong>Rp {selectedNominal.toLocaleString()}</strong></div>
                <div style={{ color: '#059669', fontWeight: 600, marginTop: '2px' }}>
                  {activeTarifPerKwh <= 500 ? '✓ Subsidi Pemerintah Aktif' : '✓ Tarif Standar Non-Subsidi'}
                </div>
              </div>
            </div>
          </Card>

          {/* Widget 2: Log Riwayat Penukaran Warga / Nasional */}
          <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HistoryIcon size={18} color="var(--color-primary)" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--color-text)' }}>
                  Log Riwayat Transaksi PPOB
                </h3>
              </div>

              {/* Toggle Filter History */}
              <div style={{ display: 'flex', backgroundColor: 'var(--color-bg)', padding: '2px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <button
                  type="button"
                  onClick={() => setFilterHistoryMode('selected')}
                  style={{
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: filterHistoryMode === 'selected' ? 'var(--color-primary)' : 'transparent',
                    color: filterHistoryMode === 'selected' ? 'white' : 'var(--color-text-light)',
                    cursor: 'pointer'
                  }}
                >
                  Warga Ini
                </button>
                <button
                  type="button"
                  onClick={() => setFilterHistoryMode('all')}
                  style={{
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: filterHistoryMode === 'all' ? 'var(--color-primary)' : 'transparent',
                    color: filterHistoryMode === 'all' ? 'white' : 'var(--color-text-light)',
                    cursor: 'pointer'
                  }}
                >
                  Semua ({localRedeemHistory.length})
                </button>
              </div>
            </div>

            {/* List Riwayat */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
              {displayedHistory.length > 0 ? (
                displayedHistory.map((item) => {
                  const targetWarga = mockWarga.find(w => w.id_warga === item.id_warga);
                  return (
                    <div 
                      key={item.id_redeem}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-bg)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        fontSize: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '13px' }}>
                          Klaim Token Rp {item.nominal_rp.toLocaleString('id-ID')}
                        </div>
                        <div style={{ color: 'var(--color-text-light)', fontSize: '11px' }}>
                          {targetWarga?.nama} ({item.id_warga}) • {item.tanggal}
                        </div>
                        {item.token_pln && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#059669', fontSize: '11px', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                              {item.token_pln}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyToken(item.token_pln!)}
                              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                              title="Salin token"
                            >
                              <Copy size={12} color="var(--color-text-light)" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ 
                          fontSize: '10px', 
                          fontWeight: 700, 
                          padding: '2px 6px', 
                          borderRadius: '10px',
                          backgroundColor: item.status === 'Sukses' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: item.status === 'Sukses' ? '#059669' : '#d97706'
                        }}>
                          {item.status}
                        </span>
                        <div style={{ fontSize: '11px', color: 'var(--color-accent)', fontWeight: 600, marginTop: '4px' }}>
                          -{item.poin_dipotong} Pts
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-light)', fontSize: '12px' }}>
                  Belum ada histori penukaran token untuk kriteria ini.
                </div>
              )}
            </div>
          </Card>

          {/* Widget 3: Panduan Cepat Input Token ke Meteran Listrik */}
          <Card style={{ padding: '16px', backgroundColor: 'var(--color-surface)', border: 'var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Info size={16} color="var(--color-primary)" />
              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
                Panduan Pengisian Token ke Meteran Prabayar
              </h4>
            </div>
            <ol style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: 'var(--color-text-light)', lineHeight: '1.6' }}>
              <li>Ketik 20 digit nomor token pada keypad meteran listrik PLN di rumah warga.</li>
              <li>Tekan tombol **Enter** (biasanya tombol panah atau tanda pagar).</li>
              <li>Layar meteran akan menampilkan tulisan **"BENAR"** dan saldo kWh bertambah otomatis.</li>
            </ol>
          </Card>

        </div>

      </div>

    </div>
  );
};
