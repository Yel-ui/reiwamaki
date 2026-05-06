import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Pencil, Plus, Trash2, ShoppingBag, Users, BarChart3, UtensilsCrossed, Home, Bell } from "lucide-react";
import { toast } from "sonner";
import AdminPasscodeGate from "@/components/AdminPasscodeGate";

const peso = (n: number) => `₱${Number(n).toFixed(2)}`;
const STATUSES = ["confirmed", "preparing", "on-the-way", "delivered", "cancelled"] as const;
const ACTIVE_STATUSES = ["confirmed", "preparing", "on-the-way"];

type Order = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  delivery_address: string | null;
  phone: string | null;
  notes: string | null;
  user_id: string;
  created_at: string;
};

type OrderItem = {
  id: string;
  order_id: string;
  item_name: string;
  item_price: number;
  quantity: number;
};

type Profile = { user_id: string; name: string | null; phone: string | null; address: string | null; created_at: string };
type MenuItem = {
  id: string; name: string; description: string; price: number; category: string;
  image: string; available: boolean; slug: string | null;
};

const NotificationDot = ({ count }: { count: number }) => {
  if (!count) return null;
  return (
    <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold rounded-full bg-red-500 text-white shadow-md animate-pulse">
      {count > 99 ? "99+" : count}
    </span>
  );
};

const AdminPage = () => {
  const { user, profile, loading: authLoading, logout } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const [tab, setTab] = useState("welcome");

  useEffect(() => {
    if (!authLoading && !user) navigate("/");
  }, [authLoading, user, navigate]);

  const loadPending = async () => {
    const { count } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .in("status", ACTIVE_STATUSES);
    setPendingCount(count || 0);
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadPending();
    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        loadPending();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  if (authLoading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-8 max-w-md text-center space-y-4 shadow-2xl">
          <h1 className="text-2xl font-heading">Access denied</h1>
          <p className="text-muted-foreground">This area is for administrators only.</p>
          <Button onClick={() => navigate("/")}>Back to home</Button>
        </Card>
      </div>
    );
  }

  return (
    <AdminPasscodeGate>
      <div className="admin-theme min-h-screen relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_hsl(340_30%_15%/0.5),_transparent_60%),radial-gradient(ellipse_at_bottom_right,_hsl(220_30%_15%/0.5),_transparent_60%)]">
        <div className="relative z-10">
          <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-md border-b border-border shadow-lg">
            <div className="container flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate("/")}><ArrowLeft className="h-4 w-4" /></Button>
                <span className="text-2xl">🌸</span>
                <h1 className="text-xl font-heading">Admin Dashboard</h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  {pendingCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-red-500 text-white shadow-md">
                      {pendingCount > 99 ? "99+" : pendingCount}
                    </span>
                  )}
                </div>
                <Button variant="ghost" onClick={logout}>Sign out</Button>
              </div>
            </div>
          </header>

          <main className="container py-6">
            <Tabs value={tab} onValueChange={setTab} orientation="vertical" className="flex flex-col md:flex-row gap-6">
              <TabsList className="flex md:flex-col h-auto md:w-56 md:sticky md:top-20 p-2 bg-card/60 backdrop-blur-md border border-border/60 rounded-xl shadow-xl gap-1">
                <TabsTrigger value="welcome" className="w-full justify-start data-[state=active]:shadow-md">
                  <Home className="h-4 w-4 mr-2" />Welcome
                </TabsTrigger>
                <TabsTrigger value="orders" className="w-full justify-start data-[state=active]:shadow-md">
                  <ShoppingBag className="h-4 w-4 mr-2" />Orders
                  <NotificationDot count={pendingCount} />
                </TabsTrigger>
                <TabsTrigger value="analytics" className="w-full justify-start data-[state=active]:shadow-md">
                  <BarChart3 className="h-4 w-4 mr-2" />Analytics
                </TabsTrigger>
                <TabsTrigger value="menu" className="w-full justify-start data-[state=active]:shadow-md">
                  <UtensilsCrossed className="h-4 w-4 mr-2" />Menu
                </TabsTrigger>
                <TabsTrigger value="customers" className="w-full justify-start data-[state=active]:shadow-md">
                  <Users className="h-4 w-4 mr-2" />Customers
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 min-w-0">
                <TabsContent value="welcome" className="mt-0">
                  <WelcomeTab name={profile?.name || "Admin"} pendingCount={pendingCount} onGoToOrders={() => setTab("orders")} />
                </TabsContent>
                <TabsContent value="orders" className="mt-0"><OrdersTab /></TabsContent>
                <TabsContent value="analytics" className="mt-0"><AnalyticsTab /></TabsContent>
                <TabsContent value="menu" className="mt-0"><MenuTab /></TabsContent>
                <TabsContent value="customers" className="mt-0"><CustomersTab /></TabsContent>
              </div>
            </Tabs>
          </main>
        </div>
      </div>
    </AdminPasscodeGate>
  );
};

/* ---------------- Welcome ---------------- */
const WelcomeTab = ({ name, pendingCount, onGoToOrders }: { name: string; pendingCount: number; onGoToOrders: () => void }) => {
  return (
    <div className="relative">
      <Card className="relative overflow-hidden p-8 md:p-12 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)] rounded-2xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
        <div className="relative space-y-4">
          <div className="text-5xl">🌸</div>
          <h2 className="text-3xl md:text-4xl font-heading">Welcome back, {name}</h2>
          <p className="text-muted-foreground max-w-xl">
            Here's a quick look at the kitchen. Use the menu on the left to manage orders, analytics, menu items and customers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <Card className="relative p-5 bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="h-6 w-6 text-primary" />
                  {pendingCount > 0 && (
                    <span className="absolute -top-2 -right-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-[11px] font-bold rounded-full bg-red-500 text-white shadow-md animate-pulse">
                      {pendingCount > 99 ? "99+" : pendingCount}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active orders</p>
                  <p className="text-2xl font-heading">{pendingCount}</p>
                </div>
              </div>
              {pendingCount > 0 && (
                <Button size="sm" className="mt-4" onClick={onGoToOrders}>View orders</Button>
              )}
            </Card>

            <Card className="p-5 bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg">
              <p className="text-sm text-muted-foreground">Notifications</p>
              <p className="mt-2 text-sm">
                {pendingCount > 0
                  ? `🔔 You have ${pendingCount} order${pendingCount > 1 ? "s" : ""} waiting to be processed.`
                  : "✨ All caught up. No active orders right now."}
              </p>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
};

/* ---------------- Orders ---------------- */
const OrdersTab = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: o } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders((o as Order[]) || []);
    if (o && o.length) {
      const ids = o.map((x: any) => x.id);
      const { data: it } = await supabase.from("order_items").select("*").in("order_id", ids);
      const grouped: Record<string, OrderItem[]> = {};
      (it as OrderItem[] || []).forEach((i) => { (grouped[i.order_id] ||= []).push(i); });
      setItems(grouped);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) { toast.error("Failed to update"); return; }
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    toast.success(`Order updated to ${status}`);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!orders.length) return <p className="text-muted-foreground text-center py-12">No orders yet.</p>;

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <Card key={o.id} className="p-4 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg">{o.order_number}</span>
                <Badge variant="outline">{o.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(o.created_at).toLocaleString()} · {o.phone || "—"} · {o.delivery_address || "—"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium">{peso(o.total)}</span>
              <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {items[o.id]?.length ? (
            <div className="mt-3 pt-3 border-t text-sm space-y-1">
              {items[o.id].map((i) => (
                <div key={i.id} className="flex justify-between">
                  <span>{i.quantity}× {i.item_name}</span>
                  <span className="text-muted-foreground">{peso(i.item_price * i.quantity)}</span>
                </div>
              ))}
            </div>
          ) : null}
        </Card>
      ))}
    </div>
  );
};

/* ---------------- Analytics ---------------- */
const AnalyticsTab = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: o }, { data: i }] = await Promise.all([
        supabase.from("orders").select("*"),
        supabase.from("order_items").select("*"),
      ]);
      setOrders((o as Order[]) || []);
      setItems((i as OrderItem[]) || []);
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const revenue = orders.reduce((s, o) => s + Number(o.total), 0);
    const completed = orders.filter((o) => o.status === "delivered").length;
    const popular: Record<string, number> = {};
    items.forEach((i) => { popular[i.item_name] = (popular[i.item_name] || 0) + i.quantity; });
    const top = Object.entries(popular).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { revenue, count: orders.length, completed, top };
  }, [orders, items]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 shadow-lg"><p className="text-sm text-muted-foreground">Total revenue</p><p className="text-3xl font-heading mt-2">{peso(stats.revenue)}</p></Card>
        <Card className="p-5 shadow-lg"><p className="text-sm text-muted-foreground">Total orders</p><p className="text-3xl font-heading mt-2">{stats.count}</p></Card>
        <Card className="p-5 shadow-lg"><p className="text-sm text-muted-foreground">Delivered</p><p className="text-3xl font-heading mt-2">{stats.completed}</p></Card>
      </div>
      <Card className="p-5 shadow-lg">
        <h3 className="font-heading text-lg mb-3">Top items</h3>
        {stats.top.length === 0 ? (
          <p className="text-muted-foreground text-sm">No data yet.</p>
        ) : (
          <div className="space-y-2">
            {stats.top.map(([name, qty]) => (
              <div key={name} className="flex justify-between text-sm">
                <span>{name}</span><span className="text-muted-foreground">{qty} sold</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

/* ---------------- Menu ---------------- */
const emptyForm: Partial<MenuItem> = { name: "", description: "", price: 0, category: "Sushi Bake", image: "🍣", available: true };

const MenuTab = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<MenuItem> | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("menu_items").select("*").order("category").order("name");
    setItems((data as MenuItem[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.name || !editing?.category) { toast.error("Name and category are required"); return; }
    const payload = {
      name: editing.name,
      description: editing.description || "",
      price: Number(editing.price) || 0,
      category: editing.category,
      image: editing.image || "🍣",
      available: editing.available ?? true,
    };
    const { error } = editing.id
      ? await supabase.from("menu_items").update(payload).eq("id", editing.id)
      : await supabase.from("menu_items").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    setOpen(false); setEditing(null); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    load();
  };

  const toggle = async (item: MenuItem) => {
    await supabase.from("menu_items").update({ available: !item.available }).eq("id", item.id);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing({ ...emptyForm })}><Plus className="h-4 w-4 mr-2" />Add item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing?.id ? "Edit item" : "New item"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={editing?.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={editing?.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Price (₱)</Label><Input type="number" value={editing?.price ?? 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} /></div>
                <div><Label>Category</Label><Input value={editing?.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></div>
              </div>
              <div><Label>Image (emoji or URL)</Label><Input value={editing?.image || ""} onChange={(e) => setEditing({ ...editing, image: e.target.value })} /></div>
              <div className="flex items-center gap-2"><Switch checked={editing?.available ?? true} onCheckedChange={(v) => setEditing({ ...editing, available: v })} /><Label>Available</Label></div>
            </div>
            <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <Card className="shadow-lg">
          <Table>
            <TableHeader><TableRow>
              <TableHead></TableHead><TableHead>Name</TableHead><TableHead>Category</TableHead>
              <TableHead>Price</TableHead><TableHead>Available</TableHead><TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {items.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="text-2xl">{m.image}</TableCell>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>{m.category}</TableCell>
                  <TableCell>{peso(m.price)}</TableCell>
                  <TableCell><Switch checked={m.available} onCheckedChange={() => toggle(m)} /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(m); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(m.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

/* ---------------- Customers ---------------- */
const CustomersTab = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("profiles").select("user_id, name, phone, address, created_at").order("created_at", { ascending: false })
      .then(({ data }) => { setProfiles((data as Profile[]) || []); setLoading(false); });
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Note: passwords are one-way encrypted and cannot be displayed. Showing all other account details below.
      </p>
      <Card className="shadow-lg">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Address</TableHead><TableHead>Password</TableHead><TableHead>Joined</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {profiles.map((p) => (
              <TableRow key={p.user_id}>
                <TableCell className="font-medium">{p.name || "—"}</TableCell>
                <TableCell>{p.phone || "—"}</TableCell>
                <TableCell className="max-w-xs truncate">{p.address || "—"}</TableCell>
                <TableCell className="text-muted-foreground italic">••••••• (encrypted)</TableCell>
                <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminPage;
