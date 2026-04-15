import { useParams, useNavigate } from "react-router-dom";
import { useOrders } from "@/contexts/OrderContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, ChefHat, Truck, Package, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const statusSteps = [
  { key: "confirmed", label: "Order Confirmed", icon: CheckCircle, emoji: "✅" },
  { key: "preparing", label: "Preparing", icon: ChefHat, emoji: "👨‍🍳" },
  { key: "on-the-way", label: "On the Way", icon: Truck, emoji: "🛵" },
  { key: "delivered", label: "Delivered", icon: Package, emoji: "📦" },
] as const;

interface OrderDetail {
  id: string;
  order_number: string;
  status: string;
  total: number;
  delivery_address: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
}

interface OrderItem {
  id: string;
  item_name: string;
  item_price: number;
  quantity: number;
  customizations: Record<string, string> | null;
  special_instructions: string | null;
}

const OrderStatusPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getOrder } = useOrders();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Try context first
    const ctxOrder = getOrder(id);
    if (ctxOrder) {
      setOrder(ctxOrder as unknown as OrderDetail);
    }

    // Fetch from DB with items
    const fetchOrder = async () => {
      const { data: orderData } = await supabase.from("orders").select("*").eq("id", id).single();
      if (orderData) setOrder(orderData as unknown as OrderDetail);

      const { data: itemsData } = await supabase.from("order_items").select("*").eq("order_id", id);
      if (itemsData) setItems(itemsData as unknown as OrderItem[]);
      setLoading(false);
    };
    fetchOrder();

    // Realtime for this order
    const channel = supabase
      .channel(`order-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` }, (payload) => {
        setOrder((prev) => prev ? { ...prev, ...(payload.new as any) } : prev);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, getOrder]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <div className="text-5xl mb-3">🍽️</div>
          <p className="text-muted-foreground">Order not found</p>
          <Button className="mt-4" onClick={() => navigate("/")}>Back to Menu</Button>
        </div>
      </div>
    );
  }

  const currentIdx = statusSteps.findIndex((s) => s.key === order.status);
  const safeIdx = currentIdx >= 0 ? currentIdx : 0;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-border/50 animate-fade-in">
        <CardHeader className="text-center space-y-2 pb-2">
          <div className="text-5xl">{statusSteps[safeIdx].emoji}</div>
          <h1 className="text-2xl font-heading text-foreground">{statusSteps[safeIdx].label}</h1>
          <p className="text-sm text-muted-foreground font-mono">{order.order_number}</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Progress tracker */}
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-border" />
            <div
              className="absolute top-4 left-6 h-0.5 bg-primary transition-all duration-700"
              style={{ width: `${(safeIdx / (statusSteps.length - 1)) * (100 - 12)}%` }}
            />
            {statusSteps.map((step, i) => {
              const Icon = step.icon;
              const done = i <= safeIdx;
              return (
                <div key={step.key} className="relative z-10 flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`text-[10px] ${done ? "text-foreground font-medium" : "text-muted-foreground"}`}>{step.label}</span>
                </div>
              );
            })}
          </div>

          <Separator />

          {/* Delivery info */}
          <div className="bg-secondary/50 rounded-lg p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span>{order.phone || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Address</span>
              <span className="text-right max-w-[180px]">{order.delivery_address || "—"}</span>
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div className="space-y-2">
            <h3 className="font-heading text-lg">Items Ordered</h3>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <div>
                  <span>{item.item_name}</span>
                  <span className="text-muted-foreground ml-1">x{item.quantity}</span>
                  {item.special_instructions && (
                    <p className="text-xs text-muted-foreground italic">"{item.special_instructions}"</p>
                  )}
                </div>
                <span className="font-medium">₱{(item.item_price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex justify-between text-lg font-heading">
            <span>Total</span>
            <span className="text-primary">₱{Number(order.total).toFixed(2)}</span>
          </div>

          {order.status !== "delivered" && (
            <div className="bg-cherry-light/50 rounded-lg p-3 text-center text-sm text-foreground flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 animate-pulse" />
              Your order is being processed. Status updates in real-time!
            </div>
          )}

          {order.status === "delivered" && (
            <div className="bg-primary/10 rounded-lg p-3 text-center text-sm text-foreground">
              🎉 Your order has been delivered! Enjoy your meal!
            </div>
          )}

          <Button className="w-full" onClick={() => navigate("/")}>
            Back to Menu
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderStatusPage;
