"use client";

import type { Soal } from "@/types";
import { MAPEL_LABEL } from "@/types";

export default function SoalCard({
  soal,
  nomor,
  terpilih,
  onPilih,
}: {
  soal: Soal;
  nomor: number;
  terpilih: string | null;
  onPilih: (opsi: string) => void;
}) {
  return (
    <article className="space-y-4">
      <header className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Soal {nomor} · {MAPEL_LABEL[soal.mapel]}
        </span>
        <span>{soal.subtopik}</span>
      </header>

      <p className="text-lg leading-relaxed whitespace-pre-wrap">{soal.pertanyaan}</p>

      <div role="radiogroup" aria-label="Pilihan jawaban" className="space-y-2">
        {Object.entries(soal.opsi).map(([kunci, teks]) => {
          const aktif = terpilih === kunci;
          return (
            <button
              key={kunci}
              type="button"
              role="radio"
              aria-checked={aktif}
              onClick={() => onPilih(kunci)}
              className={`w-full text-left rounded-lg border p-3 transition ${
                aktif
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <span className="font-semibold mr-2">{kunci}.</span>
              {teks}
            </button>
          );
        })}
      </div>
    </article>
  );
}
