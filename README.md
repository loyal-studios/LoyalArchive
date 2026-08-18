# Loyal Archive Frontend

Frontend/PWA Loyal Archive untuk GitHub Pages.

Repository publik ini sengaja hanya memuat antarmuka aplikasi. Repository tidak berisi:

- metadata atau data arsip pengguna;
- gambar original dan thumbnail produksi;
- source backend Google Apps Script;
- credential, token sesi, OTP, atau secret;
- ID Google Sheets/Drive;
- export atau data migrasi Notion.

Data asli disimpan pada Google Sheets dan Google Drive milik pengguna. Semua operasi data melewati backend terpisah dan membutuhkan sesi login yang valid.

## Development

```bash
npm ci
npm run dev
npm run verify
```

Tanpa `VITE_APPS_SCRIPT_URL`, aplikasi otomatis berjalan dalam mode demo lokal.
