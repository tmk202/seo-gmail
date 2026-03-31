'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AccountPage() {
  const [email, setEmail] = useState('');
  const [isSearched, setIsSearched] = useState(false);

  const mockAccounts = [
    { id: '1', date: '21/10/2026', type: 'Demo Antigravity - Premium', status: 'Hoàn thành', qty: 2, action: 'Tải File (TXT)' },
    { id: '2', date: '19/10/2026', type: 'Demo Antigravity - Basic', status: 'Hoàn thành', qty: 5, action: 'Tải File (TXT)' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().length > 5) {
       setIsSearched(true);
    }
  };

  return (
    <div className="app-container">
      <header className="simple-header">
        <Link href="/" className="logo">
          Antigravity<span>Store</span>
        </Link>
      </header>

      <div className="checkout-container fade-in">
        <h1 className="section-title">Tra cứu tài khoản</h1>
        
        <form onSubmit={handleSearch} className="checkout-card">
           <div className="input-group">
             <label>Nhập Email lúc mua hàng:</label>
             <input 
               type="email" 
               placeholder="Nhập email của bạn..." 
               value={email}
               onChange={(e) => setEmail(e.target.value)}
             />
           </div>
           
           <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '1rem'}}>
             Kiểm Tra Đơn Hàng
           </button>
        </form>

        {isSearched && (
          <div className="history-table fade-in delay-1">
             <h3 style={{marginBottom: '1rem', color: '#fff'}}>Lịch sử giao dịch:</h3>
             <table>
               <thead>
                 <tr>
                   <th>Ngày mua</th>
                   <th>Sản phẩm</th>
                   <th>Số lượng</th>
                   <th>Trạng thái</th>
                   <th>Hành động</th>
                 </tr>
               </thead>
               <tbody>
                 {mockAccounts.map(acc => (
                   <tr key={acc.id}>
                     <td>{acc.date}</td>
                     <td>{acc.type}</td>
                     <td>{acc.qty}</td>
                     <td className="status-ready">{acc.status}</td>
                     <td><button className="btn btn-outline btn-sm action-btn">{acc.action}</button></td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}
      </div>

    </div>
  );
}
