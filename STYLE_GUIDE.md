# Panduan Gaya Penulisan Kode (Style Guide)
Last updated: 21 Mei 2026

Panduan ini mengatur standar penulisan kode sumber untuk memastikan konsistensi dan kemudahan pemeliharaan di seluruh platform NEWGAME. Seluruh kontributor diwajibkan untuk mematuhi konvensi yang ditetapkan di bawah ini.

---

## Konvensi Umum

Proyek ini menggunakan TypeScript dengan mode strict yang diaktifkan secara ketat pada konfigurasi compiler. Indentasi kode menggunakan dua spasi dan tidak diperkenankan menggunakan tab. Penggunaan titik koma (semicolon) pada akhir baris bersifat opsional untuk kode frontend namun sangat diwajibkan pada kode backend. String harus diapit oleh tanda kutip tunggal (single quote), kecuali jika string tersebut memuat tanda kutip tunggal di dalamnya. Penggunaan trailing comma pada objek multiline sangat disarankan untuk mengurangi konflik saat penggabungan kode (merge). Batas maksimum panjang satu baris adalah 120 karakter, meskipun ini bersifat fleksibel jika pemotongan baris akan mengurangi tingkat keterbacaan.

## Aturan Penamaan

Konsistensi penamaan sangat krusial dalam proyek berskala besar. Komponen antarmuka React dan nama tipe atau antarmuka (interface) harus ditulis dengan gaya PascalCase. Nama tipe dan antarmuka dapat ditambahkan prefiks huruf 'I' sebagai penanda, namun hal ini tidak diwajibkan.

Seluruh penamaan file modul, layanan (service), definisi fitur, serta lembar gaya (CSS) wajib menggunakan gaya kebab-case. Contohnya adalah nama file seperti `badge-definitions.ts` atau `landing.css`. Sementara itu, nama variabel biasa dan nama fungsi di dalam kode harus ditulis menggunakan gaya camelCase. Konstanta global harus menggunakan gaya UPPER_SNAKE_CASE.

Aturan khusus berlaku untuk basis data dan lapisan presentasi. Koleksi Firestore wajib dinamai dengan snake_case, seperti `user_badges` atau `xp_history`. Penamaan kelas CSS harus menggunakan format kebab-case, contohnya `.glow-card`. Pola penamaan endpoint API juga harus menggunakan format kebab-case, misalnya `/api/pillar-levels`.

---

## Struktur Pengembangan Frontend (Next.js)

Pengembangan antarmuka mematuhi paradigma Next.js App Router. Direktif 'use client' hanya boleh ditempatkan pada komponen yang memerlukan pengelolaan state interaktif, efek samping (effects), atau pengikatan fungsi event handler. Modul yang murni merender elemen statis tidak perlu menyertakan direktif tersebut dan dibiarkan menggunakan mekanisme render sisi server secara default.

Penataan desain dilarang menggunakan gaya sebaris (inline styles) kecuali jika parameter yang disisipkan sangat dinamis (dihitung saat eksekusi runtime). Setiap halaman atau komponen kompleks yang memerlukan tata letak khusus harus memiliki lembar gayanya masing-masing dan diimpor pada lapisan modul terkait, bukan diletakkan terpusat pada file gaya global. Pengelolaan status antar-komponen berskala besar dilakukan dengan memanfaatkan pustaka Zustand, sementara untuk urusan state lokal sederhana direkomendasikan untuk menggunakan hook standar bawaan React.

Integrasi panggilan HTTP ke endpoint tidak diizinkan dilakukan langsung menggunakan fetch telanjang (raw fetch API). Seluruh proses pengambilan, pengiriman, hingga unggah data harus selalu merujuk pada pemanggilan fungsi melalui modul klien API (`lib/api.ts`) demi kelancaran penyisipan token autentikasi. Mengenai representasi visual yang membutuhkan ikon atau ilustrasi pendukung, diwajibkan untuk memanfaatkan tag SVG sebaris atau mengacu pada file gambar di direktori `/public/`. Menyisipkan emoji dalam teks tidak dibenarkan dalam penyusunan elemen UI profesional, terkecuali sebagai bagian data input dari pengguna.

Penggunaan warna hardcoded secara eksplisit (seperti pemanggilan kode `#ffffff` secara langsung) sangat tidak disarankan. Konsep pengaturan warna telah dibakukan melalui sistem variabel bawaan CSS (`--color-text-primary`, `--color-bg-card`, dll.) yang dapat dilihat selengkapnya pada file konfigurasi `globals.css`.

---

## Struktur Pengembangan Backend (NestJS)

Pengembangan logika backend diatur berdasarkan pola modular dan Domain-Driven Design (DDD). Modul baru wajib dienkapsulasi dengan pemisahan peran yang tegas; berkas pengendali (controller) mutlak dibebaskan dari setiap beban logika bisnis komputasi. Tugas pengendali (controller) semata-mata diizinkan melingkupi pemrosesan request dari klien (seperti ekstraksi header, body, token) untuk kemudian diumpan secara rapi ke modul layanan (service). Modul layanan (service) berperan penuh menanggung aktivitas krusial, antara lain validasi entitas, pelaksanaan kaidah bisnis, serta modifikasi persisten pada basis data Firestore.

Keamanan akses pada keseluruhan sistem API mutlak dilindungi dengan integrasi skema Firebase Auth. Tiap endpoint yang terbuka menerima permintaan wajib diselubungi dekorator `FirebaseAuthGuard` guna memastikan peminta memegang token autentikasi yang berlaku. Secara spesifik bagi titik endpoint administratif yang rentan dan memengaruhi pengaturan sistem secara menyeluruh, diwajibkan penambahan filter spesifik melalui penyematan dekorator `RolesGuard` berikut peran yang berkesesuaian.

Beban validasi masuknya informasi ke backend dimandatkan penuh ke dalam berkas Data Transfer Object (DTO) menggunakan utilitas pustaka bawaan `class-validator`. Kesalahan pemrosesan dari segala jenis kegagalan fungsional yang terjadi selama rutinitas service harus senantiasa dilemparkan kembali dalam rupa kelas `HttpException` berikut pelengkap respons status kode HTTP yang mewakili kegagalan tersebut dengan akurat.
