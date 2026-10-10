import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, User, LogOut, LayoutDashboard, Package, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        {/* Brand */}
        <Link to="/" className="navbar-brand" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-icon-wrapper">
            <ShoppingBag className="brand-icon" />
          </div>
          <span className="brand-text">Quick<span className="brand-accent">Cart</span></span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="desktop-nav">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
            Products
          </Link>
          {user && (
            <Link to="/orders" className={`nav-link ${isActive('/orders') ? 'active' : ''}`}>
              My Orders
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className={`nav-link admin-nav-link ${isActive('/admin') ? 'active' : ''}`}>
              <LayoutDashboard size={17} />
              Admin Dashboard
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="navbar-actions">
          {/* Cart Icon */}
          <Link to="/cart" className="cart-button" title="View Cart">
            <ShoppingCart size={22} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {/* User Section */}
          {user ? (
            <div className="user-profile-menu">
              <div className="user-info-chip">
                <div className="user-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="user-details-text">
                  <span className="user-name">{user.name}</span>
                  <span className={`role-badge ${isAdmin ? 'role-admin' : 'role-user'}`}>
                    {user.role}
                  </span>
                </div>
              </div>
              <button onClick={handleLogout} className="btn-logout" title="Sign Out">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-primary">
                <User size={16} />
                <span>Sign In</span>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <Link
            to="/"
            className={`mobile-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/products"
            className={`mobile-link ${isActive('/products') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Products
          </Link>
          {user && (
            <Link
              to="/orders"
              className={`mobile-link ${isActive('/orders') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              My Orders
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className={`mobile-link admin-nav-link ${isActive('/admin') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <LayoutDashboard size={18} />
              Admin Dashboard
            </Link>
          )}
          <div className="mobile-drawer-footer">
            {user ? (
              <button onClick={handleLogout} className="btn btn-outline btn-block">
                <LogOut size={18} />
                Sign Out ({user.name})
              </button>
            ) : (
              <Link
                to="/login"
                className="btn btn-primary btn-block"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User size={18} />
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
