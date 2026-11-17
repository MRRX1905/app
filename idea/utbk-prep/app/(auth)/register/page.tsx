"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await createClient().auth.signUp({
      email,
      password,
      options: { data: { nama } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <h1 className="text-2xl font-bold">Daftar</h1>
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Nama</span>
          <input
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 p-2 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Daftar"}
        </button>
      </form>
      <p className="text-sm text-gray-600">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-blue-600 underline">
          Masuk
        </Link>
      </p>
    </main>
  );
}
