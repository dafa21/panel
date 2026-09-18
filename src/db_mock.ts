// Mock Database untuk simulasi prototipe

export interface Warga {
  id_warga: string;
  nama: string;
  id_dai: string;
  id_pelanggan_pln: string;
  golongan_va: string;
  latitude: number;
  longitude: number;
  total_poin: number;
}

export interface Dai {
  id_dai: string;
  nama: string;
  regional: string;
}

export interface Amaliyah {
  id_amaliyah: string;
  nama: string;
  kategori: 'wajib' | 'sunnah' | 'sosial' | 'dakwah' | 'pendidikan' | 'kebersihan';
  poin: number;
  deskripsi?: string;
  target_bulanan?: number;
  status_aktif?: boolean;
}

export interface TrxAmaliyah {
  id_trx: string;
  id_dai: string;
  id_warga: string;
  id_amaliyah: string;
  tanggal: string;
  latitude: number;
  longitude: number;
  kwh_meter: number;
}

export const mockDai: Dai[] = [
  { id_dai: 'D01', nama: 'Ustadz Ahmad', regional: 'Jawa Barat' },
  { id_dai: 'D02', nama: 'Ustadz Budi', regional: 'Jawa Tengah' },
];

export const mockWarga: Warga[] = [
  {
    id_warga: 'W001',
    nama: 'Bapak Supriadi',
    id_dai: 'D01',
    id_pelanggan_pln: '112233445566',
    golongan_va: '900',
    latitude: -6.914744,
    longitude: 107.609810,
    total_poin: 1500,
  },
  {
    id_warga: 'W002',
    nama: 'Ibu Siti',
    id_dai: 'D01',
    id_pelanggan_pln: '112233445567',
    golongan_va: '450',
    latitude: -6.920000,
    longitude: 107.615000,
    total_poin: 45000, // Siap redeem
  },
  {
    id_warga: 'W003',
    nama: 'Bapak Joko',
    id_dai: 'D02',
    id_pelanggan_pln: '112233445568',
    golongan_va: '900',
    latitude: -7.250445,
    longitude: 112.768845,
    total_poin: 25000,
  }
];

export const mockAmaliyah: Amaliyah[] = [
  { id_amaliyah: 'A01', nama: 'Sholat 5 Waktu Berjamaah', kategori: 'wajib', poin: 50, deskripsi: 'Menegakkan sholat fardhu berjamaah di masjid/mushola desa', target_bulanan: 150, status_aktif: true },
  { id_amaliyah: 'A02', nama: 'Puasa Sunnah Senin Kamis', kategori: 'sunnah', poin: 30, deskripsi: 'Melaksanakan puasa sunnah di hari Senin atau Kamis', target_bulanan: 8, status_aktif: true },
  { id_amaliyah: 'A03', nama: 'Kerja Bakti Desa & Lingkungan', kategori: 'sosial', poin: 25, deskripsi: 'Gotong royong membersihkan saluran air dan fasilitas umum', target_bulanan: 4, status_aktif: true },
  { id_amaliyah: 'A04', nama: 'Hadir Majelis Taklim & Pengajian', kategori: 'wajib', poin: 40, deskripsi: 'Mengikuti pembinaan rutin keislaman bersama da\'i', target_bulanan: 4, status_aktif: true },
  { id_amaliyah: 'A05', nama: 'Tilawah Al-Quran 1 Juz', kategori: 'sunnah', poin: 25, deskripsi: 'Membaca mushaf Al-Quran mandiri atau tadarus bersama', target_bulanan: 30, status_aktif: true },
  { id_amaliyah: 'A06', nama: 'Sedekah Subuh & Infaq Mandiri', kategori: 'sosial', poin: 20, deskripsi: 'Menyisihkan sebagian rezeki untuk kas sosial warga duafa', target_bulanan: 30, status_aktif: true },
  { id_amaliyah: 'A07', nama: 'Sholat Tahajud / Qiyamul Lail', kategori: 'sunnah', poin: 45, deskripsi: 'Mendirikan sholat malam di sepertiga malam terakhir', target_bulanan: 15, status_aktif: true },
  { id_amaliyah: 'A08', nama: 'Bimbingan Belajar Mengaji Anak', kategori: 'pendidikan', poin: 35, deskripsi: 'Membimbing anak-anak warga belajar membaca iqro & tajwid', target_bulanan: 12, status_aktif: true },
  { id_amaliyah: 'A09', nama: 'Operasi Bersih Sanitasi & Masjid', kategori: 'kebersihan', poin: 25, deskripsi: 'Menjaga kebersihan dan higienitas tempat wudhu & masjid', target_bulanan: 4, status_aktif: true },
];

export const mockHistory: TrxAmaliyah[] = [
  { id_trx: 'TRX005', id_dai: 'D01', id_warga: 'W001', id_amaliyah: 'A01', tanggal: '2026-09-09 12:15', latitude: -6.9147, longitude: 107.6098, kwh_meter: 1.2 },
  { id_trx: 'TRX006', id_dai: 'D01', id_warga: 'W002', id_amaliyah: 'A02', tanggal: '2026-09-09 17:30', latitude: -6.9200, longitude: 107.6150, kwh_meter: 1.0 },
  { id_trx: 'TRX007', id_dai: 'D02', id_warga: 'W003', id_amaliyah: 'A01', tanggal: '2026-09-09 18:45', latitude: -7.2504, longitude: 112.7688, kwh_meter: 1.5 },
  { id_trx: 'TRX008', id_dai: 'D01', id_warga: 'W001', id_amaliyah: 'A04', tanggal: '2026-09-10 09:00', latitude: -6.9147, longitude: 107.6098, kwh_meter: 0.9 },
  { id_trx: 'TRX009', id_dai: 'D01', id_warga: 'W002', id_amaliyah: 'A01', tanggal: '2026-09-10 12:20', latitude: -6.9200, longitude: 107.6150, kwh_meter: 1.5 },
  { id_trx: 'TRX010', id_dai: 'D02', id_warga: 'W003', id_amaliyah: 'A05', tanggal: '2026-09-10 16:30', latitude: -7.2504, longitude: 112.7688, kwh_meter: 0.8 },
  { id_trx: 'TRX011', id_dai: 'D01', id_warga: 'W001', id_amaliyah: 'A03', tanggal: '2026-09-11 07:30', latitude: -6.9147, longitude: 107.6098, kwh_meter: 1.4 },
  { id_trx: 'TRX012', id_dai: 'D01', id_warga: 'W002', id_amaliyah: 'A04', tanggal: '2026-09-11 13:00', latitude: -6.9200, longitude: 107.6150, kwh_meter: 1.1 },
  { id_trx: 'TRX013', id_dai: 'D02', id_warga: 'W003', id_amaliyah: 'A01', tanggal: '2026-09-11 18:30', latitude: -7.2504, longitude: 112.7688, kwh_meter: 1.5 },
  { id_trx: 'TRX014', id_dai: 'D01', id_warga: 'W001', id_amaliyah: 'A01', tanggal: '2026-09-12 12:15', latitude: -6.9147, longitude: 107.6098, kwh_meter: 1.5 },
  { id_trx: 'TRX015', id_dai: 'D01', id_warga: 'W002', id_amaliyah: 'A05', tanggal: '2026-09-12 15:45', latitude: -6.9200, longitude: 107.6150, kwh_meter: 0.7 },
  { id_trx: 'TRX016', id_dai: 'D02', id_warga: 'W003', id_amaliyah: 'A02', tanggal: '2026-09-12 17:40', latitude: -7.2504, longitude: 112.7688, kwh_meter: 1.0 },
  { id_trx: 'TRX017', id_dai: 'D01', id_warga: 'W001', id_amaliyah: 'A02', tanggal: '2026-09-13 06:00', latitude: -6.9147, longitude: 107.6098, kwh_meter: 1.0 },
  { id_trx: 'TRX018', id_dai: 'D01', id_warga: 'W002', id_amaliyah: 'A01', tanggal: '2026-09-13 12:20', latitude: -6.9200, longitude: 107.6150, kwh_meter: 1.5 },
  { id_trx: 'TRX019', id_dai: 'D02', id_warga: 'W003', id_amaliyah: 'A04', tanggal: '2026-09-13 14:10', latitude: -7.2504, longitude: 112.7688, kwh_meter: 1.2 },
  { id_trx: 'TRX001', id_dai: 'D01', id_warga: 'W001', id_amaliyah: 'A01', tanggal: '2026-09-14 12:30', latitude: -6.9147, longitude: 107.6098, kwh_meter: 1.5 },
  { id_trx: 'TRX002', id_dai: 'D01', id_warga: 'W002', id_amaliyah: 'A01', tanggal: '2026-09-14 12:30', latitude: -6.9200, longitude: 107.6150, kwh_meter: 1.5 },
  { id_trx: 'TRX020', id_dai: 'D02', id_warga: 'W003', id_amaliyah: 'A01', tanggal: '2026-09-14 18:30', latitude: -7.2504, longitude: 112.7688, kwh_meter: 1.5 },
  { id_trx: 'TRX003', id_dai: 'D02', id_warga: 'W003', id_amaliyah: 'A03', tanggal: '2026-09-15 08:00', latitude: -7.2504, longitude: 112.7688, kwh_meter: 0.5 },
  { id_trx: 'TRX004', id_dai: 'D01', id_warga: 'W001', id_amaliyah: 'A05', tanggal: '2026-09-15 10:15', latitude: -6.9147, longitude: 107.6098, kwh_meter: 0.8 },
  { id_trx: 'TRX021', id_dai: 'D01', id_warga: 'W002', id_amaliyah: 'A04', tanggal: '2026-09-15 11:00', latitude: -6.9200, longitude: 107.6150, kwh_meter: 1.2 },
];

export const NILAI_KONVERSI = 1; // 1 poin = Rp1 (Untuk mempermudah demonstrasi, 1 poin = Rp1)

export const AMBANG_BATAS_REDEEM = [20000, 50000, 100000];

export interface PvOffGrid {
  id_pv: string;
  nama_lokasi: string;
  detail: string;
  latitude: number;
  longitude: number;
  // Alamat & Wilayah Detail
  alamat_lengkap: string;
  dusun: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kode_pos: string;

  // Kapasitas & Spesifikasi Energi
  total_kwh: number; // Kapasitas sistem kWh
  kapasitas_wp: number; // Watt Peak (Wp)
  kapasitas_baterai_kwh: number; // Kapasitas penyimpanan baterai
  jenis_baterai: string; // misal 'LiFePO4 48V'
  inverter_spec: string; // misal 'Hybrid Pure Sine Wave 10 kW'
  ketahanan: number;
  satuan_ketahanan: 'Jam' | 'Hari';
  rata_produksi_harian_kwh: number;

  // Penerima Manfaat
  jumlah_rumah: number;
  jumlah_kk: number;
  jumlah_jiwa: number;
  kw_per_rumah: number;

  // Integrasi Amaliyah & Token
  id_dai_pembina: string;
  nama_dai: string;
  amaliyah_progress_persen: number;
  target_amaliyah_bulanan: number;
  amaliyah_tercapai: number;
  total_rupiah_redeem: number; // Total rupiah terkonversi dari redeem token amaliyah
  total_poin_terkonversi: number;
  total_kwh_terdistribusi: number;

  // Dokumentasi & Status Operasional
  galeri_foto: string[];
  tanggal_peresmian: string;
  status_operasional: 'Optimal' | 'Pemeliharaan' | 'Siaga';
  tingkat_kesehatan: number; // Persentase kesehatan sistem (misal 99.2)
  reduksi_co2_kg: number;
  penghematan_bbm_liter: number;
  catatan_maintenance: string;
  tanggal_maintenance_terakhir: string;
  warga_terhubung_ids?: string[];
}

export const mockPvOffGrid: PvOffGrid[] = [
  {
    id_pv: 'PV001',
    nama_lokasi: 'Desa Sukamaju, Dusun 3',
    detail: 'Medan pegunungan terisolir, panel terpasang kokoh di atap balai pertemuan desa dengan baterai cadangan 2 hari.',
    latitude: -6.950000,
    longitude: 107.500000,
    alamat_lengkap: 'Jl. Pasir Wangi No. 45, RT 02/RW 03, Dusun 3, Desa Sukamaju, Kec. Cililin, Kab. Bandung Barat, Jawa Barat 40562',
    dusun: 'Dusun 3 Pasir Wangi',
    desa: 'Sukamaju',
    kecamatan: 'Cililin',
    kabupaten: 'Bandung Barat',
    provinsi: 'Jawa Barat',
    kode_pos: '40562',
    total_kwh: 15,
    kapasitas_wp: 6200,
    kapasitas_baterai_kwh: 12.5,
    jenis_baterai: 'Lithium Iron Phosphate (LiFePO4) 48V 260Ah',
    inverter_spec: 'Hybrid Pure Sine Wave 5.5 kW / MPPT 100A',
    ketahanan: 2,
    satuan_ketahanan: 'Hari',
    rata_produksi_harian_kwh: 18.5,
    jumlah_rumah: 30,
    jumlah_kk: 28,
    jumlah_jiwa: 114,
    kw_per_rumah: 0.5,
    id_dai_pembina: 'D01',
    nama_dai: 'Ustadz Ahmad (Regional Jabar)',
    amaliyah_progress_persen: 86.4,
    target_amaliyah_bulanan: 600,
    amaliyah_tercapai: 518,
    total_rupiah_redeem: 142000,
    total_poin_terkonversi: 142000,
    total_kwh_terdistribusi: 48.6,
    galeri_foto: [
      '/pv-photos/rooftop-1.jpg',
      '/pv-photos/battery-1.jpg',
      '/pv-photos/meter-1.jpg'
    ],
    tanggal_peresmian: '14 Januari 2026',
    status_operasional: 'Optimal',
    tingkat_kesehatan: 98.8,
    reduksi_co2_kg: 520,
    penghematan_bbm_liter: 195,
    catatan_maintenance: 'Pembersihan panel berkala & inspeksi grounding aman, efisiensi inverter 97.4%',
    tanggal_maintenance_terakhir: '08 September 2026',
    warga_terhubung_ids: ['W001', 'W002']
  },
  {
    id_pv: 'PV002',
    nama_lokasi: 'Dusun Teratai Indah',
    detail: 'Pemasangan komunal microgrid 2 titik terintegrasi panel surya mounted & baterai sentral menyuplai seluruh rumah warga binaan.',
    latitude: -7.210445,
    longitude: 112.728845,
    alamat_lengkap: 'Kawasan Pesisir Tambak Asri, RT 04/RW 02, Dusun Teratai Indah, Kel. Tambakkedi, Kec. Semampir, Kota Surabaya, Jawa Timur 60155',
    dusun: 'Dusun Teratai Indah',
    desa: 'Tambakkedi',
    kecamatan: 'Semampir',
    kabupaten: 'Surabaya',
    provinsi: 'Jawa Timur',
    kode_pos: '60155',
    total_kwh: 50,
    kapasitas_wp: 18500,
    kapasitas_baterai_kwh: 42.0,
    jenis_baterai: 'Modular LiFePO4 Rack System 51.2V 800Ah High-Cycle',
    inverter_spec: '3-Phase Industrial Solar Inverter 20 kW Smart Grid',
    ketahanan: 24,
    satuan_ketahanan: 'Jam',
    rata_produksi_harian_kwh: 64.2,
    jumlah_rumah: 100,
    jumlah_kk: 94,
    jumlah_jiwa: 376,
    kw_per_rumah: 0.5,
    id_dai_pembina: 'D02',
    nama_dai: 'Ustadz Budi (Regional Jatim)',
    amaliyah_progress_persen: 91.2,
    target_amaliyah_bulanan: 1500,
    amaliyah_tercapai: 1368,
    total_rupiah_redeem: 485000,
    total_poin_terkonversi: 485000,
    total_kwh_terdistribusi: 165.2,
    galeri_foto: [
      '/pv-photos/ground-1.jpg',
      '/pv-photos/battery-1.jpg',
      '/pv-photos/rooftop-1.jpg',
      '/pv-photos/meter-1.jpg'
    ],
    tanggal_peresmian: '03 Februari 2026',
    status_operasional: 'Optimal',
    tingkat_kesehatan: 99.4,
    reduksi_co2_kg: 1780,
    penghematan_bbm_liter: 640,
    catatan_maintenance: 'Inspeksi panel tanah & kalibrasi meteran prabayar warga selesai dilakukan, normal 100%',
    tanggal_maintenance_terakhir: '12 September 2026',
    warga_terhubung_ids: ['W003']
  }
];

export interface TrxRedeem {
  id_redeem: string;
  id_warga: string;
  tanggal: string;
  nominal_rp: number;
  poin_dipotong: number;
  status: 'Sukses' | 'Pending';
  token_pln?: string;
}

export const mockTrxRedeem: TrxRedeem[] = [
  {
    id_redeem: 'RDM001',
    id_warga: 'W002',
    tanggal: '2026-08-12 09:00',
    nominal_rp: 20000,
    poin_dipotong: 20000,
    status: 'Sukses',
    token_pln: '1234 - 5678 - 9012 - 3456 - 7890'
  }
];
