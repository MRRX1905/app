import type { Mapel, PerformaMapel, PerformaSubtopik, Soal } from "@/types";

/** Target waktu (detik) per soal. Dipakai untuk menilai kecepatan relatif. */
const TARGET_DETIK: Record<Mapel, number> = {
  pu: 100,
  ppu: 75,
  pbm: 90,
  pk: 100,
  mat_ipa: 110,
  fis: 120,
  kim: 110,
  bio: 90,
  mat_ips: 105,
  eko: 90,
  sos: 85,
  geo: 85,
};

/**
 * Prioritas latihan 0-100. Makin tinggi = makin perlu dilatih.
 * Akurasi berbobot 70%, kelambatan 30%.
 */
export function prioritasLatihan(p: PerformaSubtopik): number {
  const target = TARGET_DETIK[p.mapel] ?? 100;
  const akurasi = Number(p.akurasi_pct) || 0;
  const waktu = Number(p.rata_waktu_detik) || target;

  // 0 = secepat target, 1 = dua kali lebih lambat atau lebih
  const kelambatan = Math.min(Math.max((waktu - target) / target, 0), 1);

  // Sedikit pengerjaan = data belum cukup, turunkan keyakinan
  const keyakinan = Math.min(p.total_soal / 10, 1);

  const skor = (100 - akurasi) * 0.7 + kelambatan * 100 * 0.3;
  return Math.round(skor * keyakinan);
}

export function urutkanKelemahan(
  subtopik: PerformaSubtopik[],
  batas = 5
): (PerformaSubtopik & { prioritas: number })[] {
  return subtopik
    .map((s) => ({ ...s, prioritas: prioritasLatihan(s) }))
    .sort((a, b) => b.prioritas - a.prioritas)
    .slice(0, batas);
}

/** Gabungkan performa subtopik jadi per-mapel untuk radar chart. */
export function agregasiPerMapel(
  subtopik: PerformaSubtopik[]
): PerformaMapel[] {
  const peta = new Map<Mapel, { benar: number; total: number; waktu: number; n: number }>();

  for (const s of subtopik) {
    const cur = peta.get(s.mapel) ?? { benar: 0, total: 0, waktu: 0, n: 0 };
    cur.benar += Number(s.benar);
    cur.total += Number(s.total_soal);
    cur.waktu += Number(s.rata_waktu_detik) * Number(s.total_soal);
    cur.n += Number(s.total_soal);
    peta.set(s.mapel, cur);
  }

  return [...peta.entries()].map(([mapel, v]) => ({
    mapel,
    akurasi_pct: v.total ? Math.round((v.benar / v.total) * 1000) / 10 : 0,
    total_soal: v.total,
    rata_waktu_detik: v.n ? Math.round(v.waktu / v.n) : 0,
  }));
}

export interface Rekomendasi {
  subtopik: string;
  mapel: Mapel;
  prioritas: number;
  alasan: string;
}

/** Susun rekomendasi latihan hari ini dari daftar kelemahan. */
export function rekomendasiHariIni(
  subtopik: PerformaSubtopik[],
  batas = 3
): Rekomendasi[] {
  return urutkanKelemahan(subtopik, batas).map((s) => ({
    subtopik: s.subtopik,
    mapel: s.mapel,
    prioritas: s.prioritas,
    alasan:
      s.akurasi_pct < 60
        ? `Akurasi ${s.akurasi_pct}% — perlu penguatan konsep`
        : s.rata_waktu_detik > (TARGET_DETIK[s.mapel] ?? 100)
          ? `Akurasi oke, tapi rata-rata ${s.rata_waktu_detik}s/soal — terlalu lambat`
          : `Akurasi ${s.akurasi_pct}% — tingkatkan konsistensi`,
  }));
}

/** Pilih soal dari bank, prioritaskan subtopik lemah, hindari soal yang sudah dikerjakan. */
export function pilihSoal(
  bank: Soal[],
  prioritasSubtopik: string[],
  sudahDikerjakan: number[],
  jumlah: number
): Soal[] {
  const sudah = new Set(sudahDikerjakan);
  const segar = bank.filter((s) => !sudah.has(s.id));
  const pool = segar.length >= jumlah ? segar : bank;

  const bobot = (s: Soal) => {
    const idx = prioritasSubtopik.indexOf(s.subtopik);
    const skorPrioritas = idx === -1 ? 0 : (prioritasSubtopik.length - idx) * 10;
    return skorPrioritas;
  };

  return [...pool].sort((a, b) => bobot(b) - bobot(a)).slice(0, jumlah);
}
