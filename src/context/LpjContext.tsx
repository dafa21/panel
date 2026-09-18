import React, { createContext, useContext, useState } from 'react';
import { 
  defaultLpjBudgetConfig, 
  type LpjBudgetConfig, 
  mockLpjKategori, 
  type LpjKategoriAnggaran,
  mockLpjLedger,
  type LpjLedgerItem,
  defaultLpjEsgImpacts,
  type LpjEsgImpact
} from '../lpj_mock';

interface LpjContextType {
  budgetConfig: LpjBudgetConfig;
  updateBudgetConfig: (newConfig: Partial<LpjBudgetConfig>) => void;
  kategoriAnggaran: LpjKategoriAnggaran[];
  updateKategoriRealisasi: (id: string, realisasi: number) => void;
  ledgerItems: LpjLedgerItem[];
  addLedgerItem: (item: LpjLedgerItem, autoSyncBudget?: boolean) => void;
  updateLedgerItem: (id_spj: string, updated: Partial<LpjLedgerItem>) => void;
  deleteLedgerItem: (id_spj: string) => void;
  esgImpacts: LpjEsgImpact[];
  updateEsgImpact: (id: string, updated: Partial<LpjEsgImpact>) => void;
  addEsgImpact: (impact: LpjEsgImpact) => void;
  deleteEsgImpact: (id: string) => void;
}

const STORAGE_KEY = 'simddii_lpj_budget_config';
const STORAGE_KEY_CATEGORIES = 'simddii_lpj_categories';
const STORAGE_KEY_LEDGER = 'simddii_lpj_ledger';
const STORAGE_KEY_ESG = 'simddii_lpj_esg';

const LpjContext = createContext<LpjContextType | undefined>(undefined);

export const LpjProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. State Budget Config
  const [budgetConfig, setBudgetConfig] = useState<LpjBudgetConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultLpjBudgetConfig, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Gagal membaca budget config dari storage:', e);
    }
    return defaultLpjBudgetConfig;
  });

  // 2. State Kategori Anggaran
  const [kategoriAnggaran, setKategoriAnggaran] = useState<LpjKategoriAnggaran[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Gagal membaca kategori anggaran dari storage:', e);
    }
    return mockLpjKategori;
  });

  // 3. State Ledger Transaksi SPJ (Buku Kas Umum)
  const [ledgerItems, setLedgerItems] = useState<LpjLedgerItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LEDGER);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Gagal membaca ledger SPJ dari storage:', e);
    }
    return mockLpjLedger;
  });

  // 4. State Poin-Poin Evaluasi Dampak (ESG Metrics)
  const [esgImpacts, setEsgImpacts] = useState<LpjEsgImpact[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ESG);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Gagal membaca ESG impacts dari storage:', e);
    }
    return defaultLpjEsgImpacts;
  });

  // Updater Budget Config
  const updateBudgetConfig = (newConfig: Partial<LpjBudgetConfig>) => {
    setBudgetConfig(prev => {
      const updated = { ...prev, ...newConfig };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Gagal menyimpan budget config:', e);
      }
      return updated;
    });
  };

  // Updater Kategori Realisasi
  const updateKategoriRealisasi = (id: string, realisasi: number) => {
    setKategoriAnggaran(prev => {
      const updated = prev.map(k => {
        if (k.id === id) {
          const persentase = Math.min(100, Math.round((realisasi / k.pagu) * 100));
          return { ...k, realisasi, persentase };
        }
        return k;
      });
      try {
        localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(updated));
      } catch (e) {
        console.error('Gagal menyimpan kategori:', e);
      }
      return updated;
    });
  };

  // Updater Ledger Transaksi SPJ
  const addLedgerItem = (newItem: LpjLedgerItem, autoSyncBudget: boolean = true) => {
    setLedgerItems(prev => {
      const updated = [newItem, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY_LEDGER, JSON.stringify(updated));
      } catch (e) {
        console.error('Gagal menyimpan ledger:', e);
      }
      return updated;
    });

    // Otomatis sinkronkan realisasi anggaran jika diaktifkan
    if (autoSyncBudget) {
      updateBudgetConfig({
        realisasiAnggaran: budgetConfig.realisasiAnggaran + newItem.nominal
      });

      // Update kategori anggaran yang bersangkutan
      setKategoriAnggaran(prev => {
        const updated = prev.map(k => {
          if (newItem.pos_anggaran.toLowerCase().includes(k.nama.toLowerCase().slice(0, 8))) {
            const newRealisasi = k.realisasi + newItem.nominal;
            const persentase = Math.min(100, Math.round((newRealisasi / k.pagu) * 100));
            return { ...k, realisasi: newRealisasi, persentase };
          }
          return k;
        });
        try {
          localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(updated));
        } catch (e) {
          console.error('Gagal menyimpan kategori:', e);
        }
        return updated;
      });
    }
  };

  const updateLedgerItem = (id_spj: string, updatedFields: Partial<LpjLedgerItem>) => {
    setLedgerItems(prev => {
      const updated = prev.map(item => item.id_spj === id_spj ? { ...item, ...updatedFields } : item);
      try {
        localStorage.setItem(STORAGE_KEY_LEDGER, JSON.stringify(updated));
      } catch (e) {
        console.error('Gagal menyimpan ledger:', e);
      }
      return updated;
    });
  };

  const deleteLedgerItem = (id_spj: string) => {
    setLedgerItems(prev => {
      const target = prev.find(item => item.id_spj === id_spj);
      const updated = prev.filter(item => item.id_spj !== id_spj);
      try {
        localStorage.setItem(STORAGE_KEY_LEDGER, JSON.stringify(updated));
      } catch (e) {
        console.error('Gagal menyimpan ledger:', e);
      }

      if (target) {
        // Kurangi realisasi anggaran secara terintegrasi
        updateBudgetConfig({
          realisasiAnggaran: Math.max(0, budgetConfig.realisasiAnggaran - target.nominal)
        });
      }

      return updated;
    });
  };

  // Updater Poin-Poin Dampak (ESG Metrics)
  const updateEsgImpact = (id: string, updatedFields: Partial<LpjEsgImpact>) => {
    setEsgImpacts(prev => {
      const updated = prev.map(impact => impact.id === id ? { ...impact, ...updatedFields } : impact);
      try {
        localStorage.setItem(STORAGE_KEY_ESG, JSON.stringify(updated));
      } catch (e) {
        console.error('Gagal menyimpan ESG impacts:', e);
      }
      return updated;
    });
  };

  const addEsgImpact = (newImpact: LpjEsgImpact) => {
    setEsgImpacts(prev => {
      const updated = [...prev, newImpact];
      try {
        localStorage.setItem(STORAGE_KEY_ESG, JSON.stringify(updated));
      } catch (e) {
        console.error('Gagal menyimpan ESG impacts:', e);
      }
      return updated;
    });
  };

  const deleteEsgImpact = (id: string) => {
    setEsgImpacts(prev => {
      const updated = prev.filter(i => i.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY_ESG, JSON.stringify(updated));
      } catch (e) {
        console.error('Gagal menyimpan ESG impacts:', e);
      }
      return updated;
    });
  };

  return (
    <LpjContext.Provider value={{
      budgetConfig,
      updateBudgetConfig,
      kategoriAnggaran,
      updateKategoriRealisasi,
      ledgerItems,
      addLedgerItem,
      updateLedgerItem,
      deleteLedgerItem,
      esgImpacts,
      updateEsgImpact,
      addEsgImpact,
      deleteEsgImpact
    }}>
      {children}
    </LpjContext.Provider>
  );
};

export const useLpj = () => {
  const context = useContext(LpjContext);
  if (!context) {
    throw new Error('useLpj harus digunakan di dalam LpjProvider');
  }
  return context;
};

