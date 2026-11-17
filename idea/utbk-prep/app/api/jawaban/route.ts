import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface Masukan {
  soal_id: number;
  jawaban_user: string | null;
  waktu_detik: number;
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    sesiId: number;
    jawaban: Masukan[];
    durasiDetik: number;
  };

  const { data: sesi } = await supabase
    .from("sesi_ujian")
    .select("id, user_id")
    .eq("id", body.sesiId)
    .maybeSingle();

  if (!sesi || sesi.user_id !== user.id) {
    return NextResponse.json({ error: "sesi tidak ditemukan" }, { status: 404 });
  }

  const soalIds = body.jawaban.map((j) => j.soal_id);
  const { data: soal, error: soalErr } = await supabase
    .from("soal")
    .select("id, jawaban_benar")
    .in("id", soalIds);

  if (soalErr) {
    return NextResponse.json({ error: soalErr.message }, { status: 500 });
  }

  const kunci = new Map(soal!.map((s) => [s.id, s.jawaban_benar]));

  const rows = body.jawaban.map((j) => ({
    sesi_id: body.sesiId,
    soal_id: j.soal_id,
    jawaban_user: j.jawaban_user,
    benar: j.jawaban_user === kunci.get(j.soal_id),
    waktu_detik: Math.min(Math.max(Math.round(j.waktu_detik), 0), 32767),
  }));

  const { error: insertErr } = await supabase.from("jawaban").insert(rows);
  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  const { error: updateErr } = await supabase
    .from("sesi_ujian")
    .update({
      selesai_at: new Date().toISOString(),
      durasi_detik: Math.round(body.durasiDetik),
    })
    .eq("id", body.sesiId);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
