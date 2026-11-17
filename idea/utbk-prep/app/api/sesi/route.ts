import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Mapel, TipeSesi } from "@/types";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    tipe: TipeSesi;
    mapel?: Mapel[];
    subtopikPrioritas?: string[];
    jumlah?: number;
  };

  const tipe: TipeSesi = body.tipe === "simulasi" ? "simulasi" : "latihan";
  const jumlah = Math.min(Math.max(body.jumlah ?? 20, 5), 100);

  let query = supabase.from("soal").select("*");
  if (body.mapel?.length) query = query.in("mapel", body.mapel);

  const { data: bank, error } = await query.limit(500);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const prioritas = body.subtopikPrioritas ?? [];
  const diurut = (bank ?? []).slice().sort((a, b) => {
    const ia = prioritas.indexOf(a.subtopik);
    const ib = prioritas.indexOf(b.subtopik);
    const sa = ia === -1 ? 0 : prioritas.length - ia;
    const sb = ib === -1 ? 0 : prioritas.length - ib;
    return sb - sa;
  });

  const dipilih = diurut.slice(0, jumlah);
  if (!dipilih.length) {
    return NextResponse.json({ error: "bank soal kosong" }, { status: 422 });
  }

  const { data: sesi, error: sesiErr } = await supabase
    .from("sesi_ujian")
    .insert({
      user_id: user.id,
      tipe,
      mapel_filter: body.mapel ?? null,
    })
    .select("id")
    .single();

  if (sesiErr) {
    return NextResponse.json({ error: sesiErr.message }, { status: 500 });
  }

  return NextResponse.json({
    sesiId: sesi.id,
    soal: dipilih.map((s) => ({ ...s, jawaban_benar: undefined })),
  });
}
