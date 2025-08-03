import { GoogleGenerativeAI } from '@google/generative-ai';

// Konfigurasi agar Vercel mengenali ini sebagai Edge Function
export const config = {
  runtime: 'edge',
};

// Fungsi yang akan dijalankan sebagai endpoint
export default async (req) => {
  // Ambil prompt dari body request
  const { prompt } = await req.json();

  // Ambil API Key dari environment variable
  // Kunci ini hanya akan tersedia saat di-deploy ke Vercel atau saat local development
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ message: text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in Edge Function:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate response.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};