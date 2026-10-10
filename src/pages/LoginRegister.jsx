import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, UserPlus, Lock, Mail, User as UserIcon, Shield, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginRegister = () => {
  const [isLoginTab, setIsLoginTab] = useState(true);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRole, setRegisterRole] = useState('USER');

  const { login, register, loading, error, setError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError('Please fill in both email and password.');
      return;
    }
    const result = await login(loginEmail, loginPassword);
    if (result.success) {
      if (result.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/products');
      }
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPassword) {
      setError('All fields are required.');
      return;
    }
    const result = await register(registerName, registerEmail, registerPassword, registerRole);
    if (result.success) {
      if (result.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/products');
      }
    }
  };

  const fillQuickAccount = (email, password) => {
    setIsLoginTab(true);
    setLoginEmail(email);
    setLoginPassword(password);
    setError(null);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Tab Headers */}
        <div className="auth-tabs">
          <button
            className={`auth-tab-btn ${isLoginTab ? 'active' : ''}`}
            onClick={() => {
              setIsLoginTab(true);
              setError(null);
            }}
          >
            <LogIn size={18} />
            <span>Sign In</span>
          </button>
          <button
            className={`auth-tab-btn ${!isLoginTab ? 'active' : ''}`}
            onClick={() => {
              setIsLoginTab(false);
              setError(null);
            }}
          >
            <UserPlus size={18} />
            <span>Create Account</span>
          </button>
        </div>

        {/* Demo Quick Fills */}
        <div className="demo-credentials-banner">
          <div className="demo-credentials-header">
            <Sparkles size={15} />
            <span>Quick Demo Logins:</span>
          </div>
          <div className="demo-buttons">
            <button
              type="button"
              className="btn-demo-tag"
              onClick={() => fillQuickAccount('admin@shop.com', 'admin123')}
            >
              <Shield size={13} /> Admin (admin@shop.com)
            </button>
            <button
              type="button"
              className="btn-demo-tag"
              onClick={() => fillQuickAccount('user@shop.com', 'user123')}
            >
              <UserIcon size={13} /> Customer (user@shop.com)
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="auth-error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        {isLoginTab ? (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="loginEmail">Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="field-icon" />
                <input
                  id="loginEmail"
                  type="email"
                  placeholder="name@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="loginPassword">Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="field-icon" />
                <input
                  id="loginPassword"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block btn-lg auth-submit-btn"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="regName">Full Name</label>
              <div className="input-with-icon">
                <UserIcon size={18} className="field-icon" />
                <input
                  id="regName"
                  type="text"
                  placeholder="John Doe"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="regEmail">Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="field-icon" />
                <input
                  id="regEmail"
                  type="email"
                  placeholder="name@example.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="regPassword">Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="field-icon" />
                <input
                  id="regPassword"
                  type="password"
                  placeholder="At least 6 characters"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="regRole">Account Type</label>
              <div className="input-with-icon">
                <Shield size={18} className="field-icon" />
                <select
                  id="regRole"
                  value={registerRole}
                  onChange={(e) => setRegisterRole(e.target.value)}
                  className="role-select"
                >
                  <option value="USER">Customer (Shop & Order)</option>
                  <option value="ADMIN">Administrator (Manage Products & Orders)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block btn-lg auth-submit-btn"
            >
              {loading ? 'Creating Account...' : 'Register Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginRegister;
