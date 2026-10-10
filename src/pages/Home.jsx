import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Star, Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { productService } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/currency';
import sampleProducts from '../data/sampleProducts';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadFeatured();
  }, []);

  const loadFeatured = async () => {
    try {
      setLoading(true);
      const res = await productService.getAll();
      const liveProducts = Array.isArray(res?.data) ? res.data : [];
      const items = [
        ...liveProducts,
        ...sampleProducts.filter(
          (sample) => !liveProducts.some((product) => product.name === sample.name),
        ),
      ];
      setFeaturedProducts(items.slice(0, 8));
    } catch (err) {
      console.error('Error fetching featured products:', err);
      setFeaturedProducts(sampleProducts);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const res = await addToCart(product.id, 1);
    if (res.success) {
      setNotification(`Added "${product.name}" to cart!`);
      setTimeout(() => setNotification(''), 3000);
    } else {
      setNotification(res.message || 'Could not add to cart');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  return (
    <div className="home-page">
      {/* Toast Notification */}
      {notification && (
        <div className="toast-notification">
          <CheckCircle2 size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>Next-Gen Online Shopping</span>
          </div>
          <h1 className="hero-title">
            Discover Quality Products at <span className="gradient-text">Unbeatable Prices</span>
          </h1>
          <p className="hero-subtitle">
            Explore our curated catalog of top-tier electronics, fashion, and home essentials. Fast delivery, secure checkout, and premium quality guaranteed.
          </p>
          <div className="hero-cta-group">
            <Link to="/products" className="btn btn-primary btn-lg">
              <span>Start Shopping</span>
              <ArrowRight size={18} />
            </Link>
            {!user && (
              <Link to="/login" className="btn btn-outline btn-lg">
                Sign In / Register
              </Link>
            )}
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">10k+</span>
              <span className="stat-label">Happy Customers</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Curated Items</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">99.9%</span>
              <span className="stat-label">On-time Delivery</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card-stack">
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"
              alt="Wireless Headphones"
              className="hero-main-img"
            />
            <div className="floating-card floating-card-1">
              <Zap className="floating-card-icon" />
              <div>
                <strong>Flash Sale</strong>
                <p>Up to 40% Off</p>
              </div>
            </div>
            <div className="floating-card floating-card-2">
              <ShieldCheck className="floating-card-icon" />
              <div>
                <strong>Verified Seller</strong>
                <p>100% Authentic</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Highlights */}
      <section className="category-section">
        <div className="section-header">
          <h2 className="section-title">Popular Categories</h2>
          <p className="section-subtitle">Browse products by your favorite categories</p>
        </div>

        <div className="category-grid">
          <Link to="/products?category=Electronics" className="category-card">
            <div className="category-card-overlay">
              <h3>Electronics</h3>
              <p>Headphones, Keyboards, Gadgets & more</p>
              <span className="category-card-link">Explore Category &rarr;</span>
            </div>
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
              alt="Electronics"
            />
          </Link>

          <Link to="/products?category=Fashion" className="category-card">
            <div className="category-card-overlay">
              <h3>Fashion</h3>
              <p>Backpacks, Jackets, Apparel & more</p>
              <span className="category-card-link">Explore Category &rarr;</span>
            </div>
            <img
              src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500"
              alt="Fashion"
            />
          </Link>

          <Link to="/products?category=Home & Office" className="category-card">
            <div className="category-card-overlay">
              <h3>Home & Office</h3>
              <p>Desk ergonomics, bottles & utilities</p>
              <span className="category-card-link">Explore Category &rarr;</span>
            </div>
            <img
              src="https://images.unsplash.com/photo-1580481077111-e6e226e6443d?w=500"
              alt="Home & Office"
            />
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="section-header-flex">
          <div>
            <h2 className="section-title">Featured Products</h2>
            <p className="section-subtitle">Handpicked selections ready to dispatch</p>
          </div>
          <Link to="/products" className="btn btn-outline">
            View All Products &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="loading-spinner-wrapper">
            <div className="spinner"></div>
            <p>Loading featured items...</p>
          </div>
        ) : (
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  <img
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'}
                    alt={product.name}
                    className="product-img"
                  />
                  {product.category && (
                    <span className="product-badge">{product.category}</span>
                  )}
                </div>

                <div className="product-info">
                  <div className="product-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="star-icon filled" />
                    ))}
                    <span className="rating-text">(4.8)</span>
                  </div>

                  <h3 className="product-name">
                    <Link to={`/products/${product.id}`}>{product.name}</Link>
                  </h3>
                  <p className="product-desc">{product.description}</p>

                  <div className="product-footer">
                    <div className="product-pricing">
                      <span className="product-price">{formatINR(product.price)}</span>
                      <span className="stock-info">
                        {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                      </span>
                    </div>

                    <button
                      className="btn btn-primary btn-sm add-cart-btn"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.quantity <= 0}
                    >
                      <ShoppingCart size={16} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
