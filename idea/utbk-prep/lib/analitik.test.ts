import assert from "node:assert";
import {
  prioritasLatihan,
  agregasiPerMapel,
  rekomendasiHariIni,
  pilihSoal,
} from "./analitik";
import type { PerformaSubtopik, Soal } from "../types";

const p = (o: Partial<PerformaSubtopik>): PerformaSubtopik => ({
  mapel: "pu",
  subtopik: "x",
  total_soal: 10,
  benar: 5,
  rata_waktu_detik: 100,
  akurasi_pct: 50,
  ...o,
});

// akurasi rendah -> prioritas tinggi
assert(prioritasLatihan(p({ akurasi_pct: 20 })) > prioritasLatihan(p({ akurasi_pct: 90 })));

// data sedikit -> prioritas ditekan
assert(prioritasLatihan(p({ total_soal: 2 })) < prioritasLatihan(p({ total_soal: 20 })));

// lambat menaikkan prioritas
assert(
  prioritasLatihan(p({ rata_waktu_detik: 200, akurasi_pct: 50 })) >
    prioritasLatihan(p({ rata_waktu_detik: 100, akurasi_pct: 50 }))
);

// agregasi per mapel
const agg = agregasiPerMapel([
  p({ mapel: "pu", benar: 8, total_soal: 10, akurasi_pct: 80 }),
  p({ mapel: "pu", benar: 2, total_soal: 10, akurasi_pct: 20 }),
]);
assert(agg.length === 1);
assert(agg[0].total_soal === 20);
assert(agg[0].akurasi_pct === 50);

// rekomendasi terurut prioritas
const rek = rekomendasiHariIni([
  p({ subtopik: "kuat", akurasi_pct: 95 }),
  p({ subtopik: "lemah", akurasi_pct: 10 }),
]);
assert(rek[0].subtopik === "lemah");

// pilihSoal memprioritaskan subtopik lemah
const bank = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  mapel: "pu",
  subtopik: i < 10 ? "lemah" : "kuat",
  tahun: null,
  tingkat: 3,
  pertanyaan: "?",
  opsi: { A: "a" },
  jawaban_benar: "A",
  pembahasan: null,
})) as Soal[];
const dipilih = pilihSoal(bank, ["lemah"], [], 5);
assert(dipilih.every((s) => s.subtopik === "lemah"));

console.log("analitik: semua cek lulus");
