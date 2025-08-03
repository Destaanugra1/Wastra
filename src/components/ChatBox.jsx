import { BotMessageSquare } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const quickReplies = [
  { text: 'Apa jam buka toko?', reply: 'Toko Batik kami buka setiap hari pukul 08.00 - 20.00.' },
  { text: 'Apakah bisa COD?', reply: 'Kami tidak melayani Cash on Delivery (COD) atau cash or duel😊.' },
  { text: 'Ada promo apa hari ini?', reply: 'Saat ini ada promo diskon 10% untuk pembelian di atas Rp200.000.' },
  { text: 'Bagaimana cara order?', reply: 'Anda bisa order melalui website ini atau chat admin kami.' },
];

const keywordTriggers = [
  { keyword: /halo|hallo|hai|hello/i, reply: 'Halo! Ada yang bisa kami bantu? 😊' },
  { keyword: /order|pesan|beli|cara order|cara pesan/i, reply: 'Anda bisa order melalui website ini atau chat admin kami.' },
  { keyword: /jam buka|buka toko|jam operasional/i, reply: 'Toko Batik kami buka setiap hari pukul 08.00 - 20.00.' },
  { keyword: /alamat|lokasi/i, reply: 'Jl. Garuda Makmur, Semuli Raya Abung Semuli, Lampung utara, Lampung.' },
  { keyword: /ongkir|pengiriman/i, reply: 'Ongkir mengikuti tarif ekspedisi JNE, J&T, dan SiCepat.' },
  { keyword: /bahan/i, reply: 'Kami menggunakan bahan katun premium untuk semua produk.' },
  { keyword: /admin/i, reply: 'Admin kami siap membantu Anda, silakan tulis pertanyaan Anda.' },
  { keyword: /cod/i, reply: 'Kami tidak melayani Cash on Delivery (COD), di takutkan cash or duel😊.' },
  { keyword: /promo|diskon/i, reply: 'Saat ini ada promo diskon 10% untuk pembelian di atas Rp200.000.' },
];

const defaultWelcome = 'Halo! Ada yang bisa kami bantu? Pilih pertanyaan cepat atau ketik pesan Anda.';


const ChatBox = ({ open, onClose }) => {
  const [messages, setMessages] = useState([
    { from: 'cs', text: defaultWelcome }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) setMessages([{ from: 'cs', text: defaultWelcome }]);
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (text) => {
    if (!text.trim()) return;
    setMessages((msgs) => [...msgs, { from: 'user', text }]);
    setInput('');
    // Cek semua trigger, ambil balasan pertama yang cocok
    const trigger = keywordTriggers.find(k => k.keyword.test(text));
    if (trigger) {
      setTimeout(() => {
        setMessages((msgs) => [
          ...msgs,
          { from: 'cs', text: trigger.reply }
        ]);
      }, 600);
    } else {
      setLoading(true);
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) throw new Error('API key Gemini tidak ditemukan di file .env');

        const genAI = new GoogleGenerativeAI(apiKey);
        // Mengganti model ke versi yang lebih baru, mungkin lebih kompatibel
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

        const system_prompt = `
        Anda adalah "CS Wastra", asisten customer service virtual untuk sebuah toko online yang menjual batik premium. Nama toko kami adalah 'Toko Batik Wastra'.

        Tugas Anda adalah menjawab pertanyaan pelanggan dengan ramah, informatif, dan HANYA seputar produk dan layanan kami. JANGAN menjawab pertanyaan di luar topik ini. Jika ada pertanyaan di luar konteks, jawab dengan sopan bahwa Anda hanya bisa membantu terkait produk batik kami.

        Berikan email saya pada akhir jawaban jika pelanggan meminta informasi lebih lanjut atau ingin menghubungi admin dengan email destaanugrapratama@gmail.com, dengan sekali enter.

        Berikut adalah informasi tentang toko kami:
        - Nama Toko: Toko Batik Wastra
        - Produk: Batik premium (kemeja, kain, dress, dll.)
        - Jam Buka: Setiap hari, pukul 08.00 - 20.00 WIB.
        - Alamat: Jl. Garuda Makmur, Semuli Raya Abung Semuli, Lampung utara, Lampung.
        - Bahan: Kami menggunakan bahan katun premium berkualitas tinggi.
        - Promo Saat Ini: Diskon 10% untuk total pembelian di atas Rp200.000.
        - Cara Order: Pelanggan bisa order langsung melalui website atau dengan bantuan Anda di chat ini.
        - Pembayaran: Maaf kami Tidak melayani layanan COD.
        - Pengiriman: Kami menggunakan ekspedisi JNE, J&T, dan SiCepat. Ongkir disesuaikan dengan tarif ekspedisi.

        Gunakan informasi ini untuk menjawab pertanyaan pelanggan berikut. Selalu jawab dalam Bahasa Indonesia yang baik dan sopan.

        Pertanyaan Pelanggan: "${text}"
        `;

        const result = await model.generateContent(system_prompt);
        const response = await result.response;
        const aiText = response.text();

        setMessages((msgs) => [
          ...msgs,
          { from: 'cs', text: aiText || 'Maaf, CS sedang offline.' }
        ]);
      } catch (err) {
        console.error("Detail Error dari Gemini API:", err);
        setMessages((msgs) => [
          ...msgs,
          { from: 'cs', text: 'Error: Gagal menghubungi AI. Cek konsol browser untuk detail.' }
        ]);
      }
      setLoading(false);
    }
  };

  const handleQuickReply = (reply) => {
    setMessages((msgs) => [
      ...msgs,
      { from: 'user', text: reply.text },
      { from: 'cs', text: reply.reply }
    ]);
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-20 right-6 z-50 w-80 max-w-full bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-[#a6603a] rounded-t-xl">
        <div className="flex items-center space-x-2">
          <span className="h-8 w-8 bg-[#a6603a] rounded-full flex items-center justify-center">
            <BotMessageSquare />
          </span>
          <span className="text-white font-semibold">CS Wastra</span>
        </div>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-gray-50" style={{ maxHeight: 320 }}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.from === 'cs' ? 'justify-start' : 'justify-end'}`}>
            <div className={`px-3 py-2 rounded-lg text-sm ${msg.from === 'cs' ? 'bg-green-100 text-gray-800' : 'bg-[#a6603a] text-white'}`}>{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-lg text-sm bg-green-100 text-gray-800 flex items-center space-x-1">
              <span className="animate-bounce-slow delay-0 inline-block">.</span>
              <span className="animate-bounce-slow delay-150 inline-block">.</span>
              <span className="animate-bounce-slow delay-300 inline-block">.</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Quick Replies */}
      <div className="flex flex-wrap gap-2 px-4 pb-2">
        {quickReplies.map((qr, i) => (
          <button key={i} onClick={() => handleQuickReply(qr)} className="bg-green-200 text-green-900 px-3 py-1 rounded-full text-xs hover:bg-green-300 transition">
            {qr.text}
          </button>
        ))}
      </div>
      {/* Input */}
      <form className="flex items-center border-t px-2 py-2  bg-white rounded-b-xl" onSubmit={e => { e.preventDefault(); handleSend(input); }}>
        <input
          type="text"
          className="flex-1 px-3 py-2 text-green-600 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
          placeholder="Tulis pesan..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(input); }}
        />
        <button type="submit" className="ml-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm">Kirim</button>
      </form>
    </div>
  );
};

export default ChatBox;
