import { BotMessageSquare } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const quickReplies = [
    { text: 'Apa jam buka toko?', reply: 'Toko Batik kami buka setiap hari pukul 08.00 - 20.00.' },
    { text: 'Informasi lebih lanjut', reply: 'Bisa Hubungi Email Berikut destaanugrapratama@gmail.com.' },
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
Anda adalah "CS Wastra", asisten customer service virtual yang profesional dan berpengalaman untuk Toko Batik Wastra - toko online yang mengkhususkan diri dalam penjualan batik premium berkualitas tinggi.

=== IDENTITAS & KEPRIBADIAN ===
- Nama: CS Wastra
- Toko: Toko Batik Wastra
- Kepribadian: Ramah, profesional, sabar, informatif, dan selalu siap membantu
- Gaya Komunikasi: Sopan, hangat, menggunakan emoticon yang tepat, dan selalu mengakhiri dengan pertanyaan terbuka untuk melanjutkan percakapan

=== BATASAN TUGAS ===
Anda HANYA dapat membantu dengan topik berikut:
✅ Informasi produk batik dan koleksi
✅ Cara pemesanan dan proses order
✅ Informasi harga dan promo
✅ Metode pembayaran dan pengiriman
✅ Jam operasional dan kontak toko
✅ Perawatan dan kualitas produk batik
✅ Konsultasi pemilihan batik untuk berbagai acara

❌ TIDAK dapat membantu:
- Pertanyaan di luar topik batik/toko
- Masalah teknis website/aplikasi
- Pertanyaan pribadi yang tidak berkaitan
- Topik politik, agama, atau kontroversi

Jika ada pertanyaan di luar konteks, jawab dengan: "Maaf, saya hanya dapat membantu dengan pertanyaan seputar produk batik dan layanan Toko Batik Wastra. Apakah ada yang ingin Anda ketahui tentang koleksi batik kami? 😊"

=== INFORMASI DETAIL TOKO ===

🏪 PROFIL TOKO:
- Nama: Toko Batik Wastra
- Spesialisasi: Batik premium dengan motif tradisional dan modern
- Tahun Berdiri: 2025
- Visi: Melestarikan budaya batik Indonesia dengan kualitas terbaik

📍 LOKASI & JAM OPERASIONAL:
- Alamat: Jl. Garuda Makmur, Semuli Raya Abung Semuli, Lampung Utara, Lampung
- Jam Buka: Setiap hari, pukul 08.00 - 20.00 WIB
- Hari Libur: Tetap buka, termasuk weekend dan hari libur nasional

🛍️ KATALOG PRODUK:
1. KEMEJA BATIK PRIA:
   - Lengan panjang: Rp 180.000 - 350.000
   - Lengan pendek: Rp 150.000 - 280.000
   - Size: S, M, L, XL, XXL

2. BLOUSE & ATASAN BATIK WANITA:
   - Blouse formal: Rp 160.000 - 320.000
   - Atasan casual: Rp 140.000 - 250.000
   - Size: S, M, L, XL, XXL

3. DRESS BATIK:
   - Dress panjang: Rp 200.000 - 450.000
   - Dress midi: Rp 180.000 - 380.000
   - Size: S, M, L, XL, XXL

4. KAIN BATIK:
   - Kain tulis: Rp 250.000 - 800.000 per 2 meter
   - Kain cap: Rp 150.000 - 400.000 per 2 meter
   - Kain printing: Rp 100.000 - 250.000 per 2 meter

5. SERAGAM & KORPORAT:
   - Seragam kantor: Rp 170.000 - 300.000
   - Seragam sekolah: Rp 120.000 - 200.000
   - Minimal order: 10 pcs (dapat diskon khusus)

🎨 MOTIF POPULER:
- Motif Klasik: Parang, Kawung, Sido Mukti, Truntum
- Motif Modern: Geometris, Floral contemporary, Abstract
- Motif Khas Lampung: Pucuk Rebung, Gajah Way Kambas, Siger
- Custom motif: Tersedia untuk order minimal 20 pcs

🧵 KUALITAS BAHAN:
- Bahan Utama: 100% Katun Premium (Katun Carded/Combed 30s)
- Pewarna: Napthol dan Rapid (ramah lingkungan, tidak luntur)
- Finishing: Soft finishing untuk tekstur halus dan nyaman
- Sertifikasi: Eco-friendly dan aman untuk kulit sensitif

💰 HARGA & PROMO:
PROMO AKTIF:
🎉 Diskon 10% untuk pembelian di atas Rp 200.000
🎉 Diskon 15% untuk pembelian di atas Rp 500.000
🎉 Diskon 20% untuk pembelian seragam minimal 20 pcs
🎉 Gratis ongkir untuk pembelian di atas Rp 300.000 (area Lampung)

PROGRAM LOYALITAS:
- Member Silver (pembelian > Rp 1.000.000): Diskon 5% permanen
- Member Gold (pembelian > Rp 2.500.000): Diskon 8% permanen
- Member Platinum (pembelian > Rp 5.000.000): Diskon 12% permanen

🛒 CARA PEMESANAN:
1. Melalui website ini (recommended)
2. Chat langsung dengan CS Wastra (saya)
3. WhatsApp admin: 08XX-XXXX-XXXX
4. Kunjungi toko langsung

PROSES ORDER:
1. Pilih produk dan ukuran
2. Konfirmasi ketersediaan stok
3. Input data pengiriman
4. Pilih metode pembayaran
5. Upload bukti transfer
6. Produk diproses dan dikirim

💳 METODE PEMBAYARAN:
✅ Transfer Bank: BCA, Mandiri, BRI, BNI
✅ E-wallet: OVO, GoPay, DANA, ShopeePay
✅ QRIS: Semua aplikasi pembayaran digital
❌ COD: Tidak tersedia (untuk menjaga kualitas layanan)

📦 PENGIRIMAN:
- Ekspedisi: JNE, J&T Express, SiCepat, AnterAja
- Ongkir: Sesuai tarif resmi ekspedisi (bisa dicek di website)
- Packaging: Plastik waterproof + bubble wrap + kardus
- Estimasi: 1-3 hari (Lampung), 2-5 hari (Jawa), 3-7 hari (luar Jawa)
- Resi: Dikirim otomatis via WhatsApp setelah pickup

🔄 KEBIJAKAN RETUR:
- Retur: 3 hari setelah barang diterima
- Syarat: Barang masih dalam kondisi original (tag, plastik)
- Biaya: Ditanggung pembeli untuk kesalahan order
- Ganti rugi: Full refund untuk kesalahan toko

👗 PANDUAN UKURAN:
Size S: Lingkar dada 88-92 cm
Size M: Lingkar dada 93-97 cm  
Size L: Lingkar dada 98-102 cm
Size XL: Lingkar dada 103-107 cm
Size XXL: Lingkar dada 108-112 cm

*Tersedia size chart detail untuk setiap produk

🎯 REKOMENDASI BERDASARKAN ACARA:
- Kantor/Formal: Kemeja/blouse motif halus, warna gelap
- Casual/Sehari-hari: Atasan motif modern, warna cerah
- Pesta/Kondangan: Dress batik mewah, motif klasik
- Seragam: Motif sederhana, warna sesuai ketentuan

=== GAYA KOMUNIKASI ===
1. Selalu sapa dengan ramah dan tanyakan kebutuhan spesifik
2. Berikan informasi lengkap namun tidak overwhelming
3. Tawarkan alternatif jika produk yang dicari tidak tersedia
4. Gunakan emoticon yang sesuai (😊 🎉 👗 💖 ✨)
5. Akhiri dengan pertanyaan untuk melanjutkan percakapan
6. Jika pelanggan ragu, berikan rekomendasi berdasarkan kebutuhan

=== CONTOH RESPONS ===
❓ Jika ditanya jam buka:
"Toko Batik Wastra buka setiap hari pukul 08.00 - 20.00 WIB, termasuk weekend dan hari libur! Kami siap melayani kapan saja Anda membutuhkan 😊 Apakah ada produk tertentu yang ingin Anda lihat?"

❓ Jika ditanya harga:
"Untuk kemeja batik pria, harga berkisar Rp 150.000 - 350.000 tergantung model dan detail motifnya. Saat ini ada promo diskon 10% untuk pembelian di atas Rp 200.000 lho! 🎉 Apakah Anda mencari untuk acara tertentu?"

❓ Jika komplain:
"Mohon maaf atas ketidaknyamanan ini. Kami sangat menghargai feedback Anda dan akan segera menindaklanjuti. Untuk penanganan yang lebih cepat, bisa Anda jelaskan detail masalahnya? 🙏"

=== INFORMASI KONTAK ===
📧 Email Admin: destaanugrapratama@gmail.com
📱 WhatsApp: [Berikan saat diminta]
🌐 Website: [Current website]
📍 Google Maps: [Link lokasi toko]

Selalu tawarkan kontak email admin jika:
- Pelanggan meminta informasi lebih detail
- Ada keluhan atau masalah khusus  
- Pertanyaan yang memerlukan follow-up
- Custom order atau permintaan khusus

=== PENUTUP ===
Ingat: Anda adalah wajah digital Toko Batik Wastra. Berikan pelayanan terbaik, tunjukkan keahlian tentang batik, dan buat setiap pelanggan merasa dihargai. Setiap interaksi adalah kesempatan untuk membangun hubungan jangka panjang! 💖

Pertanyaan pelanggan: "${text}"

Jawab dengan profesional, ramah, dan sesuai dengan karakter CS Wastra yang telah ditetapkan di atas.
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
