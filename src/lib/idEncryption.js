/**
 * Utility untuk mengenkripsi dan mendekripsi ID user
 * Menggunakan Base64 encoding dengan salt untuk keamanan
 */

// Secret key untuk enkripsi (gunakan environment variable di production)
const SECRET_KEY = 'mySecretKey2025';

/**
 * Enkripsi ID user menjadi token yang aman
 * @param {number|string} id - ID user yang akan dienkripsi
 * @returns {string} - Token terenkripsi
 */
export function encryptId(id) {
  if (!id) return '';
  
  // Konversi ke string dan tambahkan timestamp untuk keamanan ekstra
  const timestamp = Date.now();
  const payload = `${id}_${timestamp}_${SECRET_KEY}`;
  
  // Encode ke Base64 dan buat URL-safe
  const encoded = btoa(payload)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
    
  return encoded;
}

/**
 * Dekripsi token menjadi ID user asli
 * @param {string} token - Token terenkripsi
 * @returns {number|null} - ID user atau null jika invalid
 */
export function decryptId(token) {
  if (!token) return null;
  
  try {
    // Restore Base64 format
    let base64 = token
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }
    
    // Decode dari Base64
    const payload = atob(base64);
    const parts = payload.split('_');
    
    // Validasi format dan secret key
    if (parts.length >= 3 && parts[parts.length - 1] === SECRET_KEY) {
      const id = parseInt(parts[0]);
      // const timestamp = parseInt(parts[1]);
      
      // Optional: Validasi timestamp (misalnya token valid 24 jam)
      // const now = Date.now();
      // const maxAge = 24 * 60 * 60 * 1000; // 24 jam
      // if (now - timestamp > maxAge) return null;
      
      return isNaN(id) ? null : id;
    }
    
    return null;
  } catch (error) {
    console.error('Error decrypting ID:', error);
    return null;
  }
}

/**
 * Generate random token untuk tambahan keamanan
 * @returns {string} - Random token
 */
export function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validasi apakah token valid
 * @param {string} token - Token yang akan divalidasi
 * @returns {boolean} - True jika valid
 */
export function isValidToken(token) {
  return decryptId(token) !== null;
}
