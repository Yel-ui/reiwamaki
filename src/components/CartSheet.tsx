import { useCart } from "@/contexts/CartContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const CartSheet = () => {
  const { items, updateQuantity, removeItem, total, itemCount } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleCheckout = () => {
    setOpen(false);
    navigate("/receipt");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative border-primary/30">
          <ShoppingCart className="h-5 w-5 text-primary" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-body font-semibold">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-heading text-2xl">Your Cart</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-3">🍽️</div>
              <p className="text-muted-foreground">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mt-1">Browse our menu and add items</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-3 mt-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <span className="text-2xl">{item.image}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-medium text-sm truncate">{item.name}</p>
                    <p className="text-sm text-primary font-semibold">₱{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              <Separator />
              <div className="flex justify-between font-body">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">₱{total.toFixed(2)}</span>
              </div>
              <Button className="w-full" onClick={handleCheckout}>
                Place Order — ₱{total.toFixed(2)}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
