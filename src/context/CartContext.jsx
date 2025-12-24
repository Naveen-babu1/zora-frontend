import { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalItems: 0, totalPrice: 0 });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) fetchCart();
    else setCart({ items: [], totalItems: 0, totalPrice: 0 });
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const data = await cartService.getCart();
      setCart(data.cart);
    } catch (error) {
      console.error('Failed to fetch cart');
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items');
      return false;
    }
    try {
      setLoading(true);
      const data = await cartService.addToCart(productId, quantity);
      setCart(data.cart);
      toast.success('Added to cart');
      return true;
    } catch (error) {
      toast.error(error.message || 'Failed to add');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      setLoading(true);
      const data = await cartService.updateCartItem(productId, quantity);
      setCart(data.cart);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      const data = await cartService.removeFromCart(productId);
      setCart(data.cart);
      toast.success('Removed from cart');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCart({ items: [], totalItems: 0, totalPrice: 0 });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeFromCart, clearCart, refreshCart: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);