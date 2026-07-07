import { useState } from "react";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "peonify_cookie_consent";

export default function CookieConsent() {
  const [answered, setAnswered] = useState(() =>
    Boolean(localStorage.getItem(CONSENT_KEY))
  );

  if (answered) return null;

  const decide = (value: "accepted" | "essential") => {
    localStorage.setItem(CONSENT_KEY, value);
    setAnswered(true);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto flex max-w-2xl flex-col items-start gap-3 rounded-xl border bg-background/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center">
        <Cookie className="size-5 shrink-0 text-primary" />
        <p className="flex-1 text-sm text-muted-foreground">
          We use cookies to keep you signed in and remember your cart. No
          third-party tracking — just the essentials for a smooth bloom.
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => decide("essential")}>
            Essentials only
          </Button>
          <Button size="sm" onClick={() => decide("accepted")}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
