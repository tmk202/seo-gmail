'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Account {
  email: string;
  password: string;
  recoveryEmail?: string | null;
}

interface Order {
  id: string;
  orderCode: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'DELIVERED';
  createdAt: string;
  accounts: Account[];
}

const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  PENDING:   { text: 'Chờ thanh toán', color: '#f59e0b' },
  PAID:      { text: 'Đang xử lý…',   color: '#22d3ee' },
  DELIVERED: { text: 'Hoàn thành',    color: '#10b981' },
};

function downloadTxt(order: Order) {
  const lines = order.accounts.map(
    (a) => `${a.email}|${a.password}|${a.recoveryEmail ?? ''}`
  );
  const content = `Đơn hàng: ${order.orderCode}\nSản phẩm: ${order.productName}\n\n${lines.join('\n')}`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${order.orderCode}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AccountPage() {
  const [email, setEmail]         = useState('');
  const [orderCode, setOrderCode] = useState('');
  const [orders, setOrders]       = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');
  const [searched, setSearched]   = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSearched(false);
    if (!email.trim() || !orderCode.trim()) {
      setError('Vui lòng nhập đầy đủ Email và Mã đơn hàng.');
      return;
    }

    setIsLoading(true);
    try {
      const qEmail = encodeURIComponent(email.trim());
      const qCode  = encodeURIComponent(orderCode.trim().toUpperCase());
      const res = await fetch(`/api/orders?email=${qEmail}&orderCode=${qCode}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Đã có lỗi.'); return; }
      setOrders(data.orders);
      setSearched(true);
    } catch {
      setError('Không kết nối được server.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app-container">
      <header className="simple-header">
        <Link href="/" className="logo">
          Antigravity<span>Store</span>
        </Link>
      </header>

      <div className="checkout-container fade-in">
        <h1 className="section-title">Tra cứu đơn hàng</h1>

        <form onSubmit={handleSearch} className="checkout-card">
          <div className="input-group">
            <label>Nhập Email lúc mua hàng:</label>
            <input
              type="email"
              placeholder="vd: you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Mã tra cứu đơn hàng (ANTI-XXXX):</label>
            <input
              type="text"
              placeholder="Nhập mã bắt đầu bằng ANTI"
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              required
            />
          </div>
          {error && (
            <p style={{ color: '#f87171', marginBottom: '1rem', fontSize: '0.9rem' }}>⚠️ {error}</p>
          )}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={isLoading}>
            {isLoading ? 'Đang tìm...' : 'Kiểm Tra Đơn Hàng'}
          </button>
        </form>

        {searched && orders.length === 0 && (
          <div className="checkout-card" style={{ textAlign: 'center', color: '#aaa' }}>
            Không tìm thấy đơn hàng nào với email này.
          </div>
        )}

        {orders.map((order) => {
          const s = STATUS_LABEL[order.status] ?? STATUS_LABEL.PENDING;
          return (
            <div key={order.id} className="checkout-card fade-in" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontFamily: 'monospace', color: 'var(--accent)', fontWeight: 700, fontSize: '1rem' }}>{order.orderCode}</span>
                  <span style={{ marginLeft: '0.75rem', color: '#aaa', fontSize: '0.85rem' }}>
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <span style={{ color: s.color, fontWeight: 600, fontSize: '0.85rem', background: `${s.color}22`, padding: '3px 12px', borderRadius: 20, border: `1px solid ${s.color}44` }}>
                  {s.text}
                </span>
              </div>

              <div className="order-summary" style={{ marginBottom: order.status === 'DELIVERED' ? '1rem' : 0 }}>
                <div className="summary-item">
                  <span>Sản phẩm:</span>
                  <strong>{order.productName} × {order.quantity}</strong>
                </div>
                <div className="summary-item total">
                  <span>Tổng tiền:</span>
                  <span className="price">{order.totalAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              {order.status === 'DELIVERED' && order.accounts.length > 0 && (
                <div>
                  <div className="history-table" style={{ marginBottom: '0.75rem' }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Email</th>
                          <th>Mật khẩu</th>
                          <th>Recovery</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.accounts.map((acc, i) => (
                          <tr key={i}>
                            <td>{acc.email}</td>
                            <td style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{acc.password}</td>
                            <td style={{ color: '#888' }}>{acc.recoveryEmail ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => downloadTxt(order)}
                    style={{ fontSize: '0.85rem' }}
                  >
                    ⬇ Tải File TXT
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
