// ignore_for_file: deprecated_member_use

// NEWGAME — Android Demo App
// Flutter showcase for Android platform
// Run: flutter run -d <emulator-id>

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
  ));
  runApp(const NewgameApp());
}

// ── Color Palette ─────────────────────────────────────────────
const kGold = Color(0xFFFDCF41);
const kInk = Color(0xFF1F293A);
const kBg = Color(0xFF080D14);
const kSurf = Color(0xFF0C1420);
const kSurf2 = Color(0xFF111827);
const kMuted = Color(0xFF8892A4);
const kTxt = Color(0xFFF0EEF4);
const kPurple = Color(0xFFB9A6CE);
const kGreen = Color(0xFF22C55E);
const kBorder = Color(0xFF1E2D40);
const kOrange = Color(0xFFFF6B35);

// ── Player record type ────────────────────────────────────────
typedef Player = (String name, int xp, String medal);

// ── App Root ──────────────────────────────────────────────────
class NewgameApp extends StatelessWidget {
  const NewgameApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NEWGAME',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        useMaterial3: true,
        scaffoldBackgroundColor: kBg,
        colorScheme: const ColorScheme.dark(
          primary: kGold,
          onPrimary: kInk,
          secondary: kPurple,
          surface: kSurf,
          onSurface: kTxt,
        ),
        fontFamily: 'Roboto',
      ),
      home: const SplashScreen(),
    );
  }
}

// ── Splash Screen ─────────────────────────────────────────────
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _fade;
  late Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 1400));
    _fade = CurvedAnimation(parent: _ctrl, curve: Curves.easeIn);
    _scale = Tween<double>(begin: 0.7, end: 1.0)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.elasticOut));
    _ctrl.forward();
    Future.delayed(const Duration(milliseconds: 2200), () {
      if (mounted) {
        Navigator.pushReplacement(
          context,
          PageRouteBuilder(
            pageBuilder: (_, _, _) => const HomePage(),
            transitionDuration: const Duration(milliseconds: 600),
            transitionsBuilder: (_, anim, _, child) =>
                FadeTransition(opacity: anim, child: child),
          ),
        );
      }
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: Center(
        child: FadeTransition(
          opacity: _fade,
          child: ScaleTransition(
            scale: _scale,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 88,
                  height: 88,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [kGold, kPurple],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: kGold.withOpacity(0.4),
                        blurRadius: 32,
                        spreadRadius: 4,
                      ),
                    ],
                  ),
                  child: const Icon(Icons.gamepad_rounded, size: 44, color: kInk),
                ),
                const SizedBox(height: 20),
                const Text(
                  'NEWGAME',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    color: kGold,
                    letterSpacing: 4,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Platform Belajar Gamifikasi',
                  style: TextStyle(fontSize: 13, color: kMuted),
                ),
                const SizedBox(height: 36),
                SizedBox(
                  width: 180,
                  child: LinearProgressIndicator(
                    backgroundColor: kSurf2,
                    color: kGold,
                    borderRadius: BorderRadius.circular(4),
                    minHeight: 3,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ── Home Page ─────────────────────────────────────────────────
class HomePage extends StatefulWidget {
  const HomePage({super.key});
  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _tab = 0;
  final List<Widget> _pages = const [
    DashboardTab(),
    QuestTab(),
    LeaderboardTab(),
    ProfileTab(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: _pages[_tab],
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  Widget _buildBottomNav() {
    final items = [
      (Icons.dashboard_rounded, 'Dashboard'),
      (Icons.assignment_rounded, 'Quest'),
      (Icons.leaderboard_rounded, 'Rank'),
      (Icons.person_rounded, 'Profil'),
    ];
    return Container(
      decoration: const BoxDecoration(
        color: kSurf,
        border: Border(top: BorderSide(color: kBorder)),
      ),
      child: SafeArea(
        child: SizedBox(
          height: 60,
          child: Row(
            children: List.generate(items.length, (i) {
              final active = _tab == i;
              return Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _tab = i),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    decoration: BoxDecoration(
                      color: active ? kGold.withOpacity(0.08) : Colors.transparent,
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(items[i].$1,
                            size: 22, color: active ? kGold : kMuted),
                        const SizedBox(height: 3),
                        Text(items[i].$2,
                            style: TextStyle(
                              fontSize: 10,
                              color: active ? kGold : kMuted,
                              fontWeight:
                                  active ? FontWeight.w700 : FontWeight.normal,
                            )),
                      ],
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}

// ── Dashboard Tab ─────────────────────────────────────────────
class DashboardTab extends StatelessWidget {
  const DashboardTab({super.key});

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        _buildAppBar(),
        SliverPadding(
          padding: const EdgeInsets.all(16),
          sliver: SliverList(
            delegate: SliverChildListDelegate([
              _buildXpCard(),
              const SizedBox(height: 16),
              _buildStatsRow(),
              const SizedBox(height: 20),
              _sectionTitle('Quest Aktif'),
              const SizedBox(height: 10),
              _buildActiveQuest('Tutorial Flutter', 'Selesaikan 3 latihan', 0.75),
              const SizedBox(height: 8),
              _buildActiveQuest('Dart Master', 'Kerjakan 10 soal Dart', 0.40),
              const SizedBox(height: 20),
              _sectionTitle('Achievement Terbaru'),
              const SizedBox(height: 10),
              _buildAchievementsRow(),
              const SizedBox(height: 20),
            ]),
          ),
        ),
      ],
    );
  }

  Widget _buildAppBar() {
    return SliverAppBar(
      expandedHeight: 110,
      backgroundColor: kSurf,
      pinned: true,
      elevation: 0,
      flexibleSpace: FlexibleSpaceBar(
        background: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF0C1825), kSurf],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
          ),
          padding: const EdgeInsets.fromLTRB(16, 48, 16, 12),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  gradient:
                      const LinearGradient(colors: [kGold, kPurple]),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.gamepad_rounded, size: 20, color: kInk),
              ),
              const SizedBox(width: 10),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('NEWGAME',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: kGold,
                        letterSpacing: 2,
                      )),
                  Text('Selamat datang, Player!',
                      style: TextStyle(fontSize: 11, color: kMuted)),
                ],
              ),
              const Spacer(),
              Stack(
                children: [
                  const Icon(Icons.notifications_outlined,
                      color: kMuted, size: 24),
                  Positioned(
                    right: 0,
                    top: 0,
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: kGold,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildXpCard() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [kGold.withOpacity(0.15), kPurple.withOpacity(0.08)],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kGold.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: kGold.withOpacity(0.15),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: kGold.withOpacity(0.3)),
              ),
              child: const Row(children: [
                Icon(Icons.star_rounded, size: 13, color: kGold),
                SizedBox(width: 4),
                Text('Level 12',
                    style: TextStyle(
                        fontSize: 11,
                        color: kGold,
                        fontWeight: FontWeight.w700)),
              ]),
            ),
            const Spacer(),
            const Text('2,450 / 3,000 XP',
                style: TextStyle(fontSize: 12, color: kMuted)),
          ]),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: const LinearProgressIndicator(
              value: 2450 / 3000,
              backgroundColor: kSurf2,
              color: kGold,
              minHeight: 10,
            ),
          ),
          const SizedBox(height: 8),
          const Text('550 XP lagi menuju Level 13 🚀',
              style: TextStyle(fontSize: 11, color: kMuted)),
        ],
      ),
    );
  }

  Widget _buildStatsRow() {
    const stats = [
      (Icons.check_circle_rounded, '24', 'Quest\nSelesai', kGreen),
      (Icons.local_fire_department_rounded, '7', 'Streak\nHari', kGold),
      (Icons.emoji_events_rounded, '5', 'Badge\nDapat', kPurple),
    ];
    return Row(
      children: stats
          .map((s) => Expanded(
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: kSurf,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: kBorder),
                  ),
                  child: Column(children: [
                    Icon(s.$1, color: s.$4, size: 22),
                    const SizedBox(height: 6),
                    Text(s.$2,
                        style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            color: s.$4)),
                    const SizedBox(height: 2),
                    Text(s.$3,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                            fontSize: 9.5, color: kMuted, height: 1.4)),
                  ]),
                ),
              ))
          .toList(),
    );
  }

  Widget _sectionTitle(String title) => Text(title,
      style: const TextStyle(
          fontSize: 13, fontWeight: FontWeight.w800, color: kTxt));

  Widget _buildActiveQuest(String title, String sub, double progress) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: kSurf,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kBorder),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: kGold.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.assignment_rounded, size: 16, color: kGold),
          ),
          const SizedBox(width: 10),
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(title,
                style: const TextStyle(
                    fontSize: 12, fontWeight: FontWeight.w700, color: kTxt)),
            Text(sub, style: const TextStyle(fontSize: 10, color: kMuted)),
          ]),
          const Spacer(),
          Text('${(progress * 100).round()}%',
              style: const TextStyle(
                  fontSize: 12, color: kGold, fontWeight: FontWeight.w700)),
        ]),
        const SizedBox(height: 10),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: progress,
            backgroundColor: kSurf2,
            color: kGold,
            minHeight: 5,
          ),
        ),
      ]),
    );
  }

  Widget _buildAchievementsRow() {
    const badges = [
      (Icons.rocket_launch_rounded, 'First Step', kGold),
      (Icons.local_fire_department_rounded, 'On Fire', kOrange),
      (Icons.psychology_rounded, 'Thinker', kPurple),
      (Icons.speed_rounded, 'Speedy', kGreen),
    ];
    return SizedBox(
      height: 90,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: badges.length,
        separatorBuilder: (_, _) => const SizedBox(width: 10),
        itemBuilder: (_, i) => Column(children: [
          Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              color: badges[i].$3.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: badges[i].$3.withOpacity(0.3)),
            ),
            child: Icon(badges[i].$1, color: badges[i].$3, size: 26),
          ),
          const SizedBox(height: 6),
          Text(badges[i].$2,
              style: const TextStyle(fontSize: 9.5, color: kMuted)),
        ]),
      ),
    );
  }
}

// ── Quest Tab ─────────────────────────────────────────────────
class QuestTab extends StatelessWidget {
  const QuestTab({super.key});

  @override
  Widget build(BuildContext context) {
    const quests = [
      ('Flutter Basics', 'Pelajari dasar-dasar Flutter', 150, kGold, 0.75,
          Icons.phone_android_rounded),
      ('Dart OOP', 'Kuasai Object Oriented Programming', 200, kPurple, 0.40,
          Icons.code_rounded),
      ('API Integration', 'Hubungkan app ke REST API', 300, kGreen, 0.10,
          Icons.cloud_rounded),
      ('State Management', 'Provider & Riverpod mastery', 250, kOrange, 0.0,
          Icons.storage_rounded),
      ('UI Design', 'Buat UI yang indah & responsive', 180, kPurple, 0.60,
          Icons.palette_rounded),
    ];
    return CustomScrollView(
      slivers: [
        SliverAppBar(
          title: const Text('Quest Board',
              style: TextStyle(
                  fontWeight: FontWeight.w800, color: kTxt, fontSize: 16)),
          backgroundColor: kSurf,
          pinned: true,
          elevation: 0,
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(1),
            child: Container(height: 1, color: kBorder),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.all(16),
          sliver: SliverList(
            delegate: SliverChildBuilderDelegate(
              (_, i) {
                final q = quests[i];
                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: kSurf,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: kBorder),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: q.$4.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(q.$6, color: q.$4, size: 20),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(q.$1,
                                  style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w700,
                                      color: kTxt)),
                              Text(q.$2,
                                  style: const TextStyle(
                                      fontSize: 10, color: kMuted)),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: kGold.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(children: [
                            const Icon(Icons.star_rounded,
                                size: 11, color: kGold),
                            const SizedBox(width: 3),
                            Text('+${q.$3} XP',
                                style: const TextStyle(
                                    fontSize: 10,
                                    color: kGold,
                                    fontWeight: FontWeight.w700)),
                          ]),
                        ),
                      ]),
                      const SizedBox(height: 12),
                      Row(children: [
                        Expanded(
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(4),
                            child: LinearProgressIndicator(
                              value: q.$5,
                              backgroundColor: kSurf2,
                              color: q.$4,
                              minHeight: 5,
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Text('${(q.$5 * 100).round()}%',
                            style: TextStyle(
                                fontSize: 10,
                                color: q.$4,
                                fontWeight: FontWeight.w700)),
                      ]),
                    ],
                  ),
                );
              },
              childCount: quests.length,
            ),
          ),
        ),
      ],
    );
  }
}

// ── Leaderboard Tab ───────────────────────────────────────────
class LeaderboardTab extends StatelessWidget {
  const LeaderboardTab({super.key});

  static const List<Player> _players = [
    ('RannNymphaea', 4820, '🥇'),
    ('DartMaster99', 4200, '🥈'),
    ('FlutterKing', 3980, '🥉'),
    ('CodeNinja', 3540, '4'),
    ('PixelWizard', 3210, '5'),
    ('ByteCrafter', 2980, '6'),
    ('DevHero', 2750, '7'),
    ('AppBuilder', 2500, '8'),
  ];

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        SliverAppBar(
          title: const Text('Leaderboard',
              style: TextStyle(
                  fontWeight: FontWeight.w800, color: kTxt, fontSize: 16)),
          backgroundColor: kSurf,
          pinned: true,
          elevation: 0,
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(1),
            child: Container(height: 1, color: kBorder),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [kGold.withOpacity(0.12), kPurple.withOpacity(0.06)],
                ),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: kGold.withOpacity(0.2)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _podium(_players[1], 2, 70),
                  _podium(_players[0], 1, 90),
                  _podium(_players[2], 3, 55),
                ],
              ),
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          sliver: SliverList(
            delegate: SliverChildBuilderDelegate(
              (_, i) {
                final p = _players[i];
                final isMe = i == 0;
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: isMe ? kGold.withOpacity(0.08) : kSurf,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                        color: isMe ? kGold.withOpacity(0.3) : kBorder),
                  ),
                  child: Row(children: [
                    SizedBox(
                      width: 32,
                      child: Text(p.$3,
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 18)),
                    ),
                    const SizedBox(width: 10),
                    CircleAvatar(
                      radius: 18,
                      backgroundColor: kPurple.withOpacity(0.2),
                      child: Text(p.$1[0],
                          style: const TextStyle(
                              color: kPurple,
                              fontWeight: FontWeight.w800,
                              fontSize: 14)),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(p.$1,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: isMe ? kGold : kTxt,
                          )),
                    ),
                    Row(children: [
                      const Icon(Icons.star_rounded, size: 13, color: kGold),
                      const SizedBox(width: 3),
                      Text('${p.$2}',
                          style: const TextStyle(
                              fontSize: 13,
                              color: kGold,
                              fontWeight: FontWeight.w700)),
                      const Text(' XP',
                          style: TextStyle(fontSize: 10, color: kMuted)),
                    ]),
                  ]),
                );
              },
              childCount: _players.length,
            ),
          ),
        ),
      ],
    );
  }

  Widget _podium(Player p, int rank, double height) {
    final color = rank == 1
        ? kGold
        : rank == 2
            ? const Color(0xFFB0B7C3)
            : const Color(0xFFCD7F32);
    return Column(children: [
      CircleAvatar(
        radius: rank == 1 ? 26.0 : 20.0,
        backgroundColor: color.withOpacity(0.2),
        child: Text(p.$1[0],
            style: TextStyle(
                color: color,
                fontWeight: FontWeight.w900,
                fontSize: rank == 1 ? 18.0 : 14.0)),
      ),
      const SizedBox(height: 6),
      Text(
        p.$1.length > 8 ? p.$1.substring(0, 8) : p.$1,
        style: TextStyle(
            fontSize: 9.5, color: color, fontWeight: FontWeight.w600),
      ),
      const SizedBox(height: 4),
      Container(
        width: 60,
        height: height,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: color.withOpacity(0.12),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Text('$rank',
            style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w900,
                color: color.withOpacity(0.5))),
      ),
    ]);
  }
}

// ── Profile Tab ───────────────────────────────────────────────
class ProfileTab extends StatelessWidget {
  const ProfileTab({super.key});

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [kPurple.withOpacity(0.15), kBg],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
            padding: const EdgeInsets.fromLTRB(16, 56, 16, 24),
            child: Column(children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [kGold, kPurple]),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                        color: kGold.withOpacity(0.3), blurRadius: 20)
                  ],
                ),
                child: const Icon(Icons.person_rounded, size: 40, color: kInk),
              ),
              const SizedBox(height: 12),
              const Text('RannNymphaea',
                  style: TextStyle(
                      fontSize: 20, fontWeight: FontWeight.w900, color: kTxt)),
              const SizedBox(height: 4),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: kGold.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: kGold.withOpacity(0.25)),
                ),
                child: const Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(Icons.star_rounded, size: 12, color: kGold),
                  SizedBox(width: 4),
                  Text('Level 12 · 4,820 XP',
                      style: TextStyle(
                          fontSize: 11,
                          color: kGold,
                          fontWeight: FontWeight.w700)),
                ]),
              ),
            ]),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          sliver: SliverList(
            delegate: SliverChildListDelegate([
              _statCard(),
              const SizedBox(height: 16),
              _menuSection('Akun', [
                (Icons.edit_rounded, 'Edit Profil', kPurple),
                (Icons.shield_rounded, 'Keamanan', kGreen),
                (Icons.notifications_rounded, 'Notifikasi', kGold),
              ]),
              const SizedBox(height: 12),
              _menuSection('Tentang', [
                (Icons.info_rounded, 'Tentang NEWGAME', kMuted),
                (Icons.help_rounded, 'Bantuan', kMuted),
                (Icons.logout_rounded, 'Keluar', Colors.red),
              ]),
              const SizedBox(height: 24),
            ]),
          ),
        ),
      ],
    );
  }

  Widget _statCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kSurf,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorder),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _stat('24', 'Quest', kGold),
          Container(width: 1, height: 36, color: kBorder),
          _stat('7', 'Streak', kOrange),
          Container(width: 1, height: 36, color: kBorder),
          _stat('5', 'Badge', kPurple),
          Container(width: 1, height: 36, color: kBorder),
          _stat('#1', 'Rank', kGreen),
        ],
      ),
    );
  }

  Widget _stat(String val, String label, Color color) => Column(children: [
        Text(val,
            style: TextStyle(
                fontSize: 20, fontWeight: FontWeight.w900, color: color)),
        Text(label, style: const TextStyle(fontSize: 10, color: kMuted)),
      ]);

  Widget _menuSection(
      String title, List<(IconData, String, Color)> items) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Padding(
        padding: const EdgeInsets.only(bottom: 8, left: 2),
        child: Text(title.toUpperCase(),
            style: const TextStyle(
                fontSize: 9.5,
                color: kMuted,
                letterSpacing: 1.5,
                fontWeight: FontWeight.w700)),
      ),
      Container(
        decoration: BoxDecoration(
          color: kSurf,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: kBorder),
        ),
        child: Column(
          children: List.generate(items.length, (i) {
            final item = items[i];
            return Column(children: [
              ListTile(
                dense: true,
                leading:
                    Icon(item.$1, color: item.$3, size: 20),
                title: Text(item.$2,
                    style: TextStyle(
                        fontSize: 13,
                        color: item.$3 == Colors.red ? Colors.red : kTxt)),
                trailing: const Icon(Icons.chevron_right_rounded,
                    size: 18, color: kMuted),
              ),
              if (i < items.length - 1)
                const Divider(height: 1, color: kBorder, indent: 56),
            ]);
          }),
        ),
      ),
    ]);
  }
}
