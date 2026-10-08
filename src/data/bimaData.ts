// Data Kurva S, Master 31 Project, dan Kelengkapan Dokumen Kontrak PT BIMA

export interface KurvaData {
  m: number;
  names: string[];
  nil: number[];
  bob: number[];
  port: {
    p: (number | null)[];
    r: (number | null)[];
  };
  proj: {
    p: (number | null)[];
    r: (number | null)[];
  }[];
}

export interface MasterProject {
  no: number;
  n: string;
  g: string; // ON GOING, SELESAI, PO, LELANG
  nv: number; // Nilai M
  nt: string; // Teks Rupiah
  pem: string; // Pemilik
  bamk: string;
  ak: string;
  akt: string;
  ket: string;
  pl: number | null;
  pt: string;
  rl: number | null;
  rt: string;
  dv: number | null;
  st: string;
  sit: string;
  mit: string;
  ls: string;
  akd: string | null;
}

export interface ContractItem {
  s: 'G' | 'C'; // G = on going, C = close/selesai
  w: string; // WBS
  j: 'U' | 'V' | 'D'; // U = user, V = vendor, D = divisi
  n: string; // Nama
  pic: string;
  b: string; // Bucket nilai: '0 - 2.5M' | '2.5M - 5M' | '5M - 10M' | '> 10M'
  v: number; // Nilai
  p: number; // Progres %
  d: string; // 20 chars: A=ada, T=td, K=kosong, H=kosong, P=proses, D=divisi
  a: string | null; // Tgl mulai YYYY-MM-DD
  e: string | null; // Tgl selesai YYYY-MM-DD
}

export const K: KurvaData = {
  m: 33,
  names: [
    "Elektrifikasi 22 RTG Surabaya",
    "Konversi Energi RTG",
    "Refurbishment QCC Bitung/Belawan",
    "Elektrifikasi 3 RTG Semarang",
    "Retrofit QCC-04A JICT2",
    "Refurbishment CC-04 Ex-MTS Makassar",
    "Engine HMC B10 Berlian",
    "Genset dan GO Engine Belawan",
    "Conveyor C Bengkulu",
    "Conveyor TTL"
  ],
  nil: [146.7, 68.9, 43.4, 30.7, 35.1, 25.9, 11.4, 23.8, 37.7, 40.6],
  bob: [31.6, 14.9, 9.4, 6.6, 7.6, 5.6, 2.4, 5.1, 8.1, 8.7],
  port: {
    p: [10.6, 14.4, 15.5, 16.8, 19.5, 22.2, 23.7, 26.0, 28.1, 33.6, 36.7, 40.0, 42.8, 47.3, 50.5, 55.1, 58.2, 62.7, 66.4, 73.0, 74.3, 78.5, 81.1, 83.4, 90.3, 91.5, 93.8, 94.4, 94.9, 95.1, 99.0, 99.5, 100.0],
    r: [17.5, 18.7, 21.5, 23.6, 30.2, 31.0, 31.2, 32.8, 35.4, 36.8, 40.5, 43.2, 43.8, 46.9, 50.1, 53.0, 56.0, 59.3, 62.0, 65.1, 67.9, 70.4, 72.8, 74.1, 79.9, 81.4, 84.3, 85.4, 86.6, 87.9, 91.0, 93.7, null]
  },
  proj: [
    {
      p: [16.9, 27.0, 28.5, 31.4, 38.3, 44.9, 48.8, 54.1, 58.9, 64.4, 70.2, 72.8, 75.2, 77.5, 78.8, 80.0, 81.4, 81.9, 83.5, 85.9, 86.5, 88.5, 89.0, 91.5, 94.1, 97.1, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
      r: [35.8, 37.0, 45.0, 51.3, 66.5, 69.1, 69.9, 70.3, 74.7, 75.2, 75.8, 76.1, 76.4, 77.4, 78.2, 80.8, 81.8, 82.9, 82.9, 85.6, 87.5, 89.5, 90.2, 90.7, 93.4, 96.1, 98.4, 99.9, 100.0, 100.0, 100.0, 100.0, null]
    },
    {
      p: [35.3, 39.3, 43.4, 46.4, 50.2, 54.3, 55.7, 55.7, 55.7, 63.9, 65.4, 67.1, 68.6, 76.7, 78.4, 79.9, 81.4, 89.7, 91.2, 92.5, 93.6, 98.5, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
      r: [41.3, 47.4, 49.4, 49.4, 61.6, 61.6, 61.6, 61.6, 61.6, 61.6, 61.6, 71.8, 73.2, 74.9, 77.6, 79.2, 88.0, 93.2, 96.5, 97.5, 99.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, null]
    },
    {
      p: [null, null, null, null, null, null, null, 6.2, 7.3, 20.7, 22.6, 30.4, 32.0, 33.0, 35.9, 48.4, 50.3, 55.4, 69.3, 96.7, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
      r: [null, null, null, null, null, null, null, 15.6, 21.7, 26.2, 42.3, 45.9, 46.5, 46.5, 48.1, 55.5, 56.9, 65.1, 73.3, 88.0, 90.7, 95.2, 95.9, 98.9, 99.8, 99.8, 99.8, 99.8, 100.0, 100.0, 100.0, 100.0, null]
    },
    {
      p: [null, null, null, null, null, null, 0.0, 1.0, 6.5, 15.8, 24.5, 37.5, 39.1, 45.2, 56.0, 66.5, 74.1, 87.2, 94.2, 99.8, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
      r: [null, null, null, null, null, null, 0.0, 0.0, 3.4, 6.5, 30.5, 35.8, 36.0, 46.7, 49.7, 51.3, 53.9, 61.9, 64.7, 66.5, 74.3, 74.3, 74.3, 74.6, 76.4, 80.1, 89.0, 89.0, 90.0, 93.0, 96.2, 98.8, null]
    },
    {
      p: [null, null, null, null, null, null, null, null, 1.0, 10.1, 14.3, 22.0, 40.8, 43.2, 46.2, 56.6, 76.6, 95.5, 99.7, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
      r: [null, null, null, null, null, null, null, null, 4.5, 13.5, 19.0, 24.0, 27.0, 30.0, 38.8, 40.6, 43.8, 56.1, 68.0, 76.2, 86.2, 89.6, 94.1, 97.1, 98.0, 100.0, 100.9, 100.9, 100.9, 100.9, 100.9, 100.9, null]
    },
    {
      p: [null, null, null, null, null, null, null, null, null, null, null, null, null, 4.7, 4.7, 14.0, 15.5, 20.3, 34.9, 41.3, 51.0, 92.4, 98.6, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
      r: [null, null, null, null, null, null, null, null, null, null, null, null, null, 0.0, 5.1, 20.0, 23.1, 23.1, 29.1, 29.5, 33.5, 43.2, 55.7, 67.5, 84.1, 88.1, 89.5, 90.6, 91.3, 100.0, 100.0, 100.0, null]
    },
    {
      p: [null, null, null, null, null, null, null, null, null, null, null, null, 7.5, 22.5, 37.5, 47.5, 52.1, 55.6, 58.4, 61.9, 64.7, 67.4, 70.9, 73.7, 76.5, 79.3, 85.0, 90.0, 100.0, 100.0, 100.0, 100.0, 100.0],
      r: [null, null, null, null, null, null, null, null, null, null, null, null, 0.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 30.0, 38.0, 38.0, 42.0, 42.0, 42.0, 42.0, 42.0, 54.0, 54.0, 54.0, 94.0, 94.0, null]
    },
    {
      p: [null, null, null, null, null, null, null, null, null, null, null, null, null, 25.1, 43.8, 55.8, 55.8, 55.8, 55.8, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
      r: [null, null, null, null, null, null, null, null, null, null, null, null, null, 16.3, 40.9, 42.9, 55.8, 55.8, 55.8, 55.8, 55.8, 55.8, 55.8, 55.8, 55.8, 55.8, 55.8, 55.8, 55.8, 55.8, 55.8, 76.2, null]
    },
    {
      p: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 5.4, 12.8, 28.5, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
      r: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 5.4, 5.4, 5.4, 5.4, 5.4, 11.6, 11.6, 19.7, 22.1, 30.3, 46.5, null]
    },
    {
      p: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 14.2, 15.0, 17.2, 19.4, 33.6, 38.8, 42.0, 44.2, 88.7, 93.9, 100.0],
      r: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 11.0, 11.0, 53.8, 53.8, 64.3, 67.7, 72.7, 76.8, 91.5, 93.4, null]
    }
  ]
};

export const MAP: Record<number, number> = { 0: 3, 2: 8, 4: 9, 3: 7 };

export const M: MasterProject[] = [
  {"no":1,"n":"Elektrifikasi 3 (Tiga) Unit Rubber Tyred Gantry Crane (RTG) di Terminal Petikemas Semarang","g":"ON GOING","nv":30.7,"nt":"Rp 30.700.000.000","pem":"PT Pelindo Terminal Petikemas - TPK Semarang","bamk":"25 Jul 2024","ak":"31 Mar 2026","akt":"31 Mar 2026","ket":"*Sedang diajukan addendum tambah waktu dan tambah kurang","pl":100.0,"pt":"100%","rl":95.0,"rt":"95%","dv":-5.0,"st":"DELAYED","sit":"Sedang diajukan addendum tambah waktu dan tambah kurang. PT BIMA dikenakan denda per unit sesuai dengan realisasi pekerjaan; Unit ke-3 estimasi selesai 30 Oktober 2026.","mit":"Vendor yang dikenakan denda secara back to back adalah Vahle dan SSTI.","ls":"Untuk pekerjaan kompleks seperti elektrifikasi dan refurbishment (pekerjaan lebih dari satu vendor) dapat mulai dimitigasi dengan pemberian konsekuensi yang setara dengan yang harus ditanggung PT BIMA. Diusulkan untuk denda per unit mengexcludekan pekerjaan sipil.","akd":"2026-03-31"},
  {"no":2,"n":"Elektrifikasi Fix Crane di Pelabuhan Gorontalo","g":"ON GOING","nv":4.7,"nt":"Rp 4.703.634.743","pem":"PT Pelabuhan Indonesia (Persero) Regional IV","bamk":"28 Nov 2025","ak":"15 Nov 2026","akt":"15 Nov 2026","ket":"-","pl":58.741,"pt":"58,74%","rl":56.982,"rt":"56,98%","dv":-1.76,"st":"ON TRACK","sit":"Dokumen perjanjian atas addendum untuk tahap 2 (dua) telah di proses oleh PT Pelindo Regional IV (User); PT BIMA menunggu kesiapan power PLN agar dapat melakukan energize unit Fix Crane 01; Untuk kesiapan pekerjaan tahap 2, diestimasikan akan dilakukan FAT pada minggu depan dan setelah material sesuai akan segera dilakukan pengiriman oleh subkontraktor.","mit":"-","ls":"Pengurusan SLO sebaiknya dibicarakan lebih lanjut pada kontrak-kontrak sejenis berikutnya.","akd":"2026-11-15"},
  {"no":3,"n":"Revitalisasi Conveyor C TCK Bengkulu","g":"ON GOING","nv":37.65,"nt":"Rp 37.650.000.000","pem":"PT Pelindo Multi Terminal","bamk":"8 Okt 2025","ak":"30 Sep 2026","akt":"20 Nov 2026","ket":"Sedang diajukan Addendum sd 20 Nov 2026","pl":100.0,"pt":"100%","rl":59.556,"rt":"59,56%","dv":-40.44,"st":"AT RISK","sit":"Sedang diajukan Addendum sd 20 Nov 2026. Project banyak terhambat pada proses Pengadaan dikarenakan penugasan pada awalnya diberikan kepada salah satu pelaksana; Tantangan Project selanjutnya adalah terkait knowledge dan experience dalam mengerjakan conveyor dari scratch sedangkan skema kontrak tidak begitu jelas apakah D&B atau Kontrak Harga Satuan.","mit":"Melibatkan konsultan DED dan melakukan pendampingan engineering sejak tahap awal untuk pekerjaan dengan tingkat kompleksitas tinggi, seperti revitalisasi conveyor, guna memastikan ketepatan desain, mitigasi risiko teknis, dan kelancaran pelaksanaan project.","ls":"-","akd":"2026-11-20"},
  {"no":4,"n":"Pengadaan Generator Set dan General Overhoul Engine Container Crane dan Rubber Tyred Gantry di Belawan New Container Terminal","g":"ON GOING","nv":21.77,"nt":"Rp 21.772.755.606","pem":"PT Prima Terminal Petikemas","bamk":"30 Des 2024","ak":"26 Nov 2025","akt":"26 Nov 2025","ket":"-","pl":100.0,"pt":"100%","rl":77.92,"rt":"77,92%","dv":-22.08,"st":"AT RISK","sit":"Pengadaan engine beserta generator telah dilakukan melalui mekanisme tebus 5 unit dari PT Altrak, MPL, dan OEM China oleh Rekanan (PT Tunas); Kesulitan pembiayaan dalam penyelesaian scope kontrak dari rekanan (PT Tunas).","mit":"Penyelesaian pekerjaan dengan komitmen dari sisi PT BIMA dan Pihak Rekanan sampai pekerjaan selesai.","ls":"Tidak melakukan negosiasi sebelum RKS dan ketentuan-ketentuan spesifikasi dapat dipastikan bersama dengan unit fungsi.","akd":"2025-11-26"},
  {"no":5,"n":"Pekerjaan Penggantian Belt Conveyor BC-01 B, TC A, TC B dan BC-02 A & B Serta Penggantian Drive Kit dan Drive Module Untuk Grab Ship Unloader di Terminal Teluk Lamong","g":"ON GOING","nv":40.6,"nt":"Rp 40.600.000.000","pem":"PT Pelindo Multi Terminal","bamk":"18 Nov 2025","ak":"13 Sep 2026","akt":"12 Nov 2026","ket":"Pengajuan addendum selama 60 hari kalender","pl":100.0,"pt":"100%","rl":92.76,"rt":"92,76%","dv":-7.24,"st":"ON TRACK","sit":"Pengajuan addendum selama 60 hari kalender. Addendum perpanjangan waktu telah disampaikan kepada User dan telah memperoleh persetujuan. Saat ini dalam proses penandatanganan secara sirkuler; Pekerjaan pemasangan belt BC-2A telah selesai. Saat ini menunggu pelaksanaan Comtest yang direncanakan pada 3 Oktober 2026, dengan catatan pekerjaan pendukung lainnya telah selesai dan kondisi belt telah berada pada posisi normal.","mit":"Melakukan pengecekan menyeluruh terhadap seluruh roller dan memastikan fungsi serta kondisi operasionalnya normal untuk mencegah abnormalitas saat running dan mendukung kelancaran pelaksanaan Comtest.","ls":"Mematangkan persiapan pekerjaan sebelum eksekusi, termasuk memastikan ketersediaan dan penataan alat bantu sesuai fungsi, kebutuhan, serta urutan pekerjaan, guna mendukung efektivitas dan kelancaran pelaksanaan di lapangan.","akd":"2026-11-12"},
  {"no":6,"n":"Pekerjaan Penataan dan Peningkatan Kinerja Suprastruktur di Terminal Petikemas Pantoloan","g":"ON GOING","nv":5.68,"nt":"Rp 5.680.000.000","pem":"PT Pelindo Terminal Petikemas - TPK Pantoloan","bamk":"1 Agu 2025","ak":"26 Juli 2026 / 24 September 2026","akt":"24 Sep 2026","ket":"Adendum tambah waktu sudah di stujui hingga 24 September 2026","pl":100.0,"pt":"100%","rl":77.644,"rt":"77,64%","dv":-22.36,"st":"AT RISK","sit":"Addendum perpanjangan waktu telah diterbitkan (akhir kontrak menjadi 24 Sept 2026); Pekerjaan Gearbox dan Motor Gantry RTG selesai; Motor Hoist QCC tiba di lokasi 2 Okt 2026; Pengajuan perijinan shutdown masih menunggu konfirmasi resmi terminal; Status dipastikan terlambat dari akhir kontrak.","mit":"Melakukan percepatan pemasangan Motor Hoist QCC melalui koordinasi intensif dengan pihak Terminal untuk memperoleh kepastian jadwal shutdown, serta memastikan kesiapan material, tools, manpower, dan metode kerja sebelum pelaksanaan pemasangan.","ls":"Mematangkan persiapan pekerjaan sebelum eksekusi dengan memastikan kesiapan material, alat bantu, dan penataannya sesuai fungsi, kebutuhan, serta urutan pekerjaan untuk mendukung kelancaran pelaksanaan di lapangan.","akd":"2026-09-24"},
  {"no":7,"n":"Pengadaan Spreader Twinlift dan Kabel Spreader Unit QCC di Terminal Petikemas Ternate","g":"ON GOING","nv":6.07,"nt":"Rp 6.070.000.000","pem":"PT Pelindo Terminal Petikemas TPK Ternate","bamk":"22 Des 2025","ak":"17 Des 2026","akt":"17 Des 2026","ket":"-","pl":22.16,"pt":"22,16%","rl":22.16,"rt":"22,16%","dv":0.0,"st":"ON TRACK","sit":"FAT Online Spreader Bromma telah dilaksanakan pada 2 Oktober 2026; Pemasangan Spreader direncanakan pada week 3–4 bulan November 2026.","mit":"Melakukan koordinasi intensif dengan shipping company terkait kepastian jadwal delivery dan MOS, serta melakukan penyesuaian jadwal operasional kapal di TPK Ternate. Memastikan kelengkapan dokumen customs sebelum proses delivery untuk meminimalkan potensi keterlambatan.","ls":"Untuk pengadaan spreader atau equipment yang memiliki kecenderungan pada brand tertentu, preferensi brand dari user perlu ditetapkan sejak Kick Off Meeting dengan mempertimbangkan populasi existing equipment, compatibility, ketersediaan spare part, kemudahan maintenance, dan aspek teknis lainnya.","akd":"2026-12-17"},
  {"no":8,"n":"Perbaikan After Accident Pada QCC 03 dan QCC 07 (Tahap-II) di Terminal Petikemas Banjarmasin","g":"ON GOING","nv":2.36,"nt":"Rp 2.357.854.000","pem":"PT Pelindo Terminal Petikemas - TPK Banjarmasin","bamk":"16 Feb 2026","ak":"3 Sep 2026","akt":"1 Jan 2027","ket":"Sedang diajukan addendum waktu s/d 1 Januari 2027","pl":100.0,"pt":"100%","rl":55.0,"rt":"55%","dv":-45.0,"st":"AT RISK","sit":"Sedang diajukan addendum waktu s/d 1 Januari 2027. Permohonan shutdown unit belum direalisasikan karena kondisi operasional terminal belum memungkinkan; Addendum kontrak masih proses approval; Material onsite, 2 unit beam bumper selesai terpasang.","mit":"Melakukan koordinasi intensif dengan user untuk mendapatkan kepastian jadwal shutdown, serta memanfaatkan waktu tunggu dengan memastikan kesiapan material, tools, manpower, dan metode kerja; Paralel melakukan monitoring proses approval addendum agar segera difinalisasi.","ls":"Melakukan early alignment dengan pihak terminal terkait kebutuhan dan kepastian shutdown, serta menyusun timeline pekerjaan yang mempertimbangkan kondisi operasional terminal untuk memastikan waktu pelaksanaan dapat direalisasikan sesuai rencana.","akd":"2027-01-01"},
  {"no":9,"n":"Penggantian Rail Trolley RTG di Terminal Petikemas Surabaya","g":"ON GOING","nv":2.67,"nt":"Rp 2.670.415.000","pem":"PT Pelindo Terminal Petikemas Surabaya","bamk":"20 Jul 2026","ak":"16 Des 2026 (MOS) / 15 Mei 2027 (Kontrak)","akt":"15 Mei 2027","ket":"-","pl":15.0,"pt":"15%","rl":15.0,"rt":"15%","dv":0.0,"st":"ON TRACK","sit":"Proses pengadaan kepada subkontraktor (PT Konecranes Material Handling Indonesia); Berita Acara Kesepakatan dasar pengadaan rail trolly ttd 17 Sept 2026 (BA.014/PRO-ME/IX/BIMA-2026).","mit":"Melakukan kesepakatan dengan KMHI dimana prosesnya sudah pasti PL (gagal lelang 2x).","ls":"Proses Pengadaan di Internal harus diperkuat untuk memangkas jangka waktu pelaksanaan pekerjaan menjadi lebih efektif.","akd":"2027-05-15"},
  {"no":10,"n":"Penggantian Pin Boogie TPS","g":"ON GOING","nv":2.84,"nt":"Rp 2.844.414.000","pem":"PT Pelindo Terminal Petikemas Surabaya","bamk":"20 Agu 2026","ak":"12 Mei 2027","akt":"12 Mei 2027","ket":"-","pl":15.0,"pt":"15%","rl":25.0,"rt":"25%","dv":10.0,"st":"ON TRACK","sit":"Proses pengadaan material kepada subkontraktor (PT Parina).","mit":"Melakukan kesepakatan dengan PT Parina dimana prosesnya sudah pasti PL (gagal lelang 2x).","ls":"Proses Pengadaan di Internal harus diperkuat untuk memangkas jangka waktu pelaksanaan pekerjaan menjadi lebih efektif.","akd":"2027-05-12"},
  {"no":11,"n":"Perbaikan Berat Hopper Kijing","g":"ON GOING","nv":1.49,"nt":"Rp 1.487.000.000","pem":"PT Pelindo Multi Terminal","bamk":"30 Apr 2026","ak":"27 Sep 2026","akt":"27 Sep 2026","ket":"-","pl":100.0,"pt":"100%","rl":68.58,"rt":"68,58%","dv":-31.42,"st":"AT RISK","sit":"Pengadaan material mengalami hambatan akibat keterlambatan procurement; Subkontraktor terlambat mulai pekerjaan; Proses pengajuan addendum scope lining Hopper material UHMWPE.","mit":"Memulai pekerjaan sesuai BAMK (untuk vendor).","ls":"Memulai pekerjaan tepat waktu dan sesuai dengan timeline yang diberikan rekanan.","akd":"2026-09-27"},
  {"no":12,"n":"Pekerjaan Perbaikan dan Pengadaan Drive Modul ACS 800 dan Kabel Festoon Trolley dan Hoist RTG 09 di TPK New Makassar Terminal 1","g":"ON GOING","nv":2.19,"nt":"Rp 2.195.000.000","pem":"PT Pelindo Terminal Petikemas New Makassar Terminal 1","bamk":"1 Des 2025","ak":"29 Jul 2026","akt":"29 Jul 2026","ket":"-","pl":47.18,"pt":"47,18%","rl":47.18,"rt":"47,18%","dv":0.0,"st":"ON TRACK","sit":"Material telah onsite 25 Sept 2026; Menunggu joint inspection sesuai RKS; Setelah sesuai, pekerjaan pemasangan akan segera dilaksanakan.","mit":"Mempercepat koordinasi & joint inspection; Memastikan dokumentasi & persetujuan; Menyiapkan manpower, equipment, & area kerja.","ls":"Memastikan pengiriman material sesuai schedule; Memastikan kesiapan area, manpower, & joint inspection sebelum material tiba untuk menghindari idle time.","akd":"2026-07-29"},
  {"no":13,"n":"Pengecatan 1 (Satu) Unit QCC Ex Koja di Pelabuhan Kijing","g":"ON GOING","nv":1.29,"nt":"Rp 1.287.000.000","pem":"PT Pelindo Terminal Petikemas","bamk":"31 Juli 2026 (Mulai Pekerjaan)","ak":"28 Okt 2026","akt":"28 Okt 2026","ket":"-","pl":88.554,"pt":"88,55%","rl":90.513,"rt":"90,51%","dv":1.96,"st":"ON TRACK","sit":"Progress pekerjaan painting masih berjalan sesuai rencana (on track) dan terus dimonitor untuk memastikan penyelesaian sesuai target yang telah ditetapkan.","mit":"-","ls":"-","akd":"2026-10-28"},
  {"no":14,"n":"Pengadaan 2 Unit Forklift Kapasitas 3 Ton di TPK Ternate","g":"ON GOING","nv":1.41,"nt":"Rp 1.410.000.000","pem":"PT Pelindo Terminal Petikemas TPK Ternate","bamk":"22 Jul 2026","ak":"20 Okt 2026","akt":"20 Okt 2026","ket":"-","pl":50.0,"pt":"50%","rl":50.0,"rt":"50%","dv":0.0,"st":"ON TRACK","sit":"Masih menunggu pengiriman forklift dari workshop rekanan ke site.","mit":"Melakukan monitoring & koordinasi intensif dengan vendor terkait kesiapan dan jadwal pengiriman.","ls":"Memastikan ketersediaan forklift sesuai spesifikasi RKS; Memastikan target delivery & estimasi kedatangan disepakati serta dipantau berkala.","akd":"2026-10-20"},
  {"no":15,"n":"Pengadaan Emergency Brake CC-06 TPS","g":"ON GOING","nv":1.8,"nt":"Rp 1.800.000.000","pem":"PT Terminal Petikemas Surabaya","bamk":"15 Okt 2025","ak":"19 Agu 2026","akt":"19 Agu 2026","ket":"-","pl":100.0,"pt":"100%","rl":90.0,"rt":"90%","dv":-10.0,"st":"DELAYED","sit":"Terjadi dispute terkait pengadaan material.","mit":"Mempercepat proses tagihan ke user dan penyelesaian addendum dengan vendor.","ls":"Memastikan & mempercepat penerimaan kontrak dari user; Memastikan pengiriman material & pemenuhan isi kontrak dengan vendor berjalan sesuai kesepakatan.","akd":"2026-08-19"},
  {"no":16,"n":"Pengadaan 3 (Tiga) Unit Spreader IPC Terminal Petikemas","g":"SELESAI","nv":9.74,"nt":"Rp 9.740.000.000","pem":"PT IPC Terminal Petikemas","bamk":"9 Okt 2025","ak":"7 Mei 2026","akt":"7 Mei 2026","ket":"-","pl":null,"pt":"-","rl":100.0,"rt":"100%","dv":null,"st":"DELAYED","sit":"BAST 23 Juli 2026; Proses perhitungan denda bersama IPC (user).","mit":"Mengajukan denda secara parsial per lokasi/site.","ls":"-","akd":"2026-05-07"},
  {"no":17,"n":"Pengadaan 4 (Empat) Unit Chassiss IPC Terminal Petikemas","g":"SELESAI","nv":2.34,"nt":"Rp 2.340.000.000","pem":"PT IPC Terminal Petikemas","bamk":"10 Okt 2025","ak":"9 Mar 2026","akt":"9 Mar 2026","ket":"-","pl":null,"pt":"-","rl":100.0,"rt":"100%","dv":null,"st":"DELAYED","sit":"BAST 25 Mei 2026; Proses penagihan ke IPC (user).","mit":"Mempercepat proses pengajuan tagihan dan perhitungan denda dengan user.","ls":"-","akd":"2026-03-09"},
  {"no":18,"n":"Pengadaan dan Pemasangan Emergency Hoist Brake Container Crane 01 dan 02 TPK Nilam","g":"SELESAI","nv":7.26,"nt":"Rp 7.256.200.000","pem":"PT Terminal Teluk Lamong - TPK Nilam","bamk":"3 Sep 2025","ak":"1 Mei 2026","akt":"1 Mei 2026","ket":"-","pl":null,"pt":"-","rl":100.0,"rt":"100%","dv":null,"st":"DELAYED","sit":"BAST 28 Agustus 2026; Unit sudah beroperasi dengan progres pekerjaan fisik 100%; Proses penagihan Termin III.","mit":"Mempercepat proses pengajuan dan approval tagihan Termin III.","ls":"-","akd":"2026-05-01"},
  {"no":19,"n":"Penggantian Wheel dan Modif Leg CC Ex-Koja di MNP dan Kijing","g":"SELESAI","nv":10.56,"nt":"Rp 10.563.020.000","pem":"PT Pelindo Terminal Petikemas","bamk":"26 Nov 2025","ak":"30 Sep 2026","akt":"30 Sep 2026","ket":"-","pl":null,"pt":"-","rl":100.0,"rt":"100%","dv":null,"st":"DONE (ON TRACK)","sit":"BAST 28 September 2026; Dalam proses pengurusan BAST; Dalam proses penyelesaian administrasi dan laporan project.","mit":"Mempercepat proses pemenuhan kelengkapan administrasi dan penyelesaian laporan.","ls":"-","akd":"2026-09-30"},
  {"no":20,"n":"Perbaikan Struktur Boom Quay Container Crane (QCC#01) Klaim Asuransi TPK New Makassar Terminal 2","g":"SELESAI","nv":7.52,"nt":"Rp 7.517.430.000","pem":"PT Pelindo Terminal Petikemas New Makassar","bamk":"1 Apr 2026","ak":"18 Sep 2026","akt":"18 Sep 2026","ket":"-","pl":null,"pt":"-","rl":100.0,"rt":"100%","dv":null,"st":"DONE (ON TRACK)","sit":"BAST 02 September 2026; Unit telah beroperasi dengan pekerjaan fisik mencapai 100%; Proses penagihan 100%.","mit":"Mempercepat proses pengajuan dan approval tagihan 100%.","ls":"-","akd":"2026-09-18"},
  {"no":21,"n":"Penataan dan Peningkatan Kinerja Suprastruktur di TPK Ambon Sub Item Pekerjaan Pengadaan Spreader Twin Lift Petikemas Empty Untuk QCC-01 di Terminal Petikemas Ambon","g":"SELESAI","nv":6.38,"nt":"Rp 6.385.000.000","pem":"TPK Ambon","bamk":"19 Des 2025","ak":"31 Des 2026","akt":"31 Des 2026","ket":"-","pl":null,"pt":"-","rl":100.0,"rt":"100%","dv":null,"st":"DONE","sit":"Dalam proses pengurusan BAST; Dalam proses penyelesaian Laporan Mingguan dan Laporan Bulanan.","mit":"Mempercepat proses BAST dan penyelesaian laporan sesuai kebutuhan administrasi project.","ls":"-","akd":"2026-12-31"},
  {"no":22,"n":"Pengadaan dan Pemasangan Sparepart Pada RS 01 Akibat Insiden di PT Terminal Teluk Lamong","g":"SELESAI","nv":1.88,"nt":"Rp 1.877.633.000","pem":"PT Terminal Teluk Lamong","bamk":"16 Apr 2026","ak":"12 Sep 2026","akt":"12 Sep 2026","ket":"-","pl":null,"pt":"-","rl":100.0,"rt":"100%","dv":null,"st":"DONE","sit":"Pekerjaan fisik 100%, Comtest belum dilaksanakan (menunggu GO Engine & Transmisi); Pekerjaan kombinasi dengan Tim Maintenance Site; Proses tagihan Termin I (30%).","mit":"Didukung BA Justifikasi/BA Kesepakatan untuk mengakomodir klausul Comtest; Koordinasi dengan User terkait pembayaran Termin I (30%).","ls":"-","akd":"2026-09-12"},
  {"no":23,"n":"Refurbishment QCC-04 Ex-MTS TPK Makassar","g":"SELESAI","nv":25.95,"nt":"Rp 25.948.340.000","pem":"PT Pelindo Terminal Petikemas","bamk":"27 Desember 2024 (Mulai Pekerjaan)","ak":"21 Des 2025","akt":"21 Des 2025","ket":"-","pl":null,"pt":"-","rl":100.0,"rt":"100%","dv":null,"st":"DONE (DELAYED)","sit":"BAST-1 20 Agustus 2026; Kontrak utama selesai, laporan closing berjalan; Keterlambatan 242 hari (denda maksimal); Trial Motor Thruster Brake dummy load 32,1 ton sukses; Operation Test menunggu rail clamp, cable control, kabel JB.","mit":"Percepatan pekerjaan pending (rail clamp, cable control, kabel JB sea side), testing memenuhi syarat sebelum Operation Test, laporan closing diselesaikan.","ls":"Memastikan seluruh pekerjaan, inspeksi, testing, dan dokumentasi closing terintegrasi dalam checklist readiness sebelum Operation Test dan closing project.","akd":"2025-12-21"},
  {"no":24,"n":"Pekerjaan Rekondisi Alat (QCC & RTG) Tahun 2026 di Terminal Petikemas Banjarmasin","g":"PO","nv":3.61,"nt":"Rp 3.606.000.000","pem":"PT Pelindo Terminal Petikemas","bamk":"BAMK belum ada (SP3 : 22 Sept 2026)","ak":"est. 18 Feb 2027","akt":"18 Feb 2027","ket":"150 hari kalender","pl":0.0,"pt":"0%","rl":0.0,"rt":"0%","dv":0.0,"st":"ACTIVE","sit":"BAMK user belum terbit; Proses PR (pembuatan & approval RKS, Kritek, Nodin PR, dll); Investasi SPTP.","mit":"Mempercepat penyelesaian dokumen internal pengadaan & approval; Koordinasi dengan terminal/user terkait metode & pelaporan.","ls":"-","akd":"2027-02-18"},
  {"no":25,"n":"Pekerjaan Investasi Pengadaan & Pemasangan Twinlift Spreader Quay Container Crane (QCC) TPK New Makassar Terminal 2","g":"PO","nv":12.15,"nt":"Rp 12.150.000.000","pem":"PT Pelindo Terminal Petikemas New Makassar","bamk":"Kick Off Meeting, Pembahasan Scope & Spesifikasi","ak":"-","akt":"-","ket":"320 hari kalender terhitung sejak BAMK","pl":0.0,"pt":"0%","rl":0.0,"rt":"0%","dv":0.0,"st":"ACTIVE","sit":"Proses pembahasan pekerjaan; Draft dokumen PR (Purchase Requisition) - penyusunan & review.","mit":"-","ls":"-","akd":null},
  {"no":26,"n":"Perbaikan Manlift Pada Alat Container Crane (CC) 03 di PT Pelindo TPK Bitung","g":"PO","nv":1.06,"nt":"Rp 1.055.287.000","pem":"PT Pelindo Terminal Petikemas - TPK Bitung","bamk":"-","ak":"-","akt":"-","ket":"180 hari kalender terhitung sejak BAMK","pl":0.0,"pt":"0%","rl":0.0,"rt":"0%","dv":0.0,"st":"ACTIVE","sit":"Proses penyusunan dokumen PR; Review kontrak antara PT BIMA dengan PT Pelindo Terminal Petikemas – TPK Bitung.","mit":"Koordinasi antara Legal BIMA dan Tim Teknik Bitung terkait review dan proses approval kontrak.","ls":"-","akd":null},
  {"no":27,"n":"Pengadaan dan Pemasangan Genset 1.250 KVA Unit QCC-0001 di TPK Pantoloan","g":"PO","nv":4.0,"nt":"Rp 4.005.000.000","pem":"PT Pelindo Terminal Petikemas - TPK Pantoloan","bamk":"1 Jul 2026","ak":"12 Des 2026","akt":"12 Des 2026","ket":"-","pl":35.0,"pt":"35%","rl":35.0,"rt":"35%","dv":0.0,"st":"ON TRACK","sit":"Proses tagihan uang muka (20%); Genset 1.250 KVA direncanakan tiba dan FAT estimasi minggu ke-2 Oktober 2026.","mit":"Melakukan monitoring kedatangan part dan mempersiapkan rencana pemasangan di lapangan/unit.","ls":"-","akd":"2026-12-12"},
  {"no":28,"n":"Pengadaan Genset Peralatan Bongkar Muat Petikemas TPK Pantoloan","g":"PO","nv":4.11,"nt":"Rp 4.110.000.000","pem":"PT Pelindo Terminal Petikemas - TPK Pantoloan","bamk":"24 Agu 2026","ak":"20 Apr 2027","akt":"20 Apr 2027","ket":"-","pl":35.0,"pt":"35%","rl":35.0,"rt":"35%","dv":0.0,"st":"ON TRACK","sit":"Proses tagihan uang muka (20%) PT BIMA ke User; Kendala pada proses PR terkait penentuan vendor terbatas.","mit":"Melakukan koordinasi dan diskusi dengan Tim Divisi Pengadaan untuk mempercepat proses dan mencegah keterlambatan pekerjaan.","ls":"-","akd":"2027-04-20"},
  {"no":29,"n":"Modifikasi Leg Span CC TPS","g":"LELANG","nv":13.0,"nt":"Rp 13.000.000.000","pem":"PT Terminal Petikemas Surabaya","bamk":"-","ak":"-","akt":"-","ket":"-","pl":null,"pt":"-","rl":null,"rt":"-","dv":null,"st":"LELANG / AANWIJZING","sit":"Update Proses: Pemasukan Dokumen Penawaran","mit":"-","ls":"-","akd":null},
  {"no":30,"n":"Pengadaan Motor Hoist CC IMPSA","g":"LELANG","nv":4.15,"nt":"Rp 4.150.000.000","pem":"PT Terminal Petikemas Surabaya","bamk":"-","ak":"-","akt":"-","ket":"-","pl":null,"pt":"-","rl":null,"rt":"-","dv":null,"st":"LELANG / AANWIJZING","sit":"Update Proses: Aanwijzing","mit":"-","ls":"-","akd":null},
  {"no":31,"n":"Pengadaan Manlift CC KKT dan Nilam","g":"LELANG","nv":8.1,"nt":"Rp 8.100.000.000","pem":"PT Pelindo Terminal Petikemas","bamk":"-","ak":"-","akt":"-","ket":"-","pl":null,"pt":"-","rl":null,"rt":"-","dv":null,"st":"LELANG / AANWIJZING","sit":"Update Proses: Pemasukan Dokumen Penawaran","mit":"-","ls":"-","akd":null}
];

export const GK: [string, string, string][] = [
  ["ON GOING", "On going", "#10b981"],
  ["SELESAI", "Selesai fisik, urus administrasi", "#2563eb"],
  ["PO", "PO/SP3 terbit, proses di BIMA", "#eab308"],
  ["LELANG", "Lelang / aanwijzing", "#94a3b8"]
];

export const OW = [
  "TPK Semarang",
  "Pelindo Reg. IV",
  "Pelindo Multi Terminal",
  "Prima Terminal Petikemas",
  "Pelindo Multi Terminal",
  "TPK Pantoloan",
  "TPK Ternate",
  "TPK Banjarmasin",
  "TPK Surabaya",
  "TPK Surabaya",
  "Pelindo Multi Terminal",
  "TPK New Makassar",
  "Pelindo Terminal Petikemas",
  "TPK Ternate",
  "TPK Surabaya"
];

export const SC: Record<string, string> = {
  "ON TRACK": "#10b981",
  "AT RISK": "#ef4444",
  "DELAYED": "#f97316",
  "DONE": "#2563eb",
  "DONE (ON TRACK)": "#2563eb",
  "DONE (DELAYED)": "#2563eb",
  "ACTIVE": "#eab308",
  "LELANG / AANWIJZING": "#94a3b8",
  "LELANG/AANWIJZING": "#94a3b8"
};

export const DN = [
  "RAP 2", "Justifikasi PL", "SPPP/SP3", "SPP/SP2", "PO",
  "RKS", "BA Aanwijzing", "BA Nego", "BAMK", "BA MOS",
  "BA Comtest", "BA Endurance", "BA Progress", "BASP", "BAST",
  "Lap. Mingguan", "Doc Lain", "BA ADD", "BA Pembayaran", "Invoice Vendor"
];

export const BK = ["0 - 2.5M", "2.5M - 5M", "5M - 10M", "> 10M"];

export const CL: Record<string, string> = {
  A: "ada",
  T: "td",
  K: "kosong",
  H: "kosong",
  P: "proses",
  D: "divisi"
};

// Data kelengkapan dokumen (Data on going + Data Close)
export const C: ContractItem[] = [
  {"s":"G","w":"R/4.24.53.418","j":"U","n":"REFURBISHMENT QCC-03 BITUNG DAN QCC-01 BELAWAN","pic":"SINDY","b":"> 10M","v":41000.0,"p":95,"d":"ATAAAAATATAKAAAAAATT","a":"2024-07-15","e":"2025-07-08"},
  {"s":"G","w":"R/4.24.53.418","j":"V","n":"KONECRANE","pic":"SINDY","b":"> 10M","v":1620.0,"p":75,"d":"ATTAAATTAKTTTKKTTTKK","a":"2025-09-01","e":"2025-11-29"},
  {"s":"G","w":"R/4.24.53.526","j":"U","n":"ELEKTRIFIKASI RTG TPK SEMARANG","pic":"FARUQ","b":"> 10M","v":30700.0,"p":80,"d":"ATTAAAATAAKKAKKAAAAT","a":"2024-07-25","e":"2025-09-17"},
  {"s":"G","w":"R/4.24.53.526","j":"V","n":"VAHLE","pic":"SARAH","b":"> 10M","v":2460.1,"p":85,"d":"TTTAAATTAATTAKKTAAAK","a":"2025-03-03","e":"2025-07-30"},
  {"s":"G","w":"R/4.24.53.526","j":"V","n":"CATHAY NABULA","pic":"SARAH","b":"> 10M","v":2506.7,"p":45,"d":"TTTAAATTAKKKKKKKKKKK","a":null,"e":null},
  {"s":"G","w":"R/4.24.53.526","j":"V","n":"SAMUDRA SARANA TERMINAL INDONESIA","pic":"FARUQ","b":"> 10M","v":1928.0,"p":80,"d":"ATTAAATTAKTTTTTKKTKT","a":null,"e":null},
  {"s":"G","w":"R/4.24.53.526","j":"V","n":"TRIMITRA BUANA ENGINEERING","pic":"SINDY","b":"> 10M","v":585.0,"p":80,"d":"TTTAAATTATTTTKKTAAKK","a":null,"e":null},
  {"s":"G","w":"R/4.24.53.526","j":"V","n":"USAHA TEKNIK NUSANTARA","pic":"FARUQ","b":"> 10M","v":449.0,"p":75,"d":"ATTTAATTKKTTKTTKKTTT","a":null,"e":null},
  {"s":"G","w":"R/4.24.53.605","j":"U","n":"PENGADAAN ENGINE CONT.HMC B10 DI BERLIAN","pic":"SARAH","b":"> 10M","v":11362.5,"p":50,"d":"ATTATATTAPKKKKKKAKKK","a":null,"e":null},
  {"s":"G","w":"R/4.24.53.605","j":"V","n":"PENGADAAN ENGINE CONT.HMC B10 DI BERLIAN","pic":"SARAH","b":"> 10M","v":9008.0,"p":45,"d":"TATAAATAAPKKPKKKKKKK","a":null,"e":null},
  {"s":"G","w":"R/4.25.53.022","j":"U","n":"PEKERJAAN FLUSING & FILTRASI TPK BAGENDANG","pic":"KIKI DEA","b":"0 - 2.5M","v":0.0,"p":0,"d":"KKKKKKKKKKKKKKKKKKKK","a":null,"e":null},
  {"s":"G","w":"R/4.25.53.081","j":"U","n":"PENGADAAN WHEEL GANTRY 2 UNIT QCC DI TPK KIJING DAN MAKASSAR NEW PORT","pic":"SINDY","b":"> 10M","v":10500.0,"p":55,"d":"ATTAAAAAAKKKKKKKKAKT","a":null,"e":null},
  {"s":"G","w":"R/4.25.53.202","j":"U","n":"PENGADAAN & PEMASANGAN CABLE REEL RTG 07 & 08 KLAIM ASURANSI DI TPK NEW MAKASSAR T2","pic":"WIDYA","b":"0 - 2.5M","v":1821.0,"p":50,"d":"AAAAAAAAAKKKKKKKAKKK","a":null,"e":null},
  {"s":"G","w":"R/4.25.53.202","j":"V","n":"PT JAYATECH SOLUTIONS PERKASA","pic":"WIDYA","b":"0 - 2.5M","v":1240.0,"p":50,"d":"ATTAAAKKAKKKAKKAAKKK","a":null,"e":null},
  {"s":"G","w":"R/4.24.53.177","j":"U","n":"PERBAIKAN RTG09 DRIVE MODULE ACS800 & KABEL FESTOON TROLLEY & HOIST DI MNP T1","pic":"AZIZ","b":"0 - 2.5M","v":2195.0,"p":45,"d":"ATAAAAAAAKKKKKKKKKKK","a":null,"e":null},
  {"s":"G","w":"R/4.24.53.177","j":"V","n":"PT ABB SAKTI INDUSTRI","pic":"AZIZ","b":"0 - 2.5M","v":1640.0,"p":45,"d":"TATAAATTAKKKKKKKKKKK","a":null,"e":null},
  {"s":"G","w":"R/4.24.53.522","j":"V","n":"TIGA BINTANG ELECTRIC","pic":"SARAH","b":"0 - 2.5M","v":2024.0,"p":65,"d":"ATTAAATTAAKKAKKKAKAK","a":null,"e":null},
  {"s":"G","w":"R/4.26.53.101","j":"U","n":"Pengadaan Dan Pemasangan Trafo Untuk Unit ASC 06L Di Terminal Teluk Lamong","pic":"SARAH","b":"0 - 2.5M","v":1343.8,"p":20,"d":"ATAAKKKKKKKKKKKKKKKK","a":null,"e":null},
  {"s":"G","w":"R/4.26.53.102","j":"U","n":"PENGADAAN SPREADER TWINTLIFT QCC 01 TPK AMBON","pic":"SINDY","b":"5M - 10M","v":6385.0,"p":55,"d":"ATAAAAAAAKKKKKKKAKKT","a":null,"e":null},
  {"s":"G","w":"R/4.26.53.102","j":"V","n":"DELTA SANDAI PERKASA","pic":"SINDY","b":"5M - 10M","v":4911.2,"p":45,"d":"AATAAATTAKKKKKKKKKKK","a":null,"e":null},
  {"s":"G","w":"R/4.26.53.026","j":"U","n":"PERBAIKAN AFTER ACCIDENT QCC03 & QCC07","pic":"FARUQ","b":"0 - 2.5M","v":2367.9,"p":55,"d":"AATAAATAAKKKKKKKAKAK","a":null,"e":null},
  {"s":"G","w":"R/4.26.53.026","j":"V","n":"SURYA METALINDO","pic":"FARUQ","b":"0 - 2.5M","v":1525.0,"p":45,"d":"AATAAATKKKKKKKKKAKTK","a":null,"e":null},
  {"s":"G","w":"R/4.26.53.026","j":"V","n":"GLOBAL","pic":"FARUQ","b":"0 - 2.5M","v":267.3,"p":45,"d":"AAATAATKAKKKKKKKAKKK","a":null,"e":null},
  {"s":"G","w":"R/4.26.53.026","j":"V","n":"TRIAGRI JAYA LESTARI","pic":"FARUQ","b":"0 - 2.5M","v":336.8,"p":35,"d":"ATTTAATKKKKKKKKKKKKK","a":null,"e":null},
  {"s":"G","w":"R/4.26.53.056","j":"U","n":"PENGADAAN&PEMASANGAN KABEL POWER REEL CABLE QCC 05&06 TPKNM T2","pic":"AZIZ","b":"2.5M - 5M","v":3300.0,"p":45,"d":"ATAAAAAAAKKKKKKKKKKK","a":null,"e":null},
  {"s":"G","w":"R/4.26.53.056","j":"V","n":"PENGADAAN&PEMASANGAN KABEL POWER REEL CABLE QCC 05&06 TPKNM T2","pic":"AZIZ","b":"2.5M - 5M","v":0.0,"p":10,"d":"TTKKKKKKKKKKKKKKKKKK","a":null,"e":null},
  {"s":"G","w":"R/4.25.53.126","j":"U","n":"Penataan dan Peningkatan Kinerja Suprastruktur TPK Pantoloan","pic":"MUHAIMIN","b":"5M - 10M","v":5680.0,"p":40,"d":"KTAAAAAAAKKKKKKKKKKK","a":null,"e":null},
  {"s":"G","w":"R/4.26.53.099","j":"U","n":"PEKERJAAN AGENT FEE TPS PROJECT","pic":"SARAH","b":"> 10M","v":10773.8,"p":25,"d":"KTTATTKKKKKKKKKKKKKK","a":null,"e":null},
  {"s":"G","w":"R/4.24.53.522","j":"U","n":"PEKERJAAN ELEKTRIFIKASI FIX CRANE GORONTALO","pic":"SARAH","b":"0 - 2.5M","v":3012.2,"p":55,"d":"ATAATAATAAPPPPPPPAPK","a":"2025-11-28","e":null},
  {"s":"G","w":"R/4.24.53.522","j":"V","n":"KURNIA EKA NUSA","pic":"SARAH","b":"0 - 2.5M","v":198.9,"p":95,"d":"TTTTAATTAATTTAATATAK","a":"2026-02-16","e":"2026-04-16"},
  {"s":"G","w":"R/4.25.53.131","j":"U","n":"BELT CONVEYOR ALL LINE DI TTL","pic":"WIDYA","b":"> 10M","v":40600.0,"p":90,"d":"ATAAAAAAAAAAATAKATTK","a":null,"e":null},
  {"s":"G","w":"R/4.25.53.131","j":"V","n":"PT SENTRATEK ADIPRESTASI","pic":"WIDYA","b":"> 10M","v":3379.8,"p":85,"d":"TATAAADDAAAKAAAKAAAK","a":null,"e":null},
  {"s":"G","w":"R/4.25.53.043","j":"U","n":"GO ENGINE KTA 50 CC 01 TERNATE","pic":"DITA","b":"2.5M - 5M","v":2850.0,"p":35,"d":"ATAAAKKKAKKKKKKKKKAK","a":"2025-10-29","e":null},
  {"s":"G","w":"R/4.25.53.043","j":"V","n":"CV SIDOARJO DIESEL","pic":"DITA","b":"2.5M - 5M","v":1060.1,"p":100,"d":"TTTAAATTAATTAAAAATAA","a":"2026-05-15","e":"2026-05-29"},
  {"s":"G","w":"R/4.25.53.073","j":"U","n":"PEKERJAAN GENERAL OVERHAUL ENGINE & TRANSMISI REACHSTACKER 02 DI TERMINAL PETIKEMAS AMBON ENGINE VOLVO TYPE TWD.1240VE","pic":"DITA","b":"0 - 2.5M","v":1210.0,"p":70,"d":"ATTAAATTATTTAKKKKKKT","a":"2026-02-11","e":null},
  {"s":"G","w":"R/4.25.53.073","j":"V","n":"PT PANCA BINA PERSADA","pic":"DITA","b":"0 - 2.5M","v":1074.4,"p":95,"d":"TTTAAATAATTTTAAATTTK","a":null,"e":null},
  {"s":"G","w":"R/4.26.53.055","j":"U","n":"GO ENGINE QSM11 RS 04 BRANCH MAKASSAR","pic":"KIKI DEA","b":"0 - 2.5M","v":673.0,"p":65,"d":"TTAAATTTATTTTKKKKKKK","a":null,"e":null},
  {"s":"G","w":"R/4.26.53.055","j":"V","n":"CV ENGINEER BERSAMA SOLUSI","pic":"KIKI DEA","b":"0 - 2.5M","v":467.3,"p":95,"d":"TATTAATTATTTTAAAATAK","a":null,"e":null},
  {"s":"G","w":"R/4.24.53.153","j":"U","n":"GO ENGINE CUMMINS QSL9 PADA ALAT RTG 15 DI TPK NEW MAKASSAR TERMINAL 1","pic":"KIKI DEA","b":"0 - 2.5M","v":0.0,"p":15,"d":"AKKKKAKKKKKKKKKKAKKK","a":null,"e":null},
  {"s":"G","w":"R/4.24.53.153","j":"V","n":"CV ENGINNER BERSAMA SOLUSI","pic":"KIKI DEA","b":"0 - 2.5M","v":408.5,"p":95,"d":"TATTAATTATTTTAAAATAK","a":null,"e":null},
  {"s":"G","w":"R/4.24.53.152","j":"U","n":"Pekerjaan Flushing dan Pemasangan Filter pada Unit RTG site TPK Bitung","pic":"KIKI DEA","b":"0 - 2.5M","v":95.1,"p":0,"d":"KKKKKKKKKKKKKKKKKKKK","a":null,"e":null},
  {"s":"G","w":"R/4.24.53.152","j":"V","n":"PT BERKAH INDUSTRI MESIN ANGKAT","pic":"KIKI DEA","b":"0 - 2.5M","v":0.0,"p":100,"d":"TTTTTTTTTTTTTTTTTTTT","a":null,"e":null},
  {"s":"G","w":"R/4.26.53.038","j":"U","n":"PERBAIKAN 3 HOOPER EX BELAWAN & 2 HOOPER EX TJ INTAN","pic":"WIDYA","b":"0 - 2.5M","v":1487.0,"p":15,"d":"KKKAKKKAAKKKKKKKKKKK","a":"2026-04-30","e":null},
  {"s":"G","w":"R/4.25.53.290","j":"U","n":"REVITALISASI CONVEYOR BELT C BENGKULU","pic":"YUSTAIM","b":"> 10M","v":37675.0,"p":30,"d":"KKAAKAKKAKKKKKKKAAKK","a":null,"e":null},
  {"s":"G","w":"R/4.25.53.291","j":"D","n":"PENGGANTIAN CRS CC 02 DI TPK KENDARI","pic":"YUSTAIM","b":"0 - 2.5M","v":1925.0,"p":15,"d":"KKKAAKKKAKKKKKKKKKKK","a":null,"e":null},
  {"s":"G","w":"R/4.25.53.291","j":"V","n":"PT KONECRANE / DEMAG","pic":"YUSTAIM","b":"0 - 2.5M","v":1695.0,"p":5,"d":"KKKKAKKKKKKKKKKKKKKK","a":null,"e":null},
  {"s":"G","w":"R/4.25.53.033","j":"D","n":"PENGADAAN PEMASANGAN CRS CC02 KENDARI","pic":"YUSTAIM","b":"0 - 2.5M","v":1925.0,"p":5,"d":"KKKKKKKKKKKKKKKKKKKT","a":null,"e":null},
  {"s":"G","w":"R/4.25.53.033","j":"V","n":"KONECRANES MATERIAL HANDLINGS INDONE","pic":"YUSTAIM","b":"0 - 2.5M","v":1695.0,"p":0,"d":"KKKKKKKKKKKKKKKKKKKK","a":null,"e":null},
  {"s":"G","w":"R/4.26.53.043","j":"U","n":"PEKERJAAN PENGADAAN PART & PEMASANGAN DRIVE MOTOR HOIST (NO 2) PADA ALAT HARBOUR PORTAL CRANE (HPC 03) PT PELINDO MULTI TERMINAL - TERMINAL JAMRUD","pic":"ARDI","b":"0 - 2.5M","v":0.0,"p":20,"d":"KKAKKKAAKKKKKKKKAKKK","a":null,"e":null},
  {"s":"G","w":"R/4.26.53.072","j":"U","n":"PENGADAAN GENSET 125O KVA CC 01 TPK PANTOLOAN","pic":"ARDI","b":"2.5M - 5M","v":4005.0,"p":15,"d":"KKKAAKKKAKKKKKKKKKKK","a":null,"e":null},
  {"s":"G","w":"R/4.26.53.010","j":"U","n":"Perbaikan RS02 Accident TTL","pic":"ARDI","b":"0 - 2.5M","v":1877.6,"p":30,"d":"KKKAAKKKAAKKAKKAKKKK","a":null,"e":null},
  {"s":"G","w":"R/4.26.53.010","j":"V","n":"INDO TRAKTOR UTAMA","pic":"ARDI","b":"0 - 2.5M","v":1073.6,"p":10,"d":"KKKKAKKKKKKKKKKKAKKK","a":null,"e":null},
  {"s":"G","w":"R/4.26.53.028","j":"U","n":"PENGADAAN PEMASANGAN CABLE RAIL SYSTEM RTG12 TPK BANJARMASIN","pic":"ARDI","b":"0 - 2.5M","v":0.0,"p":0,"d":"KKKKKKKKKKKKKKKKKKKK","a":null,"e":null},
  {"s":"G","w":"R/4.26.53.036","j":"U","n":"REPAIR JACK CYLINDER HYDRAULIC HMC 07 JAMRUD","pic":"SAIFUL","b":"0 - 2.5M","v":786.0,"p":40,"d":"KKAAAKKKAKKKKAAAAKKK","a":null,"e":null},
  {"s":"G","w":"R/4.25.53.192","j":"U","n":"PENGADAAN SPREADER TWINTLIFT TERNATE","pic":"SINDY","b":"0 - 2.5M","v":0.0,"p":0,"d":"KKKKKKKKKKKKKKKKKKKK","a":null,"e":null},
  // Data Close Sample
  {"s":"C","w":"R/4.24.53.001","j":"U","n":"PENGADAAN XRAY REGIONAL 1","pic":"WIDYA","b":"2.5M - 5M","v":3293.0,"p":100,"d":"ATAATAATAAATATAAAATT","a":"2024-10-28","e":"2025-05-02"},
  {"s":"C","w":"R/4.24.53.001","j":"V","n":"PT SENJAYA SOLUSI SEKURINDO","pic":"WIDYA","b":"2.5M - 5M","v":3293.0,"p":100,"d":"ATTAAATAATATATATAAAA","a":"2024-11-01","e":"2025-01-15"},
  {"s":"C","w":"R/4.24.53.020","j":"U","n":"PENGADAAN XRAY REGIONAL 2","pic":"WIDYA","b":"0 - 2.5M","v":1645.4,"p":100,"d":"ATTATATTAAATTTAATATT","a":"2024-10-28","e":"2025-05-01"},
  {"s":"C","w":"R/4.24.53.020","j":"V","n":"PT SENJAYA SOLUSI SEKURINDO","pic":"WIDYA","b":"0 - 2.5M","v":1645.4,"p":100,"d":"ATTAAATAATATATATAAAA","a":"2024-11-01","e":"2025-01-15"},
  {"s":"C","w":"R/4.24.53.534","j":"U","n":"RTG 48 NO.6 OVERHAUL&B/P GEARBOX GANTRY","pic":"AZIZ","b":"0 - 2.5M","v":10.1,"p":95,"d":"ATTTATTTTTTTTTAAATTK","a":"2024-06-26","e":"2024-07-10"},
  {"s":"C","w":"R/4.24.53.534","j":"V","n":"PARINA TEKNIK UNGGUL SEJAHTERA","pic":"AZIZ","b":"0 - 2.5M","v":7.8,"p":95,"d":"ATTTAATTTTTTTAAAATTK","a":"2025-01-21","e":"2025-02-10"},
  {"s":"C","w":"R/4.24.53.521","j":"U","n":"PEKERJAAN ELEKTRIFIKASI RTG DI TERMINAL PETIKEMAS SURABAYA","pic":"SARAH","b":"> 10M","v":146740.3,"p":95,"d":"ATTAAAATATAAAHAATAAT","a":null,"e":null},
  {"s":"C","w":"R/4.24.53.521","j":"V","n":"SURMET JASA TENAGA KERJA","pic":"SARAH","b":"> 10M","v":11999.9,"p":100,"d":"TTTAAATTAAATAAAAAAAA","a":"2024-03-07","e":"2026-03-01"},
  {"s":"C","w":"R/4.24.53.521","j":"V","n":"SURMET PERBAIKAN ACCIDENT RTG 55","pic":"SARAH","b":"> 10M","v":70.6,"p":95,"d":"TATTAATTATTTAAATATAK","a":"2025-06-05","e":"2025-06-11"},
  {"s":"C","w":"R/4.24.53.521","j":"V","n":"SURMET ADDITIONAL MATERIAL 4 UNIT","pic":"SARAH","b":"> 10M","v":390.0,"p":100,"d":"TATTAATTAATTAAATATAA","a":"2025-09-23","e":"2025-10-18"},
  {"s":"C","w":"R/4.24.53.521","j":"V","n":"TIGA BINTANG PENGADAAN ATS AMF","pic":"SARAH","b":"> 10M","v":1815.0,"p":95,"d":"TTTAAATTAATTAAAAAAAK","a":"2024-03-04","e":"2026-02-08"},
  {"s":"C","w":"R/4.24.53.521","j":"V","n":"TRIMITRA BUANA TRANSFORMATOR DRY","pic":"SARAH","b":"> 10M","v":9035.4,"p":100,"d":"TTTAAATTAATTAAAAAAAA","a":"2023-12-28","e":"2025-06-05"},
  {"s":"C","w":"R/4.24.53.521","j":"V","n":"CATHAY NEBULA AGSS","pic":"SARAH","b":"> 10M","v":10351.5,"p":95,"d":"TTTAAATTAAATAAAAAAAK","a":"2023-12-29","e":"2026-04-30"},
  {"s":"C","w":"R/4.24.53.521","j":"V","n":"VAHLE CRS","pic":"SARAH","b":"> 10M","v":26453.1,"p":85,"d":"TTTAAATTAAATAPPTAAAK","a":"2023-12-04","e":"2026-04-30"},
  {"s":"C","w":"R/4.24.53.590","j":"U","n":"MODIFIKASI LEG SPAN QCC04 TPK MAKASSAR","pic":"WAHYU","b":"5M - 10M","v":6180.0,"p":100,"d":"ATAAAAATATATTTATTATT","a":"2024-09-08","e":"2024-12-31"},
  {"s":"C","w":"R/4.24.53.501","j":"U","n":"REFURBISHMENT QCC-03 BANJARMASIN","pic":"ELTRIA","b":"> 10M","v":18029.9,"p":100,"d":"ATAAAAATATATATAAAAAT","a":"2024-03-22","e":"2025-04-14"},
  {"s":"C","w":"R/4.24.53.502","j":"U","n":"ELEKTRIFIKASI RTG BANJARMASIN","pic":"ELTRIA","b":"> 10M","v":28294.1,"p":95,"d":"ATTAAAATATAAAAAAAAKT","a":"2023-12-07","e":"2025-11-01"},
  {"s":"C","w":"R/4.24.53.418","j":"U","n":"REFURBISHMENT QCC-03 BITUNG DAN QCC-01 BELAWAN","pic":"SINDY","b":"> 10M","v":41000.0,"p":95,"d":"ATAAAAATATAKAAAAAATT","a":"2024-07-15","e":"2025-07-08"},
  {"s":"C","w":"R/4.24.53.425","j":"U","n":"HYBRID BJTI","pic":"SINDY","b":"> 10M","v":68945.3,"p":100,"d":"ATTAAATTATAAAAAAATAT","a":"2023-11-27","e":"2025-11-15"},
  {"s":"C","w":"R/4.24.53.108","j":"U","n":"PEKERJAAN ELEKTRIFIKASI 2 UNIT QCC TPK AMBON","pic":"SARAH","b":"> 10M","v":31968.0,"p":95,"d":"ATTAAAAAAAAAAAAATAAK","a":"2024-03-06","e":"2025-05-30"},
  {"s":"C","w":"R/4.24.53.021","j":"U","n":"REFURBISHMENT QCC-04 EX-MTS TPK MAKASSAR","pic":"ELTRIA","b":"> 10M","v":25948.3,"p":50,"d":"ATAAAAKKATKKKKKKKTKT","a":null,"e":null},
  {"s":"C","w":"R/4.24.53.601","j":"U","n":"PENGADAAN GENERATOR SET DAN GO CC BNCT","pic":"WIDYA","b":"> 10M","v":23449.1,"p":100,"d":"HTTATATAATATATAAAAAT","a":"2024-12-30","e":"2025-07-22"},
  {"s":"C","w":"R/4.24.53.088","j":"U","n":"PEKERJAAN RETROFIT QCC 04A JICT2","pic":"ELTRIA","b":"> 10M","v":35056.4,"p":100,"d":"ATAAAATTATAAAAAAAAAA","a":"2024-12-26","e":"2026-04-19"}
];
