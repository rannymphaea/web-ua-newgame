// NEWGAME Mobile Simulator — v0.1.5
//
// Mode otomatis:
//   Windows desktop → jendela berukuran HP dengan WebView (EdgeChromium)
//   Android         → WebView full-screen dengan bottom nav + drawer
//   Platform lain   → panduan cara menjalankan
//
// Cara menjalankan:
//   Windows : flutter run -d windows
//   Android : flutter run -d [device-id]
//   Emulator: flutter run -d emulator-5554
//
// Pastikan dev server berjalan dulu:
//   cd apps/web && npm run dev
//   Server berjalan di http://localhost:3000

import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:window_manager/window_manager.dart';
import 'simulator_android.dart';
import 'simulator_windows.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Konfigurasi jendela desktop
  if (!kIsWeb && _isDesktop) {
    await windowManager.ensureInitialized();
    const size = Size(420, 900); // lebar HP + chrome
    await windowManager.waitUntilReadyToShow(
      const WindowOptions(
        size: size,
        minimumSize: Size(360, 640),
        maximumSize: Size(600, 1100),
        center: true,
        title: 'NEWGAME Simulator',
        backgroundColor: Color(0xFF080D14),
        skipTaskbar: false,
        titleBarStyle: TitleBarStyle.normal,
      ),
      () async {
        await windowManager.show();
        await windowManager.focus();
      },
    );
  }

  runApp(const NewgameSimulatorApp());
}

bool get _isDesktop =>
    !kIsWeb && (Platform.isWindows || Platform.isMacOS || Platform.isLinux);

// ── Color tokens (sama dengan web globals.css) ───────────
const kBg = Color(0xFF080D14);
const kSurf = Color(0xFF0C1420);
const kBorder = Color(0xFF1E2D40);
const kMuted = Color(0xFF8892A4);
const kTxt = Color(0xFFF0EEF4);
const kGold = Color(0xFFFDCF41);
const kPurple = Color(0xFFB9A6CE);
const kGreen = Color(0xFF22C55E);
const kRed = Color(0xFFEF4444);

// ── Halaman yang tersedia ─────────────────────────────────
const navPages = <NavPage>[
  NavPage('Landing', '/landing', Icons.home_rounded),
  NavPage('Login', '/login', Icons.lock_rounded),
  NavPage('Dashboard', '/dashboard', Icons.dashboard_rounded),
  NavPage('Scan QR', '/scan', Icons.qr_code_scanner_rounded),
  NavPage('Leaderboard', '/leaderboard', Icons.leaderboard_rounded),
  NavPage('Berita', '/news', Icons.newspaper_rounded),
  NavPage('Profil', '/profile', Icons.person_rounded),
  NavPage('Kalender', '/calendar', Icons.calendar_month_rounded),
  NavPage('Badges', '/badges', Icons.military_tech_rounded),
  NavPage('Admin', '/admin', Icons.admin_panel_settings_rounded),
];

class NavPage {
  final String label;
  final String path;
  final IconData icon;
  const NavPage(this.label, this.path, this.icon);
}

// ── App root ──────────────────────────────────────────────
class NewgameSimulatorApp extends StatelessWidget {
  const NewgameSimulatorApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NEWGAME Simulator',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: kBg,
        colorScheme: const ColorScheme.dark(
          primary: kGold,
          surface: kSurf,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: kBg,
          surfaceTintColor: Colors.transparent,
          elevation: 0,
        ),
      ),
      home: _buildHome(),
    );
  }

  Widget _buildHome() {
    if (kIsWeb) return const _UnsupportedPage(platform: 'Web');
    if (_isDesktop) return const WindowsSimulatorPage();
    if (Platform.isAndroid) return const AndroidSimulatorPage();
    return const _UnsupportedPage(platform: 'Platform ini');
  }
}

// ── Halaman fallback ──────────────────────────────────────
class _UnsupportedPage extends StatelessWidget {
  final String platform;
  const _UnsupportedPage({required this.platform});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [kGold, kPurple]),
                borderRadius: BorderRadius.circular(24),
              ),
              child: const Center(
                child: Icon(Icons.devices_rounded, size: 40, color: kBg),
              ),
            ),
            const SizedBox(height: 24),
            const Text('NEWGAME Simulator',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: kGold,
                )),
            const SizedBox(height: 12),
            Text(
              '$platform tidak didukung.\n\n'
              'Cara menjalankan:\n'
              '  Windows: flutter run -d windows\n'
              '  Android: flutter run -d [device-id]\n\n'
              'Pastikan dev server berjalan:\n'
              '  cd apps/web && npm run dev',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 13, color: kMuted, height: 1.7),
            ),
          ]),
        ),
      ),
    );
  }
}
