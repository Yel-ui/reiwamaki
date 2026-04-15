import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useOrders } from "@/contexts/OrderContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import type { CustomerInfo } from "@/lib/menu-data";
import { ArrowLeft, MapPin, Phone, User, CreditCard, Loader2 } from "lucide-react";

const CheckoutPage = () => {
  const { items, total, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [info, setInfo] = useState<CustomerInfo>({
    fullName: profile?.name || "",
    phone: profile?.phone || "",
    address: profile?.address || "",
    city: "",
    notes: "",
    paymentMethod: "cod",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CustomerInfo, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    navigate("/");
    return null;
  }

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!info.fullName.trim()) e.fullName = "Required";
    if (!info.phone.trim() || info.phone.replace(/\D/g, "").length < 10)
      e.phone = "Enter a valid phone number";
    if (!info.address.trim()) e.address = "Required";
    if (!info.city.trim()) e.city = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const order = await placeOrder(items, total, info);
      if (order) {
        clearCart();
        navigate(`/order/${order.id}`);
      } else {
        toast({ title: "Order failed", description: "Please try again.", variant: "destructive" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const paymentMethods = [
    { value: "cod" as const, label: "Cash on Delivery", icon: "💵" },
    { value: "gcash" as const, label: "GCash", icon: "📱" },
    { value: "card" as const, label: "Credit/Debit Card", icon: "💳" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center h-14 gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-heading">Checkout</h1>
        </div>
      </header>

      <main className="container py-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <h2 className="font-heading text-lg flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Delivery Information
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={info.fullName} onChange={(e) => setInfo({ ...info, fullName: e.target.value })} placeholder="Juan Dela Cruz" maxLength={100} />
                {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <Label htmlFor="phone" className="flex items-center gap-1"><Phone className="h-3 w-3" /> Phone Number</Label>
                <Input id="phone" value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} placeholder="09XX XXX XXXX" maxLength={15} />
                {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
              </div>
              <div>
                <Label htmlFor="address" className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Delivery Address</Label>
                <Textarea id="address" value={info.address} onChange={(e) => setInfo({ ...info, address: e.target.value })} placeholder="House/Unit No., Street, Barangay" rows={2} maxLength={300} />
                {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
              </div>
              <div>
                <Label htmlFor="city">City / Municipality</Label>
                <Input id="city" value={info.city} onChange={(e) => setInfo({ ...info, city: e.target.value })} placeholder="e.g. Quezon City" maxLength={100} />
                {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
              </div>
              <div>
                <Label htmlFor="notes">Delivery Notes (optional)</Label>
                <Textarea id="notes" value={info.notes} onChange={(e) => setInfo({ ...info, notes: e.target.value })} placeholder="Gate code, landmarks, etc." rows={2} maxLength={200} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <h2 className="font-heading text-lg flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" /> Payment Method
              </h2>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {paymentMethods.map((pm) => (
                  <button
                    key={pm.value}
                    type="button"
                    onClick={() => setInfo({ ...info, paymentMethod: pm.value })}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                      info.paymentMethod === pm.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <span className="text-xl">{pm.icon}</span>
                    <span className="font-body font-medium text-sm">{pm.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <h2 className="font-heading text-lg">Order Summary</h2>
            </CardHeader>
            <CardContent className="space-y-2">
              {items.map((item) => (
                <div key={item.cartKey} className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>{item.image}</span>
                    <span className="truncate max-w-[180px]">{item.name}</span>
                    <span className="text-muted-foreground">x{item.quantity}</span>
                  </div>
                  <span className="font-medium">₱{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <Separator className="my-2" />
              <div className="flex justify-between font-heading text-lg">
                <span>Total</span>
                <span className="text-primary">₱{total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full text-base h-12" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Place Order — ₱{total.toFixed(2)}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default CheckoutPage;
