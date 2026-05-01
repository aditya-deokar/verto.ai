import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

/**
 * Encrypts a piece of text using AES-256-GCM.
 * @param text The plain text to encrypt.
 * @returns An object containing the encrypted string, IV, and auth tag.
 */
export function encryptKey(text: string) {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY is not defined in environment variables');
  }

  // Ensure the key is 32 bytes
  const key = crypto.scryptSync(encryptionKey, 'salt', 32);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag().toString('hex');

  return {
    key: encrypted,
    iv: iv.toString('hex'),
    tag: tag,
  };
}

/**
 * Decrypts a piece of text using AES-256-GCM.
 * @param encrypted The encrypted hex string.
 * @param iv The hex initialization vector.
 * @param tag The hex authentication tag.
 * @returns The decrypted plain text.
 */
export function decryptKey(encrypted: string, iv: string, tag: string) {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY is not defined in environment variables');
  }

  const key = crypto.scryptSync(encryptionKey, 'salt', 32);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(tag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Masks an API key for display in the UI.
 * @param key The plain text API key.
 * @returns A masked version of the key.
 */
export function maskKey(key: string) {
  if (key.length <= 8) return '••••••••';
  return `${key.substring(0, 4)}••••••••${key.substring(key.length - 4)}`;
}
