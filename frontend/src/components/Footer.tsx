import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

// Brand icons (lucide no longer ships brand logos)
const svgProps = {
  viewBox: "0 0 24 24",
  fill: "currentColor",
  className: "size-4",
} as const;
const InstagramIcon = () => (
  <svg {...svgProps}>
    <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 1.8.25 2.2.41.6.22 1 .48 1.4.9.4.4.7.9.9 1.4.2.4.4 1.1.4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.9.7-1.4.9-.4.2-1.1.4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.9-.9-1.4-.2-.4-.4-1.1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c0-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.9-.7 1.4-.9.4-.2 1.1-.4 2.2-.4 1.3-.1 1.7-.1 4.9-.1M12 0C8.7 0 8.3 0 7 .1 5.8.1 4.9.3 4.1.6c-.8.3-1.5.8-2.2 1.4C1.3 2.6.8 3.3.6 4.1.3 4.9.1 5.8.1 7 0 8.3 0 8.7 0 12s0 3.7.1 5c0 1.2.2 2.1.5 2.9.3.8.7 1.5 1.4 2.1.6.7 1.3 1.1 2.1 1.4.8.3 1.7.5 2.9.5 1.3.1 1.7.1 5 .1s3.7 0 5-.1c1.2 0 2.1-.2 2.9-.5.8-.3 1.5-.7 2.1-1.4.7-.6 1.1-1.3 1.4-2.1.3-.8.5-1.7.5-2.9.1-1.3.1-1.7.1-5s0-3.7-.1-5c0-1.2-.2-2.1-.5-2.9-.3-.8-.7-1.5-1.4-2.1C21.4 1.3 20.7.8 20 .6 19.1.3 18.2.1 17 .1 15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.9 1.4 1.4 0 0 0 0-2.9z" />
  </svg>
);
const FacebookIcon = () => (
  <svg {...svgProps}>
    <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.49h-2.8V24C19.62 23.1 24 18.1 24 12.07z" />
  </svg>
);
const XIcon = () => (
  <svg {...svgProps}>
    <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.64 7.58H.46l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41z" />
  </svg>
);
const YoutubeIcon = () => (
  <svg {...svgProps}>
    <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
  </svg>
);
const LinkedinIcon = () => (
  <svg {...svgProps}>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
);

const SOCIALS = [
  { icon: InstagramIcon, label: "Instagram", href: "https://instagram.com/peonify" },
  { icon: FacebookIcon, label: "Facebook", href: "https://facebook.com/peonify" },
  { icon: XIcon, label: "X (Twitter)", href: "https://x.com/peonify" },
  { icon: YoutubeIcon, label: "YouTube", href: "https://youtube.com/@peonify" },
  { icon: LinkedinIcon, label: "LinkedIn", href: "https://linkedin.com/company/peonify" },
];

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { to: "/shop", label: "The Boutique" },
      { to: "/builder", label: "Bouquet Builder" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About Us" },
      { to: "/contact", label: "Contact Us" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/terms", label: "Terms & Conditions" },
      { to: "/privacy", label: "Privacy Policy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1">
            <span className="font-heading text-2xl font-semibold">Peonify</span>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Hand-curated luxury florals, delivered with precision. Same-day
              delivery when ordered before 2pm.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              hello@peonify.com · +1 (555) 010-2030
            </p>
            <div className="mt-4 flex gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex size-9 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <s.icon />
                </a>
              ))}
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold tracking-wide uppercase">
                {col.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Separator className="my-8" />
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Peonify Floral Atelier. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
