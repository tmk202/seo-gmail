---
description: Deploy dự án lên Vercel production
---

// turbo-all

## Chuẩn bị trước khi deploy

Đảm bảo bạn đã:
1. Điền đủ tất cả biến môi trường vào Vercel Dashboard (xem mục "Secrets cần thiết" bên dưới).
2. Commit toàn bộ code mới nhất.

## Bước 1 — Cài Vercel CLI (nếu chưa có)

```bash
npm install -g vercel
```

## Bước 2 — Link project với Vercel (chỉ làm 1 lần)

```bash
vercel link
```

- Chọn đúng team/account
- Chọn project tương ứng (hoặc tạo mới)
- Lấy `VERCEL_ORG_ID` và `VERCEL_PROJECT_ID` từ file `.vercel/project.json` sau khi link xong

## Bước 3 — Lấy Vercel Token

Vào: https://vercel.com/account/tokens → Tạo token mới → copy giá trị

## Bước 4 — Thêm Secrets vào GitHub Repository

Vào GitHub Repo → Settings → Secrets and variables → Actions → New repository secret

Thêm các secret sau:

| Secret Name        | Giá trị lấy từ đâu                                  |
|--------------------|------------------------------------------------------|
| `VERCEL_TOKEN`     | Vercel Account → Settings → Tokens                  |
| `VERCEL_ORG_ID`    | File `.vercel/project.json` sau khi `vercel link`   |
| `VERCEL_PROJECT_ID`| File `.vercel/project.json` sau khi `vercel link`   |
| `DATABASE_URL`     | Supabase Dashboard → Project Settings → Database    |
| `DIRECT_URL`       | Giống DATABASE_URL                                   |
| `ENCRYPTION_KEY`   | Chuỗi bí mật tự đặt (min 32 ký tự)                 |
| `ADMIN_SECRET`     | Mật khẩu admin API tự đặt                           |
| `SEPAY_API_TOKEN`  | SePay Dashboard → API Settings                      |
| `RESEND_API_KEY`   | Resend Dashboard → API Keys                         |

## Bước 5 — Deploy thủ công lần đầu (tuỳ chọn)

```bash
vercel --prod
```

## Bước 6 — Push code để kích hoạt CI/CD tự động

```bash
git add .
git commit -m "feat: initial production deploy"
git push origin main
```

Sau bước này, GitHub Actions sẽ tự động:
1. Build kiểm tra TypeScript
2. Deploy lên Vercel Production

## Kiểm tra sau deploy

- Mở URL Vercel được cấp → test mua hàng
- Kiểm tra Vercel Dashboard → Functions → xem logs Runtime
- Ping thử API: `curl https://your-domain.vercel.app/api/orders?email=test@test.com&orderCode=ANTI-TEST`
