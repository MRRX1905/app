"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { PerformaMapel } from "@/types";
import { MAPEL_LABEL } from "@/types";

export default function RadarMapel({ data }: { data: PerformaMapel[] }) {
  if (data.length < 3) {
    return (
      <p className="text-sm text-gray-500">
        Kerjakan minimal 3 mapel berbeda untuk melihat peta kekuatan.
      </p>
    );
  }

  const chart = data.map((d) => ({
    mapel: MAPEL_LABEL[d.mapel].split(" ")[0],
    akurasi: d.akurasi_pct,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={chart}>
        <PolarGrid />
        <PolarAngleAxis dataKey="mapel" tick={{ fontSize: 11 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
        <Radar
          dataKey="akurasi"
          stroke="#2563eb"
          fill="#2563eb"
          fillOpacity={0.35}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
