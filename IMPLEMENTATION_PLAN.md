# Kế Hoạch Triển Khai Backend & Hệ Thống Tự Động Hóa G-Store

Bản kế hoạch này nhằm định hướng chi tiết việc biến giao diện Front-end (Next.js) hiện tại thành một ứng dụng thương mại điện tử **Hoàn toàn tự động (Auto-delivery)** chuyên phân phối tài khoản số (Gmail).

---

## 🏗️ 1. Kiến Trúc Database (Kho Chứa Lõi)

**Công nghệ:** Supabase (PostgreSQL) + Prisma ORM  
**Lý do:** Miễn phí cho dự án nhỏ, độ trễ thấp, tích hợp hoàn hảo với Next.js App Router (Server Actions).

### Sơ đồ Database (ERD):

| Bảng | Mô tả | Các cột chính |
|------|--------|---------------|
| `Products` | Chứa thông tin các gói sản phẩm | `id`, `name`, `price`, `description`, `is_active` |
| `Accounts` | Kho chứa tài khoản Gmail | `id`, `product_id`, `email`, `password`, `recovery_email`, `status` (AVAILABLE / SOLD) |
| `Orders` | Đơn hàng của khách | `id`, `order_code` (ANTI-XXXX), `customer_email`, `total_price`, `quantity`, `product_id`, `status` (PENDING / PAID / DELIVERED), `created_at` |
| `Order_Items` | Mapping 1 đơn hàng - nhiều Accounts | `order_id`, `account_id` |

### Yêu cầu bảo mật:
- Mã hóa trường `password` và `recovery_email` trong DB bằng AES-256.
- Sử dụng Row Level Security (RLS) của Supabase để ngăn truy cập trái phép.

---

## 💸 2. Tự Động Hóa Thanh Toán (Payment Webhook)

**Công nghệ:** SePay hoặc Casso.vn (có gói Free cho lưu lượng thấp).

### Luồng Hoạt Động:

```
Khách bấm "Mua Ngay"
       │
       ▼
Hệ thống tạo mã GD: ANTI_5892
Lưu vào DB Orders (status: PENDING)
Hiển thị VietQR Code động
       │
       ▼
Khách quét QR → Chuyển khoản
       │
       ▼
Tiền vào tài khoản ngân hàng thật
       │
       ▼
SePay/Casso nhận biến động số dư
       │
       ▼
Webhook POST /api/webhooks/payment
       │
       ▼
Hệ thống kiểm tra:
  - Description chứa "ANTI_5892"?
  - Amount == total_price?
       │
       ▼
✅ Khớp → Cập nhật Orders → status: PAID
       → Kích hoạt Delivery tự động
❌ Không khớp → Bỏ qua / Log lỗi
```

### Bảo mật Webhook:
- Xác thực `X-Signature` header từ SePay/Casso.
- Rate limiting trên endpoint `/api/webhooks/payment`.
- Chỉ cho phép IP whitelist của SePay/Casso gọi vào.

---

## 🚚 3. Hệ Thống Trả Hàng Tự Động (Delivery)

Ngay khi Webhook báo **PAID**, hệ thống kích hoạt luồng Delivery:

### Luồng xử lý:

1. **Trích xuất kho:** Dựa vào `product_id` và `quantity`, chạy query:
   ```sql
   SELECT * FROM Accounts 
   WHERE product_id = ? AND status = 'AVAILABLE' 
   LIMIT [quantity]
   FOR UPDATE SKIP LOCKED;
   ```
   > Dùng `FOR UPDATE SKIP LOCKED` (DB Transaction) để ngăn 2 khách mua trùng 1 acc.

2. **Khóa hàng:** Update trạng thái các Accounts thành **SOLD**, gắn vào bảng `Order_Items`.

3. **Gửi Email tự động:** Dùng **Resend** (hoặc Nodemailer) gửi danh sách `email|pass|recovery` cho khách.

4. **Hiển thị trên web:** Trang `/account` query DB theo `customer_email`, render nút **Tải File (TXT)** chứa thông tin tài khoản đã mua.

5. **Cập nhật trạng thái:** Đơn hàng chuyển từ PAID → **DELIVERED**.

---

## ⚙️ 4. Admin Dashboard (Trang Quản Trị)

**Bảo mật:** Sử dụng **NextAuth** (hoặc Clerk) để xác thực, chặn mọi người lạ.

### Tính năng chính (`/admin`):

| Module | Mô tả |
|--------|--------|
| **Dashboard** | Tổng acc còn trong kho (theo từng loại), doanh thu hôm nay/tuần/tháng, biểu đồ đơn hàng |
| **Quản lý Kho** | Form Textarea cho phép paste hàng loạt format `email\|pass\|recovery`. Hệ thống tự parse và INSERT vào bảng `Accounts` |
| **Upload File** | Nút Upload file `.txt` chứa hàng nghìn dòng, hệ thống đọc và nạp kho tự động |
| **Quản lý Đơn hàng** | Xem tất cả đơn, nút "Xác nhận tay" nếu Webhook lỗi, nút "Hoàn tiền" |
| **Sửa Sản phẩm** | Thay đổi giá, tên gói, bật/tắt sản phẩm |

---

## 🚦 Lộ Trình Phát Triển (Roadmap)

### Phase 1: Tạo Nền Tảng Data & Logic Checkout (2 ngày)
- [ ] Setup Supabase, viết Prisma Schema cho 4 bảng.
- [ ] Tạo API Route `POST /api/checkout` sinh mã GD random, lưu đơn PENDING.
- [ ] Tạo API VietQR Code động (dùng VietQR API public).
- [ ] Sửa trang `/checkout` gọi API thật thay vì mock.

### Phase 2: Tích hợp Webhook & Auto-Delivery (2 ngày)
- [ ] Đăng ký SePay/Casso, lấy API Key.
- [ ] Xây dựng `POST /api/webhooks/payment` xử lý callback.
- [ ] Viết logic trích kho Account + khóa Transaction.
- [ ] Tích hợp Resend để gửi Email tự động.
- [ ] Sửa trang `/account` query DB thay vì mock data.

### Phase 3: Admin Dashboard & Bảo Mật (1 ngày)
- [ ] Tích hợp NextAuth bảo vệ route `/admin`.
- [ ] Xây UI form paste/upload Account hàng loạt.
- [ ] Dashboard thống kê kho + doanh thu.
- [ ] Tối ưu performance, deploy lên Vercel.

---

> **Tổng kết:** Với kiến trúc Next.js (Full-stack) + Supabase (Database) + SePay (Payment Gateway) + Resend (Email), hệ thống sẽ hoạt động hoàn toàn tự động 24/7 mà không cần người trực.
