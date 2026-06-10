// NEWGAME Mobile Simulator — Flutter Web
// Jalankan: flutter run -d chrome
// Load web asli (localhost:3000) dalam frame HP yang bisa di-switch device

// ignore_for_file: avoid_web_libraries_in_flutter
import 'dart:ui_web' as ui;
import 'dart:html' as html;

import 'package:flutter/material.dart';

void main() {
  runApp(const SimulatorApp());
}

// ── Color Palette ──────────────────────────────────────
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

// ── Device Preset ──────────────────────────────────────
class DevicePreset {
  final String name;
  final String emoji;
  final double w;
  final double h;
  final bool tablet;
  const DevicePreset(this.name, this.emoji, this.w, this.h, {this.tablet = false});
}

const devices = <DevicePreset>[
  DevicePreset('iPhone SE 3',      '📱', 375, 667),
  DevicePreset('iPhone 14',        '📱', 390, 844),
  DevicePreset('iPhone 14 Pro Max','📱', 430, 932),
  DevicePreset('Pixel 7',          '📱', 412, 915),
  DevicePreset('Samsung Galaxy S23','📱',360, 780),
  DevicePreset('Redmi Note 12',    '📱', 393, 873),
  DevicePreset('iPad Mini 6',      '📟', 768, 1024, tablet: true),
  DevicePreset('iPad Air 5',       '📟', 820, 1180, tablet: true),
];

const navLinks = <Map<String, String>>[
  {'label': 'Landing',     'path': '/landing',             'emoji': '🏠'},
  {'label': 'Login',       'path': '/login',               'emoji': '🔐'},
  {'label': 'Dashboard',   'path': '/dashboard',           'emoji': '📊'},
  {'label': 'Leaderboard', 'path': '/leaderboard',         'emoji': '🏆'},
  {'label': 'Berita',      'path': '/news',                'emoji': '📰'},
  {'label': 'Profile',     'path': '/profile',             'emoji': '👤'},
  {'label': 'Scan QR',     'path': '/scan',                'emoji': '📷'},
  {'label': 'Admin',       'path': '/admin',               'emoji': '⚙️'},
];

// ── App ────────────────────────────────────────────────
class SimulatorApp extends StatelessWidget {
  const SimulatorApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NEWGAME Mobile Simulator',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: kBg,
        colorScheme: const ColorScheme.dark(
          primary: kGold, surface: kSurf,
        ),
      ),
      home: const SimulatorPage(),
    );
  }
}

// ── Main Page ──────────────────────────────────────────
class SimulatorPage extends StatefulWidget {
  const SimulatorPage({super.key});
  @override State<SimulatorPage> createState() => _SimulatorPageState();
}

class _SimulatorPageState extends State<SimulatorPage> {
  static const baseUrl = 'http://localhost:3000';

  int _deviceIdx = 1;       // iPhone 14 default
  double _scale  = 0.72;
  bool _landscape = false;
  String _url = '$baseUrl/landing';
  bool _registered = false;

  final _urlCtrl = TextEditingController(text: '$baseUrl/landing');
  html.IFrameElement? _iframe;

  DevicePreset get _device => devices[_deviceIdx];
  double get _devW => _landscape ? _device.h : _device.w;
  double get _devH => _landscape ? _device.w : _device.h;

  @override
  void initState() {
    super.initState();
    _registerIframe();
  }

  void _registerIframe() {
    _iframe = html.IFrameElement()
      ..src = _url
      ..style.border = 'none'
      ..style.width  = '100%'
      ..style.height = '100%'
      ..allow = 'fullscreen'
      ..setAttribute('sandbox',
          'allow-same-origin allow-scripts allow-forms allow-popups allow-modals');

    ui.platformViewRegistry.registerViewFactory(
      'newgame-webview',
      (_) => _iframe!,
      isVisible: true,
    );
    setState(() => _registered = true);
  }

  void _navigate(String path) {
    final url = path.startsWith('http') ? path : '$baseUrl$path';
    setState(() => _url = url);
    _urlCtrl.text = url;
    _iframe?.src = url;
  }

  void _reload() => _iframe?.src = _url;

  @override
  Widget build(BuildContext context) {
    const sidebarW = 260.0;
    return Scaffold(
      backgroundColor: kBg,
      body: Row(children: [
        // ── Sidebar ────────────────────────
        _buildSidebar(sidebarW),
        // ── Canvas ─────────────────────────
        Expanded(child: _buildCanvas()),
      ]),
    );
  }

  // ──────────────────────────────────────────────────────
  Widget _buildSidebar(double w) {
    return Container(
      width: w,
      decoration: const BoxDecoration(
        color: kBg,
        border: Border(right: BorderSide(color: kBorder)),
      ),
      child: Column(children: [
        // Brand
        _brand(),
        // Scrollable body
        Expanded(
          child: ListView(padding: const EdgeInsets.all(14), children: [
            // URL
            _label('URL'),
            _urlBar(),
            const SizedBox(height: 20),
            // Nav links
            _label('Navigasi Cepat'),
            ...navLinks.map((l) => _navItem(l)),
            const SizedBox(height: 20),
            // Devices
            _label('Device'),
            ...List.generate(devices.length, (i) => _deviceItem(i)),
            const SizedBox(height: 20),
            // Scale
            _label('Skala'),
            _scaleRow(),
            const SizedBox(height: 20),
            // Orientation
            _label('Orientasi'),
            _orientRow(),
            const SizedBox(height: 20),
            // Info
            _infoBox(),
          ]),
        ),
        // Status
        _statusBar(),
      ]),
    );
  }

  Widget _brand() => Container(
    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
    decoration: const BoxDecoration(
      border: Border(bottom: BorderSide(color: kBorder)),
    ),
    child: Row(children: [
      Container(
        width: 34, height: 34,
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [kGold, kPurple]),
          borderRadius: BorderRadius.circular(10),
        ),
        child: const Center(child: Text('📱', style: TextStyle(fontSize: 17))),
      ),
      const SizedBox(width: 10),
      const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('NEWGAME', style: TextStyle(
          fontSize: 12, fontWeight: FontWeight.w800,
          color: kGold, letterSpacing: 1.5,
        )),
        Text('Mobile Simulator', style: TextStyle(fontSize: 9.5, color: kMuted)),
      ]),
    ]),
  );

  Widget _label(String txt) => Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Text(txt.toUpperCase(), style: const TextStyle(
      fontSize: 9, fontWeight: FontWeight.w800,
      color: kMuted, letterSpacing: 1.8,
    )),
  );

  Widget _urlBar() => Container(
    decoration: BoxDecoration(
      color: kSurf, borderRadius: BorderRadius.circular(8),
      border: Border.all(color: kBorder),
    ),
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
    child: Row(children: [
      Expanded(
        child: TextField(
          controller: _urlCtrl,
          style: const TextStyle(fontSize: 11, color: kTxt),
          decoration: const InputDecoration(
            border: InputBorder.none, isDense: true,
            hintText: 'http://localhost:3000/...',
            hintStyle: TextStyle(fontSize: 11, color: kMuted),
          ),
          onSubmitted: _navigate,
        ),
      ),
      GestureDetector(
        onTap: () => _navigate(_urlCtrl.text),
        child: const Icon(Icons.refresh_rounded, size: 16, color: kMuted),
      ),
    ]),
  );

  Widget _navItem(Map<String, String> l) {
    final active = _url.contains(l['path']!);
    return GestureDetector(
      onTap: () => _navigate(l['path']!),
      child: Container(
        margin: const EdgeInsets.only(bottom: 3),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
        decoration: BoxDecoration(
          color: active ? kGold.withAlpha(25) : Colors.transparent,
          borderRadius: BorderRadius.circular(7),
          border: Border.all(
            color: active ? kGold.withAlpha(60) : Colors.transparent,
          ),
        ),
        child: Row(children: [
          Text(l['emoji']!, style: const TextStyle(fontSize: 12)),
          const SizedBox(width: 8),
          Expanded(child: Text(l['label']!, style: TextStyle(
            fontSize: 12, color: active ? kGold : kTxt,
            fontWeight: active ? FontWeight.w700 : FontWeight.normal,
          ))),
          if (active) Container(
            width: 5, height: 5,
            decoration: const BoxDecoration(color: kGold, shape: BoxShape.circle),
          ),
        ]),
      ),
    );
  }

  Widget _deviceItem(int i) {
    final d = devices[i];
    final active = _deviceIdx == i;
    return GestureDetector(
      onTap: () => setState(() { _deviceIdx = i; }),
      child: Container(
        margin: const EdgeInsets.only(bottom: 3),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
        decoration: BoxDecoration(
          color: active ? kPurple.withAlpha(30) : Colors.transparent,
          borderRadius: BorderRadius.circular(7),
          border: Border.all(
            color: active ? kPurple.withAlpha(60) : Colors.transparent,
          ),
        ),
        child: Row(children: [
          Text(d.emoji, style: const TextStyle(fontSize: 12)),
          const SizedBox(width: 8),
          Expanded(child: Text(d.name, style: TextStyle(
            fontSize: 11, color: active ? kPurple : kTxt,
            fontWeight: active ? FontWeight.w700 : FontWeight.normal,
          ), overflow: TextOverflow.ellipsis)),
          Text('${d.w.round()}×${d.h.round()}', style: const TextStyle(
            fontSize: 9.5, color: kMuted,
          )),
        ]),
      ),
    );
  }

  Widget _scaleRow() => Row(children: [
    SizedBox(
      width: 38,
      child: Text('${(_scale * 100).round()}%',
        textAlign: TextAlign.right,
        style: const TextStyle(fontSize: 11, color: kMuted)),
    ),
    Expanded(
      child: Slider(
        value: _scale,
        min: 0.25, max: 1.0,
        activeColor: kGold,
        inactiveColor: kSurf2,
        onChanged: (v) => setState(() => _scale = v),
      ),
    ),
  ]);

  Widget _orientRow() => Row(children: [
    Expanded(child: _orientBtn(false, '📱', 'Portrait')),
    const SizedBox(width: 8),
    Expanded(child: _orientBtn(true, '📺', 'Landscape')),
  ]);

  Widget _orientBtn(bool landscape, String icon, String label) {
    final active = _landscape == landscape;
    return GestureDetector(
      onTap: () => setState(() => _landscape = landscape),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: active ? kGold.withAlpha(25) : kSurf,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: active ? kGold.withAlpha(70) : kBorder,
          ),
        ),
        child: Column(children: [
          Text(icon, style: const TextStyle(fontSize: 16)),
          const SizedBox(height: 4),
          Text(label, style: TextStyle(
            fontSize: 10,
            color: active ? kGold : kMuted,
            fontWeight: active ? FontWeight.w700 : FontWeight.normal,
          )),
        ]),
      ),
    );
  }

  Widget _infoBox() => Container(
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: kGold.withAlpha(15),
      borderRadius: BorderRadius.circular(8),
      border: Border.all(color: kGold.withAlpha(40)),
    ),
    child: const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        Text('ℹ️', style: TextStyle(fontSize: 11)),
        SizedBox(width: 6),
        Text('CARA PAKAI', style: TextStyle(
          fontSize: 9, fontWeight: FontWeight.w800, color: kGold, letterSpacing: 1.2,
        )),
      ]),
      SizedBox(height: 8),
      Text(
        'Jalankan dev server:\n'
        'npm run dev\n\n'
        'Lalu tekan Ctrl+Shift+B\n'
        'di VS Code untuk buka\n'
        'simulator ini.',
        style: TextStyle(fontSize: 10, color: kMuted, height: 1.5),
      ),
    ]),
  );

  Widget _statusBar() => Container(
    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
    decoration: const BoxDecoration(
      color: Color(0xFF050A10),
      border: Border(top: BorderSide(color: kBorder)),
    ),
    child: Row(children: [
      Container(
        width: 6, height: 6,
        decoration: const BoxDecoration(color: kGreen, shape: BoxShape.circle),
      ),
      const SizedBox(width: 8),
      const Expanded(child: Text('Flutter Web — Running', style: TextStyle(fontSize: 10, color: kMuted))),
      Text('${_devW.round()}×${_devH.round()}',
        style: const TextStyle(fontSize: 9.5, color: kMuted, fontFamily: 'monospace')),
    ]),
  );

  // ──────────────────────────────────────────────────────
  Widget _buildCanvas() {
    final frameW = _devW * _scale + 44;
    final frameH = _devH * _scale + 48 + 20;
    final isTablet = _device.tablet;
    final borderR = isTablet ? 22.0 : 40.0;

    return Container(
      color: const Color(0xFF060B11),
      child: Stack(children: [
        // Dot grid
        Positioned.fill(child: CustomPaint(painter: _DotGridPainter())),

        // Center content
        Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Chip
              Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                decoration: BoxDecoration(
                  color: kSurf,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: kBorder),
                ),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Text(_device.emoji, style: const TextStyle(fontSize: 13)),
                  const SizedBox(width: 8),
                  Text(_device.name, style: const TextStyle(
                    fontSize: 12, fontWeight: FontWeight.w700, color: kTxt,
                  )),
                  Container(margin: const EdgeInsets.symmetric(horizontal: 8),
                    width: 1, height: 12, color: kBorder),
                  Text('${_devW.round()}×${_devH.round()}',
                    style: const TextStyle(fontSize: 11, color: kMuted, fontFamily: 'monospace')),
                  Container(margin: const EdgeInsets.symmetric(horizontal: 8),
                    width: 1, height: 12, color: kBorder),
                  Text('${(_scale * 100).round()}%',
                    style: const TextStyle(fontSize: 11, color: kGold, fontWeight: FontWeight.w700)),
                  if (_landscape) ...[
                    Container(margin: const EdgeInsets.symmetric(horizontal: 8),
                      width: 1, height: 12, color: kBorder),
                    const Text('🔄', style: TextStyle(fontSize: 11)),
                  ],
                ]),
              ),

              // Phone frame
              Container(
                width: frameW,
                height: frameH,
                decoration: BoxDecoration(
                  color: const Color(0xFF18202E),
                  borderRadius: BorderRadius.circular(borderR),
                  border: Border.all(color: const Color(0xFF2A3650), width: 2.5),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withAlpha(180), blurRadius: 60, spreadRadius: 8),
                    BoxShadow(color: kGold.withAlpha(8), blurRadius: 100, spreadRadius: 30),
                  ],
                ),
                child: Column(children: [
                  // Notch / top bar
                  if (!isTablet) _phoneTop(),
                  // WebView
                  Expanded(child: ClipRRect(
                    borderRadius: isTablet
                      ? BorderRadius.circular(borderR - 2)
                      : BorderRadius.zero,
                    child: SizedBox(
                      width: _devW * _scale,
                      child: _registered
                        ? _buildWebView()
                        : const Center(child: CircularProgressIndicator(color: kGold)),
                    ),
                  )),
                  // Bottom indicator
                  _phoneBottom(isTablet),
                ]),
              ),

              // Nav buttons
              const SizedBox(height: 14),
              Row(mainAxisSize: MainAxisSize.min, children: [
                _navBtn(Icons.arrow_back_ios_rounded, () {
                  html.window.history.back();
                }),
                const SizedBox(width: 8),
                _navBtn(Icons.home_rounded, () => _navigate('/landing')),
                const SizedBox(width: 8),
                _navBtn(Icons.refresh_rounded, _reload),
                const SizedBox(width: 8),
                _navBtn(Icons.arrow_forward_ios_rounded, () {
                  html.window.history.forward();
                }),
              ]),
            ],
          ),
        ),
      ]),
    );
  }

  Widget _buildWebView() {
    return Transform.scale(
      scale: _scale,
      alignment: Alignment.topLeft,
      child: SizedBox(
        width: _devW,
        height: _devH,
        child: const HtmlElementView(viewType: 'newgame-webview'),
      ),
    );
  }

  Widget _phoneTop() => Container(
    height: 28,
    color: const Color(0xFF0F1521),
    child: Center(
      child: Container(
        width: 90, height: 18,
        decoration: BoxDecoration(
          color: const Color(0xFF18202E),
          borderRadius: BorderRadius.circular(9),
        ),
        child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          Container(width: 9, height: 9,
            decoration: BoxDecoration(
              color: const Color(0xFF0F1521),
              shape: BoxShape.circle,
              border: Border.all(color: kBorder, width: 0.5),
            )),
          const SizedBox(width: 6),
          Container(width: 32, height: 5,
            decoration: BoxDecoration(
              color: const Color(0xFF0F1521),
              borderRadius: BorderRadius.circular(3),
            )),
        ]),
      ),
    ),
  );

  Widget _phoneBottom(bool tablet) => Container(
    height: tablet ? 10 : 20,
    color: const Color(0xFF0F1521),
    child: Center(
      child: Container(
        width: tablet ? 80 : 60,
        height: 4,
        decoration: BoxDecoration(
          color: Colors.white.withAlpha(60),
          borderRadius: BorderRadius.circular(2),
        ),
      ),
    ),
  );

  Widget _navBtn(IconData icon, VoidCallback onTap) => GestureDetector(
    onTap: onTap,
    child: Container(
      width: 36, height: 36,
      decoration: BoxDecoration(
        color: kSurf,
        shape: BoxShape.circle,
        border: Border.all(color: kBorder),
      ),
      child: Icon(icon, size: 14, color: kMuted),
    ),
  );
}

// ── Dot Grid Background ────────────────────────────────
class _DotGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    const step = 28.0;
    final paint = Paint()
      ..color = const Color(0xFF0F1521)
      ..style = PaintingStyle.fill;
    for (double x = 0; x < size.width; x += step) {
      for (double y = 0; y < size.height; y += step) {
        canvas.drawCircle(Offset(x, y), 1, paint);
      }
    }
  }
  @override bool shouldRepaint(_) => false;
}
