import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [saleType, setSaleType] = useState('RETAIL'); // 'RETAIL' | 'WHOLESALE'
  const [discountType, setDiscountType] = useState('NONE'); // 'NONE' | 'PERCENTAGE' | 'FIXED'
  const [discountValue, setDiscountValue] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  /**
   * Add or increment product in cart
   */
  const addItem = useCallback((product, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product._id === product._id);
      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = next[existingIndex].quantity + quantity;
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: Math.min(newQty, product.stockQuantity || 9999),
        };
        return next;
      }
      return [
        ...prev,
        {
          product,
          quantity: Math.min(quantity, product.stockQuantity || 9999),
        },
      ];
    });
  }, []);

  /**
   * Remove item from cart
   */
  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((item) => item.product._id !== productId));
  }, []);

  /**
   * Update quantity of item in cart
   */
  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product._id === productId) {
          return {
            ...item,
            quantity: Math.min(quantity, item.product.stockQuantity || 9999),
          };
        }
        return item;
      })
    );
  }, [removeItem]);

  /**
   * Clear entire cart and reset payments
   */
  const clearCart = useCallback(() => {
    setItems([]);
    setDiscountType('NONE');
    setDiscountValue(0);
    setPaidAmount(0);
    setSelectedCustomer(null);
  }, []);

  // Compute pricing totals
  const { subtotal, discountAmount, totalPrice, amountDue } = useMemo(() => {
    let sub = 0;
    items.forEach((item) => {
      const price =
        saleType === 'WHOLESALE'
          ? item.product.wholesalePrice || item.product.retailPrice
          : item.product.retailPrice;
      sub += price * item.quantity;
    });

    let discount = 0;
    if (discountType === 'PERCENTAGE') {
      const pct = Math.max(0, Math.min(100, Number(discountValue) || 0));
      discount = sub * (pct / 100);
    } else if (discountType === 'FIXED') {
      discount = Math.max(0, Math.min(sub, Number(discountValue) || 0));
    }

    const total = Math.max(0, sub - discount);
    const due = Math.max(0, total - (Number(paidAmount) || 0));

    return {
      subtotal: sub,
      discountAmount: discount,
      totalPrice: total,
      amountDue: due,
    };
  }, [items, saleType, discountType, discountValue, paidAmount]);

  return (
    <CartContext.Provider
      value={{
        items,
        saleType,
        discountType,
        discountValue,
        paidAmount,
        selectedCustomer,
        subtotal,
        discountAmount,
        totalPrice,
        amountDue,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setSaleType,
        setDiscountType,
        setDiscountValue,
        setPaidAmount,
        setSelectedCustomer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
