import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Generate pembahasan untuk satu soal. Hasil disimpan ke DB supaya
 * pemanggilan berikutnya tidak membayar API lagi.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { soalId } = (await request.json()) as { soalId: number };

  const { data: soal } = await supabase
    .from("soal")
    .select("id, pertanyaan, opsi, jawaban_benar, pembahasan")
    .eq("id", soalId)
    .maybeSingle();

  if (!soal) {
    return NextResponse.json({ error: "soal tidak ditemukan" }, { status: 404 });
  }
  if (soal.pembahasan) {
    return NextResponse.json({ pembahasan: soal.pembahasan });
  }

  const opsiTeks = Object.entries(soal.opsi as Record<string, string>)
    .map(([k, v]) => `${k}. ${v}`)
    .join("\n");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 600,
      messages: [
        {
          role: "system",
          content:
            "Kamu tutor UTBK. Jelaskan pembahasan soal dalam Bahasa Indonesia: kenapa jawaban benar, dan kenapa opsi lain salah. Ringkas, maksimal 200 kata.",
        },
        {
          role: "user",
          content: `Soal:\n${soal.pertanyaan}\n\nOpsi:\n${opsiTeks}\n\nJawaban benar: ${soal.jawaban_benar}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `OpenAI: ${res.status}` },
      { status: 502 }
    );
  }

  const json = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  const pembahasan = json.choices?.[0]?.message?.content?.trim();
  if (!pembahasan) {
    return NextResponse.json({ error: "respons kosong" }, { status: 502 });
  }

  await supabase.from("soal").update({ pembahasan }).eq("id", soalId);

  return NextResponse.json({ pembahasan });
}
