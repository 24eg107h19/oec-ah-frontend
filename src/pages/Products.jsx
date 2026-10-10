import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, Filter, ShoppingCart, Star, CheckCircle2, SlidersHorizontal } from 'lucide-react';
import { productService } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/currency';

const categories = ['All', 'Electronics', 'Fashion', 'Home & Office'];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [sortBy, setSortBy] = useState('default');
  const [notification, setNotification] = useState('');

  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getAll(searchTerm, selectedCategory);
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
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

  // Sorting
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="products-page">
      {/* Toast Alert */}
      {notification && (
        <div className="toast-notification">
          <CheckCircle2 size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Explore Products</h1>
          <p className="page-subtitle">Find premium goods curated for every lifestyle</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="products-controls">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search products by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => {
                  setSearchTerm('');
                  productService.getAll('', selectedCategory).then((res) => setProducts(res.data));
                }}
              >
                &times;
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-primary search-submit-btn">
            Search
          </button>
        </form>

        <div className="sort-wrapper">
          <SlidersHorizontal size={18} className="sort-icon" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="default">Sort by: Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Product Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="category-pills">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`pill-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Display */}
      {loading ? (
        <div className="loading-spinner-wrapper">
          <div className="spinner"></div>
          <p>Fetching products catalog...</p>
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="empty-state">
          <h3>No products found</h3>
          <p>We couldn't find any products matching your criteria.</p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              productService.getAll('', 'All').then((res) => setProducts(res.data));
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {sortedProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image-container">
                <Link to={`/products/${product.id}`}>
                  <img
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'}
                    alt={product.name}
                    className="product-img"
                  />
                </Link>
                {product.category && (
                  <span className="product-badge">{product.category}</span>
                )}
              </div>

              <div className="product-info">
                <div className="product-rating">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="star-icon filled" />
                  ))}
                  <span className="rating-text">(4.9)</span>
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
    </div>
  );
};

export default Products;
