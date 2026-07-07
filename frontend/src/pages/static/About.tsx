import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <>
      <section className="bg-gradient-to-b from-secondary/60 to-background">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="font-heading text-5xl font-medium">Our Story</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Peonify began with a simple belief: sending flowers should feel as
            special as receiving them.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 px-4 py-12 md:grid-cols-2">
        <img
          src="/images/garden-whisper.jpg"
          alt="Hand-tied peony bouquet"
          className="aspect-square w-full rounded-2xl object-cover shadow-md"
        />
        <div className="space-y-4 text-muted-foreground">
          <h2 className="font-heading text-3xl font-medium text-foreground">
            A boutique atelier, not a warehouse
          </h2>
          <p>
            Every arrangement that leaves our studio is hand-selected and
            hand-tied the same morning it ships. We work directly with local
            growers, choose stems at peak bloom, and never hold flowers longer
            than a day.
          </p>
          <p>
            Our couriers deliver inside the window you choose, and our team
            personally follows every shipment from the florist's bench to your
            recipient's door.
          </p>
          <p>
            Whether it's a single anniversary bouquet or flowers for an entire
            event, we treat each order like it's the only one.
          </p>
          <Button asChild className="mt-2">
            <Link to="/shop">Visit the Boutique</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
