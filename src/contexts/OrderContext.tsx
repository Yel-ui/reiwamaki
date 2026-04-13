import React, { createContext, useContext, useState, useCallback } from "react";
import type { Order, CustomerInfo, CartItem } from "@/lib/menu-data";

interface OrderContextType {
  orders: Order[];
  placeOrder: (items: CartItem[], total: number, customer: CustomerInfo) => Order;
  getOrder: (id: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  const placeOrder = useCallback((items: CartItem[], total: number, customer: CustomerInfo): Order => {
    const order: Order = {
      id: `RWM-${Date.now().toString(36).toUpperCase()}`,
      items: [...items],
      total,
      customer,
      status: "confirmed",
      createdAt: new Date(),
    };
    setOrders((prev) => [order, ...prev]);

    // Simulate status progression
    setTimeout(() => {
      setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: "preparing" } : o));
    }, 5000);
    setTimeout(() => {
      setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: "on-the-way" } : o));
    }, 15000);
    setTimeout(() => {
      setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: "delivered" } : o));
    }, 30000);

    return order;
  }, []);

  const getOrder = useCallback((id: string) => orders.find((o) => o.id === id), [orders]);

  return (
    <OrderContext.Provider value={{ orders, placeOrder, getOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
};
