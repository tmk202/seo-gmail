const fs = require('fs');
const path = require('path');

// ==============================================================================
// CẤU HÌNH NẠP KHO (FILL INFO HERE)
// ==============================================================================
const CONFIG = {
  ADMIN_SECRET: "giaiquyetkhonggiaithich",
  API_URL: "http://127.0.0.1:3000/api/admin/inventory",
  WEBHOOK_URL: "http://localhost:3001/api/webhooks/sepay",
  PRODUCT_ID: "prod_basic" // prod_basic, prod_premium, prod_master
};

// DÁN TÀI KHOẢN VÀO ĐÂY THEO ĐỊNH DẠNG: email|password|recovery
const ACCOUNTS_TO_IMPORT = [
  "test_gmail_1@gmail.com|pass123|recovery1@gmail.com",
  "test_gmail_2@gmail.com|pass456|recovery2@gmail.com",
  "test_gmail_3@gmail.com|pass789|recovery3@gmail.com"
];

async function importAccounts() {
  console.log(`🚀 Bắt đầu nạp ${ACCOUNTS_TO_IMPORT.length} tài khoản vào kho...`);
  
  try {
    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.ADMIN_SECRET}`
      },
      body: JSON.stringify({
        productId: CONFIG.PRODUCT_ID,
        accounts: ACCOUNTS_TO_IMPORT
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ THÀNH CÔNG!');
      console.log(`- Đã nạp mới: ${data.inserted}`);
      console.log(`- Bị trùng/Bỏ qua: ${data.skipped}`);
    } else {
      console.error('❌ THẤT BẠI!');
      console.error(`- Lỗi: ${data.error}`);
    }
  } catch (error) {
    console.error('❌ LỖI KẾT NỐI:');
    console.error(error.message);
  }
}

importAccounts();
