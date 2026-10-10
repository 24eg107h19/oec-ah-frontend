import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user?.id) {
      setCartItems([]);
      return;
    }
    try {
      setLoading(true);
      const res = await cartService.getCart(user.id);
      setCartItems(res.data || []);
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user?.id) {
      return { success: false, requireLogin: true };
    }
    try {
      await cartService.addToCart(user.id, productId, quantity);
      await fetchCart();
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to add item to cart';
      return { success: false, message: msg };
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      await cartService.updateQuantity(cartItemId, quantity);
      await fetchCart();
      return { success: true };
    } catch (err) {
      console.error('Failed to update quantity:', err);
      return { success: false };
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await cartService.removeItem(cartItemId);
      await fetchCart();
      return { success: true };
    } catch (err) {
      console.error('Failed to remove item:', err);
      return { success: false };
    }
  };

  const clearCart = async () => {
    if (!user?.id) return;
    try {
      await cartService.clearCart(user.id);
      setCartItems([]);
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
  const cartTotal = cartItems.reduce(
    (acc, item) => acc + (item.product?.price || 0) * (item.quantity || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
