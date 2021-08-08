import CryptoJs from "crypto-js";

export function generateKey() {
  const salt = CryptoJs.lib.WordArray.random(128 / 8);
  return CryptoJs.PBKDF2(CryptoJs.lib.WordArray.random(128 / 8), salt, {
    keySize: 512 / 32,
    iterations: 1000,
  });
}

export function encrypt(message) {}

export function decrypt(message) {}
