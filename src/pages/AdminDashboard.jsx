import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Truck,
  Check,
  XCircle,
  IndianRupee,
  TrendingUp,
  X,
  Search,
} from 'lucide-react';
import { productService, orderService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/currency';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'orders'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [errorNotification, setErrorNotification] = useState('');

  // Search filter
  const [productSearch, setProductSearch] = useState('');

  // Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: 'Electronics',
    imageUrl: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!isAdmin) {
      navigate('/');
    } else {
      loadData();
    }
  }, [user, isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, ordRes] = await Promise.all([
        productService.getAll(),
        orderService.getAllOrders(),
      ]);
      setProducts(prodRes.data);
      setOrders(ordRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      showError('Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const showError = (msg) => {
    setErrorNotification(msg);
    setTimeout(() => setErrorNotification(''), 3500);
  };

  // Open modal for Adding
  const openAddModal = () => {
    setIsEditing(false);
    setCurrentProductId(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      quantity: '',
      category: 'Electronics',
      imageUrl: '',
    });
    setIsModalOpen(true);
  };

  // Open modal for Editing
  const openEditModal = (product) => {
    setIsEditing(true);
    setCurrentProductId(product.id);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      quantity: product.quantity,
      category: product.category || 'Electronics',
      imageUrl: product.imageUrl || '',
    });
    setIsModalOpen(true);
  };

  // Submit Product Form
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || productForm.quantity === '') {
      showError('Please fill in required fields (Name, Price, Quantity)');
      return;
    }

    const payload = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      quantity: parseInt(productForm.quantity, 10),
      category: productForm.category,
      imageUrl: productForm.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    };

    try {
      if (isEditing) {
        await productService.update(currentProductId, payload);
        showSuccess('Product updated successfully!');
      } else {
        await productService.create(payload);
        showSuccess('Product added successfully!');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save product');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await productService.delete(id);
        showSuccess(`"${name}" was deleted successfully`);
        loadData();
      } catch (err) {
        showError('Could not delete product.');
      }
    }
  };

  // Update Order Status
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      showSuccess(`Order #${orderId} status updated to ${newStatus}`);
      loadData();
    } catch (err) {
      showError('Failed to update order status');
    }
  };

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const outOfStockCount = products.filter((p) => p.quantity <= 0).length;

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(productSearch.toLowerCase()))
  );

  return (
    <div className="admin-page">
      {/* Toast Alerts */}
      {notification && (
        <div className="toast-notification">
          <CheckCircle2 size={18} />
          <span>{notification}</span>
        </div>
      )}
      {errorNotification && (
        <div className="toast-notification error-toast">
          <AlertCircle size={18} />
          <span>{errorNotification}</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="admin-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Manage products, update stock inventory, and fulfill customer orders</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary btn-add-product">
          <Plus size={18} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box bg-blue">
            <Package size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Total Products</span>
            <span className="metric-value">{products.length}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box bg-purple">
            <ShoppingBag size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Total Orders</span>
            <span className="metric-value">{orders.length}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box bg-green">
            <IndianRupee size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Total Revenue</span>
            <span className="metric-value">{formatINR(totalRevenue)}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box bg-amber">
            <AlertCircle size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Low / Out of Stock</span>
            <span className="metric-value">{outOfStockCount}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tab-nav">
        <button
          className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Package size={18} />
          <span>Products Catalog ({products.length})</span>
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <ShoppingBag size={18} />
          <span>Customer Orders ({orders.length})</span>
        </button>
      </div>

      {/* TAB 1: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="admin-section">
          <div className="admin-table-controls">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search products by title or category..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="search-input"
              />
            </div>
            <span className="table-count-tag">{filteredProducts.length} items found</span>
          </div>

          <div className="admin-table-card">
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Product Details</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8">
                        No products match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p.id}>
                        <td className="text-muted">#{p.id}</td>
                        <td>
                          <img
                            src={p.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                            alt={p.name}
                            className="admin-table-thumb"
                          />
                        </td>
                        <td>
                          <div className="admin-product-name">{p.name}</div>
                          <div className="admin-product-desc-snippet">{p.description}</div>
                        </td>
                        <td>
                          <span className="table-category-badge">{p.category || 'General'}</span>
                        </td>
                        <td>
                          <strong>{formatINR(p.price)}</strong>
                        </td>
                        <td>
                          <span
                            className={`stock-indicator-badge ${
                              p.quantity > 5
                                ? 'stock-ok'
                                : p.quantity > 0
                                ? 'stock-low'
                                : 'stock-out'
                            }`}
                          >
                            {p.quantity} units
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="table-action-btns">
                            <button
                              onClick={() => openEditModal(p)}
                              className="btn-icon-action btn-edit"
                              title="Edit product"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="btn-icon-action btn-delete"
                              title="Delete product"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS */}
      {activeTab === 'orders' && (
        <div className="admin-section">
          <div className="admin-table-card">
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Order Date</th>
                    <th>Items Ordered</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8">
                        No customer orders received yet.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id}>
                        <td>
                          <strong>#{o.id}</strong>
                        </td>
                        <td>
                          <div className="customer-info-cell">
                            <strong>{o.user?.name || 'Customer'}</strong>
                            <span className="text-muted text-sm">{o.user?.email}</span>
                            <span className="text-muted text-sm">{o.shippingAddress}</span>
                          </div>
                        </td>
                        <td className="text-muted text-sm">
                          {o.orderDate
                            ? new Date(o.orderDate).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </td>
                        <td>
                          <div className="order-items-snippet">
                            {o.orderItems?.map((item) => (
                              <div key={item.id} className="item-snippet-row">
                                <span>{item.quantity}x</span>
                                <span>{item.product?.name}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td>
                          <strong className="order-total-highlight">
                            {formatINR(o.totalAmount)}
                          </strong>
                        </td>
                        <td>
                          <span className={`status-pill status-${o.status?.toLowerCase()}`}>
                            {o.status}
                          </span>
                        </td>
                        <td>
                          <select
                            value={o.status}
                            onChange={(e) => handleStatusChange(o.id, e.target.value)}
                            className="status-dropdown"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{isEditing ? 'Update Product' : 'Add New Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="modal-form">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Wireless Noise-Canceling Headphones"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="99.99"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="25"
                    value={productForm.quantity}
                    onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home & Office">Home & Office</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  placeholder="Write a clear product description..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                ></textarea>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEditing ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
