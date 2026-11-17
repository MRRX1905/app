import type { Rekomendasi } from "@/lib/analitik";
import { MAPEL_LABEL } from "@/types";

export default function KartuKelemahan({ items }: { items: Rekomendasi[] }) {
  if (!items.length) {
    return (
      <p className="text-sm text-gray-500">
        Belum ada data. Kerjakan latihan pertama untuk melihat rekomendasi.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((r) => (
        <li
          key={`${r.mapel}-${r.subtopik}`}
          className="rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium">{r.subtopik}</p>
              <p className="text-sm text-gray-500">{MAPEL_LABEL[r.mapel]}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${
                r.prioritas >= 60
                  ? "bg-red-100 text-red-700"
                  : r.prioritas >= 35
                    ? "bg-amber-100 text-amber-700"
                    : "bg-gray-100 text-gray-700"
              }`}
            >
              prioritas {r.prioritas}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600">{r.alasan}</p>
        </li>
      ))}
    </ul>
  );
}
