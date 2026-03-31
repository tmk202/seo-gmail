'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'basic';
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState('');

  const plans: Record<string, {name: string, price: number}> = {
    basic: { name: "Demo Antigravity - Basic", price: 15000 },
    premium: { name: "Demo Antigravity - Premium", price: 35000 },
    master: { name: "Demo Antigravity - Master", price: 90000 },
  };

  const currentPlan = plans[plan] || plans.basic;
  const total = currentPlan.price * quantity;

  return (
    <div className="checkout-container fade-in">
      <div className="checkout-card">
        <h2 className="section-title">Thanh toán đơn hàng</h2>
        
        <div className="order-summary">
          <div className="summary-item">
            <span>Sản phẩm:</span>
            <strong>{currentPlan.name}</strong>
          </div>
          <div className="summary-item">
            <span>Số lượng:</span>
            <div className="quantity-control">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
              <input readOnly value={quantity} />
              <button onClick={() => setQuantity(q => Math.min(100, q + 1))}>+</button>
            </div>
          </div>
          <div className="summary-item total">
            <span>Tổng thanh toán:</span>
            <span className="price">{total.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>

        <div className="input-group">
          <label>Email nhận tài khoản (Bắt buộc):</label>
          <input 
            type="email" 
            placeholder="vd: you@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="payment-method">
          <h3>Quét mã QR để thanh toán tự động</h3>
          <div className="qr-box">
             {/* Mock QR Code representation */}
             <div className="mock-qr">
               <svg viewBox="0 0 100 100" width="120" height="120" xmlns="http://www.w3.org/2000/svg">
                 <rect width="100" height="100" fill="#ffffff" rx="10" />
                 <path d="M15 15h20v20H15zM20 20h10v10H20zM65 15h20v20H65zM70 20h10v10H70zM15 65h20v20H15zM20 70h10v10H20zM45 45h10v10H45zM60 45h5v5h-5zM75 50h10v5H75z" fill="#000" />
                 <path d="M40 20h15v5H40zM40 70h15v5H40zM20 45h5v10h-5z" fill="#000"/>
               </svg>
             </div>
             <p>Nội dung chuyển khoản:<br/><strong style={{color: 'var(--accent)'}}>ANTI {Math.floor(1000 + Math.random() * 9000)}</strong></p>
             <p className="qr-hint">Hệ thống xử lý tự động trong 30s sau khi chuyển khoản.</p>
          </div>
        </div>

        <div className="form-actions">
           <button className="btn btn-primary" style={{width: '100%'}}>
              Tôi đã chuyển khoản
           </button>
           <Link href="/" className="btn btn-outline" style={{width: '100%', marginTop: '1rem', display: 'block'}}>Hủy giao dịch</Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="app-container">
      <header className="simple-header">
        <Link href="/" className="logo">
          Antigravity<span>Store</span>
        </Link>
      </header>
      
      <Suspense fallback={<div className="loading" style={{color: 'white', textAlign: 'center'}}>Đang tải cấu hình...</div>}>
         <CheckoutContent />
      </Suspense>
    </div>
  );
}
