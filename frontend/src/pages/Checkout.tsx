import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { CreditCard, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { api, formatPrice } from "@/lib/api";
import { useCart } from "@/context/CartContext";

const WINDOWS = ["09:00 - 12:00", "12:00 - 15:00", "15:00 - 18:00", "18:00 - 21:00"];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();

  const [orderType, setOrderType] = useState<"on_demand" | "scheduled">("on_demand");
  const [date, setDate] = useState(""); // yyyy-mm-dd from the native date picker
  const [window, setWindow] = useState("");
  const [form, setForm] = useState({
    customer_name: "",
    email: "",
    phone: "",
    address: "",
    gift_note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<"paystack" | "mock">("mock");
  const { user, loading } = useAuth();

  useEffect(() => {
    api
      .getPaymentsConfig()
      .then(({ provider }) => setPaymentProvider(provider))
      .catch(() => undefined);
  }, []);

  // Checkout requires an account — guests are sent to sign in and come back.
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { state: { from: "/checkout" } });
    }
  }, [loading, user, navigate]);

  // Signed-in customers get their saved details filled in automatically,
  // including the delivery location from their profile.
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        customer_name: prev.customer_name || user.name,
        email: prev.email || user.email,
        phone: prev.phone || user.phone,
        address:
          prev.address ||
          [user.address, user.city].filter(Boolean).join(", "),
      }));
    }
  }, [user]);

  if (user?.role === "admin") {
    return (
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-heading text-4xl font-medium">Checkout</h1>
        <p className="mt-2 text-muted-foreground">
          Admin accounts manage the shop — they can't place orders. Sign in
          with a customer account to buy.
        </p>
        <Button className="mt-6" onClick={() => navigate("/admin")}>
          Back to Admin Dashboard
        </Button>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-heading text-4xl font-medium">Checkout</h1>
        <p className="mt-2 text-muted-foreground">Your cart is empty.</p>
        <Button className="mt-6" onClick={() => navigate("/shop")}>
          Browse the Boutique
        </Button>
      </section>
    );
  }

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const today = format(new Date(), "yyyy-MM-dd");
  const deliveryDate = orderType === "on_demand" ? today : date;

  const canSubmit =
    form.customer_name.trim() &&
    form.email.trim() &&
    form.address.trim() &&
    deliveryDate &&
    window &&
    !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !deliveryDate) return;
    setSubmitting(true);
    try {
      const order = await api.createOrder({
        ...form,
        delivery_date: deliveryDate,
        delivery_window: window,
        order_type: orderType,
        items: items.map((it) => ({
          product_id: it.product_id,
          name: it.name,
          custom_config: it.custom_config,
          quantity: it.quantity,
          unit_price_cents: it.unit_price_cents,
        })),
      });
      clearCart();
      if (order.authorization_url) {
        // Paystack mode: hand the customer to the secure payment page.
        // (globalThis: the local "window" state shadows the browser global.)
        toast.info("Taking you to Paystack to complete payment…");
        globalThis.location.href = order.authorization_url;
        return;
      }
      toast.success(`Order ${order.reference} placed — follow it in your account`);
      navigate("/account");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-heading text-4xl font-medium sm:text-5xl">Checkout</h1>

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]"
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  1
                </span>
                Recipient
              </CardTitle>
              <CardDescription>Who is receiving the flowers?</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={form.customer_name}
                  onChange={set("customer_name")}
                  placeholder="Amara Chen"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="amara@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="+1 555 000 0000"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Delivery address</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={set("address")}
                  placeholder="12 Bloom Street, Apt 4, Portland OR"
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="note">Gift note (optional)</Label>
                <Textarea
                  id="note"
                  value={form.gift_note}
                  onChange={set("gift_note")}
                  placeholder="Happy anniversary — these reminded me of you."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  2
                </span>
                Delivery
              </CardTitle>
              <CardDescription>
                Choose today for same-day delivery, or pick a future date and a
                time window that suits — we arrive inside it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <RadioGroup
                value={orderType}
                onValueChange={(v) => setOrderType(v as typeof orderType)}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                <Label
                  htmlFor="on_demand"
                  className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-secondary/50"
                >
                  <RadioGroupItem value="on_demand" id="on_demand" className="mt-0.5" />
                  <span>
                    <span className="block font-medium">On-demand</span>
                    <span className="mt-1 block text-sm font-normal text-muted-foreground">
                      Delivered today
                    </span>
                  </span>
                </Label>
                <Label
                  htmlFor="scheduled"
                  className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-secondary/50"
                >
                  <RadioGroupItem value="scheduled" id="scheduled" className="mt-0.5" />
                  <span>
                    <span className="block font-medium">Scheduled</span>
                    <span className="mt-1 block text-sm font-normal text-muted-foreground">
                      Pick a future date — events &amp; anniversaries
                    </span>
                  </span>
                </Label>
              </RadioGroup>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {orderType === "scheduled" && (
                  <div className="space-y-2">
                    <Label htmlFor="delivery-date">Delivery date</Label>
                    <Input
                      id="delivery-date"
                      type="date"
                      min={today}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      We'll remind you the day before and again 5 hours before
                      delivery.
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Delivery window</Label>
                  <Select value={window} onValueChange={setWindow}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a window" />
                    </SelectTrigger>
                    <SelectContent>
                      {WINDOWS.map((w) => (
                        <SelectItem key={w} value={w}>
                          {w}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  3
                </span>
                <CreditCard className="size-4" /> Payment
              </CardTitle>
              <CardDescription>
                {paymentProvider === "paystack"
                  ? "Secure payment by Paystack. After placing the order you'll be taken to Paystack's payment page."
                  : "Payments run in demo mode — no card required."}
              </CardDescription>
            </CardHeader>
            {paymentProvider !== "paystack" && (
              <CardContent>
                <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  <Lock className="size-4" />
                  Demo mode active — your order is marked paid instantly. Add a
                  Paystack test key in backend/.env to enable real payments.
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((it) => (
                <div key={it.line_id} className="flex justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">
                    {it.quantity} × {it.name}
                  </span>
                  <span className="shrink-0 font-medium tabular-nums">
                    {formatPrice(it.unit_price_cents * it.quantity)}
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-heading text-xl font-semibold">
                  {formatPrice(total)}
                </span>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={!canSubmit}>
                {submitting
                  ? "Placing order…"
                  : paymentProvider === "paystack"
                    ? "Place Order & Pay"
                    : "Place Order"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                You can follow the shipment from your account.
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </section>
  );
}
