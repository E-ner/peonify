import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { effectivePriceCents, formatPrice } from "@/lib/api";
import type { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import ProductImage from "./ProductImage";

const NEW_WINDOW_DAYS = 14;

export function isNewProduct(p: Product): boolean {
  return (
    Boolean(p.created_at) &&
    Date.now() - new Date(p.created_at).getTime() <
      NEW_WINDOW_DAYS * 24 * 3600 * 1000
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const price = effectivePriceCents(product);
  const onSale = product.discount_percent > 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // the whole card is a link — don't navigate
    addItem({
      product_id: product.id,
      name: product.name,
      unit_price_cents: price,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Link to={`/shop/${product.slug}`} className="group">
      <Card className="gap-0 overflow-hidden py-0 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
        <div className="relative overflow-hidden">
          <ProductImage
            src={product.image_url}
            hue={product.hue}
            name={product.name}
            className="transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {onSale && (
              <Badge className="bg-destructive text-white">
                -{product.discount_percent}%
              </Badge>
            )}
            {isNewProduct(product) && <Badge>New</Badge>}
            {!product.in_stock && <Badge variant="secondary">Out of stock</Badge>}
          </div>
        </div>
        <CardContent className="space-y-1.5 p-4">
          <Badge variant="secondary" className="capitalize">
            {product.collection}
          </Badge>
          <h3 className="font-heading text-xl leading-snug font-semibold">
            {product.name}
          </h3>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-primary">
              {formatPrice(price)}
              {onSale && (
                <span className="ml-2 text-xs text-muted-foreground line-through">
                  {formatPrice(product.price_cents)}
                </span>
              )}
            </p>
            {!isAdmin && (
              <Button
                size="sm"
                variant="outline"
                className="h-8"
                disabled={!product.in_stock}
                onClick={handleAdd}
              >
                <ShoppingBag className="size-3.5" />
                Add
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
