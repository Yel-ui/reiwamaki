import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { CartItem, CustomerInfo } from "@/lib/menu-data";

interface DbOrder {
  id: string;
  order_number: string;
  status: "confirmed" | "preparing" | "on-the-way" | "delivered" | "cancelled";
  total: number;
  delivery_address: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  items?: DbOrderItem[];
}

interface DbOrderItem {
  id: string;
  item_name: string;
  item_price: number;
  quantity: number;
  customizations: Record<string, string> | null;
  special_instructions: string | null;
}

interface OrderContextType {
  orders: DbOrder[];
  loading: boolean;
  placeOrder: (items: CartItem[], total: number, customer: CustomerInfo) => Promise<DbOrder | null>;
  getOrder: (id: string) => DbOrder | undefined;
  fetchOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user) { setOrders([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setOrders(data as unknown as DbOrder[]);
    setLoading(false);
  }, [user]);

  // Fetch orders on user change
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Realtime subscription for order status updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("user-orders")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, (payload) => {
        const updated = payload.new as unknown as DbOrder;
        if (updated) {
          setOrders((prev) => prev.map((o) => o.id === updated.id ? { ...o, ...updated } : o));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const placeOrder = useCallback(async (items: CartItem[], total: number, customer: CustomerInfo): Promise<DbOrder | null> => {
    if (!user) return null;
    const orderNumber = `RWM-${Date.now().toString(36).toUpperCase()}`;

    const { data: orderData, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        total,
        delivery_address: `${customer.address}, ${customer.city}`,
        phone: customer.phone,
        notes: customer.notes || null,
      })
      .select()
      .single();

    if (error || !orderData) return null;

    const orderItems = items.map((item) => ({
      order_id: (orderData as any).id,
      item_name: item.name,
      item_price: item.price,
      quantity: item.quantity,
      customizations: item.selectedCustomizations || null,
      special_instructions: item.specialInstructions || null,
    }));

    await supabase.from("order_items").insert(orderItems);

    const newOrder = orderData as unknown as DbOrder;
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  }, [user]);

  const getOrder = useCallback((id: string) => orders.find((o) => o.id === id), [orders]);

  return (
    <OrderContext.Provider value={{ orders, loading, placeOrder, getOrder, fetchOrders }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
};
