import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:aali_resident_app/main.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  testWidgets('AaliResidentApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const AaliResidentApp());
    await tester.pumpAndSettle();
    expect(find.textContaining('Aali AI'), findsWidgets);
  });

  testWidgets(
      'mobile access picker separates resident, responder and volunteer workspaces',
      (WidgetTester tester) async {
    tester.view.physicalSize = const Size(320, 720);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(const AaliResidentApp());
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);

    expect(find.text('Choose your workspace'), findsOneWidget);
    expect(
        Theme.of(tester.element(find.text('Choose your workspace'))).brightness,
        Brightness.light);
    expect(find.text('Resident'), findsOneWidget);
    expect(find.text('Responder'), findsOneWidget);
    expect(find.text('Volunteer'), findsOneWidget);

    await tester.tap(find.text('Responder'));
    await tester.pumpAndSettle();
    expect(find.text('Responder sign in'), findsOneWidget);
    expect(find.text('Review incidents and human rescue suggestions.'),
        findsOneWidget);

    await tester.tap(find.text('Volunteer'));
    await tester.pumpAndSettle();
    expect(find.text('Volunteer sign in'), findsOneWidget);
    expect(find.text('Submit field water readings against a village.'),
        findsOneWidget);
  });
}
