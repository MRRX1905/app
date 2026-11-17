"use client";

export default function NavigasiSoal({
  total,
  aktif,
  terjawab,
  onPilih,
}: {
  total: number;
  aktif: number;
  terjawab: Set<number>;
  onPilih: (i: number) => void;
}) {
  return (
    <nav aria-label="Navigasi soal" className="grid grid-cols-5 gap-2">
      {Array.from({ length: total }, (_, i) => {
        const iniAktif = i === aktif;
        const sudah = terjawab.has(i);
        return (
          <button
            key={i}
            type="button"
            onClick={() => onPilih(i)}
            aria-current={iniAktif ? "true" : undefined}
            aria-label={`Soal ${i + 1}${sudah ? ", sudah dijawab" : ""}`}
            className={`aspect-square rounded border text-sm font-medium transition ${
              iniAktif
                ? "border-blue-600 bg-blue-600 text-white"
                : sudah
                  ? "border-blue-300 bg-blue-100 text-blue-800"
                  : "border-gray-200 hover:border-gray-400"
            }`}
          >
            {i + 1}
          </button>
        );
      })}
    </nav>
  );
}
