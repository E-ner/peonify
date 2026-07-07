import type { ReactNode } from "react";
import { Link } from "react-router-dom";

// Premium split-screen frame shared by the login and signup pages.
export default function AuthLayout({
  title,
  subtitle,
  image,
  quote,
  quoteSub,
  children,
}: {
  title: string;
  subtitle: string;
  image: string;
  quote: string;
  quoteSub: string;
  children: ReactNode;
}) {
  return (
    <section className="grid min-h-[calc(100vh-4rem)] grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src={image}
          alt="Peonify arrangement"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
        <div className="absolute bottom-10 left-10 max-w-sm text-white">
          <p className="font-heading text-3xl leading-snug font-medium">{quote}</p>
          <p className="mt-3 text-sm text-white/80">{quoteSub}</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <Link to="/" className="font-heading text-2xl font-semibold">
            Peonify
          </Link>
          <h1 className="mt-8 font-heading text-4xl font-medium">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </section>
  );
}
