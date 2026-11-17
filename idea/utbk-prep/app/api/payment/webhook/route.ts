import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import crypto from "node:crypto";

/**
 * Webhook Midtrans. Verifikasi signature supaya endpoint ini tidak bisa
 * dipakai orang lain untuk memberi premium gratis.
 */
export async function POST(request: Request) {
  const notif = (await request.json()) as {
    order_id: string;
    status_code: string;
    gross_amount: string;
    signature_key: string;
    transaction_status: string;
    custom_field1?: string; // user_id
  };

  const serverKey = process.env.MIDTRANS_SERVER_KEY!;
  const harapan = crypto
    .createHash("sha512")
    .update(
      `${notif.order_id}${notif.status_code}${notif.gross_amount}${serverKey}`
    )
    .digest("hex");

  if (harapan !== notif.signature_key) {
    return NextResponse.json({ error: "signature invalid" }, { status: 401 });
  }

  const lunas =
    notif.transaction_status === "settlement" ||
    notif.transaction_status === "capture";

  if (!lunas || !notif.custom_field1) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const aktifSampai = new Date();
  aktifSampai.setDate(aktifSampai.getDate() + 30);

  const { error } = await admin.from("subscriptions").insert({
    user_id: notif.custom_field1,
    plan: "premium",
    aktif_sampai: aktifSampai.toISOString(),
    midtrans_order: notif.order_id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
