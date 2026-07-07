import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { adminApi, type Category, type Collection, type ProductInput } from "@/lib/api";
import type { Product } from "@/lib/types";

const EMPTY: ProductInput = {
  name: "",
  description: "",
  category: "bouquet",
  collection: "signature",
  price_cents: 0,
  hue: 340,
  image_url: "",
  in_stock: true,
  discount_percent: 0,
};

export default function ProductForm({
  open,
  onOpenChange,
  product,
  categories,
  collections,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  categories: Category[];
  collections: Collection[];
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ProductInput>(EMPTY);
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (product) {
        setForm({
          slug: product.slug,
          name: product.name,
          description: product.description,
          category: product.category,
          collection: product.collection,
          price_cents: product.price_cents,
          hue: product.hue,
          image_url: product.image_url,
          in_stock: product.in_stock,
          discount_percent: product.discount_percent,
        });
        setPrice((product.price_cents / 100).toFixed(2));
      } else {
        setForm(EMPTY);
        setPrice("");
      }
    }
  }, [open, product]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const { url } = await adminApi.uploadImage(file);
      setForm((p) => ({ ...p, image_url: url }));
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price_cents: Math.round(parseFloat(price || "0") * 100),
      };
      if (product) {
        await adminApi.updateProduct(product.id, payload);
        toast.success(`${payload.name} updated`);
      } else {
        await adminApi.createProduct(payload);
        toast.success(`${payload.name} added to the boutique`);
      }
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            {product ? `Edit ${product.name}` : "New Product"}
          </DialogTitle>
          <DialogDescription>
            {product
              ? "Changes go live in the boutique immediately."
              : "Add a new arrangement to the boutique."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/40 transition-colors hover:border-primary"
            >
              {uploading ? (
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              ) : form.image_url ? (
                <img
                  src={form.image_url}
                  alt="Product"
                  className="size-full object-cover"
                />
              ) : (
                <ImagePlus className="size-5 text-muted-foreground" />
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUpload(file);
                e.target.value = "";
              }}
            />
            <div className="flex-1 space-y-2">
              <Label htmlFor="p-name">Name</Label>
              <Input
                id="p-name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Blush Peony Dream"
                required
              />
              <p className="text-xs text-muted-foreground">
                Click the square to upload a photo (max 5MB).
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="p-desc">Description</Label>
            <Textarea
              id="p-desc"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Collection</Label>
              <Select
                value={form.collection}
                onValueChange={(v) => setForm((p) => ({ ...p, collection: v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((c) => (
                    <SelectItem key={c.id} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-price">Price (USD)</Label>
              <Input
                id="p-price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="129.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-discount">Discount % (0 = none)</Label>
              <Input
                id="p-discount"
                type="number"
                min="0"
                max="90"
                value={form.discount_percent || ""}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    discount_percent: Math.min(90, Math.max(0, Number(e.target.value) || 0)),
                  }))
                }
                placeholder="0"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="p-stock">In stock</Label>
              <div className="flex h-9 items-center">
                <Switch
                  id="p-stock"
                  checked={form.in_stock}
                  onCheckedChange={(v) => setForm((p) => ({ ...p, in_stock: v }))}
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={saving || uploading}>
            {saving ? "Saving…" : product ? "Save Changes" : "Add Product"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
