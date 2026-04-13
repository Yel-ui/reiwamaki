import { useParams, useNavigate } from "react-router-dom";
import { useOrders } from "@/contexts/OrderContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, ChefHat, Truck, Package } from "lucide-react";
import { useEffect, useState } from "react";

const statusSteps = [
  { key: "confirmed", label: "Order Confirmed", icon: CheckCircle, emoji: "✅" },
  { key: "preparing", label: "Preparing", icon: ChefHat, emoji: "👨‍🍳" },
  { key: "on-the-way", label: "On the Way", icon: Truck, emoji: "🛵" },
  { key: "delivered", label: "Delivered", icon: Package, emoji: "📦" },
] as const;

const OrderStatusPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getOrder } = useOrders();
  const navigate = useNavigate();
  const [, setTick] = useState(0);

  // Re-render every 3s to catch status updates
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  const order = id ? getOrder(id) : undefined;

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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-border/50 animate-fade-in">
        <CardHeader className="text-center space-y-2 pb-2">
          <div className="text-5xl">{statusSteps[currentIdx].emoji}</div>
          <h1 className="text-2xl font-heading text-foreground">{statusSteps[currentIdx].label}</h1>
          <p className="text-sm text-muted-foreground font-mono">{order.id}</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Progress tracker */}
          <div className="flex items-center justify-between relative">
            {/* Line behind */}
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-border" />
            <div
              className="absolute top-4 left-6 h-0.5 bg-primary transition-all duration-700"
              style={{ width: `${(currentIdx / (statusSteps.length - 1)) * (100 - 12)}%` }}
            />
            {statusSteps.map((step, i) => {
              const Icon = step.icon;
              const done = i <= currentIdx;
              return (
                <div key={step.key} className="relative z-10 flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`text-[10px] ${done ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          <Separator />

          {/* Delivery info */}
          <div className="bg-secondary/50 rounded-lg p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium">{order.customer.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span>{order.customer.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Address</span>
              <span className="text-right max-w-[180px]">{order.customer.address}, {order.customer.city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment</span>
              <span className="capitalize">{order.customer.paymentMethod === "cod" ? "Cash on Delivery" : order.customer.paymentMethod === "gcash" ? "GCash" : "Card"}</span>
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div className="space-y-2">
            <h3 className="font-heading text-lg">Items Ordered</h3>
            {order.items.map((item) => (
              <div key={item.cartKey} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span>{item.image}</span>
                  <div>
                    <span>{item.name}</span>
                    <span className="text-muted-foreground ml-1">x{item.quantity}</span>
                    {item.specialInstructions && (
                      <p className="text-xs text-muted-foreground italic">"{item.specialInstructions}"</p>
                    )}
                  </div>
                </div>
                <span className="font-medium">₱{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex justify-between text-lg font-heading">
            <span>Total</span>
            <span className="text-primary">₱{order.total.toFixed(2)}</span>
          </div>

          {order.status !== "delivered" && (
            <div className="bg-cherry-light/50 rounded-lg p-3 text-center text-sm text-foreground flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 animate-pulse" />
              Your order is being processed. Status updates automatically!
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
