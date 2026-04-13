import React, { createContext, useContext, useState, useCallback } from "react";
import type { MenuItem, CartItem, ItemCustomization } from "@/lib/menu-data";

function makeCartKey(id: string, customizations?: ItemCustomization, instructions?: string): string {
  return `${id}|${JSON.stringify(customizations || {})}|${instructions || ""}`;
}

function calcExtraPrice(item: MenuItem, customizations?: ItemCustomization): number {
  if (!item.customizations || !customizations) return 0;
  return item.customizations.reduce((sum, opt) => {
    const chosen = opt.choices.find((c) => c.value === customizations[opt.id]);
    return sum + (chosen?.extra || 0);
  }, 0);
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, customizations?: ItemCustomization, instructions?: string) => void;
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: MenuItem, customizations?: ItemCustomization, instructions?: string) => {
    const key = makeCartKey(item.id, customizations, instructions);
    const extra = calcExtraPrice(item, customizations);
    setItems((prev) => {
      const existing = prev.find((i) => i.cartKey === key);
      if (existing) {
        return prev.map((i) => i.cartKey === key ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price + extra,
        category: item.category,
        image: item.image,
        quantity: 1,
        selectedCustomizations: customizations,
        specialInstructions: instructions,
        cartKey: key,
      }];
    });
  }, []);

  const removeItem = useCallback((cartKey: string) => {
    setItems((prev) => prev.filter((i) => i.cartKey !== cartKey));
  }, []);

  const updateQuantity = useCallback((cartKey: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.cartKey !== cartKey));
    } else {
      setItems((prev) => prev.map((i) => i.cartKey === cartKey ? { ...i, quantity } : i));
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
