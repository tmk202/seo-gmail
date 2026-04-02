'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface OrderInfo {
  id: string;
  orderCode: string;
  totalAmount: number;
  productName: string;
  quantity: number;
  customerEmail: string;
}

const PRODUCTS: Record<string, { id: string; name: string; price: number }> = {
  basic:   { id: 'prod_basic',   name: 'Demo Antigravity - Basic',   price: 15000 },
  premium: { id: 'prod_premium', name: 'Demo Antigravity - Premium', price: 35000 },
  master:  { id: 'prod_master',  name: 'Demo Antigravity - Master',  price: 90000 },
};

// ===== Bank info — điền vào đây sau khi tạo tài khoản SePay =====
const BANK_BIN  = '970436';    // VD: 970436 = Vietcombank. Tra cứu tại vietqr.io/danh-sach-ngan-hang
const BANK_ACCT = '1234567890'; // Số tài khoản ngân hàng thực của bạn

function buildVietQRUrl(amount: number, description: string): string {
  return `https://img.vietqr.io/image/${BANK_BIN}-${BANK_ACCT}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=ANTIGRAVITY%20STORE`;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'basic';

  const currentPlan = PRODUCTS[plan] || PRODUCTS.basic;

  const [quantity, setQuantity]   = useState(1);
  const [email, setEmail]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');
  const [order, setOrder]         = useState<OrderInfo | null>(null);

  const total = currentPlan.price * quantity;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Vui lòng nhập email nhận hàng.'); return; }

    setIsLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: currentPlan.id,
          quantity,
          customerEmail: email.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Đã có lỗi xảy ra.'); return; }
      setOrder(data.order);
    } catch {
      setError('Không thể kết nối tới server. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }

  // ── Hiển thị QR Code sau khi tạo đơn thành công ──
  if (order) {
    const qrUrl = buildVietQRUrl(order.totalAmount, order.orderCode);
    return (
      <div className="checkout-container fade-in">
        <div className="checkout-card">
          <h2 className="section-title">Quét QR để thanh toán</h2>

          <div className="order-summary" style={{ marginBottom: '1.5rem' }}>
            <div className="summary-item">
              <span>Sản phẩm:</span>
              <strong>{order.productName}</strong>
            </div>
            <div className="summary-item">
              <span>Số lượng:</span>
              <strong>{order.quantity}</strong>
            </div>
            <div className="summary-item total">
              <span>Tổng thanh toán:</span>
              <span className="price">{order.totalAmount.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

          <div className="payment-method">
            <div className="qr-box">
              {/* QR Code thật từ VietQR */}
              <img
                src={qrUrl}
                alt="VietQR Code"
                style={{ width: 220, height: 220, borderRadius: 8, display: 'block', margin: '0 auto 1rem' }}
              />
              <p>Nội dung chuyển khoản bắt buộc:</p>
              <p style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: 2 }}>
                {order.orderCode}
              </p>
              <p className="qr-hint">Hệ thống xử lý tự động trong ~30 giây sau khi tiền vào tài khoản.</p>
              <p className="qr-hint" style={{ marginTop: '0.5rem' }}>
                Tài khoản sẽ được gửi tới: <strong style={{ color: '#fff' }}>{order.customerEmail}</strong>
              </p>
            </div>
          </div>

          <Link href={`/account`} className="btn btn-outline" style={{ width: '100%', display: 'block', marginTop: '1rem', textAlign: 'center' }}>
            Tra cứu đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  // ── Form đặt hàng ──
  return (
    <div className="checkout-container fade-in">
      <form className="checkout-card" onSubmit={handleSubmit}>
        <h2 className="section-title">Thanh toán đơn hàng</h2>

        <div className="order-summary">
          <div className="summary-item">
            <span>Sản phẩm:</span>
            <strong>{currentPlan.name}</strong>
          </div>
          <div className="summary-item">
            <span>Số lượng:</span>
            <div className="quantity-control">
              <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
              <input readOnly value={quantity} />
              <button type="button" onClick={() => setQuantity(q => Math.min(100, q + 1))}>+</button>
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
            required
          />
        </div>

        {error && (
          <p style={{ color: '#f87171', fontSize: '0.9rem', marginBottom: '1rem', background: 'rgba(248,113,113,0.1)', padding: '0.75rem', borderRadius: 8 }}>
            ⚠️ {error}
          </p>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
            {isLoading ? 'Đang tạo đơn...' : 'Tạo đơn & Nhận QR Code'}
          </button>
          <Link href="/" className="btn btn-outline" style={{ width: '100%', marginTop: '1rem', display: 'block', textAlign: 'center' }}>
            Hủy giao dịch
          </Link>
        </div>
      </form>
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

      <Suspense fallback={<div className="loading" style={{ color: 'white', textAlign: 'center' }}>Đang tải...</div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}
