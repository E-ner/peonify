import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { api, formatPrice } from "@/lib/api";
import type { BuilderOption, BuilderOptions } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const STEPS = [
  { key: "size", title: "Size", hint: "How generous should it be?" },
  { key: "focal", title: "Focal flower", hint: "The star of the arrangement." },
  { key: "foliage", title: "Foliage", hint: "Texture and movement." },
  { key: "packaging", title: "Finishing", hint: "How it arrives matters." },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

// Real photography for the live preview and option cards
// (bridalbouquetbuilder.com style: actual blooms compose the bouquet).
const FOCAL_IMAGES: Record<string, string> = {
  "Blush Peony": "/images/petite-poeme.jpg",
  "Coral Charm Peony": "/images/coral-charm-cascade.jpg",
  "White Peony": "/images/duchesse-blanche-stems.jpg",
  "Garden Rose": "/images/builder/garden-rose.jpg",
};
const FOLIAGE_IMAGES: Record<string, string> = {
  "Silver Eucalyptus": "/images/builder/eucalyptus.jpg",
  "Olive Branch": "/images/builder/olive.jpg",
  "Ruscus & Fern": "/images/builder/fern.jpg",
};
const PACKAGING_IMAGES: Record<string, string> = {
  "Ivory Silk Wrap": "/images/garden-whisper.jpg",
  "Black Boutique Box": "/images/ivory-noir.jpg",
  "Ceramic Vessel": "/images/hero.jpg",
};
const SIZE_BLOOMS: Record<string, number> = {
  Petite: 5,
  Classic: 7,
  Grand: 9,
  Opulent: 12,
};

export function optionImage(step: StepKey, name: string): string | undefined {
  if (step === "focal") return FOCAL_IMAGES[name];
  if (step === "foliage") return FOLIAGE_IMAGES[name];
  if (step === "packaging") return PACKAGING_IMAGES[name];
  return undefined;
}

function BouquetPreview({
  choices,
}: {
  choices: Partial<Record<StepKey, BuilderOption>>;
}) {
  const focalImage = FOCAL_IMAGES[choices.focal?.name ?? ""] ?? FOCAL_IMAGES["Blush Peony"];
  const foliageImage = FOLIAGE_IMAGES[choices.foliage?.name ?? ""];
  const blooms = SIZE_BLOOMS[choices.size?.name ?? ""] ?? 7;
  const packaging = choices.packaging?.name ?? "";

  // Deterministic bloom placement in a dome shape
  const positions = useMemo(
    () =>
      Array.from({ length: blooms }).map((_, i) => {
        const angle = (i / Math.max(blooms - 1, 1)) * Math.PI;
        const ring = i % 2 === 0 ? 30 : 18;
        return {
          left: 50 + Math.cos(angle) * ring,
          top: 42 - Math.sin(angle) * (ring * 0.75) + (i % 3) * 4,
          size: 20 + ((i * 7) % 10),
          rotate: ((i * 47) % 40) - 20,
        };
      }),
    [blooms]
  );

  return (
    <div
      className={cn(
        "relative mx-auto aspect-square w-full max-w-64 overflow-hidden rounded-2xl border bg-gradient-to-b from-muted/40 to-secondary/40",
        packaging === "Black Boutique Box" && "border-4 border-foreground/80",
        packaging === "Ceramic Vessel" && "rounded-b-[45%]"
      )}
    >
      {/* foliage layer — real leaves behind the blooms */}
      {choices.foliage && foliageImage && (
        <img
          src={foliageImage}
          alt={choices.foliage.name}
          className="absolute inset-x-4 top-6 bottom-14 h-auto w-[calc(100%-2rem)] rounded-full object-cover opacity-70 blur-[1px]"
        />
      )}
      {/* blooms — circular crops of the chosen focal flower */}
      {choices.size &&
        positions.map((p, i) => (
          <img
            key={i}
            src={focalImage}
            alt=""
            className="absolute rounded-full border border-white/40 object-cover shadow-md transition-all duration-500"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}%`,
              aspectRatio: "1",
              transform: `translate(-50%, -50%) rotate(${p.rotate}deg)`,
            }}
          />
        ))}
      {/* wrap / vessel */}
      {packaging === "Ivory Silk Wrap" && (
        <div className="absolute inset-x-8 bottom-0 h-24 rounded-t-[50%] bg-orange-50/90 shadow-inner" />
      )}
      {packaging === "Ceramic Vessel" && (
        <div className="absolute inset-x-10 bottom-0 h-20 rounded-t-xl bg-stone-200 shadow-inner" />
      )}
      {!choices.size && !choices.focal && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="px-6 text-center text-sm text-muted-foreground">
            Your bouquet takes shape here as you choose.
          </p>
        </div>
      )}
    </div>
  );
}

export default function Builder() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [options, setOptions] = useState<BuilderOptions | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [choices, setChoices] = useState<Partial<Record<StepKey, BuilderOption>>>({});

  useEffect(() => {
    api.getBuilderOptions().then(setOptions).catch(() => setOptions({}));
  }, []);

  if (!options) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12">
        <Skeleton className="h-10 w-64" />
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </section>
    );
  }

  const step = STEPS[stepIdx];
  const stepOptions = options[step.key] ?? [];
  const selected = choices[step.key];

  const chosen = STEPS.map((s) => ({ step: s, option: choices[s.key] })).filter(
    (x): x is { step: (typeof STEPS)[number]; option: BuilderOption } =>
      Boolean(x.option)
  );
  const total = chosen.reduce((sum, x) => sum + x.option.price_cents, 0);
  const isComplete = chosen.length === STEPS.length;
  const progress = (chosen.length / STEPS.length) * 100;

  const pick = (opt: BuilderOption) => {
    setChoices((prev) => ({ ...prev, [step.key]: opt }));
    if (stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1);
  };

  const handleAddToCart = () => {
    if (!isComplete) return;
    const summary = STEPS.map((s) => choices[s.key]!.name).join(" · ");
    addItem({
      product_id: null,
      name: `Custom Bouquet — ${summary}`,
      unit_price_cents: total,
      custom_config: Object.fromEntries(
        STEPS.map((s) => [s.key, choices[s.key]!.name])
      ),
    });
    toast.success("Custom bouquet added to cart");
    navigate("/cart");
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="max-w-2xl">
        <h1 className="font-heading text-4xl font-medium sm:text-5xl">
          Bouquet Builder
        </h1>
        <p className="mt-2 text-muted-foreground">
          Four decisions. One extraordinary arrangement — watch it take shape as
          you go.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <Progress value={progress} />
          <div className="mt-4 flex flex-wrap gap-2">
            {STEPS.map((s, i) => (
              <Button
                key={s.key}
                variant={
                  i === stepIdx ? "default" : choices[s.key] ? "secondary" : "outline"
                }
                size="sm"
                onClick={() => setStepIdx(i)}
              >
                {choices[s.key] && <Check className="size-3.5" />}
                {i + 1}. {s.title}
              </Button>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="font-heading text-2xl font-medium">{step.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{step.hint}</p>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {stepOptions.map((opt) => {
                const isSelected = selected?.id === opt.id;
                return (
                  <Card
                    key={opt.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => pick(opt)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        pick(opt);
                      }
                    }}
                    className={cn(
                      "cursor-pointer p-4 transition-all hover:border-primary/50 hover:shadow-md",
                      isSelected && "border-primary ring-2 ring-primary/30"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {optionImage(step.key, opt.name) && (
                        <img
                          src={optionImage(step.key, opt.name)}
                          alt={opt.name}
                          className="size-14 shrink-0 rounded-full border object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium">{opt.name}</p>
                          {isSelected && (
                            <Check className="size-4 shrink-0 text-primary" />
                          )}
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {opt.detail}
                        </p>
                        <p className="mt-1.5 text-sm font-medium text-primary">
                          {opt.price_cents > 0
                            ? `+ ${formatPrice(opt.price_cents)}`
                            : "Included"}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                disabled={stepIdx === 0}
                onClick={() => setStepIdx(stepIdx - 1)}
              >
                <ArrowLeft className="size-4" /> Back
              </Button>
              <Button
                variant="outline"
                disabled={stepIdx === STEPS.length - 1}
                onClick={() => setStepIdx(stepIdx + 1)}
              >
                Next <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Live preview + price breakdown */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-xl">
                <Sparkles className="size-4 text-primary" /> Your Bouquet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BouquetPreview choices={choices} />

              <div className="mt-5 space-y-2">
                {STEPS.map((s) => {
                  const opt = choices[s.key];
                  return (
                    <div key={s.key} className="flex justify-between gap-2 text-sm">
                      <span className="text-muted-foreground">{s.title}</span>
                      {opt ? (
                        <span className="text-right">
                          {opt.name}
                          <span className="ml-2 tabular-nums text-muted-foreground">
                            {opt.price_cents > 0
                              ? formatPrice(opt.price_cents)
                              : "—"}
                          </span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50 italic">
                          Not chosen
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="font-heading text-2xl font-semibold">
                  {formatPrice(total)}
                </span>
              </div>
              {isAdmin ? (
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Ordering is for customers — admins manage the boutique.
                </p>
              ) : (
                <Button
                  className="mt-4 w-full"
                  size="lg"
                  disabled={!isComplete}
                  onClick={handleAddToCart}
                >
                  {isComplete
                    ? "Add to Cart"
                    : `${STEPS.length - chosen.length} step${STEPS.length - chosen.length > 1 ? "s" : ""} to go`}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
