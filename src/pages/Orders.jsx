import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, MapPin, Phone, CheckCircle2, Clock, Truck, Check, XCircle } from 'lucide-react';
import { orderService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/currency';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrdersByUser(user.id);
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return (
          <span className="order-status-badge status-pending">
            <Clock size={14} /> Pending
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="order-status-badge status-processing">
            <Clock size={14} /> Processing
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="order-status-badge status-shipped">
            <Truck size={14} /> Shipped
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="order-status-badge status-delivered">
            <Check size={14} /> Delivered
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="order-status-badge status-cancelled">
            <XCircle size={14} /> Cancelled
          </span>
        );
      default:
        return <span className="order-status-badge">{status}</span>;
    }
  };

  if (!user) {
    return (
      <div className="orders-page">
        <div className="empty-state auth-prompt-state">
          <Package size={56} className="empty-icon" />
          <h2>Sign In to View Orders</h2>
          <p>Please log in to track your order history and view receipts.</p>
          <Link to="/login" className="btn btn-primary btn-lg">
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Orders</h1>
          <p className="page-subtitle">Track deliveries and view order invoices</p>
        </div>
        <Link to="/products" className="btn btn-outline">
          Continue Shopping
        </Link>
      </div>

      {loading ? (
        <div className="loading-spinner-wrapper">
          <div className="spinner"></div>
          <p>Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <Package size={64} className="empty-icon" />
          <h2>No Orders Placed Yet</h2>
          <p>You haven't placed any orders yet. Discover our top products today!</p>
          <Link to="/products" className="btn btn-primary btn-lg">
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div className="order-main-meta">
                  <span className="order-number">Order #{order.id}</span>
                  <div className="order-date-row">
                    <Calendar size={14} />
                    <span>
                      {order.orderDate
                        ? new Date(order.orderDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Recent'}
                    </span>
                  </div>
                </div>

                <div className="order-status-total">
                  <div className="order-status-container">{getStatusBadge(order.status)}</div>
                  <span className="order-header-total">{formatINR(order.totalAmount)}</span>
                </div>
              </div>

              {/* Order Meta details */}
              <div className="order-meta-info-bar">
                <div className="meta-info-item">
                  <MapPin size={15} />
                  <span><strong>Deliver to:</strong> {order.shippingAddress || 'Standard Address'}</span>
                </div>
                {order.phoneNumber && (
                  <div className="meta-info-item">
                    <Phone size={15} />
                    <span><strong>Phone:</strong> {order.phoneNumber}</span>
                  </div>
                )}
              </div>

              {/* Order Items Table */}
              <div className="order-items-table">
                {order.orderItems?.map((item) => (
                  <div key={item.id} className="order-item-row">
                    <img
                      src={
                        item.product?.imageUrl ||
                        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'
                      }
                      alt={item.product?.name}
                      className="order-item-img"
                    />
                    <div className="order-item-info">
                      <Link to={`/products/${item.product?.id}`} className="order-item-name">
                        {item.product?.name}
                      </Link>
                      <span className="order-item-qty">Qty: {item.quantity}</span>
                    </div>
                    <div className="order-item-pricing">
                      <span className="unit-price">{formatINR(item.price)} each</span>
                      <span className="line-total">{formatINR(item.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
