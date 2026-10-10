import React from 'react';
import { ShoppingBag, Heart, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer-container">
      {/* Features Bar */}
      <div className="footer-perks">
        <div className="perk-item">
          <Truck className="perk-icon" />
          <div>
            <h4>Free & Fast Delivery</h4>
            <p>On orders over ₹999</p>
          </div>
        </div>
        <div className="perk-item">
          <ShieldCheck className="perk-icon" />
          <div>
            <h4>Secure Payments</h4>
            <p>100% protected transactions</p>
          </div>
        </div>
        <div className="perk-item">
          <RefreshCw className="perk-icon" />
          <div>
            <h4>Easy Returns</h4>
            <p>30 days return policy</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-brand-summary">
          <div className="footer-brand">
            <ShoppingBag size={20} />
            <span>Quick Cart</span>
          </div>
          <p>Full-stack modern e-commerce platform built with React, Spring Boot & MySQL.</p>
        </div>
        <div className="tech-stack-badges">
          <span className="tech-badge">React 18</span>
          <span className="tech-badge">Spring Boot 3</span>
          <span className="tech-badge">MySQL / H2</span>
          <span className="tech-badge">REST API</span>
        </div>
      </div>
      <div className="footer-copy">
        <p>&copy; {new Date().getFullYear()} Quick Cart E-Commerce. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
