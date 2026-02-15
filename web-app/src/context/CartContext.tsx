'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext<any>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<any[]>([]);

  // Load cart from LocalStorage on start
  useEffect(() => {
    const savedCart = localStorage.getItem('personalised-cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // Save to LocalStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('personalised-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any) => {
    setCart((prev) => [...prev, product]);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter(item => item.id !== id));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);