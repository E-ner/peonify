import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, effectivePriceCents, type Category, type Collection } from "@/lib/api";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import Paginator, { usePagination } from "@/components/Paginator";

const PRICE_RANGES = [
  { key: "all", label: "Any price", min: 0, max: Infinity },
  { key: "under75", label: "Under $75", min: 0, max: 7500 },
  { key: "75to120", label: "$75 – $120", min: 7500, max: 12000 },
  { key: "over120", label: "Over $120", min: 12000, max: Infinity },
];

const SORTS = [
  { key: "newest", label: "Newest first" },
  { key: "price_asc", label: "Price: low to high" },
  { key: "price_desc", label: "Price: high to low" },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [query, setQuery] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [sort, setSort] = useState("newest");
  const [saleOnly, setSaleOnly] = useState(searchParams.get("sale") === "1");

  const category = searchParams.get("category") || "all";
  const collection = searchParams.get("collection") || "";

  // Categories & collections come from the API so anything the admin adds in
  // Catalog shows up here immediately.
  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => setCategories([]));
    api.getCollections().then(setCollections).catch(() => setCollections([]));
  }, []);

  useEffect(() => {
    setProducts(null);
    const params: Record<string, string> = {};
    if (category !== "all") params.category = category;
    if (collection) params.collection = collection;
    api
      .getProducts(params)
      .then(setProducts)
      .catch(() => setProducts([]));
  }, [category, collection]);

  const setCategory = (key: string) => {
    const next = new URLSearchParams(searchParams);
    if (key !== "all") next.set("category", key);
    else next.delete("category");
    setSearchParams(next);
  };

  const setCollection = (slug: string) => {
    const next = new URLSearchParams(searchParams);
    if (slug !== "all") next.set("collection", slug);
    else next.delete("collection");
    setSearchParams(next);
  };

  const filtered = useMemo(() => {
    if (!products) return null;
    const q = query.trim().toLowerCase();
    const range = PRICE_RANGES.find((r) => r.key === priceRange) ?? PRICE_RANGES[0];

    const result = products.filter((p) => {
      const price = effectivePriceCents(p);
      if (q && !p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) {
        return false;
      }
      if (saleOnly && p.discount_percent <= 0) return false;
      return price >= range.min && price < range.max;
    });

    result.sort((a, b) => {
      if (sort === "price_asc") return effectivePriceCents(a) - effectivePriceCents(b);
      if (sort === "price_desc") return effectivePriceCents(b) - effectivePriceCents(a);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return result;
  }, [products, query, priceRange, sort, saleOnly]);

  const pager = usePagination(filtered, 9);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-heading text-4xl font-medium sm:text-5xl">
        {collection
          ? `The ${collections.find((c) => c.slug === collection)?.name ?? collection} Collection`
          : "The Boutique"}
      </h1>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Tabs value={category} onValueChange={setCategory}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map((c) => (
              <TabsTrigger key={c.id} value={c.slug}>
                {c.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative min-w-48 flex-1 sm:max-w-64">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search flowers…"
            className="pl-9"
          />
        </div>
        {collection && (
          <Button variant="ghost" size="sm" onClick={() => setSearchParams({})}>
            Clear collection <X className="size-3.5" />
          </Button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Select value={collection || "all"} onValueChange={setCollection}>
          <SelectTrigger className="w-44" size="sm">
            <SelectValue placeholder="All collections" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All collections</SelectItem>
            {collections.map((c) => (
              <SelectItem key={c.id} value={c.slug}>
                {c.name} Collection
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger className="w-36" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRICE_RANGES.map((r) => (
              <SelectItem key={r.key} value={r.key}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-44" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => (
              <SelectItem key={s.key} value={s.key}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={saleOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setSaleOnly((v) => !v)}
        >
          🔥 On sale
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {pager.pageItems === null ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-4/5 rounded-xl" />
          ))
        ) : pager.pageItems.length === 0 ? (
          <p className="col-span-full text-muted-foreground">
            No arrangements match your search.
          </p>
        ) : (
          pager.pageItems.map((p) => <ProductCard key={p.id} product={p} />)
        )}
      </div>
      <Paginator
        page={pager.page}
        pageCount={pager.pageCount}
        onChange={pager.setPage}
        total={pager.total}
        label="arrangements"
      />
    </section>
  );
}
