/**
 * Payment gateway: Paystack (https://paystack.com/docs/api/transaction/).
 *
 * Chosen because it's very easy to test: create a free Paystack account, copy
 * the TEST secret key (starts with sk_test_...) into backend/.env as
 * PAYSTACK_SECRET_KEY, and every payment runs against Paystack's sandbox —
 * test cards like 4084 0840 8408 4081 complete instantly, no real money.
 *
 * Without a key the gateway runs in MOCK mode so the shop still works
 * end-to-end out of the box.
 *
 * Flow with a key set:
 *   1. POST https://api.paystack.co/transaction/initialize
 *      { email, amount (lowest currency unit), currency }
 *   2. Paystack returns { authorization_url, access_code, reference }
 *   3. The customer completes payment on authorization_url
 *   4. Verify with GET https://api.paystack.co/transaction/verify/:reference
 *      (transaction status is in response.data.status)
 */

const PAYSTACK_BASE = "https://api.paystack.co";

export interface PaymentResult {
  provider: "mock" | "paystack";
  payment_ref: string;
  authorization_url?: string;
  status: "succeeded" | "requires_confirmation";
}

interface PaystackInitResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export function paymentsProvider(): "paystack" | "mock" {
  return process.env.PAYSTACK_SECRET_KEY ? "paystack" : "mock";
}

export async function createPayment(
  amountCents: number,
  email: string,
  callbackUrl?: string
): Promise<PaymentResult> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (secretKey) {
    // Currency: omitted by default so Paystack uses the merchant account's
    // own currency (sending e.g. USD to an NGN/KES/RWF account fails with
    // "Currency not supported by merchant"). Override with PAYSTACK_CURRENCY.
    const currency = process.env.PAYSTACK_CURRENCY?.trim();
    const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amountCents, // lowest unit of the merchant currency
        ...(currency ? { currency } : {}),
        ...(callbackUrl ? { callback_url: callbackUrl } : {}),
      }),
    });
    const body = (await res.json()) as PaystackInitResponse;
    if (!res.ok || !body.status || !body.data) {
      throw new Error(`Paystack initialize failed: ${body.message || res.status}`);
    }
    return {
      provider: "paystack",
      payment_ref: body.data.reference,
      authorization_url: body.data.authorization_url,
      status: "requires_confirmation",
    };
  }

  // Mock mode — no key configured; payment "succeeds" instantly.
  return {
    provider: "mock",
    payment_ref: `py_mock_${Date.now()}_${amountCents}`,
    status: "succeeded",
  };
}

/** Confirm a Paystack transaction after the customer pays. */
export async function verifyPayment(reference: string): Promise<boolean> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return reference.startsWith("py_mock_");

  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secretKey}` } }
  );
  const body = (await res.json()) as {
    status: boolean;
    data?: { status: string };
  };
  return Boolean(res.ok && body.status && body.data?.status === "success");
}
