import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/api';
import { formatINR } from '../utils/currency';

const Cart = () => {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user) {
    return (
      <div className="cart-page">
        <div className="empty-state auth-prompt-state">
          <ShoppingBag size={56} className="empty-icon" />
          <h2>Sign In to View Your Cart</h2>
          <p>Please log in or create an account to view and manage items in your shopping cart.</p>
          <Link to="/login" className="btn btn-primary btn-lg">
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      setError('Please provide a complete shipping address');
      return;
    }
    if (!phoneNumber.trim()) {
      setError('Please provide a contact phone number');
      return;
    }

    try {
      setPlacingOrder(true);
      setError('');
      const res = await orderService.placeOrder(user.id, shippingAddress.trim(), phoneNumber.trim());
      setSuccess('Order placed successfully! Redirecting to your orders...');
      await clearCart();
      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order. Please try again.');
      setPlacingOrder(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-state">
          <ShoppingBag size={64} className="empty-icon" />
          <h2>Your Cart is Empty</h2>
          <p>Explore our wide selection of products and find something you love!</p>
          <Link to="/products" className="btn btn-primary btn-lg">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* Notifications */}
      {success && (
        <div className="toast-notification">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="toast-notification error-toast">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Shopping Cart</h1>
          <p className="page-subtitle">Review items, update quantities, and proceed to checkout</p>
        </div>
        <button onClick={clearCart} className="btn btn-outline btn-sm">
          Clear Entire Cart
        </button>
      </div>

      <div className="cart-grid">
        {/* Cart Items List */}
        <div className="cart-items-container">
          <div className="cart-items-header">
            <span>Product</span>
            <span>Quantity</span>
            <span>Total</span>
            <span></span>
          </div>

          {cartItems.map((item) => {
            const product = item.product;
            const itemTotal = (product?.price || 0) * item.quantity;

            return (
              <div key={item.id} className="cart-item-row">
                <div className="cart-product-col">
                  <img
                    src={product?.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                    alt={product?.name}
                    className="cart-item-img"
                  />
                  <div className="cart-product-details">
                    <Link to={`/products/${product?.id}`} className="cart-item-title">
                      {product?.name}
                    </Link>
                    <span className="cart-item-price">{formatINR(product?.price)} each</span>
                    <span className="cart-item-stock">
                      {product?.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                    </span>
                  </div>
                </div>

                <div className="cart-qty-col">
                  <div className="quantity-selector">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      title="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={product && item.quantity >= product.quantity}
                      title="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="cart-total-col">
                  <span className="cart-row-total">{formatINR(itemTotal)}</span>
                </div>

                <div className="cart-action-col">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="btn-remove-item"
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary & Checkout Card */}
        <div className="cart-summary-card">
          <h2 className="summary-title">Order Summary</h2>

          <div className="summary-rows">
            <div className="summary-row">
              <span>Subtotal ({cartItems.length} items)</span>
              <span>{formatINR(cartTotal)}</span>
            </div>
            <div className="summary-row">
              <span>Estimated Shipping</span>
              <span className="text-success">FREE</span>
            </div>
            <div className="summary-row">
              <span>Estimated Tax (0%)</span>
              <span>{formatINR(0)}</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row summary-grand-total">
              <strong>Order Total</strong>
              <strong className="grand-total-price">{formatINR(cartTotal)}</strong>
            </div>
          </div>

          <form onSubmit={handleCheckout} className="checkout-form">
            <h3 className="form-section-title">Shipping & Contact</h3>

            <div className="form-group">
              <label htmlFor="shippingAddress">Delivery Address *</label>
              <textarea
                id="shippingAddress"
                rows="3"
                placeholder="Apartment, Street address, City, Postal Code"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Contact Phone Number *</label>
              <input
                id="phoneNumber"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={placingOrder}
              className="btn btn-primary btn-block btn-lg checkout-btn"
            >
              {placingOrder ? (
                'Processing Order...'
              ) : (
                <>
                  <span>Place Order ({formatINR(cartTotal)})</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="safe-checkout-badge">
            <ShieldCheck size={18} className="text-success" />
            <span>Guaranteed Safe & Secure Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
