import 'package:flutter_test/flutter_test.dart';
import 'package:newgame_android_demo/main.dart';

void main() {
  testWidgets('Splash screen renders correctly', (WidgetTester tester) async {
    await tester.pumpWidget(const NewgameApp());
    expect(find.text('NEWGAME'), findsWidgets);
    expect(find.text('Platform Belajar Gamifikasi'), findsOneWidget);
  });
}
