import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  Headset,
  LogOut,
  Mail,
  Package,
  Phone,
  Truck,
  UserRound,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  SHIPMENT_PIPELINE,
  STATUS_LABELS,
  api,
  formatMoneyCompact,
  formatPrice,
  meApi,
  type MyOrder,
  type Notification,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import StatusTimeline from "@/components/StatusTimeline";
import ProfileSettings from "@/components/ProfileSettings";
import Paginator, { usePagination } from "@/components/Paginator";

function StatCard({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: typeof Package;
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <Card className={cn("py-4", accent && "border-primary/40 bg-secondary/40")}>
      <CardContent className="flex items-center gap-3 px-4">
        <div className="flex size-10 items-center justify-center rounded-full bg-secondary">
          <Icon className="size-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-heading text-2xl leading-none font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Account() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<MyOrder[] | null>(null);
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [viewing, setViewing] = useState<MyOrder | null>(null);

  // Support form
  const [support, setSupport] = useState({ subject: "", body: "" });
  const [sendingSupport, setSendingSupport] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/login", { state: { from: "/account" } });
    // Admins have their own workspace — this dashboard is customers-only.
    if (!loading && user?.role === "admin") navigate("/admin", { replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    meApi.getOrders().then(setOrders).catch(() => setOrders([]));
    meApi.getNotifications().then(setNotifications).catch(() => setNotifications([]));
  }, [user]);

  const markOneRead = async (id: number) => {
    try {
      await meApi.markNotificationRead(id);
      setNotifications((prev) =>
        prev?.map((n) => (n.id === id ? { ...n, read: true } : n)) ?? prev
      );
    } catch {
      toast.error("Could not mark as read");
    }
  };

  const markAllRead = async () => {
    try {
      await meApi.markNotificationsRead();
      setNotifications((prev) => prev?.map((n) => ({ ...n, read: true })) ?? prev);
    } catch {
      toast.error("Could not mark all as read");
    }
  };

  const handleConfirmReceived = async (reference: string) => {
    setConfirming(reference);
    try {
      await api.confirmDelivered(reference);
      toast.success("Thanks for confirming — enjoy your flowers! 🌸");
      const fresh = await meApi.getOrders();
      setOrders(fresh);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not confirm delivery");
    } finally {
      setConfirming(null);
    }
  };

  const orderPager = usePagination(orders, 5);
  const notifPager = usePagination(notifications, 8);
  const unreadCount = useMemo(
    () => notifications?.filter((n) => !n.read).length ?? 0,
    [notifications]
  );
  const stats = useMemo(() => {
    const all = orders ?? [];
    return {
      total: all.length,
      awaiting: all.filter((o) => o.status === "paid").length,
      delivered: all.filter((o) => o.status === "delivered").length,
      spent: all.reduce((s, o) => s + o.total_cents, 0),
    };
  }, [orders]);

  if (loading || !user) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-6 h-64 w-full rounded-xl" />
      </section>
    );
  }

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingSupport(true);
    try {
      await api.sendContact({
        name: user.name,
        email: user.email,
        subject: support.subject || "Customer support request",
        body: support.body,
      });
      setSupport({ subject: "", body: "" });
      toast.success("Message sent — our team replies within one business day.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send message");
    } finally {
      setSendingSupport(false);
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.name} />}
            <AvatarFallback className="bg-secondary text-lg font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-heading text-3xl font-medium sm:text-4xl">
              Hello, {user.name.split(" ")[0]}
            </h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await logout();
            navigate("/");
          }}
        >
          <LogOut className="size-4" /> Sign out
        </Button>
      </div>

      {/* Status cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {orders === null ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard icon={Package} label="Total orders" value={stats.total} />
            <StatCard
              icon={Truck}
              label="Awaiting delivery"
              value={stats.awaiting}
              accent={stats.awaiting > 0}
            />
            <StatCard icon={CheckCircle2} label="Delivered" value={stats.delivered} />
            <StatCard icon={Wallet} label="Total spent" value={formatMoneyCompact(stats.spent)} />
          </>
        )}
      </div>

      <Tabs defaultValue="orders" className="mt-8">
        <TabsList className="flex-wrap">
          <TabsTrigger value="orders">
            <Package className="size-4" /> Orders
          </TabsTrigger>
          <TabsTrigger value="notifications" className="relative">
            <Bell className="size-4" /> Notifications
            {unreadCount > 0 && (
              <Badge className="ml-1 h-4 min-w-4 rounded-full px-1 text-[9px]">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="support">
            <Headset className="size-4" /> Support
          </TabsTrigger>
          <TabsTrigger value="profile">
            <UserRound className="size-4" /> Profile
          </TabsTrigger>
        </TabsList>

        {/* ---------------- Orders ---------------- */}
        <TabsContent value="orders" className="mt-4 space-y-4">
          {orders === null ? (
            <Skeleton className="h-32 w-full rounded-xl" />
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">No orders yet.</p>
                <Button asChild className="mt-4">
                  <Link to="/shop">Browse the Boutique</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            orderPager.pageItems!.map((o) => (
              <Card key={o.id} className="py-4">
                <CardContent className="px-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-medium">{o.reference}</span>
                      <span className="ml-3 text-sm text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString([], {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <Badge variant={o.status === "delivered" ? "default" : "secondary"}>
                      {o.status === "paid" ? "Paid · awaiting delivery" : STATUS_LABELS[o.status] ?? o.status}
                    </Badge>
                  </div>
                  <p className="mt-2 truncate text-sm text-muted-foreground">
                    {o.items.map((it) => `${it.quantity}× ${it.name}`).join(", ")}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-heading text-xl font-semibold">
                      {formatPrice(o.total_cents)}
                    </span>
                    <div className="flex gap-2">
                      {o.status === "paid" && (
                        <Button
                          size="sm"
                          disabled={confirming === o.reference}
                          onClick={() => handleConfirmReceived(o.reference)}
                        >
                          <CheckCircle2 className="size-3.5" />
                          {confirming === o.reference ? "Confirming…" : "I received it"}
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => setViewing(o)}>
                        Details →
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          <Paginator
            page={orderPager.page}
            pageCount={orderPager.pageCount}
            onChange={orderPager.setPage}
            total={orderPager.total}
            label="orders"
          />
        </TabsContent>

        {/* ---------------- Notifications ---------------- */}
        <TabsContent value="notifications" className="mt-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllRead}>
                Mark all as read
              </Button>
            )}
          </div>
          <Card className="py-2">
            <CardContent className="divide-y px-4">
              {notifications === null ? (
                <Skeleton className="my-4 h-16 w-full" />
              ) : notifications.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  Nothing yet — updates about your orders will land here.
                </p>
              ) : (
                notifPager.pageItems!.map((n) => (
                  <div
                    key={n.id}
                    className={cn("py-4", !n.read && "bg-secondary/30 -mx-4 px-4")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="flex items-center gap-2 font-medium">
                        {!n.read && (
                          <span className="size-2 shrink-0 rounded-full bg-primary" />
                        )}
                        {n.title}
                      </p>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {new Date(n.created_at).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                    {!n.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 h-7 px-2 text-xs text-primary"
                        onClick={() => markOneRead(n.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Paginator
            page={notifPager.page}
            pageCount={notifPager.pageCount}
            onChange={notifPager.setPage}
            total={notifPager.total}
            label="notifications"
          />
        </TabsContent>

        {/* ---------------- Support ---------------- */}
        <TabsContent value="support" className="mt-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-base">Customer Support</CardTitle>
                <CardDescription>We reply within one business day.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="flex items-center gap-2">
                  <Mail className="size-4 text-primary" /> hello@peonify.com
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="size-4 text-primary" /> +1 (555) 010-2030
                </p>
                <p className="text-xs text-muted-foreground">
                  Mon–Sat, 8am – 6pm. For order issues, include your order
                  reference (e.g. PNY-A1B2C3).
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Send us a message</CardTitle>
                <CardDescription>
                  Sent as {user.name} ({user.email}) — straight to our team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSupport} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="s-subject">Subject</Label>
                    <Input
                      id="s-subject"
                      value={support.subject}
                      onChange={(e) =>
                        setSupport((p) => ({ ...p, subject: e.target.value }))
                      }
                      placeholder="Question about order PNY-…"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="s-body">Message</Label>
                    <Textarea
                      id="s-body"
                      rows={5}
                      value={support.body}
                      onChange={(e) =>
                        setSupport((p) => ({ ...p, body: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <Button type="submit" disabled={sendingSupport}>
                    {sendingSupport ? "Sending…" : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---------------- Profile ---------------- */}
        <TabsContent value="profile" className="mt-4">
          <ProfileSettings />
        </TabsContent>
      </Tabs>

      {/* Order details dialog */}
      <Dialog open={Boolean(viewing)} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">
              {viewing?.reference}
            </DialogTitle>
            <DialogDescription>
              Delivery{" "}
              {viewing &&
                new Date(viewing.delivery_date).toLocaleDateString([], {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}{" "}
              · {viewing?.delivery_window}
            </DialogDescription>
          </DialogHeader>
          {viewing && (
            <>
              <div className="space-y-1 text-sm">
                {viewing.items.map((it, i) => (
                  <div key={i} className="flex justify-between gap-3">
                    <span className="text-muted-foreground">
                      {it.quantity} × {it.name}
                    </span>
                    <span className="tabular-nums">
                      {formatPrice(it.unit_price_cents * it.quantity)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-2 font-medium">
                  <span>Total</span>
                  <span>{formatPrice(viewing.total_cents)}</span>
                </div>
              </div>
              <StatusTimeline
                pipeline={SHIPMENT_PIPELINE}
                events={viewing.events}
                currentStatus={viewing.status}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
