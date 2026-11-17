export interface SnapshotMidtrans {
  token: string;
  redirect_url: string;
}

const BASE = process.env.MIDTRANS_IS_PRODUCTION === "true"
  ? "https://app.midtrans.com/snap/v1/transactions"
  : "https://app.sandbox.midtrans.com/snap/v1/transactions";

export async function buatTransaksi(params: {
  orderId: string;
  grossAmount: number;
  userId: string;
  email: string;
}): Promise<SnapshotMidtrans> {
  const auth = Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString(
    "base64"
  );

  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.grossAmount,
      },
      customer_details: { email: params.email },
      custom_field1: params.userId,
    }),
  });

  if (!res.ok) {
    throw new Error(`Midtrans: ${res.status} ${await res.text()}`);
  }

  return (await res.json()) as SnapshotMidtrans;
}
