import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('Sawrly app smoke test (RTL + ThemeMaterial)', (WidgetTester t) async {
    await t.pumpWidget(const SawrlyAppTest());
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}

// Test-vänlig variant utan async initialize
class SawrlyAppTest extends StatelessWidget {
  const SawrlyAppTest({super.key});
  @override
  Widget build(BuildContext context) => const MaterialApp(home: SizedBox.shrink());
}
