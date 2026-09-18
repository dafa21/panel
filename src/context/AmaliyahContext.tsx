import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { type Amaliyah, type TrxAmaliyah, mockAmaliyah, mockHistory, mockDai, mockWarga } from '../db_mock';

interface AmaliyahContextType {
  amaliyahList: Amaliyah[];
  trxList: TrxAmaliyah[];
  addAmaliyah: (item: Omit<Amaliyah, 'id_amaliyah'>) => void;
  updateAmaliyah: (id: string, item: Partial<Amaliyah>) => void;
  deleteAmaliyah: (id: string) => void;
  resetAmaliyahList: () => void;
  addTrx: (trx: Omit<TrxAmaliyah, 'id_trx'>) => void;
  addBulkTrx: (trxArray: Omit<TrxAmaliyah, 'id_trx'>[]) => void;
  
  // Analytics Precomputed Stats
  totalPoinDisalurkan: number;
  totalSetoran: number;
  totalWargaAktif: number;
  estimasiKwh: number;
  estimasiRupiah: number;
  kategoriDistribution: { name: string; value: number; poin: number; color: string }[];
  trendSetoran: { tanggal: string; label: string; count: number; poin: number }[];
  topAmaliyahList: { amaliyah: Amaliyah; count: number; totalPoin: number; persen: number }[];
  daiPerformanceList: { id_dai: string; nama: string; regional: string; totalSetoran: number; totalPoin: number }[];
}

const STORAGE_KEY_AMALIYAH = 'simddii_amaliyah_master_v1';
const STORAGE_KEY_TRX = 'simddii_amaliyah_trx_v1';

const KATEGORI_COLORS: Record<string, string> = {
  wajib: '#10b981',     // Green
  sunnah: '#3b82f6',    // Blue
  sosial: '#f59e0b',    // Amber
  dakwah: '#8b5cf6',    // Purple
  pendidikan: '#06b6d4',// Cyan
  kebersihan: '#ec4899',// Pink
};

const AmaliyahContext = createContext<AmaliyahContextType | undefined>(undefined);

export const AmaliyahProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Master Data Amaliyah
  const [amaliyahList, setAmaliyahList] = useState<Amaliyah[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AMALIYAH);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load amaliyah master from localStorage', e);
    }
    return mockAmaliyah;
  });

  // 2. Transaksi Setoran Amaliyah
  const [trxList, setTrxList] = useState<TrxAmaliyah[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TRX);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load amaliyah transactions from localStorage', e);
    }
    return mockHistory;
  });

  // Sinkronisasi ke LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AMALIYAH, JSON.stringify(amaliyahList));
  }, [amaliyahList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TRX, JSON.stringify(trxList));
  }, [trxList]);

  // CRUD Master Amaliyah
  const addAmaliyah = (item: Omit<Amaliyah, 'id_amaliyah'>) => {
    const nextNum = amaliyahList.length + 1;
    const newId = `A${String(nextNum).padStart(2, '0')}`;
    const newItem: Amaliyah = {
      ...item,
      id_amaliyah: newId,
      status_aktif: item.status_aktif !== undefined ? item.status_aktif : true
    };
    setAmaliyahList(prev => [newItem, ...prev]);
  };

  const updateAmaliyah = (id: string, item: Partial<Amaliyah>) => {
    setAmaliyahList(prev => prev.map(a => a.id_amaliyah === id ? { ...a, ...item } : a));
  };

  const deleteAmaliyah = (id: string) => {
    setAmaliyahList(prev => prev.filter(a => a.id_amaliyah !== id));
  };

  const resetAmaliyahList = () => {
    setAmaliyahList(mockAmaliyah);
    localStorage.removeItem(STORAGE_KEY_AMALIYAH);
  };

  // Pencatatan Transaksi
  const addTrx = (trx: Omit<TrxAmaliyah, 'id_trx'>) => {
    const newId = `TRX${Date.now()}`;
    const newTrx: TrxAmaliyah = { ...trx, id_trx: newId };
    setTrxList(prev => [newTrx, ...prev]);
  };

  const addBulkTrx = (trxArray: Omit<TrxAmaliyah, 'id_trx'>[]) => {
    const timestamp = Date.now();
    const newItems: TrxAmaliyah[] = trxArray.map((t, idx) => ({
      ...t,
      id_trx: `TRX${timestamp}_${idx}`
    }));
    setTrxList(prev => [...newItems, ...prev]);
  };

  // Precomputed Analytics Data
  const totalPoinDisalurkan = useMemo(() => {
    return trxList.reduce((sum, trx) => {
      const a = amaliyahList.find(item => item.id_amaliyah === trx.id_amaliyah);
      return sum + (a?.poin || 0);
    }, 0);
  }, [trxList, amaliyahList]);

  const totalSetoran = trxList.length;

  const totalWargaAktif = useMemo(() => {
    const uniqueIds = new Set(trxList.map(t => t.id_warga));
    return uniqueIds.size || mockWarga.length;
  }, [trxList]);

  const estimasiKwh = useMemo(() => {
    // 1 poin = Rp1, rasio 1 kWh ~ Rp 2.950 subsidi
    return Number((totalPoinDisalurkan / 2950).toFixed(1));
  }, [totalPoinDisalurkan]);

  const estimasiRupiah = totalPoinDisalurkan;

  // Distribusi Berdasarkan Kategori
  const kategoriDistribution = useMemo(() => {
    const counts: Record<string, { count: number; poin: number }> = {};
    trxList.forEach(trx => {
      const a = amaliyahList.find(item => item.id_amaliyah === trx.id_amaliyah);
      const kat = a?.kategori || 'wajib';
      if (!counts[kat]) counts[kat] = { count: 0, poin: 0 };
      counts[kat].count += 1;
      counts[kat].poin += (a?.poin || 0);
    });

    return Object.entries(counts).map(([kat, val]) => ({
      name: kat.charAt(0).toUpperCase() + kat.slice(1),
      value: val.count,
      poin: val.poin,
      color: KATEGORI_COLORS[kat] || '#94a3b8'
    }));
  }, [trxList, amaliyahList]);

  // Tren Setoran Harian
  const trendSetoran = useMemo(() => {
    const dailyMap: Record<string, { count: number; poin: number }> = {};
    trxList.forEach(trx => {
      const day = trx.tanggal.split(' ')[0] || trx.tanggal;
      if (!dailyMap[day]) dailyMap[day] = { count: 0, poin: 0 };
      const a = amaliyahList.find(item => item.id_amaliyah === trx.id_amaliyah);
      dailyMap[day].count += 1;
      dailyMap[day].poin += (a?.poin || 0);
    });

    const sortedDays = Object.keys(dailyMap).sort();
    return sortedDays.slice(-10).map(dateStr => {
      const parts = dateStr.split('-');
      const label = parts.length === 3 ? `${parts[2]}/${parts[1]}` : dateStr;
      return {
        tanggal: dateStr,
        label,
        count: dailyMap[dateStr].count,
        poin: dailyMap[dateStr].poin
      };
    });
  }, [trxList, amaliyahList]);

  // Top Amaliyah Leaderboard
  const topAmaliyahList = useMemo(() => {
    const map: Record<string, { count: number; totalPoin: number }> = {};
    trxList.forEach(trx => {
      const a = amaliyahList.find(item => item.id_amaliyah === trx.id_amaliyah);
      if (!map[trx.id_amaliyah]) {
        map[trx.id_amaliyah] = { count: 0, totalPoin: 0 };
      }
      map[trx.id_amaliyah].count += 1;
      map[trx.id_amaliyah].totalPoin += (a?.poin || 0);
    });

    const totalCount = trxList.length || 1;
    const sorted = Object.entries(map)
      .map(([id, data]) => {
        const amaliyah = amaliyahList.find(a => a.id_amaliyah === id) || {
          id_amaliyah: id,
          nama: 'Kegiatan Amaliyah',
          kategori: 'wajib' as const,
          poin: 25
        };
        return {
          amaliyah,
          count: data.count,
          totalPoin: data.totalPoin,
          persen: Math.round((data.count / totalCount) * 100)
        };
      })
      .sort((a, b) => b.count - a.count);

    return sorted;
  }, [trxList, amaliyahList]);

  // Performa per Da'i Pembina
  const daiPerformanceList = useMemo(() => {
    return mockDai.map(dai => {
      const daiTrx = trxList.filter(t => t.id_dai === dai.id_dai);
      const totalPoin = daiTrx.reduce((sum, t) => {
        const a = amaliyahList.find(item => item.id_amaliyah === t.id_amaliyah);
        return sum + (a?.poin || 0);
      }, 0);
      return {
        id_dai: dai.id_dai,
        nama: dai.nama,
        regional: dai.regional,
        totalSetoran: daiTrx.length,
        totalPoin
      };
    });
  }, [trxList, amaliyahList]);

  return (
    <AmaliyahContext.Provider
      value={{
        amaliyahList,
        trxList,
        addAmaliyah,
        updateAmaliyah,
        deleteAmaliyah,
        resetAmaliyahList,
        addTrx,
        addBulkTrx,
        totalPoinDisalurkan,
        totalSetoran,
        totalWargaAktif,
        estimasiKwh,
        estimasiRupiah,
        kategoriDistribution,
        trendSetoran,
        topAmaliyahList,
        daiPerformanceList
      }}
    >
      {children}
    </AmaliyahContext.Provider>
  );
};

export const useAmaliyah = () => {
  const context = useContext(AmaliyahContext);
  if (!context) {
    throw new Error('useAmaliyah must be used within an AmaliyahProvider');
  }
  return context;
};
