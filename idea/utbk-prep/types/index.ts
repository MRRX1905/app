export type Mapel =
  | "pu" | "ppu" | "pbm" | "pk"
  | "mat_ipa" | "fis" | "kim" | "bio"
  | "mat_ips" | "eko" | "sos" | "geo";

export type TipeSesi = "latihan" | "simulasi";

export const MAPEL_LABEL: Record<Mapel, string> = {
  pu: "Penalaran Umum",
  ppu: "Pengetahuan & Pemahaman Umum",
  pbm: "Pemahaman Bacaan & Menulis",
  pk: "Pengetahuan Kuantitatif",
  mat_ipa: "Matematika Saintek",
  fis: "Fisika",
  kim: "Kimia",
  bio: "Biologi",
  mat_ips: "Matematika Soshum",
  eko: "Ekonomi",
  sos: "Sosiologi",
  geo: "Geografi",
};

export const TPS: Mapel[] = ["pu", "ppu", "pbm", "pk"];

export interface Profil {
  id: string;
  nama: string;
  target_ptn: string | null;
  tahun_utbk: number | null;
  created_at: string;
}

export interface Soal {
  id: number;
  mapel: Mapel;
  subtopik: string;
  tahun: number | null;
  tingkat: number | null;
  pertanyaan: string;
  opsi: Record<string, string>;
  jawaban_benar: string;
  pembahasan: string | null;
}

export interface SesiUjian {
  id: number;
  user_id: string;
  tipe: TipeSesi;
  mapel_filter: Mapel[] | null;
  mulai_at: string;
  selesai_at: string | null;
  durasi_detik: number | null;
}

export interface Jawaban {
  id: number;
  sesi_id: number;
  soal_id: number;
  jawaban_user: string | null;
  benar: boolean | null;
  waktu_detik: number | null;
}

export interface PerformaSubtopik {
  mapel: Mapel;
  subtopik: string;
  total_soal: number;
  benar: number;
  rata_waktu_detik: number;
  akurasi_pct: number;
}

export interface PerformaMapel {
  mapel: Mapel;
  akurasi_pct: number;
  total_soal: number;
  rata_waktu_detik: number;
}
