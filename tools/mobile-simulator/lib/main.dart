// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:window_manager/window_manager.dart';

/* ═══════════════════════════════════════════════════════════════
   NEWGAME Mobile Simulator
   Flutter Desktop App — Preview web app di berbagai ukuran device
   
   Setup:
     cd tools/mobile-simulator
     flutter pub get
     flutter run -d windows
   ═══════════════════════════════════════════════════════════════ */

// ── Device presets ────────────────────────────────────────────
class DevicePreset {
  final String name;
  final String emoji;
  final double width;
  final double height;
  final bool isTablet;
  final String os; // 'ios' | 'android' | 'tablet'

  const DevicePreset({
    required this.name,
    required this.emoji,
    required this.width,
    required this.height,
    this.isTablet = false,
    this.os = 'android',
  });
}

const List<DevicePreset> kDevices = [
  DevicePreset(
      name: 'iPhone SE (3rd)', emoji: '📱', width: 375, height: 667, os: 'ios'),
  DevicePreset(
      name: 'iPhone 14', emoji: '📱', width: 390, height: 844, os: 'ios'),
  DevicePreset(
      name: 'iPhone 14 Pro Max',
      emoji: '📱',
      width: 430,
      height: 932,
      os: 'ios'),
  DevicePreset(name: 'Pixel 7', emoji: '📱', width: 412, height: 915),
  DevicePreset(
      name: 'Samsung Galaxy S23', emoji: '📱', width: 360, height: 780),
  DevicePreset(name: 'Redmi Note 12', emoji: '📱', width: 393, height: 873),
  DevicePreset(name: 'OPPO Reno 10', emoji: '📱', width: 412, height: 892),
  DevicePreset(
      name: 'iPad Mini 6',
      emoji: '📟',
      width: 768,
      height: 1024,
      isTablet: true,
      os: 'ios'),
  DevicePreset(
      name: 'iPad Air 5',
      emoji: '📟',
      width: 820,
      height: 1180,
      isTablet: true,
      os: 'ios'),
];

const String kBaseUrl = 'http://localhost:3000';

// ── Quick navigation links ────────────────────────────────────
const List<(String label, String path, String emoji)> kNavLinks = [
  ('Landing', '/landing', '🏠'),
  ('Login', '/login', '🔐'),
  ('Dashboard', '/dashboard', '📊'),
  ('Leaderboard', '/dashboard/leaderboard', '🏆'),
  ('Berita', '/dashboard/news', '📰'),
  ('Profile', '/dashboard/profile', '👤'),
  ('Admin', '/dashboard/admin', '⚙️'),
  ('Dev Profile', '/dev-profile', '💻'),
];

/* ═══════════════════════════════════════════════════════════════
   ENTRY POINT
   ═══════════════════════════════════════════════════════════════ */
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await windowManager.ensureInitialized();
  // await windowManager.ensureInitialized();

  const opts = WindowOptions(
    size: Size(1340, 860),
    minimumSize: Size(1000, 680),
    center: true,
    title: 'NEWGAME — Mobile Simulator',
    backgroundColor: Colors.transparent,
    titleBarStyle: TitleBarStyle.normal,
    skipTaskbar: false,
  );

  await windowManager.waitUntilReadyToShow(opts, () async {
    await windowManager.show();
    await windowManager.focus();
  });

  runApp(const NewgameSimApp());
}

/* ═══════════════════════════════════════════════════════════════
   APP ROOT
   ═══════════════════════════════════════════════════════════════ */
class NewgameSimApp extends StatelessWidget {
  const NewgameSimApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NEWGAME Mobile Simulator',
      debugShowCheckedModeBanner: false,
      theme: _buildTheme(),
      home: const SimulatorPage(),
    );
  }

  ThemeData _buildTheme() {
    const gold = Color(0xFFFDCF41);
    const ink = Color(0xFF1F293A);
    const bg = Color(0xFF080D14);
    const surf = Color(0xFF0C1420);
    const muted = Color(0xFF8892A4);
    const txt = Color(0xFFF0EEF4);

    return ThemeData(
      brightness: Brightness.dark,
      useMaterial3: true,
      scaffoldBackgroundColor: bg,
      colorScheme: const ColorScheme.dark(
        primary: gold,
        onPrimary: ink,
        secondary: Color(0xFFB9A6CE),
        surface: surf,
        onSurface: txt,
        surfaceVariant: Color(0xFF111827),
      ),
      sliderTheme:
          const SliderThemeData(activeTrackColor: gold, thumbColor: gold),
      textTheme: const TextTheme(
        bodySmall: TextStyle(color: muted, fontSize: 11),
        bodyMedium: TextStyle(color: txt, fontSize: 12),
        labelSmall: TextStyle(color: muted, fontSize: 10, letterSpacing: 1.2),
      ),
    );
  }
}

/* ═══════════════════════════════════════════════════════════════
   MAIN SIMULATOR PAGE
   ═══════════════════════════════════════════════════════════════ */
class SimulatorPage extends StatefulWidget {
  const SimulatorPage({super.key});
  @override
  State<SimulatorPage> createState() => _SimulatorPageState();
}

class _SimulatorPageState extends State<SimulatorPage> with WindowListener {
  // ── State ──────────────────────────────────────────────────
  DevicePreset _device = kDevices[1]; // iPhone 14 default
  bool _landscape = false;
  double _scale = 0.72;
  String _currentUrl = '$kBaseUrl/landing';
  bool _isLoading = false;
  int _loadProgress = 0;
  final _urlCtrl = TextEditingController(text: '$kBaseUrl/landing');
  WebViewController? _wvc;

  // ── Computed helpers ───────────────────────────────────────
  double get _devW => _landscape ? _device.height : _device.width;
  double get _devH => _landscape ? _device.width : _device.height;
  double get _frameW => _devW * _scale + (_device.isTablet ? 28 : 22) * 2;
  double get _frameH => _devH * _scale + (_device.isTablet ? 18 : 38) * 2;
  String get _sizeTxt => '${_devW.round()}×${_devH.round()}';

  // ── WebView init ───────────────────────────────────────────
  void _initWVC() {
    _wvc = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Colors.transparent)
      ..setNavigationDelegate(NavigationDelegate(
        onPageStarted: (url) => setState(() {
          _isLoading = true;
          _loadProgress = 0;
          _currentUrl = url;
          _urlCtrl.text = url;
        }),
        onProgress: (p) => setState(() => _loadProgress = p),
        onPageFinished: (_) => setState(() => _isLoading = false),
        onWebResourceError: (e) => setState(() => _isLoading = false),
      ))
      ..loadRequest(Uri.parse(_currentUrl));
  }

  @override
  void initState() {
    super.initState();
    windowManager.addListener(this);
    _initWVC();
  }

  @override
  void dispose() {
    windowManager.removeListener(this);
    _urlCtrl.dispose();
    super.dispose();
  }

  void _navigate(String url) {
    if (!url.startsWith('http')) url = '$kBaseUrl$url';
    _wvc?.loadRequest(Uri.parse(url));
    setState(() => _currentUrl = url);
  }

  // ── BUILD ──────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          _buildSidebar(),
          Expanded(child: _buildCanvas()),
        ],
      ),
    );
  }

  /* ── SIDEBAR ────────────────────────────────────────────── */
  Widget _buildSidebar() {
    final c = Theme.of(context).colorScheme;
    return Container(
      width: 264,
      decoration: BoxDecoration(
        color: const Color(0xFF080D14),
        border:
            Border(right: BorderSide(color: Colors.white.withOpacity(0.06))),
      ),
      child: Column(
        children: [
          // Brand header
          Container(
            padding: const EdgeInsets.fromLTRB(18, 18, 18, 14),
            decoration: BoxDecoration(
              border: Border(
                  bottom: BorderSide(color: Colors.white.withOpacity(0.06))),
            ),
            child: Row(
              children: [
                Container(
                  width: 34,
                  height: 34,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(colors: [c.primary, c.secondary]),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.phone_android,
                      size: 18, color: Color(0xFF1F293A)),
                ),
                const SizedBox(width: 10),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('NEWGAME',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: c.primary,
                          letterSpacing: 1.5,
                        )),
                    const Text('Mobile Simulator',
                        style: TextStyle(
                          fontSize: 10,
                          color: Color(0xFF8892A4),
                        )),
                  ],
                ),
              ],
            ),
          ),

          // Scrollable content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _section('URL', [_buildUrlBar()]),
                  const SizedBox(height: 18),
                  _section('Navigasi Cepat', [
                    ...kNavLinks.map((l) => _navItem(l.$1, l.$2, l.$3)),
                  ]),
                  const SizedBox(height: 18),
                  _section('Device', [
                    ...kDevices.map((d) => _deviceItem(d)),
                  ]),
                  const SizedBox(height: 18),
                  _section('Skala Tampilan', [
                    Row(children: [
                      Text('${(_scale * 100).round()}%',
                          style: const TextStyle(
                              fontSize: 11, color: Color(0xFF8892A4))),
                      Expanded(
                        child: Slider(
                          value: _scale,
                          min: 0.3,
                          max: 1.0,
                          divisions: 14,
                          onChanged: (v) => setState(() => _scale = v),
                        ),
                      ),
                    ]),
                  ]),
                  const SizedBox(height: 18),
                  _section('Orientasi', [
                    Row(children: [
                      _orientBtn(
                          'Portrait', Icons.stay_current_portrait, false),
                      const SizedBox(width: 8),
                      _orientBtn(
                          'Landscape', Icons.stay_current_landscape, true),
                    ]),
                  ]),
                  const SizedBox(height: 18),
                  // Info panel
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFDCF41).withOpacity(0.06),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                          color: const Color(0xFFFDCF41).withOpacity(0.15)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(children: [
                          const Icon(Icons.info_outline,
                              size: 12, color: Color(0xFFFDCF41)),
                          const SizedBox(width: 6),
                          Text('INFO',
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.w800,
                                color: const Color(0xFFFDCF41).withOpacity(0.8),
                                letterSpacing: 1.2,
                              )),
                        ]),
                        const SizedBox(height: 6),
                        const Text(
                          'Pastikan dev server berjalan:\nnpm run dev (port 3000)',
                          style: TextStyle(
                              fontSize: 10,
                              color: Color(0xFF8892A4),
                              height: 1.5),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Status bar
          _buildStatusBar(),
        ],
      ),
    );
  }

  Widget _section(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title.toUpperCase(),
            style: const TextStyle(
              fontSize: 9.5,
              fontWeight: FontWeight.w800,
              color: Color(0xFF8892A4),
              letterSpacing: 1.8,
            )),
        const SizedBox(height: 8),
        ...children,
      ],
    );
  }

  Widget _buildUrlBar() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0C1420),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _urlCtrl,
              style: const TextStyle(fontSize: 11, color: Color(0xFFF0EEF4)),
              decoration: const InputDecoration(
                border: InputBorder.none,
                isDense: true,
                contentPadding: EdgeInsets.zero,
                hintText: 'http://localhost:3000/...',
                hintStyle: TextStyle(fontSize: 11, color: Color(0xFF8892A4)),
              ),
              onSubmitted: (v) => _navigate(v),
            ),
          ),
          GestureDetector(
            onTap: () => _navigate(_urlCtrl.text),
            child: const Padding(
              padding: EdgeInsets.symmetric(horizontal: 6, vertical: 8),
              child: Icon(Icons.refresh, size: 15, color: Color(0xFF8892A4)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _navItem(String label, String path, String emoji) {
    final isActive = _currentUrl.endsWith(path) || _currentUrl.contains(path);
    return GestureDetector(
      onTap: () => _navigate(path),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: 3),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
        decoration: BoxDecoration(
          color: isActive
              ? const Color(0xFFFDCF41).withOpacity(0.1)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(7),
          border: Border.all(
            color: isActive
                ? const Color(0xFFFDCF41).withOpacity(0.25)
                : Colors.transparent,
          ),
        ),
        child: Row(
          children: [
            Text(emoji, style: const TextStyle(fontSize: 12)),
            const SizedBox(width: 8),
            Text(label,
                style: TextStyle(
                  fontSize: 12,
                  color: isActive
                      ? const Color(0xFFFDCF41)
                      : const Color(0xFFF0EEF4),
                  fontWeight: isActive ? FontWeight.w700 : FontWeight.normal,
                )),
            if (isActive) ...[
              const Spacer(),
              Container(
                  width: 4,
                  height: 4,
                  decoration: const BoxDecoration(
                    color: Color(0xFFFDCF41),
                    shape: BoxShape.circle,
                  )),
            ],
          ],
        ),
      ),
    );
  }

  Widget _deviceItem(DevicePreset d) {
    final isActive = _device.name == d.name;
    return GestureDetector(
      onTap: () => setState(() => _device = d),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: 3),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
        decoration: BoxDecoration(
          color: isActive
              ? const Color(0xFFB9A6CE).withOpacity(0.12)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(7),
          border: Border.all(
            color: isActive
                ? const Color(0xFFB9A6CE).withOpacity(0.25)
                : Colors.transparent,
          ),
        ),
        child: Row(
          children: [
            Text(d.emoji, style: const TextStyle(fontSize: 11)),
            const SizedBox(width: 8),
            Expanded(
                child: Text(d.name,
                    style: TextStyle(
                      fontSize: 11,
                      color: isActive
                          ? const Color(0xFFB9A6CE)
                          : const Color(0xFFF0EEF4),
                      fontWeight:
                          isActive ? FontWeight.w700 : FontWeight.normal,
                    ))),
            Text('${d.width.round()}×${d.height.round()}',
                style:
                    const TextStyle(fontSize: 9.5, color: Color(0xFF8892A4))),
          ],
        ),
      ),
    );
  }

  Widget _orientBtn(String label, IconData icon, bool val) {
    final isActive = _landscape == val;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _landscape = val),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 9),
          decoration: BoxDecoration(
            color: isActive
                ? const Color(0xFFFDCF41).withOpacity(0.1)
                : const Color(0xFF0C1420),
            borderRadius: BorderRadius.circular(7),
            border: Border.all(
              color: isActive
                  ? const Color(0xFFFDCF41).withOpacity(0.3)
                  : Colors.white.withOpacity(0.06),
            ),
          ),
          child: Column(children: [
            Icon(icon,
                size: 17,
                color: isActive
                    ? const Color(0xFFFDCF41)
                    : const Color(0xFF8892A4)),
            const SizedBox(height: 4),
            Text(label,
                style: TextStyle(
                  fontSize: 10,
                  color: isActive
                      ? const Color(0xFFFDCF41)
                      : const Color(0xFF8892A4),
                )),
          ]),
        ),
      ),
    );
  }

  Widget _buildStatusBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF050A10),
        border: Border(top: BorderSide(color: Colors.white.withOpacity(0.05))),
      ),
      child: Row(
        children: [
          // Status dot
          AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              color: _isLoading
                  ? const Color(0xFFFDCF41)
                  : const Color(0xFF22C55E),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: (_isLoading
                          ? const Color(0xFFFDCF41)
                          : const Color(0xFF22C55E))
                      .withOpacity(0.5),
                  blurRadius: 4,
                )
              ],
            ),
          ),
          const SizedBox(width: 6),
          Expanded(
            child: Text(
              _isLoading ? 'Loading... $_loadProgress%' : 'Ready',
              style: const TextStyle(fontSize: 10, color: Color(0xFF8892A4)),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          Text(_sizeTxt,
              style: const TextStyle(
                fontSize: 9.5,
                color: Color(0xFF8892A4),
                fontFamily: 'monospace',
              )),
        ],
      ),
    );
  }

  /* ── CANVAS CENTER ──────────────────────────────────────── */
  Widget _buildCanvas() {
    return Container(
      color: const Color(0xFF060B11),
      child: Stack(
        children: [
          // Dot grid bg
          CustomPaint(
              painter: _DotGridPainter(), child: const SizedBox.expand()),

          Center(
            child: SingleChildScrollView(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(height: 24),
                  _buildDeviceChip(),
                  const SizedBox(height: 20),
                  _buildPhoneFrame(),
                  const SizedBox(height: 16),
                  _buildNavButtons(),
                  const SizedBox(height: 28),
                ],
              ),
            ),
          ),

          // Progress bar
          if (_isLoading)
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: LinearProgressIndicator(
                value: _loadProgress / 100,
                backgroundColor: Colors.transparent,
                color: const Color(0xFFFDCF41).withOpacity(0.85),
                minHeight: 2,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildDeviceChip() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
      decoration: BoxDecoration(
        color: const Color(0xFF0C1420),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.07)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(_device.emoji, style: const TextStyle(fontSize: 14)),
          const SizedBox(width: 8),
          Text(_device.name,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: Color(0xFFF0EEF4),
              )),
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 8),
            width: 1,
            height: 12,
            color: Colors.white.withOpacity(0.12),
          ),
          Text(_sizeTxt,
              style: const TextStyle(
                fontSize: 11,
                color: Color(0xFF8892A4),
                fontFamily: 'monospace',
              )),
          const SizedBox(width: 8),
          Text('${(_scale * 100).round()}%',
              style: const TextStyle(
                fontSize: 11,
                color: Color(0xFFFDCF41),
                fontWeight: FontWeight.w700,
              )),
          if (_landscape) ...[
            const SizedBox(width: 6),
            const Icon(Icons.screen_rotation,
                size: 12, color: Color(0xFF8892A4)),
          ],
        ],
      ),
    );
  }

  Widget _buildPhoneFrame() {
    final topBarH = _device.isTablet ? 16.0 : 28.0;
    final botBarH = _device.isTablet ? 12.0 : 20.0;

    return Container(
      width: _frameW,
      height: _frameH,
      decoration: BoxDecoration(
        color: const Color(0xFF18202E),
        borderRadius: BorderRadius.circular(_device.isTablet ? 22 : 42),
        border: Border.all(color: const Color(0xFF2A3650), width: 2.5),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.7),
              blurRadius: 70,
              spreadRadius: 8),
          BoxShadow(
              color: const Color(0xFFFDCF41).withOpacity(0.03),
              blurRadius: 100,
              spreadRadius: 30),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(_device.isTablet ? 20 : 40),
        child: Column(
          children: [
            // Top bar (notch area)
            if (!_device.isTablet)
              Container(
                height: topBarH,
                color: const Color(0xFF0F1521),
                child: Center(
                  child: Container(
                    width: 100,
                    height: 18,
                    decoration: BoxDecoration(
                      color: const Color(0xFF18202E),
                      borderRadius: BorderRadius.circular(9),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(
                              color: const Color(0xFF0F1521),
                              shape: BoxShape.circle,
                              border: Border.all(
                                  color: Colors.white.withOpacity(0.08)),
                            )),
                        const SizedBox(width: 4),
                        Container(
                          width: 36,
                          height: 6,
                          decoration: BoxDecoration(
                            color: const Color(0xFF0F1521),
                            borderRadius: BorderRadius.circular(3),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

            // WebView content
            Expanded(
              child: SizedBox(
                width: _devW * _scale,
                child: _wvc != null
                    ? WebViewWidget(controller: _wvc!)
                    : const Center(
                        child:
                            CircularProgressIndicator(color: Color(0xFFFDCF41)),
                      ),
              ),
            ),

            // Bottom bar (home indicator)
            Container(
              height: botBarH,
              color: const Color(0xFF0F1521),
              child: Center(
                child: Container(
                  width: _device.isTablet ? 80 : 60,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.25),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNavButtons() {
    final btns = [
      (Icons.arrow_back_ios_new, 'Back', () => _wvc?.goBack()),
      (Icons.arrow_forward_ios, 'Forward', () => _wvc?.goForward()),
      (Icons.refresh, 'Reload', () => _wvc?.reload()),
      (Icons.home_outlined, 'Home', () => _navigate('/landing')),
    ];

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: btns
          .map((b) => Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: Tooltip(
                  message: b.$2,
                  child: GestureDetector(
                    onTap: () => b.$3(),
                    child: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: const Color(0xFF0C1420),
                        borderRadius: BorderRadius.circular(10),
                        border:
                            Border.all(color: Colors.white.withOpacity(0.07)),
                      ),
                      child:
                          Icon(b.$1, size: 15, color: const Color(0xFF8892A4)),
                    ),
                  ),
                ),
              ))
          .toList(),
    );
  }
}

/* ═══════════════════════════════════════════════════════════════
   DOT GRID PAINTER
   ═══════════════════════════════════════════════════════════════ */
class _DotGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.03)
      ..strokeWidth = 1;
    const step = 28.0;
    for (double x = 0; x < size.width; x += step) {
      for (double y = 0; y < size.height; y += step) {
        canvas.drawCircle(Offset(x, y), 1.2, paint);
      }
    }
  }

  @override
  bool shouldRepaint(_) => false;
}
