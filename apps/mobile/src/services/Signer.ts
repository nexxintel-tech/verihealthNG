import CryptoJS from 'crypto-js';

// Signs payloads using HMAC-SHA256 with the device_secret from SecureDeviceStore
// Timestamp is included in payload; server accepts ±5 minutes tolerance.

export function signPayloadHex(deviceSecret: string, payload: string | object, timestamp?: string): string {
  const ts = timestamp ?? new Date().toISOString();
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const message = `${ts}.${body}`;
  const hash = CryptoJS.HmacSHA256(message, deviceSecret);
  return CryptoJS.enc.Hex.stringify(hash);
}

export default signPayloadHex;
