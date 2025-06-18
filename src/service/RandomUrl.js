export function generateRandomCode() {
  const existingCode = localStorage.getItem('admin_code');
  if (existingCode) return existingCode;
  const code = crypto.randomUUID();
  localStorage.setItem('admin_code', code);
  return code;
}
