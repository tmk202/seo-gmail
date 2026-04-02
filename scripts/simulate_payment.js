// ==============================================================================
// SCRIPT GIẢ LẬP THANH TOÁN (SIMULATE SEPAY WEBHOOK)
// Dùng để test quá trình xuất kho và gửi email khi có người thanh toán thành công
// ==============================================================================

const CONFIG = {
  WEBHOOK_URL: "http://localhost:3001/api/webhooks/sepay",
  AUTH_TOKEN: "sepay_abc123456789", // Khớp với SEPAY_API_TOKEN trong .env
  ORDER_CODE: "ANTI-12345678", // Thay bằng mã đơn bạn vừa tạo sau khi checkout trên web
  AMOUNT: 15000 // Thay bằng số tiền thực tế (VD: 15000 cho Basic)
};

async function simulatePayment() {
  console.log(`💳 Đang giả lập thanh toán cho đơn: ${CONFIG.ORDER_CODE}...`);

  const payload = {
    id: 12345678, // ID giao dịch từ bank
    gateway: "VCB",
    transactionDate: new Date().toISOString(),
    accountNumber: "123456789",
    transferType: "in",
    transferAmount: CONFIG.AMOUNT,
    accumulated: 1000000,
    content: `Chuyen tien don hang ${CONFIG.ORDER_CODE}`,
    referenceCode: "ABC-XYZ"
  };

  try {
    const response = await fetch(CONFIG.WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CONFIG.AUTH_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ TRẢ VỀ THÀNH CÔNG:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.error('❌ TRẢ VỀ LỖI:');
      console.error(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ LỖI KẾT NỐI:');
    console.error(error.message);
  }
}

simulatePayment();
