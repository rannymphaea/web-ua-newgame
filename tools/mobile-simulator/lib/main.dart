// NEWGAME Mobile — Flutter App
// Preview & mobile app dengan desain yang sama dengan web.
//
// Android: flutter run (via USB/ADB ke HP)
// Web:     flutter run -d chrome (simulator preview)
//
// Pastikan dev server berjalan: cd apps/web && npm run dev

import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:webview_flutter/webview_flutter.dart';

void main() => runApp(const NewgameApp());

// ── Color Palette (match web globals.css) ──────────────
const kBg     = Color(0xFF080D14);
const kSurf   = Color(0xFF0C1420);
const kSurf2  = Color(0xFF111827);
const kBorder = Color(0xFF1E2D40);
const kMuted  = Color(0xFF8892A4);
const kTxt    = Color(0xFFF0EEF4);
const kGold   = Color(0xFFFDCF41);
const kPurple = Color(0xFFB9A6CE);
const kGreen  = Color(0xFF22C55E);
const kRed    = Color(0xFFEF4444);
const kDanger = Color(0xFFEF4444);

// ── Quick Nav Pages ───────────────────────────────────
const navPages = <_NavPage>[
  _NavPage('Landing',     '/landing',     Icons.home_rounded),
  _NavPage('Login',       '/login',       Icons.lock_rounded),
  _NavPage('Dashboard',   '/dashboard',   Icons.dashboard_rounded),
  _NavPage('Scan QR',     '/scan',        Icons.qr_code_scanner_rounded),
  _NavPage('Leaderboard', '/leaderboard', Icons.leaderboard_rounded),
  _NavPage('Berita',      '/news',        Icons.newspaper_rounded),
  _NavPage('Profil',      '/profile',     Icons.person_rounded),
  _NavPage('Kalender',    '/calendar',    Icons.calendar_month_rounded),
  _NavPage('Badges',      '/badges',      Icons.military_tech_rounded),
  _NavPage('Pirate Map',  '/pirate-map',  Icons.map_rounded),
  _NavPage('Admin',       '/admin',       Icons.admin_panel_settings_rounded),
];

class _NavPage {
  final String label;
  final String path;
  final IconData icon;
  const _NavPage(this.label, this.path, this.icon);
}

// ── App ────────────────────────────────────────────────
class NewgameApp extends StatelessWidget {
  const NewgameApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NEWGAME Mobile',
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
      home: kIsWeb ? const _WebNotSupportedPage() : const MobilePage(),
    );
  }
}

// ── Web fallback (tell user to use Chrome simulator instead) ──
class _WebNotSupportedPage extends StatelessWidget {
  const _WebNotSupportedPage();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Container(
              width: 80, height: 80,
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [kGold, kPurple]),
                borderRadius: BorderRadius.circular(24),
              ),
              child: const Center(child: Icon(Icons.phone_android, size: 40, color: kBg)),
            ),
            const SizedBox(height: 24),
            const Text('NEWGAME Mobile', style: TextStyle(
              fontSize: 24, fontWeight: FontWeight.w800, color: kGold,
            )),
            const SizedBox(height: 12),
            const Text(
              'Aplikasi ini dijalankan di Android.\n\n'
              'Untuk preview web, gunakan:\nflutter run -d chrome\n'
              'dengan simulator lama di branch web-simulator.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: kMuted, height: 1.6),
            ),
          ]),
        ),
      ),
    );
  }
}

// ── Mobile Page (Android) ──────────────────────────────
class MobilePage extends StatefulWidget {
  const MobilePage({super.key});
  @override
  State<MobilePage> createState() => _MobilePageState();
}

class _MobilePageState extends State<MobilePage> {
  // Change this to your PC's local IP when testing on physical device
  // Use 10.0.2.2 for Android emulator (maps to host localhost)
  static const _baseUrl = 'http://10.0.2.2:3000';

  late final WebViewController _controller;
  String _currentUrl = '$_baseUrl/landing'; // tracked for nav highlight
  bool _isLoading = true;
  bool _hasError = false;
  String _errorMessage = '';
  int _currentNavIndex = 0;
  double _loadProgress = 0;

  @override
  void initState() {
    super.initState();
    _initWebView();
  }

  void _initWebView() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(kBg)
      ..setNavigationDelegate(NavigationDelegate(
        onPageStarted: (url) {
          setState(() {
            _isLoading = true;
            _hasError = false;
            _currentUrl = url;
            _updateNavIndex(url);
          });
        },
        onPageFinished: (url) {
          setState(() {
            _isLoading = false;
            _currentUrl = url;
            _updateNavIndex(url);
          });
          // Inject dark theme preference
          _controller.runJavaScript(
            "try { localStorage.setItem('ng-theme', 'dark'); } catch(e) {}"
          );
        },
        onProgress: (progress) {
          setState(() => _loadProgress = progress / 100);
        },
        onWebResourceError: (error) {
          setState(() {
            _hasError = true;
            _isLoading = false;
            _errorMessage = error.description;
          });
        },
        onNavigationRequest: (request) {
          // Allow all localhost navigation
          if (request.url.contains('localhost') ||
              request.url.contains('10.0.2.2') ||
              request.url.contains('192.168.')) {
            return NavigationDecision.navigate;
          }
          // Block external URLs (open in browser instead)
          return NavigationDecision.prevent;
        },
      ))
      ..loadRequest(Uri.parse('$_baseUrl/landing'));
  }

  void _updateNavIndex(String url) {
    for (int i = 0; i < navPages.length; i++) {
      if (url.contains(navPages[i].path)) {
        _currentNavIndex = i;
        return;
      }
    }
  }

  void _navigate(String path) {
    final url = '$_baseUrl$path';
    setState(() {
      _currentUrl = url;
      _hasError = false;
    });
    _controller.loadRequest(Uri.parse(url));
  }

  void _reload() {
    setState(() => _hasError = false);
    _controller.reload();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      // Top bar
      appBar: AppBar(
        backgroundColor: kBg,
        toolbarHeight: 52,
        title: Row(children: [
          Container(
            width: 28, height: 28,
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [kGold, kPurple]),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Center(
              child: Text('N', style: TextStyle(
                fontSize: 14, fontWeight: FontWeight.w900, color: kBg,
              )),
            ),
          ),
          const SizedBox(width: 10),
          const Text('NEWGAME', style: TextStyle(
            fontSize: 14, fontWeight: FontWeight.w800,
            color: kGold, letterSpacing: 1.5,
          )),
          const SizedBox(width: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: kGold.withAlpha(25),
              borderRadius: BorderRadius.circular(4),
              border: Border.all(color: kGold.withAlpha(60)),
            ),
            child: const Text('v0.1.4', style: TextStyle(
              fontSize: 9, color: kGold, fontWeight: FontWeight.w600,
            )),
          ),
        ]),
        actions: [
          // Reload
          IconButton(
            icon: const Icon(Icons.refresh_rounded, size: 20, color: kMuted),
            onPressed: _reload,
            tooltip: 'Reload',
          ),
          // Server config
          IconButton(
            icon: const Icon(Icons.settings_rounded, size: 20, color: kMuted),
            onPressed: _showServerDialog,
            tooltip: 'Server URL',
          ),
        ],
        bottom: _isLoading
          ? PreferredSize(
              preferredSize: const Size.fromHeight(2),
              child: LinearProgressIndicator(
                value: _loadProgress,
                backgroundColor: Colors.transparent,
                valueColor: const AlwaysStoppedAnimation<Color>(kGold),
                minHeight: 2,
              ),
            )
          : null,
      ),

      // Body
      body: _hasError ? _buildErrorView() : _buildWebView(),

      // Bottom nav with quick links
      bottomNavigationBar: _buildBottomNav(),

      // Drawer for full page list
      drawer: _buildDrawer(),
    );
  }

  Widget _buildWebView() {
    return WebViewWidget(controller: _controller);
  }

  Widget _buildErrorView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(
            width: 80, height: 80,
            decoration: BoxDecoration(
              color: kRed.withAlpha(20),
              shape: BoxShape.circle,
              border: Border.all(color: kRed.withAlpha(60)),
            ),
            child: const Icon(Icons.wifi_off_rounded, size: 36, color: kRed),
          ),
          const SizedBox(height: 20),
          const Text('Tidak Dapat Terhubung', style: TextStyle(
            fontSize: 18, fontWeight: FontWeight.w700, color: kTxt,
          )),
          const SizedBox(height: 10),
          Text(
            'Pastikan dev server berjalan:\ncd apps/web && npm run dev\n\n'
            'Jika menggunakan HP fisik, ganti\nIP di settings ke IP komputer kamu.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12, color: kMuted, height: 1.6),
          ),
          if (_errorMessage.isNotEmpty) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: kSurf,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: kBorder),
              ),
              child: Text(_errorMessage, style: const TextStyle(
                fontSize: 10, color: kMuted, fontFamily: 'monospace',
              )),
            ),
          ],
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _reload,
            icon: const Icon(Icons.refresh_rounded, size: 18),
            label: const Text('Coba Lagi'),
            style: ElevatedButton.styleFrom(
              backgroundColor: kGold,
              foregroundColor: kBg,
              padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),
        ]),
      ),
    );
  }

  // Bottom nav bar — 5 most used pages
  Widget _buildBottomNav() {
    const mainNav = [0, 2, 3, 5, 6]; // Landing, Dashboard, Scan, Berita, Profil
    return Container(
      decoration: const BoxDecoration(
        color: kBg,
        border: Border(top: BorderSide(color: kBorder)),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: mainNav.map((i) {
              final page = navPages[i];
              final active = _currentNavIndex == i;
              return GestureDetector(
                onTap: () => _navigate(page.path),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: active ? kGold.withAlpha(20) : Colors.transparent,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                    Icon(page.icon, size: 22,
                      color: active ? kGold : kMuted),
                    const SizedBox(height: 3),
                    Text(page.label, style: TextStyle(
                      fontSize: 9.5,
                      color: active ? kGold : kMuted,
                      fontWeight: active ? FontWeight.w700 : FontWeight.normal,
                    )),
                  ]),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }

  // Full navigation drawer
  Widget _buildDrawer() {
    return Drawer(
      backgroundColor: kBg,
      child: SafeArea(
        child: Column(children: [
          // Header
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: kBorder)),
            ),
            child: Row(children: [
              Container(
                width: 44, height: 44,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [kGold, kPurple]),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Center(
                  child: Text('N', style: TextStyle(
                    fontSize: 22, fontWeight: FontWeight.w900, color: kBg,
                  )),
                ),
              ),
              const SizedBox(width: 14),
              const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('NEWGAME', style: TextStyle(
                  fontSize: 16, fontWeight: FontWeight.w800,
                  color: kGold, letterSpacing: 1.5,
                )),
                SizedBox(height: 2),
                Text('Learn · Create · Play', style: TextStyle(
                  fontSize: 11, color: kMuted, fontStyle: FontStyle.italic,
                )),
              ]),
            ]),
          ),

          // Nav list
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
              itemCount: navPages.length,
              itemBuilder: (context, i) {
                final page = navPages[i];
                final active = _currentNavIndex == i;
                return ListTile(
                  dense: true,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  tileColor: active ? kGold.withAlpha(20) : Colors.transparent,
                  leading: Icon(page.icon, size: 20,
                    color: active ? kGold : kMuted),
                  title: Text(page.label, style: TextStyle(
                    fontSize: 13,
                    color: active ? kGold : kTxt,
                    fontWeight: active ? FontWeight.w700 : FontWeight.normal,
                  )),
                  trailing: active
                    ? Container(width: 6, height: 6,
                        decoration: const BoxDecoration(
                          color: kGold, shape: BoxShape.circle,
                        ))
                    : null,
                  onTap: () {
                    Navigator.pop(context);
                    _navigate(page.path);
                  },
                );
              },
            ),
          ),

          // Footer
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: kBorder)),
            ),
            child: Row(children: [
              Container(width: 6, height: 6,
                decoration: BoxDecoration(
                  color: _hasError ? kRed : kGreen,
                  shape: BoxShape.circle,
                )),
              const SizedBox(width: 8),
              Expanded(child: Text(
                _hasError ? 'Disconnected' : 'Connected',
                style: const TextStyle(fontSize: 10, color: kMuted),
              )),
              const Text('v0.1.4', style: TextStyle(
                fontSize: 10, color: kMuted, fontFamily: 'monospace',
              )),
            ]),
          ),
        ]),
      ),
    );
  }

  void _showServerDialog() {
    final urlCtrl = TextEditingController(text: _baseUrl);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: kSurf,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Server URL', style: TextStyle(
          fontSize: 16, fontWeight: FontWeight.w700, color: kTxt,
        )),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          const Text(
            'Emulator: http://10.0.2.2:3000\n'
            'HP fisik: http://[IP_PC]:3000\n\n'
            'Jalankan dulu: cd apps/web && npm run dev',
            style: TextStyle(fontSize: 11, color: kMuted, height: 1.5),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: urlCtrl,
            style: const TextStyle(fontSize: 12, color: kTxt, fontFamily: 'monospace'),
            decoration: InputDecoration(
              labelText: 'Base URL',
              labelStyle: const TextStyle(fontSize: 12, color: kMuted),
              filled: true,
              fillColor: kBg,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: kBorder),
              ),
            ),
          ),
        ]),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Batal', style: TextStyle(color: kMuted)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              final url = urlCtrl.text.trim();
              if (url.isNotEmpty) {
                _controller.loadRequest(Uri.parse('$url/landing'));
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: kGold, foregroundColor: kBg,
            ),
            child: const Text('Terapkan'),
          ),
        ],
      ),
    );
  }
}
