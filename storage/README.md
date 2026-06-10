# storage/

High-resolution source assets untuk platform NEWGAME.
File-file di sini adalah sumber master yang digunakan untuk menghasilkan
aset yang di-deploy ke pps/web/public/.

## Struktur

`
storage/
├── characters/        # Karakter OC NEWGAME (PNG + SVG resolusi tinggi)
│   ├── CodeCommandColourOutlined.{png,svg}   # Code Commander
│   ├── goldGuardianColourOutlined.{png,svg}  # Gold Guardian
│   ├── sekumColourOutlined.{png,svg}          # Quest Keeper / Sekretaris
│   ├── colourOutlined.{png,svg}               # Karakter umum
│   ├── yua.{png,svg}                          # Karakter Yua (maskot)
│   └── logo.{png,svg}                         # Logo NEWGAME resolusi tinggi
│
├── logo/              # Variasi logo untuk branding eksternal
└── sfx/               # Source file audio (master, sebelum kompresi)
`

## Deploy ke public/

File yang digunakan di web app disalin/dikompres ke:

pps/web/public/images/characters/ — karakter OC (SVG siap web)
pps/web/public/images/            — logo versi web
pps/web/public/assets/sfx/        — audio (MP3)

## Catatan

- File .svg di sini adalah resolusi penuh, bisa sangat besar (1–5 MB).
- Jangan import langsung dari storage/ ke kode Next.js.
- Gunakan file yang sudah ada di pps/web/public/ untuk web.
