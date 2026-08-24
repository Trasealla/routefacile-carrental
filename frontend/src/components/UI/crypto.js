// src/utils/crypto.js
import CryptoJS from 'crypto-js';

const secretKey = 'your-secret-key'; // Use a secure key and keep it secret

export const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
};

export const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};
