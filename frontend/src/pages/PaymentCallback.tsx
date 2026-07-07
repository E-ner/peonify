import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

// Paystack redirects here after payment (?reference= / ?trxref=). We verify
// the transaction server-side — that's the source of truth, not the redirect.
export default function PaymentCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<"verifying" | "failed">("verifying");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const reference = params.get("reference") || params.get("trxref") || "";
    if (!reference) {
      setState("failed");
      return;
    }
    api
      .verifyPayment(reference)
      .then(({ reference: orderRef }) => {
        toast.success(`Payment confirmed — order ${orderRef} is on its way!`);
        navigate("/account", { replace: true });
      })
      .catch(() => setState("failed"));
  }, [params, navigate]);

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      {state === "verifying" ? (
        <>
          <Loader2 className="size-10 animate-spin text-primary" />
          <h1 className="mt-4 font-heading text-3xl font-medium">
            Confirming your payment…
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            One moment — we're verifying the transaction with Paystack.
          </p>
        </>
      ) : (
        <>
          <XCircle className="size-10 text-destructive" />
          <h1 className="mt-4 font-heading text-3xl font-medium">
            Payment not completed
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We couldn't confirm the payment. If you were charged, it will
            appear in your account shortly — otherwise you can try again from
            your cart.
          </p>
          <div className="mt-6 flex gap-2">
            <Button asChild>
              <Link to="/account">
                <CheckCircle2 className="size-4" /> My Orders
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/cart">Back to Cart</Link>
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
