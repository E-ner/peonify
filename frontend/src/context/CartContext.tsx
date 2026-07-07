import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type { CartItem } from "@/lib/types";
import { useAuth } from "./AuthContext";

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "line_id" | "quantity">) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  clearCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("peonify_cart") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("peonify_cart", JSON.stringify(items));
  }, [items]);

  const addItem: CartContextValue["addItem"] = (item) => {
    // The shop is for customers — the admin manages it, they don't buy from it.
    if (user?.role === "admin") {
      toast.error("Admin accounts can't place orders — use a customer account.");
      return;
    }
    setItems((prev) => {
      // Custom bouquets are always unique lines; products merge by id
      if (!item.custom_config) {
        const existing = prev.find(
          (it) => it.product_id === item.product_id && !it.custom_config
        );
        if (existing) {
          return prev.map((it) =>
            it === existing ? { ...it, quantity: it.quantity + 1 } : it
          );
        }
      }
      return [...prev, { ...item, line_id: crypto.randomUUID(), quantity: 1 }];
    });
  };

  const updateQuantity = (lineId: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((it) => it.line_id !== lineId)
        : prev.map((it) => (it.line_id === lineId ? { ...it, quantity } : it))
    );
  };

  const removeItem = (lineId: string) =>
    setItems((prev) => prev.filter((it) => it.line_id !== lineId));

  const clearCart = () => setItems([]);

  const total = items.reduce(
    (sum, it) => sum + it.unit_price_cents * it.quantity,
    0
  );
  const count = items.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQuantity, removeItem, clearCart, total, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
