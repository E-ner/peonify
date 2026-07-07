import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { api, effectivePriceCents, formatPrice, type Review } from "@/lib/api";
import type { Product } from "@/lib/types";
import ProductImage from "@/components/ProductImage";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

function Stars({
  value,
  onChange,
  size = "size-4",
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: string;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(i)}
          className={cn(!onChange && "cursor-default")}
        >
          <Star
            className={cn(
              size,
              i <= value ? "fill-primary text-primary" : "text-muted-foreground/40"
            )}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewsSection({ slug }: { slug: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => api.getReviews(slug).then(setReviews).catch(() => setReviews([]));

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const average =
    reviews && reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      toast.error("Pick a star rating first");
      return;
    }
    setSubmitting(true);
    try {
      await api.postReview(slug, rating, comment);
      toast.success("Thank you for your feedback 🌸");
      setRating(0);
      setComment("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not post feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <Separator className="mb-10" />
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="font-heading text-3xl font-medium">Customer Feedback</h2>
        {reviews && reviews.length > 0 && (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Stars value={Math.round(average)} /> {average.toFixed(1)} ·{" "}
            {reviews.length} review{reviews.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {reviews === null ? (
            <Skeleton className="h-24 w-full rounded-xl" />
          ) : reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No feedback yet — be the first to share your experience.
            </p>
          ) : (
            reviews.map((r) => (
              <Card key={r.id} className="py-4">
                <CardContent className="px-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      {r.avatar_url && <AvatarImage src={r.avatar_url} alt={r.author} />}
                      <AvatarFallback className="bg-secondary text-xs">
                        {r.author[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{r.author}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString([], {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <Stars value={r.rating} />
                  </div>
                  {r.comment && (
                    <p className="mt-3 text-sm text-muted-foreground">{r.comment}</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card className="h-fit">
          <CardContent className="pt-6">
            <h3 className="font-heading text-xl font-medium">Share your experience</h3>
            {user ? (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <Stars value={rating} onChange={setRating} size="size-6" />
                <Textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How were the flowers? How was the delivery?"
                />
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Posting…" : "Post Feedback"}
                </Button>
              </form>
            ) : (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Sign in to leave feedback about this arrangement.
                </p>
                <Button asChild className="mt-3 w-full" variant="outline">
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    api.getProduct(slug).then(setProduct).catch((e: Error) => setError(e.message));
  }, [slug]);

  if (error) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-muted-foreground">{error}</p>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-12 md:grid-cols-2">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </section>
    );
  }

  const price = effectivePriceCents(product);

  const handleAdd = () => {
    addItem({
      product_id: product.id,
      name: product.name,
      unit_price_cents: price,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <>
    <section className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-12 md:grid-cols-2">
      <ProductImage
        src={product.image_url}
        hue={product.hue}
        name={product.name}
        className="rounded-xl shadow-md"
      />

      <div className="flex flex-col justify-center">
        <Button asChild variant="ghost" size="sm" className="mb-4 w-fit -ml-2">
          <Link to="/shop">
            <ArrowLeft className="size-4" /> Back to boutique
          </Link>
        </Button>
        <Badge variant="secondary" className="w-fit capitalize">
          {product.collection} collection
        </Badge>
        <h1 className="mt-3 font-heading text-4xl font-medium sm:text-5xl">
          {product.name}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{product.description}</p>
        <p className="mt-6 flex items-center gap-3 text-2xl font-medium text-primary">
          {formatPrice(price)}
          {product.discount_percent > 0 && (
            <>
              <span className="text-base text-muted-foreground line-through">
                {formatPrice(product.price_cents)}
              </span>
              <Badge className="bg-destructive text-white">
                -{product.discount_percent}%
              </Badge>
            </>
          )}
        </p>
        <Separator className="my-6" />
        {isAdmin ? (
          <p className="text-sm text-muted-foreground">
            You're signed in as the admin — ordering is for customers. Edit
            this product from the admin dashboard.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={handleAdd}>
              Add to Cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                handleAdd();
                navigate("/checkout");
              }}
            >
              Buy Now
            </Button>
          </div>
        )}
        <p className="mt-4 text-sm text-muted-foreground">
          Same-day delivery when ordered before 2pm, or schedule a precise
          window at checkout.
        </p>
      </div>
    </section>
    {slug && <ReviewsSection slug={slug} />}
    </>
  );
}
