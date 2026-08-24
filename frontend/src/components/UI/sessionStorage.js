// src/utils/sessionStorage.js
import { encryptData, decryptData } from './crypto';

export const setSessionStorage = (key, value) => {
  const encryptedValue = encryptData(value);
  sessionStorage.setItem(key, encryptedValue);
};

export const getSessionStorage = (key) => {
  const encryptedValue = sessionStorage.getItem(key);
  if (!encryptedValue) {
    return null;
  }
  return decryptData(encryptedValue);
};

export const removeSessionStorage = (key) => {
  sessionStorage.removeItem(key);
};
