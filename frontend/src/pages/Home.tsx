import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarClock,
  Flame,
  PartyPopper,
  Repeat2,
  Sparkles,
  Star,
  TrendingUp,
  Truck,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type Collection, type Review } from "@/lib/api";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

const COLLECTION_FALLBACK_IMAGE = "/images/garden-whisper.jpg";

const PERKS = [
  {
    icon: CalendarClock,
    title: "Scheduled to the hour",
    text: "On-demand today, or book a precise window weeks ahead for events and anniversaries.",
  },
  {
    icon: Truck,
    title: "Shipments handled with care",
    text: "Our team personally moves every order from the florist's bench to your door — follow each step in your account.",
  },
  {
    icon: Repeat2,
    title: "Loved, and heard",
    text: "Every arrangement can be rated by the people who receive it — your feedback shapes what we grow next.",
  },
];

// Interactive 3D hero: the photo stack lives in a perspective container and
// tilts toward the pointer; each layer sits at a different translateZ depth.
function Hero3D() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMove = (e: React.MouseEvent) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -10, y: px * 12 });
  };

  return (
    <div
      ref={frameRef}
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className="relative mx-auto w-full max-w-md"
      style={{ perspective: "1200px" }}
    >
      <div
        className="relative transition-transform duration-200 ease-out"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        <img
          src="/images/hero.jpg"
          alt="Signature peony arrangement in a ceramic vase"
          className="aspect-[4/5] w-full rounded-2xl object-cover shadow-2xl"
        />

        <img
          src="/images/garden-whisper.jpg"
          alt="Garden Whisper bouquet"
          className="absolute -bottom-8 -left-8 hidden w-32 rounded-xl border-4 border-background object-cover shadow-xl sm:block"
          style={{ transform: "translateZ(60px)" }}
        />

        <div
          className="absolute -top-6 -right-4 rounded-xl border bg-background/95 px-4 py-3 shadow-lg backdrop-blur sm:-right-10"
          style={{ transform: "translateZ(80px)" }}
        >
          <div className="flex items-center gap-1 text-primary">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-3.5 fill-current" />
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            "The peonies arrived at 9:02.
            <br />
            She cried. Perfect."
          </p>
        </div>

        <div
          className="absolute -bottom-5 right-6 flex items-center gap-2 rounded-full border bg-background/95 py-2 pr-4 pl-3 shadow-lg backdrop-blur"
          style={{ transform: "translateZ(100px)" }}
        >
          <Sparkles className="size-4 text-primary" />
          <span className="text-xs font-medium">Hand-tied this morning</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState<Product[] | null>(null);
  const [bestSellers, setBestSellers] = useState<Array<Product & { sold: number }>>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<
    Array<Review & { product_name: string; slug: string }>
  >([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    api
      .getProducts({ collection: "signature" })
      .then(setFeatured)
      .catch(() => setFeatured([]));
    api.getBestSellers().then(setBestSellers).catch(() => undefined);
    api
      .getProducts()
      .then((all) => {
        setAllProducts(all);
        setNewArrivals(
          [...all]
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
            .slice(0, 4)
        );
      })
      .catch(() => undefined);
    api.getRecentReviews().then(setTestimonials).catch(() => undefined);
    api.getCollections().then(setCollections).catch(() => undefined);
  }, []);

  return (
    <>
      <section className="overflow-hidden bg-gradient-to-b from-secondary/70 via-secondary/30 to-background">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div className="text-center lg:text-left">
            <Badge variant="secondary" className="tracking-[0.3em] uppercase">
              Luxury Floral Atelier
            </Badge>
            <h1 className="mt-6 font-heading text-5xl leading-tight font-medium sm:text-6xl xl:text-7xl">
              Peonies, curated.
              <br />
              Delivered like clockwork.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground lg:mx-0">
              Hand-selected stems, artisanal arrangements and precision delivery
              windows — from our atelier to your door.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Button asChild size="lg">
                <Link to="/shop">Shop the Collection</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/builder">Build Your Bouquet</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground lg:justify-start">
              <span>✓ Same-day before 2pm</span>
              <span>✓ Order updates in your account</span>
              <span>✓ Freshness guaranteed</span>
            </div>
          </div>

          <Hero3D />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-heading text-3xl font-medium sm:text-4xl">
            The Signature Collection
          </h2>
          <Button asChild variant="link" className="text-primary">
            <Link to="/shop">View all →</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured === null
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="aspect-4/5 rounded-xl" />
              ))
            : featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Flash sale banner */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <Link to="/shop?sale=1" className="group block">
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src="/images/velvet-crush.jpg"
              alt="Flash sale bouquets"
              className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-64"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-8 text-white sm:px-12">
              <Badge className="w-fit bg-destructive text-white">
                <Flame className="size-3" /> Flash Sale
              </Badge>
              <h2 className="mt-3 font-heading text-3xl font-medium sm:text-4xl">
                Up to 20% off summer blooms
              </h2>
              <p className="mt-1 max-w-md text-sm text-white/85">
                Velvet Crush, Golden Hour, Petite Poème and more — while stems last.
              </p>
              <span className="mt-4 w-fit rounded-full bg-white px-5 py-2 text-sm font-medium text-foreground transition-transform group-hover:scale-105">
                Shop the sale →
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* Best sellers */}
      {bestSellers.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-6 flex items-center gap-2">
            <TrendingUp className="size-5 text-primary" />
            <h2 className="font-heading text-3xl font-medium">Most Loved</h2>
            <span className="text-sm text-muted-foreground">
              — our customers' favourites
            </span>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-6 flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <h2 className="font-heading text-3xl font-medium">Fresh In</h2>
            <span className="text-sm text-muted-foreground">
              — the latest additions to the boutique
            </span>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {collections.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <h2 className="mb-6 font-heading text-3xl font-medium">
            Shop by Collection
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((c) => (
              <Link key={c.id} to={`/shop?collection=${c.slug}`} className="group">
                <Card className="h-full gap-0 overflow-hidden py-0 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                  <div className="overflow-hidden">
                    <img
                      src={
                        // First product in this collection provides the cover
                        allProducts.find(
                          (p) => p.collection === c.slug && p.image_url
                        )?.image_url ?? COLLECTION_FALLBACK_IMAGE
                      }
                      alt={`${c.name} Collection`}
                      loading="lazy"
                      className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-5">
                    <p className="text-[11px] font-medium tracking-[0.25em] text-primary uppercase">
                      {c.name} Collection
                    </p>
                    <h3 className="mt-1 font-heading text-2xl font-medium">{c.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {c.description || `Explore the ${c.name} collection.`}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* How it works — the marketing explanation of the whole system */}
      <section className="bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-medium sm:text-4xl">
              How Peonify Works
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
              From first click to fresh flowers at the door — in four simple
              steps.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "1",
                title: "Choose",
                text: "Pick a ready-made arrangement from the boutique, or design your own in the Bouquet Builder.",
              },
              {
                step: "2",
                title: "Pay & schedule",
                text: "Choose same-day or a future date with a delivery window that suits, and pay securely at checkout.",
              },
              {
                step: "3",
                title: "We deliver",
                text: "Our florists hand-tie your flowers the morning of delivery and bring them right to the door.",
              },
              {
                step: "4",
                title: "Share the joy",
                text: "You're notified when it's delivered — then rate the arrangement and tell us how we did.",
              },
            ].map((s) => (
              <Card key={s.step} className="bg-background">
                <CardContent className="p-6">
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary font-heading text-lg font-semibold text-primary-foreground">
                    {s.step}
                  </span>
                  <h3 className="mt-4 font-heading text-xl font-medium">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild size="lg">
              <Link to="/shop">Start with Step 1 →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-center font-heading text-3xl font-medium sm:text-4xl">
            What Customers Say
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-0.5 text-primary">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="size-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    “{t.comment}”
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <Avatar className="size-8">
                      {t.avatar_url && <AvatarImage src={t.avatar_url} alt={t.author} />}
                      <AvatarFallback className="bg-secondary text-xs">
                        {t.author[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{t.author}</p>
                      <Link
                        to={`/shop/${t.slug}`}
                        className="text-xs text-primary hover:underline"
                      >
                        on {t.product_name}
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Events banner */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src="/images/provence-morning.jpg"
            alt="Event florals"
            className="h-52 w-full object-cover sm:h-64"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-black/75 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-end justify-center px-8 text-right text-white sm:px-12">
            <Badge className="w-fit">
              <PartyPopper className="size-3" /> Weddings & Events
            </Badge>
            <h2 className="mt-3 font-heading text-3xl font-medium sm:text-4xl">
              Flowers for your big day
            </h2>
            <p className="mt-1 max-w-md text-sm text-white/85">
              Weddings, corporate events, celebrations — our florists design at
              any scale.
            </p>
            <Button asChild variant="secondary" className="mt-4">
              <Link to="/contact">Talk to our florists →</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-16 sm:grid-cols-3">
        {PERKS.map((perk) => (
          <div key={perk.title} className="text-center sm:text-left">
            <perk.icon className="mx-auto size-6 text-primary sm:mx-0" />
            <h3 className="mt-3 font-heading text-xl font-medium">{perk.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{perk.text}</p>
          </div>
        ))}
      </section>
    </>
  );
}
