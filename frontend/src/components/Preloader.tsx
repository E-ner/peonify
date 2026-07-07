import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

// Branded splash shown while the session loads. It stays on screen for a
// minimum time so the branding is actually seen, then fades away.
const MIN_DISPLAY_MS = 1600;
const FADE_MS = 600;

export default function Preloader() {
  const { loading } = useAuth();
  const [minTimeDone, setMinTimeDone] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeDone(true), MIN_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const ready = !loading && minTimeDone;

  useEffect(() => {
    if (ready) {
      const timer = setTimeout(() => setGone(true), FADE_MS);
      return () => clearTimeout(timer);
    }
  }, [ready]);

  if (gone) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background transition-opacity duration-500",
        ready && "pointer-events-none opacity-0"
      )}
      aria-hidden="true"
    >
      <div className="relative flex size-20 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-secondary border-t-primary" />
        <span className="animate-pulse text-3xl text-primary select-none">✿</span>
      </div>
      <p className="mt-6 font-heading text-3xl font-semibold tracking-wide">
        Peonify
      </p>
      <p className="mt-1 text-[10px] tracking-[0.4em] text-muted-foreground uppercase">
        Floral Atelier
      </p>
    </div>
  );
}
