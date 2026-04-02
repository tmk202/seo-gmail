import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

interface AccountInfo {
  email: string;
  password: string;
  recoveryEmail?: string | null;
}

interface SendAccountEmailParams {
  toEmail: string;
  orderCode: string;
  productName: string;
  accounts: AccountInfo[];
}

export async function sendAccountEmail({
  toEmail,
  orderCode,
  productName,
  accounts,
}: SendAccountEmailParams) {
  const accountRows = accounts
    .map(
      (acc, i) =>
        `<tr style="background:${i % 2 === 0 ? '#0d0d0d' : '#111'}">
          <td style="padding:10px 14px;border-bottom:1px solid #222;color:#e0e0e0">${acc.email}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #222;color:#22d3ee;font-family:monospace">${acc.password}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #222;color:#aaa">${acc.recoveryEmail ?? '—'}</td>
        </tr>`
    )
    .join('');

  const { data, error } = await resend.emails.send({
    from: 'Antigravity Store <no-reply@antigravity-store.com>',
    to: toEmail,
    subject: `[${orderCode}] Tài khoản ${productName} của bạn đã sẵn sàng!`,
    html: `
      <div style="background:#000;font-family:sans-serif;padding:40px 20px;max-width:640px;margin:0 auto">
        <h1 style="color:#22d3ee;font-size:24px;margin-bottom:8px">Antigravity<span style="color:#fff">Store</span></h1>
        <p style="color:#aaa;font-size:14px;margin-bottom:32px">Mã đơn hàng: <strong style="color:#fff">${orderCode}</strong></p>

        <p style="color:#e0e0e0;margin-bottom:20px">Xin chào! Đơn hàng của bạn đã được xử lý thành công. Dưới đây là thông tin tài khoản <strong style="color:#22d3ee">${productName}</strong> của bạn:</p>

        <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px solid #222">
          <thead>
            <tr style="background:#111">
              <th style="padding:10px 14px;text-align:left;color:#fff;font-size:13px">Email</th>
              <th style="padding:10px 14px;text-align:left;color:#fff;font-size:13px">Mật khẩu</th>
              <th style="padding:10px 14px;text-align:left;color:#fff;font-size:13px">Recovery Email</th>
            </tr>
          </thead>
          <tbody>${accountRows}</tbody>
        </table>

        <p style="color:#666;font-size:12px;margin-top:32px;border-top:1px solid #222;padding-top:20px">
          Bạn cũng có thể tra cứu lại đơn hàng tại: <a href="https://your-domain.com/account" style="color:#22d3ee">your-domain.com/account</a><br/>
          Mọi thắc mắc vui lòng liên hệ qua Telegram hoặc Email hỗ trợ.
        </p>
      </div>
    `,
  });

  if (error) throw new Error(`Resend error: ${error.message}`);
  return data;
}
