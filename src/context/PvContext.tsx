import React, { createContext, useContext, useState } from 'react';
import { mockPvOffGrid, type PvOffGrid } from '../db_mock';

interface PvContextType {
  pvList: PvOffGrid[];
  addPv: (pv: PvOffGrid) => void;
  updatePv: (id_pv: string, updated: Partial<PvOffGrid>) => void;
  deletePv: (id_pv: string) => void;
  resetPvList: () => void;
  
  // State Modal Detail Global (bisa dipanggil dari mana saja)
  isDetailModalOpen: boolean;
  selectedPv: PvOffGrid | null;
  openDetailModal: (pv: PvOffGrid) => void;
  closeDetailModal: () => void;
}

const STORAGE_KEY_PV = 'simddii_pv_offgrid_list';

const PvContext = createContext<PvContextType | undefined>(undefined);

export const PvProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pvList, setPvList] = useState<PvOffGrid[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PV);
      if (saved) {
        const parsed: PvOffGrid[] = JSON.parse(saved);
        return parsed.map((item) => {
          const defaultItem = mockPvOffGrid.find(m => m.id_pv === item.id_pv) || item;
          return {
            ...defaultItem,
            ...item,
            galeri_foto: Array.isArray(item.galeri_foto) && item.galeri_foto.length > 0 
              ? item.galeri_foto 
              : (defaultItem.galeri_foto || ['/pv-photos/rooftop-1.jpg'])
          };
        });
      }
    } catch (e) {
      console.error('Gagal membaca data PV dari localStorage:', e);
    }
    return mockPvOffGrid;
  });

  const [selectedPv, setSelectedPv] = useState<PvOffGrid | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Sync perubahan pvList ke localStorage
  const saveToStorage = (newList: PvOffGrid[]) => {
    try {
      localStorage.setItem(STORAGE_KEY_PV, JSON.stringify(newList));
    } catch (e) {
      console.error('Gagal menyimpan data PV ke localStorage:', e);
    }
  };

  const addPv = (newPv: PvOffGrid) => {
    setPvList(prev => {
      const updated = [newPv, ...prev];
      saveToStorage(updated);
      return updated;
    });
  };

  const updatePv = (id_pv: string, updated: Partial<PvOffGrid>) => {
    setPvList(prev => {
      const updatedList = prev.map(pv => pv.id_pv === id_pv ? { ...pv, ...updated } : pv);
      saveToStorage(updatedList);
      // Jika PV yang sedang dibuka detailnya diedit, update juga selectedPv
      if (selectedPv && selectedPv.id_pv === id_pv) {
        setSelectedPv(prevSel => prevSel ? { ...prevSel, ...updated } : null);
      }
      return updatedList;
    });
  };

  const deletePv = (id_pv: string) => {
    setPvList(prev => {
      const updatedList = prev.filter(pv => pv.id_pv !== id_pv);
      saveToStorage(updatedList);
      if (selectedPv && selectedPv.id_pv === id_pv) {
        setIsDetailModalOpen(false);
        setSelectedPv(null);
      }
      return updatedList;
    });
  };

  const resetPvList = () => {
    setPvList(mockPvOffGrid);
    saveToStorage(mockPvOffGrid);
  };

  const openDetailModal = (pv: PvOffGrid) => {
    // Selalu ambil versi terbaru dari pvList berdasarkan ID
    const livePv = pvList.find(p => p.id_pv === pv.id_pv) || pv;
    setSelectedPv(livePv);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
  };

  return (
    <PvContext.Provider
      value={{
        pvList,
        addPv,
        updatePv,
        deletePv,
        resetPvList,
        isDetailModalOpen,
        selectedPv,
        openDetailModal,
        closeDetailModal
      }}
    >
      {children}
    </PvContext.Provider>
  );
};

export const usePv = (): PvContextType => {
  const context = useContext(PvContext);
  if (!context) {
    throw new Error('usePv harus digunakan di dalam PvProvider');
  }
  return context;
};
