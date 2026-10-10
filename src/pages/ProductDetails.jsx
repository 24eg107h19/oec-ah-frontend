import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, CheckCircle2, ShieldCheck, Truck, RefreshCw, Star } from 'lucide-react';
import { productService } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/currency';
import sampleProducts from '../data/sampleProducts';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [notification, setNotification] = useState('');
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await productService.getById(id);
      setProduct(res.data);
    } catch (err) {
      console.error('Error fetching product:', err);
      setProduct(sampleProducts.find((item) => String(item.id) === String(id)) || null);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (product && next > product.quantity) return product.quantity;
      return next;
    });
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const res = await addToCart(product.id, quantity);
    if (res.success) {
      setNotification(`Added ${quantity} of "${product.name}" to your cart!`);
      setTimeout(() => setNotification(''), 3000);
    } else {
      setNotification(res.message || 'Failed to add item to cart');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner-wrapper" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
        <p>Loading product information...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="empty-state" style={{ minHeight: '60vh' }}>
        <h2>Product Not Found</h2>
        <p>The product you are looking for does not exist or has been removed.</p>
        <Link to="/products" className="btn btn-primary">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      {/* Toast Notification */}
      {notification && (
        <div className="toast-notification">
          <CheckCircle2 size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* Back button */}
      <div className="back-nav">
        <Link to="/products" className="btn-back">
          <ArrowLeft size={18} />
          <span>Back to Products</span>
        </Link>
      </div>

      <div className="product-details-container">
        {/* Left: Product Image */}
        <div className="product-details-image-card">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
            alt={product.name}
            className="details-img"
          />
        </div>

        {/* Right: Info and Actions */}
        <div className="product-details-info">
          <div className="details-category-badge">{product.category || 'General'}</div>
          <h1 className="details-title">{product.name}</h1>

          <div className="details-rating-row">
            <div className="star-row">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className="star-icon filled" />
              ))}
            </div>
            <span className="rating-text">(4.9 out of 5 stars - 128 reviews)</span>
          </div>

          <div className="details-price-row">
            <span className="details-price">{formatINR(product.price)}</span>
            <span className="details-tax-hint">Inclusive of all taxes</span>
          </div>

          <div className="details-stock-row">
            {product.quantity > 0 ? (
              <span className="badge-in-stock">
                <CheckCircle2 size={16} /> In Stock ({product.quantity} available)
              </span>
            ) : (
              <span className="badge-out-of-stock">Out of Stock</span>
            )}
            <span className="details-sku">SKU: PROD-{product.id}</span>
          </div>

          <div className="details-description-box">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          {/* Action section */}
          {product.quantity > 0 && (
            <div className="details-actions">
              <div className="quantity-selector">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.quantity}
                >
                  +
                </button>
              </div>

              <button
                className="btn btn-primary btn-lg add-to-cart-large"
                onClick={handleAddToCart}
              >
                <ShoppingCart size={20} />
                <span>Add {quantity} to Cart - {formatINR(product.price * quantity)}</span>
              </button>
            </div>
          )}

          {/* Value perks */}
          <div className="details-perks-list">
            <div className="details-perk">
              <Truck size={20} className="perk-icon" />
              <div>
                <strong>Free Delivery</strong>
                <p>Standard delivery in 2-4 business days</p>
              </div>
            </div>
            <div className="details-perk">
              <ShieldCheck size={20} className="perk-icon" />
              <div>
                <strong>1 Year Warranty</strong>
                <p>Official manufacturer warranty coverage</p>
              </div>
            </div>
            <div className="details-perk">
              <RefreshCw size={20} className="perk-icon" />
              <div>
                <strong>30-Day Hassle-Free Returns</strong>
                <p>Instant money-back guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
