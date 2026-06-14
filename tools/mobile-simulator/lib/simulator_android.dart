// simulator_android.dart
// Mode Android — full screen WebView dengan bottom nav + drawer
// (kode dari main.dart lama, dibersihkan dan dipisahkan)

import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'main.dart';

class AndroidSimulatorPage extends StatefulWidget {
  const AndroidSimulatorPage({super.key});
  @override
  State<AndroidSimulatorPage> createState() => _AndroidSimulatorPageState();
}

class _AndroidSimulatorPageState extends State<AndroidSimulatorPage> {
  // 10.0.2.2 = localhost host dari dalam Android Emulator
  // Ganti ke IP komputer untuk HP fisik lewat WiFi
  static const _defaultBase = 'http://10.0.2.2:3000';
  String _baseUrl = _defaultBase;

  late final WebViewController _controller;
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
        onPageStarted: (url) => setState(() {
          _isLoading = true;
          _hasError = false;
          _updateNavIndex(url);
        }),
        onPageFinished: (url) {
          setState(() => _isLoading = false);
          _controller.runJavaScript(
            "try { localStorage.setItem('ng-theme', 'dark'); } catch(e) {}"
          );
        },
        onProgress: (p) => setState(() => _loadProgress = p / 100),
        onWebResourceError: (error) => setState(() {
          _hasError = true;
          _isLoading = false;
          _errorMessage = error.description;
        }),
        onNavigationRequest: (req) {
          if (req.url.contains('localhost') ||
              req.url.contains('10.0.2.2') ||
              req.url.contains('192.168.')) {
            return NavigationDecision.navigate;
          }
          return NavigationDecision.prevent;
        },
      ))
      ..loadRequest(Uri.parse('$_baseUrl/landing'));
  }

  void _updateNavIndex(String url) {
    for (int i = 0; i < navPages.length; i++) {
      if (url.contains(navPages[i].path)) {
        setState(() => _currentNavIndex = i);
        return;
      }
    }
  }

  void _navigate(String path) {
    setState(() => _hasError = false);
    _controller.loadRequest(Uri.parse('$_baseUrl$path'));
  }

  void _reload() {
    setState(() => _hasError = false);
    _controller.reload();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      appBar: _buildAppBar(),
      body: _hasError ? _buildErrorView() : WebViewWidget(controller: _controller),
      bottomNavigationBar: _buildBottomNav(),
      drawer: _buildDrawer(),
    );
  }

  AppBar _buildAppBar() {
    return AppBar(
      backgroundColor: kBg,
      toolbarHeight: 52,
      title: Row(children: [
        Container(
          width: 28, height: 28,
          decoration: BoxDecoration(
            gradient: const LinearGradient(colors: [kGold, kPurple]),
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Center(child: Text('N', style: TextStyle(
            fontSize: 14, fontWeight: FontWeight.w900, color: kBg,
          ))),
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
          child: const Text('v0.1.5', style: TextStyle(
            fontSize: 9, color: kGold, fontWeight: FontWeight.w600,
          )),
        ),
      ]),
      actions: [
        IconButton(
          icon: const Icon(Icons.refresh_rounded, size: 20, color: kMuted),
          onPressed: _reload,
        ),
        IconButton(
          icon: const Icon(Icons.settings_rounded, size: 20, color: kMuted),
          onPressed: _showServerDialog,
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
    );
  }

  Widget _buildErrorView() {
    return Center(child: Padding(
      padding: const EdgeInsets.all(32),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Container(
          width: 72, height: 72,
          decoration: BoxDecoration(
            color: kRed.withAlpha(20),
            shape: BoxShape.circle,
            border: Border.all(color: kRed.withAlpha(60)),
          ),
          child: const Icon(Icons.wifi_off_rounded, size: 32, color: kRed),
        ),
        const SizedBox(height: 18),
        const Text('Tidak Dapat Terhubung', style: TextStyle(
          fontSize: 16, fontWeight: FontWeight.w700, color: kTxt,
        )),
        const SizedBox(height: 10),
        const Text(
          'Pastikan dev server berjalan:\n  cd apps/web && npm run dev\n\n'
          'Emulator Android → gunakan 10.0.2.2\n'
          'HP fisik via WiFi → ganti ke IP komputer\n'
          'lewat tombol Settings di pojok kanan atas.',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 12, color: kMuted, height: 1.7),
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
        const SizedBox(height: 20),
        ElevatedButton.icon(
          onPressed: _reload,
          icon: const Icon(Icons.refresh_rounded, size: 16),
          label: const Text('Coba Lagi'),
          style: ElevatedButton.styleFrom(
            backgroundColor: kGold,
            foregroundColor: kBg,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        ),
      ]),
    ));
  }

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
                  duration: const Duration(milliseconds: 180),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                  decoration: BoxDecoration(
                    color: active ? kGold.withAlpha(20) : Colors.transparent,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                    Icon(page.icon, size: 22, color: active ? kGold : kMuted),
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

  Widget _buildDrawer() {
    return Drawer(
      backgroundColor: kBg,
      child: SafeArea(child: Column(children: [
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
              child: const Center(child: Text('N', style: TextStyle(
                fontSize: 22, fontWeight: FontWeight.w900, color: kBg,
              ))),
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
        Expanded(child: ListView.builder(
          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
          itemCount: navPages.length,
          itemBuilder: (context, i) {
            final page = navPages[i];
            final active = _currentNavIndex == i;
            return ListTile(
              dense: true,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              tileColor: active ? kGold.withAlpha(20) : Colors.transparent,
              leading: Icon(page.icon, size: 20, color: active ? kGold : kMuted),
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
        )),
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
              _hasError ? 'Disconnected' : 'Connected · $_baseUrl',
              style: const TextStyle(fontSize: 10, color: kMuted),
              overflow: TextOverflow.ellipsis,
            )),
            const Text('v0.1.5', style: TextStyle(
              fontSize: 10, color: kMuted, fontFamily: 'monospace',
            )),
          ]),
        ),
      ])),
    );
  }

  void _showServerDialog() {
    final ctrl = TextEditingController(text: _baseUrl);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: kSurf,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Server URL', style: TextStyle(
          fontSize: 14, fontWeight: FontWeight.w700, color: kTxt,
        )),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          const Text(
            'Emulator Android : http://10.0.2.2:3000\n'
            'HP fisik via WiFi: http://[IP_PC]:3000\n\n'
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
              setState(() => _baseUrl = ctrl.text.trim());
              Navigator.pop(ctx);
              _controller.loadRequest(Uri.parse('$_baseUrl/landing'));
            },
            child: const Text('Terapkan'),
          ),
        ],
      ),
    );
  }
}
