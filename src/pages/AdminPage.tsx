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
import { ArrowLeft, Loader2, Pencil, Plus, Trash2, ShoppingBag, Users, BarChart3, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

const peso = (n: number) => `₱${Number(n).toFixed(2)}`;
const STATUSES = ["confirmed", "preparing", "on-the-way", "delivered", "cancelled"] as const;

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

const AdminPage = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate("/");
  }, [authLoading, user, navigate]);

  if (authLoading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-8 max-w-md text-center space-y-4">
          <h1 className="text-2xl font-heading">Access denied</h1>
          <p className="text-muted-foreground">This area is for administrators only.</p>
          <Button onClick={() => navigate("/")}>Back to home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}><ArrowLeft className="h-4 w-4" /></Button>
            <span className="text-2xl">🌸</span>
            <h1 className="text-xl font-heading">Admin Dashboard</h1>
          </div>
          <Button variant="ghost" onClick={logout}>Sign out</Button>
        </div>
      </header>

      <main className="container py-6">
        <Tabs defaultValue="orders">
          <TabsList className="mb-6">
            <TabsTrigger value="orders"><ShoppingBag className="h-4 w-4 mr-2" />Orders</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="h-4 w-4 mr-2" />Analytics</TabsTrigger>
            <TabsTrigger value="menu"><UtensilsCrossed className="h-4 w-4 mr-2" />Menu</TabsTrigger>
            <TabsTrigger value="customers"><Users className="h-4 w-4 mr-2" />Customers</TabsTrigger>
          </TabsList>
          <TabsContent value="orders"><OrdersTab /></TabsContent>
          <TabsContent value="analytics"><AnalyticsTab /></TabsContent>
          <TabsContent value="menu"><MenuTab /></TabsContent>
          <TabsContent value="customers"><CustomersTab /></TabsContent>
        </Tabs>
      </main>
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
        <Card key={o.id} className="p-4">
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
        <Card className="p-5"><p className="text-sm text-muted-foreground">Total revenue</p><p className="text-3xl font-heading mt-2">{peso(stats.revenue)}</p></Card>
        <Card className="p-5"><p className="text-sm text-muted-foreground">Total orders</p><p className="text-3xl font-heading mt-2">{stats.count}</p></Card>
        <Card className="p-5"><p className="text-sm text-muted-foreground">Delivered</p><p className="text-3xl font-heading mt-2">{stats.completed}</p></Card>
      </div>
      <Card className="p-5">
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
        <Card>
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
    <Card>
      <Table>
        <TableHeader><TableRow>
          <TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Address</TableHead><TableHead>Joined</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {profiles.map((p) => (
            <TableRow key={p.user_id}>
              <TableCell className="font-medium">{p.name || "—"}</TableCell>
              <TableCell>{p.phone || "—"}</TableCell>
              <TableCell className="max-w-xs truncate">{p.address || "—"}</TableCell>
              <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default AdminPage;
