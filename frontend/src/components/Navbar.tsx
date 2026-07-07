import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bell, Menu, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { meApi } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const links = [
  { to: "/shop", label: "Shop" },
  { to: "/builder", label: "Bouquet Builder" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { count } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnread(0);
      return;
    }
    const load = () =>
      meApi
        .getNotifications()
        .then((n) => setUnread(n.filter((x) => !x.read).length))
        .catch(() => undefined);
    load();
    const timer = setInterval(load, 30_000);
    return () => clearInterval(timer);
  }, [user]);

  const initials = user?.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="size-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-left font-heading text-2xl">
                  Peonify
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {links.map((link) => (
                  <Button
                    key={link.to}
                    variant="ghost"
                    className="justify-start text-base"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate(link.to);
                    }}
                  >
                    {link.label}
                  </Button>
                ))}
                {!user && (
                  <Button
                    className="mt-2 justify-start text-base"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/login");
                    }}
                  >
                    Sign In
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex flex-col leading-none">
            <span className="font-heading text-2xl font-semibold tracking-wide">
              Peonify
            </span>
            <span className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
              Floral Atelier
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-1">
          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to}>
                {({ isActive }) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "text-sm",
                      isActive && "bg-accent text-accent-foreground"
                    )}
                  >
                    {link.label}
                  </Button>
                )}
              </NavLink>
            ))}
          </div>

          {user?.role !== "admin" && (
            <NavLink to="/cart">
              {({ isActive }) => (
                <Button
                  variant={isActive ? "secondary" : "outline"}
                  size="sm"
                  className="relative ml-1"
                >
                  <ShoppingBag className="size-4" />
                  <span className="hidden sm:inline">Cart</span>
                  {count > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 min-w-5 rounded-full px-1 text-[10px]">
                      {count}
                    </Badge>
                  )}
                </Button>
              )}
            </NavLink>
          )}

          {user ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() =>
                  navigate(user.role === "admin" ? "/admin" : "/account")
                }
              >
                <Bell className="size-4" />
                {unread > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full px-1 text-[9px]">
                    {unread}
                  </Badge>
                )}
                <span className="sr-only">Notifications</span>
              </Button>

              {/* Clicking the profile photo goes straight to your dashboard */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                title="My Dashboard"
                onClick={() =>
                  navigate(user.role === "admin" ? "/admin" : "/account")
                }
              >
                <Avatar className="size-8">
                  {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.name} />}
                  <AvatarFallback className="bg-secondary text-xs font-medium text-secondary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">My Dashboard</span>
              </Button>
            </>
          ) : (
            <Button size="sm" className="ml-1 hidden sm:inline-flex" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
