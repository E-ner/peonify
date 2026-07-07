import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  Bell,
  Flower2,
  Inbox,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  MessageSquareHeart,
  Package,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Star,
  Store,
  Trash2,
  Truck,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  STATUS_LABELS,
  adminApi,
  api,
  formatMoneyCompact,
  formatPrice,
  meApi,
  type AdminActivity,
  type AdminMetrics,
  type AdminOrder,
  type AdminReview,
  type AdminStats,
  type Category,
  type Collection,
  type ContactMessage,
  type Notification,
} from "@/lib/api";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import ProductImage from "@/components/ProductImage";
import ProfileSettings from "@/components/ProfileSettings";
import Paginator, { usePagination } from "@/components/Paginator";
import ProductForm from "./ProductForm";

type Section =
  | "dashboard"
  | "orders"
  | "products"
  | "catalog"
  | "feedback"
  | "support"
  | "notifications"
  | "activity"
  | "profile";

const NAV: Array<{ key: Section; label: string; icon: typeof Package }> = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "orders", label: "Orders", icon: ShoppingBag },
  { key: "products", label: "Products", icon: Flower2 },
  { key: "catalog", label: "Catalog", icon: Layers },
  { key: "feedback", label: "Feedback", icon: MessageSquareHeart },
  { key: "support", label: "Support", icon: Inbox },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "activity", label: "Activity", icon: Activity },
  { key: "profile", label: "Profile", icon: UserRound },
];

const revenueChartConfig = {
  revenue: { label: "Revenue", color: "var(--color-primary)" },
} satisfies ChartConfig;

const statusChartConfig = {
  count: { label: "Orders", color: "var(--color-primary)" },
} satisfies ChartConfig;

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: string | number;
}) {
  return (
    <Card className="py-4">
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

function SidebarNav({
  section,
  onSelect,
  onLogout,
  unread = 0,
}: {
  section: Section;
  onSelect: (s: Section) => void;
  onLogout: () => void;
  unread?: number;
}) {
  return (
    <nav className="flex h-full flex-col gap-1 p-3">
      {NAV.map((item) => (
        <button
          key={item.key}
          onClick={() => onSelect(item.key)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
            section === item.key
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <item.icon className="size-4" />
          {item.label}
          {item.key === "notifications" && unread > 0 && (
            <Badge className="ml-auto h-5 min-w-5 rounded-full px-1 text-[10px]">
              {unread}
            </Badge>
          )}
        </button>
      ))}
      <button
        onClick={onLogout}
        className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="size-4" />
        Sign out
      </button>
    </nav>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [reviews, setReviews] = useState<AdminReview[] | null>(null);
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const [activity, setActivity] = useState<AdminActivity[] | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [delivering, setDelivering] = useState<string | null>(null);
  const [confirmDeliver, setConfirmDeliver] = useState<AdminOrder | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [newCollection, setNewCollection] = useState("");

  // Search & filters
  const [orderQuery, setOrderQuery] = useState("");
  const [orderStatus, setOrderStatus] = useState("all");
  const [productQuery, setProductQuery] = useState("");

  const onError = useCallback((err: unknown) => {
    toast.error(err instanceof Error ? err.message : "Something went wrong");
  }, []);

  const refresh = useCallback(() => {
    adminApi.getStats().then(setStats).catch(onError);
    adminApi.getMetrics().then(setMetrics).catch(onError);
    api.getProducts().then(setProducts).catch(onError);
    adminApi.getOrders().then(setOrders).catch(onError);
    adminApi.getReviews().then(setReviews).catch(onError);
    adminApi.getMessages().then(setMessages).catch(onError);
    adminApi.getActivity().then(setActivity).catch(onError);
    api.getCategories().then(setCategories).catch(onError);
    api.getCollections().then(setCollections).catch(onError);
    meApi.getNotifications().then(setNotifications).catch(() => undefined);
  }, [onError]);

  useEffect(() => {
    refresh();
    const timer = setInterval(() => {
      meApi.getNotifications().then(setNotifications).catch(() => undefined);
    }, 30_000);
    return () => clearInterval(timer);
  }, [refresh]);

  const unread = notifications.filter((n) => !n.read).length;

  const markAllNotificationsRead = async () => {
    try {
      await meApi.markNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      /* non-fatal */
    }
  };

  const markOneNotificationRead = async (id: number) => {
    try {
      await meApi.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      /* non-fatal */
    }
  };

  const handleDeliver = async (order: AdminOrder) => {
    setDelivering(order.reference);
    setConfirmDeliver(null);
    try {
      await adminApi.deliverOrder(order.reference);
      toast.success(`${order.reference} marked as delivered`);
      refresh();
    } catch (err) {
      onError(err);
    } finally {
      setDelivering(null);
    }
  };

  // Filtered lists
  const filteredOrders = useMemo(() => {
    if (!orders) return null;
    const q = orderQuery.trim().toLowerCase();
    return orders.filter((o) => {
      if (orderStatus !== "all" && o.status !== orderStatus) return false;
      if (!q) return true;
      return (
        o.reference.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q)
      );
    });
  }, [orders, orderQuery, orderStatus]);

  const filteredProducts = useMemo(() => {
    if (!products) return null;
    const q = productQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.collection.toLowerCase().includes(q)
    );
  }, [products, productQuery]);

  const orderPager = usePagination(filteredOrders, 8);
  const productPager = usePagination(filteredProducts, 8);
  const reviewPager = usePagination(reviews, 8);
  const messagePager = usePagination(messages, 8);
  const activityPager = usePagination(activity, 10);
  const notificationPager = usePagination(notifications, 10);

  const revenueData =
    metrics?.revenue_by_day.map((d) => ({
      day: new Date(d.day).toLocaleDateString([], { month: "short", day: "numeric" }),
      revenue: d.revenue_cents / 100,
    })) ?? [];

  const statusData =
    metrics?.orders_by_status.map((s) => ({
      status: STATUS_LABELS[s.status] ?? s.status,
      count: s.count,
    })) ?? [];

  const initials = user?.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sections: Record<Section, ReactNode> = {
    /* ---------------- Dashboard ---------------- */
    dashboard: (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {stats ? (
            <>
              <StatCard icon={Wallet} label="Revenue" value={formatMoneyCompact(stats.revenue_cents)} />
              <StatCard icon={Package} label="Orders to deliver" value={stats.active_orders} />
              <StatCard icon={Flower2} label="Products" value={stats.products} />
              <StatCard icon={Users} label="Customers" value={stats.customers} />
            </>
          ) : (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Revenue — last 30 days</CardTitle>
            <CardDescription>Daily order revenue in USD.</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics ? (
              <ChartContainer config={revenueChartConfig} className="h-64 w-full">
                <AreaChart data={revenueData} margin={{ left: 0, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={60}
                    tickFormatter={(v: number) => formatMoneyCompact(v * 100)}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    dataKey="revenue"
                    type="monotone"
                    fill="var(--color-revenue)"
                    fillOpacity={0.15}
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <Skeleton className="h-64 w-full" />
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Paid vs delivered</CardTitle>
              <CardDescription>Orders waiting for delivery vs completed.</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics ? (
                <ChartContainer config={statusChartConfig} className="h-56 w-full">
                  <BarChart data={statusData} margin={{ left: 0, right: 12 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="status" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} width={30} allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={6} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <Skeleton className="h-56 w-full" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top sellers</CardTitle>
              <CardDescription>Best performing arrangements.</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics ? (
                metrics.top_products.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No sales yet.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {metrics.top_products.map((p, i) => (
                      <li key={p.name} className="flex items-center gap-3">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                          {i + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                        <span className="text-xs text-muted-foreground">{p.sold} sold</span>
                        <span className="text-sm font-medium tabular-nums">
                          {formatMoneyCompact(p.revenue_cents)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )
              ) : (
                <Skeleton className="h-56 w-full" />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    ),

    /* ---------------- Orders ---------------- */
    orders: (
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-52 flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              placeholder="Search by reference, customer, or email…"
              className="pl-9"
            />
          </div>
          <Select value={orderStatus} onValueChange={setOrderStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="paid">Paid — to deliver</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="pending_payment">Awaiting payment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Card className="py-2">
          <CardContent className="overflow-x-auto px-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Items</TableHead>
                  <TableHead className="hidden sm:table-cell">Delivery</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderPager.pageItems === null ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ) : orderPager.pageItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No matching orders.
                    </TableCell>
                  </TableRow>
                ) : (
                  orderPager.pageItems.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.reference}</TableCell>
                      <TableCell>
                        <span className="block">{o.customer_name}</span>
                        <span className="block text-xs text-muted-foreground">{o.email}</span>
                      </TableCell>
                      <TableCell className="hidden max-w-52 md:table-cell">
                        <span className="block truncate text-sm text-muted-foreground">
                          {o.items.map((it) => `${it.quantity}× ${it.name}`).join(", ")}
                        </span>
                      </TableCell>
                      <TableCell className="hidden text-sm sm:table-cell">
                        {new Date(o.delivery_date).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                        <span className="block text-xs text-muted-foreground">
                          {o.delivery_window}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {o.address}
                        </span>
                      </TableCell>
                      <TableCell className="tabular-nums">{formatPrice(o.total_cents)}</TableCell>
                      <TableCell>
                        {o.status === "delivered" ? (
                          <Badge>Delivered</Badge>
                        ) : o.status === "pending_payment" ? (
                          <Badge variant="outline" className="text-muted-foreground">
                            Awaiting payment
                          </Badge>
                        ) : (
                          <Select
                            value="paid"
                            disabled={delivering === o.reference}
                            onValueChange={(v) => {
                              if (v === "delivered") setConfirmDeliver(o);
                            }}
                          >
                            <SelectTrigger
                              size="sm"
                              className="h-8 w-40 border-primary/40 bg-secondary/50 font-medium"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="paid">
                                <span className="flex items-center gap-2">
                                  <span className="size-2 rounded-full bg-amber-500" />
                                  Paid · awaiting
                                </span>
                              </SelectItem>
                              <SelectItem value="delivered">
                                <span className="flex items-center gap-2">
                                  <Truck className="size-3.5 text-primary" />
                                  Mark as delivered
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Paginator
          page={orderPager.page}
          pageCount={orderPager.pageCount}
          onChange={orderPager.setPage}
          total={orderPager.total}
          label="orders"
        />
      </div>
    ),

    /* ---------------- Products ---------------- */
    products: (
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-52 flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              placeholder="Search products…"
              className="pl-9"
            />
          </div>
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" /> New Product
          </Button>
        </div>
        <Card className="py-2">
          <CardContent className="overflow-x-auto px-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead className="hidden sm:table-cell">Collection</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="hidden md:table-cell">Stock</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {productPager.pageItems === null ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ) : productPager.pageItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No matching products.
                    </TableCell>
                  </TableRow>
                ) : (
                  productPager.pageItems.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="size-12 overflow-hidden rounded-md">
                          <ProductImage
                            src={p.image_url}
                            hue={p.hue}
                            name={p.name}
                            className="size-12"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="hidden capitalize sm:table-cell">
                        {p.category}
                      </TableCell>
                      <TableCell className="hidden capitalize sm:table-cell">
                        {p.collection}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatPrice(p.price_cents)}
                        {p.discount_percent > 0 && (
                          <Badge className="ml-2 bg-destructive text-white">
                            -{p.discount_percent}%
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={p.in_stock ? "secondary" : "destructive"}>
                          {p.in_stock ? "In stock" : "Out of stock"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => {
                              setEditing(p);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive"
                            onClick={() => setDeleting(p)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Paginator
          page={productPager.page}
          pageCount={productPager.pageCount}
          onChange={productPager.setPage}
          total={productPager.total}
          label="products"
        />
      </div>
    ),

    /* ---------------- Catalog ---------------- */
    catalog: (
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Shop filters — bouquets, stems, arrangements…</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              className="flex gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newCategory.trim()) return;
                try {
                  await adminApi.createCategory(newCategory.trim());
                  setNewCategory("");
                  refresh();
                } catch (err) {
                  onError(err);
                }
              }}
            >
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category name"
              />
              <Button type="submit">
                <Plus className="size-4" /> Add
              </Button>
            </form>
            <ul className="divide-y">
              {categories.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2">
                  <span>
                    {c.name}{" "}
                    <span className="text-xs text-muted-foreground">/{c.slug}</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive"
                    onClick={async () => {
                      try {
                        await adminApi.deleteCategory(c.id);
                        refresh();
                      } catch (err) {
                        onError(err);
                      }
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Collections</CardTitle>
            <CardDescription>Seasonal edits shown on the home page and shop.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              className="flex gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newCollection.trim()) return;
                try {
                  await adminApi.createCollection(newCollection.trim(), "");
                  setNewCollection("");
                  refresh();
                } catch (err) {
                  onError(err);
                }
              }}
            >
              <Input
                value={newCollection}
                onChange={(e) => setNewCollection(e.target.value)}
                placeholder="New collection name"
              />
              <Button type="submit">
                <Plus className="size-4" /> Add
              </Button>
            </form>
            <ul className="divide-y">
              {collections.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2">
                  <span>
                    {c.name}{" "}
                    <span className="text-xs text-muted-foreground">/{c.slug}</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive"
                    onClick={async () => {
                      try {
                        await adminApi.deleteCollection(c.id);
                        refresh();
                      } catch (err) {
                        onError(err);
                      }
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    ),

    /* ---------------- Feedback ---------------- */
    feedback: (
      <div>
        <Card className="py-2">
          <CardContent className="divide-y px-4">
            {reviewPager.pageItems === null ? (
              <Skeleton className="my-4 h-16 w-full" />
            ) : reviewPager.pageItems.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                No customer feedback yet.
              </p>
            ) : (
              reviewPager.pageItems.map((r) => (
                <div key={r.id} className="flex items-start gap-3 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{r.author}</span>
                      <span className="flex items-center gap-0.5 text-primary">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="size-3.5 fill-current" />
                        ))}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        on{" "}
                        <Link to={`/shop/${r.slug}`} className="underline">
                          {r.product_name}
                        </Link>{" "}
                        ·{" "}
                        {new Date(r.created_at).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {r.comment && (
                      <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 text-destructive"
                    onClick={async () => {
                      try {
                        await adminApi.deleteReview(r.id);
                        refresh();
                      } catch (err) {
                        onError(err);
                      }
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Paginator
          page={reviewPager.page}
          pageCount={reviewPager.pageCount}
          onChange={reviewPager.setPage}
          total={reviewPager.total}
          label="reviews"
        />
      </div>
    ),

    /* ---------------- Support (customer messages) ---------------- */
    support: (
      <div>
        <Card className="py-2">
          <CardContent className="divide-y px-4">
            {messagePager.pageItems === null ? (
              <Skeleton className="my-4 h-16 w-full" />
            ) : messagePager.pageItems.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                No messages — contact form submissions land here.
              </p>
            ) : (
              messagePager.pageItems.map((m) => (
                <div key={m.id} className="flex items-start gap-3 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{m.name}</span>
                      <a href={`mailto:${m.email}`} className="text-xs text-primary underline">
                        {m.email}
                      </a>
                      <span className="text-xs text-muted-foreground">
                        {new Date(m.created_at).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {m.subject && <p className="mt-1 text-sm font-medium">{m.subject}</p>}
                    <p className="mt-1 text-sm text-muted-foreground">{m.body}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 text-destructive"
                    onClick={async () => {
                      try {
                        await adminApi.deleteMessage(m.id);
                        refresh();
                      } catch (err) {
                        onError(err);
                      }
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Paginator
          page={messagePager.page}
          pageCount={messagePager.pageCount}
          onChange={messagePager.setPage}
          total={messagePager.total}
          label="messages"
        />
      </div>
    ),

    /* ---------------- Notifications ---------------- */
    notifications: (
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {unread > 0 ? `${unread} unread` : "All caught up"}
          </p>
          {unread > 0 && (
            <Button variant="outline" size="sm" onClick={markAllNotificationsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <Card className="py-2">
          <CardContent className="divide-y px-4">
            {notificationPager.pageItems === null ||
            notificationPager.pageItems.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                Nothing yet — new orders, support messages and feedback will
                land here.
              </p>
            ) : (
              notificationPager.pageItems.map((n) => (
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
                      onClick={() => markOneNotificationRead(n.id)}
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
          page={notificationPager.page}
          pageCount={notificationPager.pageCount}
          onChange={notificationPager.setPage}
          total={notificationPager.total}
          label="notifications"
        />
      </div>
    ),

    /* ---------------- Activity ---------------- */
    activity: (
      <div>
        <Card className="py-2">
          <CardContent className="overflow-x-auto px-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">When</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityPager.pageItems === null ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ) : activityPager.pageItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No activity yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  activityPager.pageItems.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                        {new Date(a.created_at).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="font-medium">{a.reference}</TableCell>
                      <TableCell>{a.customer_name}</TableCell>
                      <TableCell>
                        <Badge variant={a.status === "delivered" ? "default" : "secondary"}>
                          {STATUS_LABELS[a.status] ?? a.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden max-w-72 truncate text-sm text-muted-foreground md:table-cell">
                        {a.note}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Paginator
          page={activityPager.page}
          pageCount={activityPager.pageCount}
          onChange={activityPager.setPage}
          total={activityPager.total}
          label="events"
        />
      </div>
    ),

    /* ---------------- Profile ---------------- */
    profile: (
      <div className="max-w-3xl">
        <ProfileSettings />
      </div>
    ),
  };

  const current = NAV.find((n) => n.key === section)!;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Admin top bar — the admin workspace has no storefront nav */}
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-2">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="size-5" />
                  <span className="sr-only">Admin menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 pt-10">
                <SidebarNav
                  section={section}
                  unread={unread}
                  onSelect={(s) => {
                    setSection(s);
                    setMobileNavOpen(false);
                  }}
                  onLogout={async () => {
                    await logout();
                    navigate("/");
                  }}
                />
              </SheetContent>
            </Sheet>
            <span className="font-heading text-xl font-semibold">Peonify</span>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Atelier Admin
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">
                <Store className="size-4" />
                <span className="hidden sm:inline">Storefront</span>
              </Link>
            </Button>

            {/* Notifications — the bell opens the Notifications section */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setSection("notifications")}
            >
              <Bell className="size-4" />
              {unread > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full px-1 text-[9px]">
                  {unread}
                </Badge>
              )}
              <span className="sr-only">Notifications</span>
            </Button>

            {/* Account / logout */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="size-8">
                    {user?.avatar_url && <AvatarImage src={user.avatar_url} alt={user.name} />}
                    <AvatarFallback className="bg-secondary text-xs font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  <span className="block">{user?.name}</span>
                  <span className="block text-xs font-normal text-muted-foreground">
                    {user?.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await logout();
                    navigate("/");
                  }}
                >
                  <LogOut className="size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1">
        {/* Desktop sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 border-r lg:block">
          <SidebarNav
            section={section}
            unread={unread}
            onSelect={setSection}
            onLogout={async () => {
              await logout();
              navigate("/");
            }}
          />
        </aside>

        <main className="min-w-0 flex-1 px-4 py-8 lg:px-8">
          <div className="mb-6">
            <h1 className="font-heading text-3xl font-medium">{current.label}</h1>
            <p className="text-sm text-muted-foreground">
              {section === "dashboard"
                ? "Your boutique at a glance."
                : section === "orders"
                  ? "Every order here is already paid — press Deliver when the flowers arrive."
                  : section === "support"
                    ? "Messages from customers — reply by clicking their email address."
                    : section === "notifications"
                      ? "New orders, support messages and product feedback."
                      : section === "activity"
                        ? "A clean audit trail of every order movement."
                        : ""}
            </p>
          </div>

          {sections[section]}
        </main>
      </div>

      <ProductForm
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editing}
        categories={categories}
        collections={collections}
        onSaved={refresh}
      />

      {/* Confirm delivery */}
      <Dialog
        open={Boolean(confirmDeliver)}
        onOpenChange={(o) => !o && setConfirmDeliver(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="size-5 text-primary" /> Deliver {confirmDeliver?.reference}?
            </DialogTitle>
            <DialogDescription>
              {confirmDeliver && (
                <>
                  {confirmDeliver.customer_name} · {confirmDeliver.address}
                  <br />
                  {new Date(confirmDeliver.delivery_date).toLocaleDateString([], {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  · {confirmDeliver.delivery_window}
                  <br />
                  The customer will be notified that their flowers arrived.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeliver(null)}>
              Not yet
            </Button>
            <Button onClick={() => confirmDeliver && handleDeliver(confirmDeliver)}>
              <Truck className="size-4" /> Yes, delivered
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {deleting?.name}?</DialogTitle>
            <DialogDescription>
              The product disappears from the boutique. Past orders keep their history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!deleting) return;
                try {
                  await adminApi.deleteProduct(deleting.id);
                  toast.success(`${deleting.name} removed`);
                  setDeleting(null);
                  refresh();
                } catch (err) {
                  onError(err);
                }
              }}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
