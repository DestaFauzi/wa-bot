# WhatsApp Scheduler Bot

Bot otomatis untuk mengirim pesan terjadwal ke grup WhatsApp menggunakan Node.js dan WhatsApp Web API.

## 🚀 Fitur

- ✅ Kirim pesan langsung ke grup WhatsApp
- ⏰ Jadwalkan pesan untuk dikirim di waktu tertentu
- 🔍 Lihat daftar grup WhatsApp yang tersedia
- 📱 Interface web yang mudah digunakan
- 🔐 Autentikasi menggunakan QR Code
- 📊 Status monitoring real-time

## 📋 Persyaratan

- Node.js (versi 14 atau lebih baru)
- npm atau yarn
- Chrome/Chromium browser (untuk Puppeteer)
- Akun WhatsApp aktif

## 🔧 Instalasi

1. **Clone repository:**
```bash
git clone https://github.com/username/whatsapp-scheduler.git
cd whatsapp-scheduler
```

2. **Install dependencies:**
```bash
npm install
```

3. **Buat folder public dan file HTML:**
```bash
mkdir public
# Buat file index.html di dalam folder public
```

4. **Jalankan aplikasi:**
```bash
node server.js
```

5. **Buka browser dan akses:**
```
http://localhost:3000
```

## 📦 Dependencies

```json
{
  "express": "^4.18.0",
  "whatsapp-web.js": "^1.19.0",
  "cors": "^2.8.5",
  "qrcode-terminal": "^0.12.0"
}
```

## 🛠️ Penggunaan

### 1. Autentikasi
- Jalankan aplikasi dengan `node server.js`
- QR Code akan muncul di terminal
- Scan QR Code dengan WhatsApp di ponsel Anda
- Tunggu hingga status "ready"

### 2. Kirim Pesan Langsung
**Endpoint:** `POST /api/send-message`

```javascript
// Contoh request
{
  "groupId": "GROUP_ID@g.us",
  "message": "Hello World!"
}
```

### 3. Jadwalkan Pesan
**Endpoint:** `POST /api/schedule-message`

```javascript
// Contoh request
{
  "groupId": "GROUP_ID@g.us",
  "message": "Pesan terjadwal",
  "scheduleTime": "2024-01-15T10:30:00.000Z"
}
```

### 4. Lihat Daftar Grup
**Endpoint:** `GET /api/groups`

### 5. Cek Status
**Endpoint:** `GET /api/status`

## 🔌 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/status` | Cek status bot dan QR code |
| GET | `/api/groups` | Dapatkan daftar grup WhatsApp |
| POST | `/api/send-message` | Kirim pesan langsung |
| POST | `/api/schedule-message` | Jadwalkan pesan |

## 📝 Contoh Penggunaan

### Kirim Pesan dengan cURL:
```bash
curl -X POST http://localhost:3000/api/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "123456789@g.us",
    "message": "Hello from bot!"
  }'
```

### Jadwalkan Pesan:
```bash
curl -X POST http://localhost:3000/api/schedule-message \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "123456789@g.us",
    "message": "Pesan terjadwal",
    "scheduleTime": "2024-01-15T10:30:00.000Z"
  }'
```

## 🚨 Troubleshooting

### QR Code tidak muncul:
- Pastikan tidak ada instance WhatsApp Web lain yang aktif
- Hapus folder `.wwebjs_auth` dan restart aplikasi
- Cek koneksi internet

### Pesan tidak terkirim:
- Pastikan bot sudah dalam status "ready"
- Verifikasi Group ID yang benar
- Cek apakah bot masih member grup

### Error Puppeteer:
```bash
# Install dependencies tambahan untuk Linux
sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```

## 🔒 Keamanan

- Jangan commit file `.wwebjs_auth/` ke repository
- Gunakan environment variables untuk konfigurasi sensitif
- Implementasikan rate limiting untuk production
- Validate input data sebelum mengirim pesan

## 📄 Struktur Project

```
whatsapp-scheduler/
├── server.js              # Main server file
├── public/
│   └── index.html         # Web interface
├── .wwebjs_auth/          # WhatsApp auth data (auto-generated)
├── package.json           # Dependencies
└── README.md             # Documentation
```

## 🤝 Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit perubahan (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

## 📜 Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

## ⚠️ Disclaimer

Bot ini menggunakan WhatsApp Web API yang tidak resmi. Penggunaan berlebihan dapat menyebabkan akun WhatsApp Anda dibanned. Gunakan dengan bijak dan ikuti terms of service WhatsApp.
