import { useState } from "react";
import { cn } from "@/lib/utils";
import ProductArt from "./ProductArt";

// Product photo with a graceful fallback to the gradient bloom art when the
// product has no image or the file fails to load.
export default function ProductImage({
  src,
  hue,
  name,
  className,
}: {
  src?: string;
  hue: number;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <ProductArt hue={hue} name={name} className={className} />;
  }

  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("aspect-square w-full object-cover", className)}
    />
  );
}
