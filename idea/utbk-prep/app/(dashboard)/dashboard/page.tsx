import { createClient } from "@/lib/supabase/server";
import RadarMapel from "@/components/analitik/RadarMapel";
import KartuKelemahan from "@/components/analitik/KartuKelemahan";
import {
  agregasiPerMapel,
  rekomendasiHariIni,
} from "@/lib/analitik";
import type { PerformaSubtopik } from "@/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: subtopik } = await supabase
    .from("performa_subtopik")
    .select("mapel, subtopik, total_soal, benar, rata_waktu_detik, akurasi_pct")
    .eq("user_id", user.id);

  const rows = (subtopik ?? []) as PerformaSubtopik[];

  // gabungkan subtopik yang sama lintas sesi
  const gabung = new Map<string, PerformaSubtopik>();
  for (const r of rows) {
    const key = `${r.mapel}|${r.subtopik}`;
    const cur = gabung.get(key);
    if (!cur) {
      gabung.set(key, { ...r, total_soal: Number(r.total_soal), benar: Number(r.benar) });
      continue;
    }
    const total = cur.total_soal + Number(r.total_soal);
    const benar = cur.benar + Number(r.benar);
    cur.total_soal = total;
    cur.benar = benar;
    cur.akurasi_pct = Math.round((benar / total) * 1000) / 10;
    cur.rata_waktu_detik = Math.round(
      (cur.rata_waktu_detik * (total - Number(r.total_soal)) +
        Number(r.rata_waktu_detik) * Number(r.total_soal)) /
        total
    );
  }

  const semua = [...gabung.values()];
  const perMapel = agregasiPerMapel(semua);
  const rekomendasi = rekomendasiHariIni(semua);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500">
          {semua.length
            ? `${semua.reduce((a, b) => a + b.total_soal, 0)} soal dikerjakan`
            : "Belum ada data latihan"}
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Latihan hari ini</h2>
        <KartuKelemahan items={rekomendasi} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Peta kekuatan</h2>
        <RadarMapel data={perMapel} />
      </section>
    </div>
  );
}
