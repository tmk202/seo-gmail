import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

// Dùng SHA-256 để tạo key 32-byte từ biến môi trường ENCRYPTION_KEY
function getSecretKey() {
  const secret = process.env.ENCRYPTION_KEY || process.env.ADMIN_SECRET || 'antigravity-fallback-secret-key-32';
  return crypto.createHash('sha256').update(secret).digest();
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getSecretKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  // Format: "iv:authTag:encryptedData"
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedData: string): string {
  try {
    const parts = encryptedData.split(':');
    // Nếu không đúng định dạng mã hóa mới, trả về chuỗi gốc (tương thích ngược với các acc plaintext cũ tạm thời)
    if (parts.length !== 3) return encryptedData; 

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedText = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, getSecretKey(), iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('[Crypto] Decryption failed');
    return '***ERR_DECRYPT***';
  }
}
