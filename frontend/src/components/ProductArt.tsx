import { cn } from "@/lib/utils";

// Stand-in for product photography: an abstract "bloom" rendered from the
// product's accent hue. Swap for real images by replacing this component.
export default function ProductArt({
  hue = 340,
  name = "",
  className,
}: {
  hue?: number;
  name?: string;
  className?: string;
}) {
  const style = {
    background: `
      radial-gradient(circle at 30% 30%, hsl(${hue}, 65%, 82%) 0%, transparent 45%),
      radial-gradient(circle at 68% 38%, hsl(${hue + 18}, 55%, 74%) 0%, transparent 42%),
      radial-gradient(circle at 48% 68%, hsl(${hue - 14}, 60%, 78%) 0%, transparent 48%),
      radial-gradient(circle at 75% 75%, hsl(${hue + 30}, 45%, 86%) 0%, transparent 40%),
      hsl(${hue}, 30%, 94%)`,
  };
  return (
    <div
      className={cn(
        "flex aspect-square w-full items-center justify-center overflow-hidden",
        className
      )}
      style={style}
      role="img"
      aria-label={name}
    >
      <span className="text-4xl opacity-30 select-none">✿</span>
    </div>
  );
}
