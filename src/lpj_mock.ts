export interface LpjBudgetConfig {
  paguAnggaran: number;
  realisasiAnggaran: number;
  targetKwh: number;
  biayaPerJiwa: number;
  statusAudit: string;
  periodeAktif: string;
  nomorLpj: string;
}

export const defaultLpjBudgetConfig: LpjBudgetConfig = {
  paguAnggaran: 150000000,
  realisasiAnggaran: 112500000,
  targetKwh: 1250,
  biayaPerJiwa: 37500,
  statusAudit: 'Wajar Tanpa Pengecualian (WTP) - Terverifikasi Digital',
  periodeAktif: 'Kuartal III 2026 (Juli - September)',
  nomorLpj: 'SIMDDII/LPJ-Q3/2026/09/01'
};

export interface LpjKategoriAnggaran {
  id: string;
  nama: string;
  pagu: number;
  realisasi: number;
  persentase: number;
  keterangan: string;
  color: string;
}

export const mockLpjKategori: LpjKategoriAnggaran[] = [
  {
    id: 'KAT-01',
    nama: 'Subsidi Token Listrik Warga',
    pagu: 60000000,
    realisasi: 48000000,
    persentase: 80,
    keterangan: 'Penyaluran token listrik prabayar 450VA & 900VA sesuai akumulasi poin amaliyah',
    color: '#3b82f6'
  },
  {
    id: 'KAT-02',
    nama: 'Kafalah & Operasional Da\'i Pembina',
    pagu: 45000000,
    realisasi: 36000000,
    persentase: 80,
    keterangan: 'Transportasi, monitoring GIS mobile, dan bimbingan rutin da\'i pedesaan',
    color: '#10b981'
  },
  {
    id: 'KAT-03',
    nama: 'Pemeliharaan & Komponen PV Off-Grid',
    pagu: 25000000,
    realisasi: 16500000,
    persentase: 66,
    keterangan: 'Suku cadang inverter, aki baterai solar, dan instalasi jaringan komunal',
    color: '#f59e0b'
  },
  {
    id: 'KAT-04',
    nama: 'Pembinaan Amaliyah & Majelis Taklim',
    pagu: 12000000,
    realisasi: 8000000,
    persentase: 67,
    keterangan: 'Pengadaan mushaf Al-Qur\'an, buku panduan ibadah, dan konsumsi taklim warga',
    color: '#8b5cf6'
  },
  {
    id: 'KAT-05',
    nama: 'Administrasi, Audit & Sistem Cloud',
    pagu: 8000000,
    realisasi: 4000000,
    persentase: 50,
    keterangan: 'Server database SIMDDII, audit kepatuhan syariah, dan pelaporan LPJ',
    color: '#06b6d4'
  }
];

export interface LpjLedgerItem {
  id_spj: string;
  tanggal: string;
  pos_anggaran: string;
  uraian: string;
  penerima: string;
  wilayah: string;
  nominal: number;
  status_verifikasi: string;
  bukti_dokumen: string;
}

export const mockLpjLedger: LpjLedgerItem[] = [
  {
    id_spj: 'SPJ/2026/07/001',
    tanggal: '2026-07-15',
    pos_anggaran: 'Subsidi Token Listrik',
    uraian: 'Penyaluran voucher token listrik tahap 1 warga binaan',
    penerima: 'Ibu Siti & Bpk Joko',
    wilayah: 'Jawa Barat & Jateng',
    nominal: 15000000,
    status_verifikasi: 'Terverifikasi Valid',
    bukti_dokumen: 'Kuitansi & No. Stroom PLN'
  },
  {
    id_spj: 'SPJ/2026/07/002',
    tanggal: '2026-07-28',
    pos_anggaran: 'Kafalah & Operasional Da\'i',
    uraian: 'Kafalah pembinaan spiritual dan monitoring da\'i bulan Juli',
    penerima: 'Ustadz Ahmad & Ustadz Budi',
    wilayah: 'Regional Jabar & Jateng',
    nominal: 12000000,
    status_verifikasi: 'Terverifikasi Transfer',
    bukti_dokumen: 'Bukti Transfer Bank Syariah'
  },
  {
    id_spj: 'SPJ/2026/08/08',
    tanggal: '2026-08-08',
    pos_anggaran: 'Pemeliharaan PV Surya',
    uraian: 'Penggantian kabel DC solar cell dan pengecekan aki PLTS',
    penerima: 'Teknisi Energi Surya',
    wilayah: 'Desa Sukamaju (Jabar)',
    nominal: 5500000,
    status_verifikasi: 'Terverifikasi Berita Acara',
    bukti_dokumen: 'Berita Acara Pekerjaan'
  },
  {
    id_spj: 'SPJ/2026/08/20',
    tanggal: '2026-08-20',
    pos_anggaran: 'Subsidi Token Listrik',
    uraian: 'Penyaluran token listrik amaliyah reward tahap 2',
    penerima: 'Warga Binaan Memenuhi Ambang',
    wilayah: 'Regional Jawa Barat',
    nominal: 18000000,
    status_verifikasi: 'Terverifikasi Valid',
    bukti_dokumen: 'Batch Voucher PLN Token'
  },
  {
    id_spj: 'SPJ/2026/08/29',
    tanggal: '2026-08-29',
    pos_anggaran: 'Kafalah & Operasional Da\'i',
    uraian: 'Kafalah bimbingan rutin dan transport da\'i bulan Agustus',
    penerima: 'Ustadz Ahmad & Ustadz Budi',
    wilayah: 'Regional Jabar & Jateng',
    nominal: 12000000,
    status_verifikasi: 'Terverifikasi Transfer',
    bukti_dokumen: 'Bukti Transfer Bank Syariah'
  },
  {
    id_spj: 'SPJ/2026/09/04',
    tanggal: '2026-09-04',
    pos_anggaran: 'Pembinaan Amaliyah',
    uraian: 'Pengadaan mushaf Al-Qur\'an dan buku saku dzikir amaliyah',
    penerima: 'Distributor Buku Islami',
    wilayah: 'Jawa Barat & Jateng',
    nominal: 4000000,
    status_verifikasi: 'Terverifikasi Faktur',
    bukti_dokumen: 'Faktur & Berita Acara Serah'
  },
  {
    id_spj: 'SPJ/2026/09/10',
    tanggal: '2026-09-10',
    pos_anggaran: 'Subsidi Token Listrik',
    uraian: 'Penyaluran token listrik amaliyah reward tahap 3 (Q3 Final)',
    penerima: 'Ibu Siti & Bpk Joko',
    wilayah: 'Jawa Barat & Jateng',
    nominal: 15000000,
    status_verifikasi: 'Terverifikasi Valid',
    bukti_dokumen: 'Kuitansi & Bukti Stroom'
  },
  {
    id_spj: 'SPJ/2026/09/14',
    tanggal: '2026-09-14',
    pos_anggaran: 'Kafalah & Operasional Da\'i',
    uraian: 'Kafalah monitoring evaluasi dan verifikasi data GIS bulan September',
    penerima: 'Ustadz Ahmad & Ustadz Budi',
    wilayah: 'Regional Jabar & Jateng',
    nominal: 12000000,
    status_verifikasi: 'Terverifikasi Transfer',
    bukti_dokumen: 'Bukti Transfer Bank Syariah'
  },
  {
    id_spj: 'SPJ/2026/09/16',
    tanggal: '2026-09-16',
    pos_anggaran: 'Administrasi & Audit',
    uraian: 'Jasa audit kepatuhan akuntansi syariah & maintenance server GIS',
    penerima: 'Kantor Akuntan Publik & IT',
    wilayah: 'Kantor Pusat Jakarta',
    nominal: 4000000,
    status_verifikasi: 'Terverifikasi Faktur',
    bukti_dokumen: 'Laporan Hasil Audit Independen'
  }
];

export interface LpjMonthlyTrend {
  bulan: string;
  realisasiRp: number;
  kwhListrik: number;
  poinAmaliyah: number;
}

export const mockLpjMonthlyTrend: LpjMonthlyTrend[] = [
  { bulan: 'Juli 2026', realisasiRp: 32500000, kwhListrik: 380, poinAmaliyah: 21500 },
  { bulan: 'Agustus 2026', realisasiRp: 41000000, kwhListrik: 440, poinAmaliyah: 26000 },
  { bulan: 'September 2026', realisasiRp: 39000000, kwhListrik: 430, poinAmaliyah: 24000 }
];

export interface LpjEsgImpact {
  id: string;
  nomor: number;
  judul: string;
  highlight: string;
  deskripsi: string;
  kategori: 'ekonomi' | 'spiritual' | 'lingkungan' | 'lainnya';
  color: string;
}

export const defaultLpjEsgImpacts: LpjEsgImpact[] = [
  {
    id: 'esg-1',
    nomor: 1,
    judul: 'Dampak Penghematan Ekonomi',
    highlight: '42.5% pengeluaran listrik bulanan',
    deskripsi: 'Penyaluran token listrik amaliyah menghemat rata-rata 42.5% pengeluaran listrik bulanan keluarga warga pra-sejahtera, mengalokasikan dana kas untuk gizi dan pendidikan anak.',
    kategori: 'ekonomi',
    color: '#2563eb'
  },
  {
    id: 'esg-2',
    nomor: 2,
    judul: 'Dampak Keberdayaan Spiritual',
    highlight: '40% menjadi 92%',
    deskripsi: 'Rasio partisipasi sholat 5 waktu berjamaah dan majelis taklim meningkat pesat dari 40% menjadi 92% pasca pembinaan terarah Da\'i dan motivasi insentif energi.',
    kategori: 'spiritual',
    color: '#059669'
  },
  {
    id: 'esg-3',
    nomor: 3,
    judul: 'Dampak Reduksi Karbon Lingkungan',
    highlight: '~850 kg CO₂e',
    deskripsi: 'Optimalisasi pemanfaatan pembangkit PV off-grid surya berkontribusi mencegah emisi karbon sebesar ~850 kg CO₂e sepanjang periode evaluasi.',
    kategori: 'lingkungan',
    color: '#d97706'
  }
];
