'use client';

import React from 'react';
import Link from 'next/link';

export default function Home() {
  const products = [
    {
      id: "basic",
      name: "Tài Khoản Demo Antigravity - Basic",
      price: "15.000đ",
      stock: "Sẵn sàng (15k)",
    },
    {
      id: "premium",
      name: "Tài Khoản Demo Antigravity - Premium",
      price: "35.000đ",
      stock: "Sẵn sàng (5k)",
    },
    {
      id: "master",
      name: "Tài Khoản Demo Antigravity - Master",
      price: "90.000đ",
      stock: "Giới hạn (200)",
    }
  ];

  return (
    <div className="app-container">
      <header className="simple-header fade-in">
        <Link href="/" className="logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 7.00005L10.2 11.65C11.2667 12.45 12.7333 12.45 13.8 11.65L20 7" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Antigravity<span>Store</span>
        </Link>
        <div className="header-actions">
          <Link href="/account" className="btn btn-outline btn-sm">Tài Khoản</Link>
        </div>
      </header>

      <main className="main-content fade-in delay-1">
        <h1 className="main-title">Tuyển chọn Gmail Tài Khoản Demo Antigravity</h1>
        
        <div className="products-list">
          {products.map((product) => (
            <div className="product-row" key={product.id}>
              <div className="product-info">
                <h2>{product.name}</h2>
                <span className="product-stock status-ready">{product.stock}</span>
              </div>
              
              <div className="product-action">
                <div className="product-price">{product.price}</div>
                <Link href={`/checkout?plan=${product.id}`} className="btn btn-primary btn-sm">Mua Ngay</Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="fade-in delay-2 simple-footer">
        <p>&copy; {new Date().getFullYear()} Antigravity Mạng Lưới Phân Phối Kín.</p>
      </footer>
    </div>
  );
}
