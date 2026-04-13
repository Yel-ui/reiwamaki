import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { useEffect, useRef } from "react";

const ReceiptPage = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const orderRef = useRef(
    `RWM-${Date.now().toString(36).toUpperCase()}`
  );

  const savedItems = useRef(items);
  const savedTotal = useRef(total);

  useEffect(() => {
    if (items.length > 0) {
      savedItems.current = items;
      savedTotal.current = total;
    }
  }, [items, total]);

  const displayItems = savedItems.current;
  const displayTotal = savedTotal.current;

  const handleDone = () => {
    clearCart();
    navigate("/");
  };

  if (displayItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <div className="text-5xl mb-3">🍽️</div>
          <p className="text-muted-foreground">No order to display</p>
          <Button className="mt-4" onClick={() => navigate("/")}>Back to Menu</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-border/50 animate-fade-in">
        <CardHeader className="text-center space-y-2 pb-2">
          <CheckCircle className="h-12 w-12 text-primary mx-auto" />
          <h1 className="text-3xl font-heading text-foreground">Order Confirmed!</h1>
          <p className="text-sm text-muted-foreground">Thank you for your order</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Order Info */}
          <div className="bg-secondary/50 rounded-lg p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order No.</span>
              <span className="font-mono font-medium">{orderRef.current}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium">{user?.name || "Guest"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div className="space-y-2">
            <h3 className="font-heading text-lg">Items Ordered</h3>
            {displayItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span>{item.image}</span>
                  <span>{item.name}</span>
                  <span className="text-muted-foreground">x{item.quantity}</span>
                </div>
                <span className="font-medium">₱{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between text-lg font-heading">
            <span>Total</span>
            <span className="text-primary">₱{displayTotal.toFixed(2)}</span>
          </div>

          <div className="bg-cherry-light/50 rounded-lg p-3 text-center text-sm text-foreground">
            🌸 Your order is being prepared! Please wait for your number to be called.
          </div>

          <Button className="w-full" onClick={handleDone}>
            Back to Menu
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceiptPage;
