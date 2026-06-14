// simulator_windows.dart
// Mode desktop Windows — jendela berukuran HP dengan phone frame + WebView EdgeChromium
//
// Tampilkan web app di dalam bingkai phone grafis.
// WebView menggunakan EdgeChromium via webview_windows package.

import 'package:flutter/material.dart';
import 'package:webview_windows/webview_windows.dart';
import 'main.dart';

// Daftar preset device (lebar x tinggi viewport)
const _devices = <_Device>[
  _Device('Pixel 7',        412, 915),
  _Device('Galaxy S23',     360, 780),
  _Device('Redmi Note 12',  393, 873),
  _Device('iPhone 14',      390, 844),
  _Device('iPhone SE',      375, 667),
  _Device('Galaxy A54',     412, 892),
];

class _Device {
  final String name;
  final int w;
  final int h;
  const _Device(this.name, this.w, this.h);
}

class WindowsSimulatorPage extends StatefulWidget {
  const WindowsSimulatorPage({super.key});

  @override
  State<WindowsSimulatorPage> createState() => _WindowsSimulatorPageState();
}

class _WindowsSimulatorPageState extends State<WindowsSimulatorPage> {
  final _controller = WebviewController();
  bool _initialized = false;
  bool _hasError = false;
  String _errorMsg = '';
  bool _isLoading = true;

  String _baseUrl = 'http://localhost:3000';
  String _currentPath = '/landing';
  int _selectedDevice = 0;
  int _selectedNav = 0;

  _Device get _device => _devices[_selectedDevice];

  @override
  void initState() {
    super.initState();
    _initWebView();
  }

  Future<void> _initWebView() async {
    try {
      await _controller.initialize();
      await _controller.setBackgroundColor(kBg);
      await _controller.setPopupWindowPolicy(WebviewPopupWindowPolicy.deny);

      _controller.url.listen((url) {
        if (mounted) {
          setState(() => _currentPath = url);
          _updateNav(url);
        }
      });

      _controller.loadingState.listen((state) {
        if (mounted) {
          setState(() => _isLoading = state == LoadingState.loading);
        }
      });

      await _controller.loadUrl('$_baseUrl$_currentPath');

      setState(() => _initialized = true);
    } catch (e) {
      setState(() {
        _hasError = true;
        _errorMsg = e.toString();
      });
    }
  }

  void _navigate(String path) {
    _currentPath = path;
    _controller.loadUrl('$_baseUrl$path');
  }

  void _reload() => _controller.reload();

  void _updateNav(String url) {
    for (int i = 0; i < navPages.length; i++) {
      if (url.contains(navPages[i].path)) {
        setState(() => _selectedNav = i);
        return;
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF05090F),
      body: Column(children: [
        _buildTopBar(),
        Expanded(
          child: Row(children: [
            _buildSidebar(),
            Expanded(child: _buildPhoneFrame()),
          ]),
        ),
        _buildStatusBar(),
      ]),
    );
  }

  // ── Top control bar ─────────────────────────────────────
  Widget _buildTopBar() {
    return Container(
      height: 44,
      decoration: const BoxDecoration(
        color: Color(0xFF080D14),
        border: Border(bottom: BorderSide(color: kBorder)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Row(children: [
        // Logo
        Container(
          width: 26, height: 26,
          decoration: BoxDecoration(
            gradient: const LinearGradient(colors: [kGold, kPurple]),
            borderRadius: BorderRadius.circular(7),
          ),
          child: const Center(
            child: Text('N', style: TextStyle(
              fontSize: 13, fontWeight: FontWeight.w900, color: kBg,
            )),
          ),
        ),
        const SizedBox(width: 8),
        const Text('NEWGAME Simulator', style: TextStyle(
          fontSize: 12, fontWeight: FontWeight.w700,
          color: kGold, letterSpacing: 0.5,
        )),
        const SizedBox(width: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(
            color: kGold.withAlpha(20),
            borderRadius: BorderRadius.circular(4),
            border: Border.all(color: kGold.withAlpha(50)),
          ),
          child: const Text('v0.1.5', style: TextStyle(
            fontSize: 9, color: kGold, fontWeight: FontWeight.w600,
          )),
        ),
        const Spacer(),

        // Device selector
        DropdownButton<int>(
          value: _selectedDevice,
          dropdownColor: kSurf,
          underline: const SizedBox(),
          isDense: true,
          style: const TextStyle(fontSize: 11, color: kTxt),
          items: List.generate(_devices.length, (i) => DropdownMenuItem(
            value: i,
            child: Text(
              '${_devices[i].name} (${_devices[i].w}×${_devices[i].h})',
              style: const TextStyle(fontSize: 11, color: kTxt),
            ),
          )),
          onChanged: (v) {
            if (v != null) setState(() => _selectedDevice = v);
          },
        ),
        const SizedBox(width: 12),

        // Reload
        _iconBtn(Icons.refresh_rounded, 'Reload', _reload),
        const SizedBox(width: 4),
        // Back
        _iconBtn(Icons.arrow_back_rounded, 'Back', () => _controller.goBack()),
        const SizedBox(width: 4),
        // Forward
        _iconBtn(Icons.arrow_forward_rounded, 'Forward', () => _controller.goForward()),
        const SizedBox(width: 4),
        // Server config
        _iconBtn(Icons.settings_rounded, 'Server URL', _showServerDialog),
      ]),
    );
  }

  Widget _iconBtn(IconData icon, String tooltip, VoidCallback onTap) {
    return Tooltip(
      message: tooltip,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(6),
        child: Container(
          width: 28, height: 28,
          decoration: BoxDecoration(
            color: kSurf,
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: kBorder),
          ),
          child: Icon(icon, size: 14, color: kMuted),
        ),
      ),
    );
  }

  // ── Sidebar navigasi ─────────────────────────────────────
  Widget _buildSidebar() {
    return Container(
      width: 140,
      decoration: const BoxDecoration(
        color: Color(0xFF07101A),
        border: Border(right: BorderSide(color: kBorder)),
      ),
      child: Column(children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(10, 10, 10, 6),
          child: Text('HALAMAN', style: TextStyle(
            fontSize: 9, fontWeight: FontWeight.w800,
            color: kMuted.withAlpha(180),
            letterSpacing: 1.2,
          )),
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            itemCount: navPages.length,
            itemBuilder: (context, i) {
              final page = navPages[i];
              final active = _selectedNav == i;
              return InkWell(
                onTap: () {
                  setState(() => _selectedNav = i);
                  _navigate(page.path);
                },
                borderRadius: BorderRadius.circular(8),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  margin: const EdgeInsets.only(bottom: 2),
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 7),
                  decoration: BoxDecoration(
                    color: active ? kGold.withAlpha(20) : Colors.transparent,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: active ? kGold.withAlpha(50) : Colors.transparent,
                    ),
                  ),
                  child: Row(children: [
                    Icon(page.icon, size: 14,
                      color: active ? kGold : kMuted),
                    const SizedBox(width: 7),
                    Expanded(child: Text(page.label, style: TextStyle(
                      fontSize: 11,
                      color: active ? kGold : kTxt,
                      fontWeight: active ? FontWeight.w700 : FontWeight.normal,
                    ))),
                  ]),
                ),
              );
            },
          ),
        ),
      ]),
    );
  }

  // ── Phone frame + WebView ────────────────────────────────
  Widget _buildPhoneFrame() {
    return Container(
      color: const Color(0xFF05090F),
      child: Center(
        child: FittedBox(
          fit: BoxFit.contain,
          child: SizedBox(
            width: _device.w.toDouble() + 24,
            height: _device.h.toDouble() + 80,
            child: Stack(children: [
              // Phone shell
              Positioned.fill(
                child: CustomPaint(painter: _PhoneFramePainter()),
              ),

              // Screen content
              Positioned(
                left: 12, right: 12,
                top: 40, bottom: 40,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(28),
                  child: _buildWebViewContent(),
                ),
              ),

              // Loading bar
              if (_isLoading)
                Positioned(
                  top: 40, left: 12, right: 12,
                  child: const LinearProgressIndicator(
                    backgroundColor: Colors.transparent,
                    valueColor: AlwaysStoppedAnimation<Color>(kGold),
                    minHeight: 2,
                  ),
                ),
            ]),
          ),
        ),
      ),
    );
  }

  Widget _buildWebViewContent() {
    if (_hasError) {
      return Container(
        color: kBg,
        child: Center(child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.error_outline_rounded, size: 36, color: kRed),
            const SizedBox(height: 12),
            const Text('WebView error', style: TextStyle(
              color: kTxt, fontSize: 14, fontWeight: FontWeight.w600,
            )),
            const SizedBox(height: 8),
            Text(_errorMsg, style: const TextStyle(
              fontSize: 10, color: kMuted, fontFamily: 'monospace',
            ), textAlign: TextAlign.center),
            const SizedBox(height: 12),
            Text(
              'Pastikan Microsoft Edge WebView2 Runtime sudah terinstal.\n'
              'Download: microsoft.com/edge/webview2',
              style: const TextStyle(fontSize: 10, color: kMuted),
              textAlign: TextAlign.center,
            ),
          ]),
        )),
      );
    }
    if (!_initialized) {
      return Container(
        color: kBg,
        child: const Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
          CircularProgressIndicator(color: kGold, strokeWidth: 2),
          SizedBox(height: 12),
          Text('Menginisialisasi WebView...', style: TextStyle(
            color: kMuted, fontSize: 12,
          )),
        ])),
      );
    }
    return Webview(_controller);
  }

  // ── Status bar bawah ─────────────────────────────────────
  Widget _buildStatusBar() {
    return Container(
      height: 28,
      decoration: const BoxDecoration(
        color: Color(0xFF050A10),
        border: Border(top: BorderSide(color: kBorder)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Row(children: [
        Container(
          width: 6, height: 6,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: _hasError ? kRed : (_isLoading ? kGold : kGreen),
            boxShadow: [BoxShadow(
              color: (_hasError ? kRed : (_isLoading ? kGold : kGreen)).withAlpha(120),
              blurRadius: 4,
            )],
          ),
        ),
        const SizedBox(width: 6),
        Text(
          _hasError ? 'Error' : (_isLoading ? 'Loading...' : 'Connected'),
          style: const TextStyle(fontSize: 10, color: kMuted),
        ),
        const SizedBox(width: 12),
        Expanded(child: Text(
          _currentPath,
          style: const TextStyle(
            fontSize: 10, color: kMuted, fontFamily: 'monospace',
          ),
          overflow: TextOverflow.ellipsis,
        )),
        Text('${_device.name} · ${_device.w}×${_device.h}',
          style: const TextStyle(fontSize: 10, color: kMuted)),
      ]),
    );
  }

  void _showServerDialog() {
    final ctrl = TextEditingController(text: _baseUrl);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: kSurf,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        title: const Text('Server URL', style: TextStyle(
          fontSize: 14, fontWeight: FontWeight.w700, color: kTxt,
        )),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          const Text(
            'Default: http://localhost:3000\n'
            'HP fisik: http://[IP_PC]:3000\n\n'
            'Jalankan dulu:\n  cd apps/web && npm run dev',
            style: TextStyle(fontSize: 11, color: kMuted, height: 1.6),
          ),
          const SizedBox(height: 14),
          TextField(
            controller: ctrl,
            style: const TextStyle(fontSize: 12, color: kTxt, fontFamily: 'monospace'),
            decoration: InputDecoration(
              labelText: 'Base URL',
              labelStyle: const TextStyle(fontSize: 11, color: kMuted),
              filled: true, fillColor: kBg,
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
            style: ElevatedButton.styleFrom(
              backgroundColor: kGold, foregroundColor: kBg,
            ),
            onPressed: () {
              _baseUrl = ctrl.text.trim();
              Navigator.pop(ctx);
              _controller.loadUrl('$_baseUrl$_currentPath');
            },
            child: const Text('Terapkan'),
          ),
        ],
      ),
    );
  }
}

// ── Phone Frame Painter ───────────────────────────────────
class _PhoneFramePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF1A2535)
      ..style = PaintingStyle.fill;

    final borderPaint = Paint()
      ..color = const Color(0xFF2A3A52)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    final rect = RRect.fromRectAndRadius(
      Rect.fromLTWH(0, 0, size.width, size.height),
      const Radius.circular(40),
    );

    canvas.drawRRect(rect, paint);
    canvas.drawRRect(rect, borderPaint);

    // Notch (pill shape di atas)
    final notchPaint = Paint()..color = const Color(0xFF101820);
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(size.width / 2 - 40, 14, 80, 16),
        const Radius.circular(8),
      ),
      notchPaint,
    );

    // Home indicator bawah
    final indicatorPaint = Paint()
      ..color = const Color(0xFF2A3A52)
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    canvas.drawLine(
      Offset(size.width / 2 - 24, size.height - 16),
      Offset(size.width / 2 + 24, size.height - 16),
      indicatorPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
