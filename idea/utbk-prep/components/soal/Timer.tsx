"use client";

import { useEffect, useRef, useState } from "react";

export default function Timer({
  totalDetik,
  onHabis,
  berjalan = true,
}: {
  totalDetik: number;
  onHabis: () => void;
  berjalan?: boolean;
}) {
  const [sisa, setSisa] = useState(totalDetik);
  const habisRef = useRef(false);

  useEffect(() => {
    if (!berjalan) return;
    const id = setInterval(() => {
      setSisa((s) => {
        if (s <= 1) {
          if (!habisRef.current) {
            habisRef.current = true;
            onHabis();
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [berjalan, onHabis]);

  const jam = Math.floor(sisa / 3600);
  const menit = Math.floor((sisa % 3600) / 60);
  const detik = sisa % 60;
  const kritis = sisa <= 300;

  return (
    <div
      role="timer"
      aria-live={kritis ? "assertive" : "off"}
      className={`font-mono text-lg tabular-nums ${kritis ? "text-red-600 font-bold" : ""}`}
    >
      {jam > 0 && `${String(jam).padStart(2, "0")}:`}
      {String(menit).padStart(2, "0")}:{String(detik).padStart(2, "0")}
    </div>
  );
}
