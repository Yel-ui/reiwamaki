import { useOrders } from "@/contexts/OrderContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, ChefHat, Truck, Package, Loader2, XCircle } from "lucide-react";

const statusConfig = {
  confirmed: { label: "Confirmed", icon: CheckCircle, color: "text-blue-500" },
  preparing: { label: "Preparing", icon: ChefHat, color: "text-amber-500" },
  "on-the-way": { label: "On the Way", icon: Truck, color: "text-primary" },
  delivered: { label: "Delivered", icon: Package, color: "text-green-600" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-destructive" },
} as const;

const OrdersPage = () => {
  const { orders, loading } = useOrders();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center h-14 gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-heading">My Orders</h1>
        </div>
      </header>

      <main className="container py-6 max-w-lg space-y-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-muted-foreground">No orders yet</p>
            <Button className="mt-4" onClick={() => navigate("/")}>Browse Menu</Button>
          </div>
        ) : (
          orders.map((order) => {
            const cfg = statusConfig[order.status] || statusConfig.confirmed;
            const Icon = cfg.icon;
            return (
              <Card
                key={order.id}
                className="cursor-pointer hover:shadow-md transition-shadow border-border/40"
                onClick={() => navigate(`/order/${order.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-medium">{order.order_number}</span>
                    <div className={`flex items-center gap-1.5 text-sm font-medium ${cfg.color}`}>
                      <Icon className="h-4 w-4" />
                      {cfg.label}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>₱{Number(order.total).toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(order.created_at).toLocaleDateString()} · {new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </CardContent>
              </Card>
            );
          })
        )}
      </main>
    </div>
  );
};

export default OrdersPage;
