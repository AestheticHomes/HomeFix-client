"use client";

/**
 * File: /components/CartContext.js
 * Purpose: Persistent global cart manager with localStorage sync & quantity updates.
 */

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [hydrated, setHydrated] = useState(false); // 🩵 Prevent hydration mismatch flicker

  // 🧠 Load from localStorage once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("homefix_cart");
      if (saved) setCart(JSON.parse(saved));
    } catch (err) {
      console.error("❌ Failed to load cart:", err);
    } finally {
      setHydrated(true);
    }
  }, []);

  // 💾 Persist on change
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem("homefix_cart", JSON.stringify(cart));
    }
  }, [cart, hydrated]);

  // ➕ Add item to cart
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((x) => x.id === item.id && x.type === item.type);
      if (existing) {
        return prev.map((x) =>
          x.id === item.id && x.type === item.type
            ? { ...x, quantity: x.quantity + (item.quantity || 1) }
            : x
        );
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };

  // 🔢 Update quantity
  const updateQuantity = (id, qty) => {
    setCart((prev) =>
      prev.map((x) => (x.id === id ? { ...x, quantity: Math.max(1, qty) } : x))
    );
  };

  // ❌ Remove or clear
  const removeFromCart = (id) => setCart((prev) => prev.filter((x) => x.id !== id));
  const clearCart = () => setCart([]);

  // 💰 Total
  const total = cart.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

  if (!hydrated) return null; // ⏳ Avoid rendering before hydration

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
