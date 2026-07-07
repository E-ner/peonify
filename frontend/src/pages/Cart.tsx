import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, total } = useCart();
  const { user } = useAuth();

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <ShoppingBag className="mx-auto size-10 text-muted-foreground" />
        <h1 className="mt-4 font-heading text-4xl font-medium">Your Cart</h1>
        <p className="mt-2 text-muted-foreground">
          Your cart is empty — it deserves better.
        </p>
        <Button asChild className="mt-6">
          <Link to="/shop">Browse the Boutique</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-heading text-4xl font-medium sm:text-5xl">Your Cart</h1>

      <Card className="mt-8 py-2">
        <CardContent className="divide-y px-4">
          {items.map((it) => (
            <div key={it.line_id} className="flex items-center gap-3 py-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{it.name}</p>
                {it.custom_config && (
                  <p className="text-xs text-muted-foreground">
                    Custom arrangement — made to order
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  onClick={() => updateQuantity(it.line_id, it.quantity - 1)}
                >
                  <Minus className="size-3.5" />
                </Button>
                <span className="w-8 text-center text-sm tabular-nums">
                  {it.quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  onClick={() => updateQuantity(it.line_id, it.quantity + 1)}
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>
              <span className="w-24 text-right font-medium tabular-nums">
                {formatPrice(it.unit_price_cents * it.quantity)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground"
                onClick={() => removeItem(it.line_id)}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Separator className="my-6" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-heading text-2xl font-semibold">
          Total {formatPrice(total)}
        </span>
        <div className="text-right">
          <Button size="lg" onClick={() => navigate("/checkout")}>
            {user ? "Proceed to Checkout" : "Sign in to Checkout"}
          </Button>
          {!user && (
            <p className="mt-1 text-xs text-muted-foreground">
              An account is required to place an order.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
