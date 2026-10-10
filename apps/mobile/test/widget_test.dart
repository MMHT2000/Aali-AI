import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:aali_resident_app/main.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  testWidgets('AaliResidentApp launches into Welcome Role Selection matching Stitch reference',
      (WidgetTester tester) async {
    tester.view.physicalSize = const Size(360, 800);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(const AaliResidentApp());
    await tester.pumpAndSettle();

    // Welcome Role Chooser elements
    expect(find.textContaining('Welcome'), findsOneWidget);
    expect(find.textContaining('Feni Flood Command'), findsOneWidget);
    expect(find.textContaining('OFFLINE MESH ACTIVE'), findsOneWidget);
    expect(find.byKey(const Key('enter-sos-help')), findsOneWidget);
    expect(find.byKey(const Key('responder-sign-in')), findsOneWidget);
    expect(find.byKey(const Key('volunteer-sign-in')), findsOneWidget);
    expect(find.textContaining('AUTONOMOUS ARCHITECTURE'), findsOneWidget);
  });

  testWidgets('Citizen role navigates to Resident Home with Emergency SOS Hero card',
      (WidgetTester tester) async {
    tester.view.physicalSize = const Size(360, 800);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(const AaliResidentApp());
    await tester.pumpAndSettle();

    // Tap Citizen SOS Help
    await tester.ensureVisible(find.byKey(const Key('enter-sos-help')));
    await tester.tap(find.byKey(const Key('enter-sos-help')));
    await tester.pumpAndSettle();

    // Now on Resident Home
    expect(find.textContaining('Need help now'), findsOneWidget);
    expect(find.textContaining('এখনই সাহায্য দরকার'), findsOneWidget);
    expect(find.textContaining('Works offline'), findsOneWidget);
    expect(find.textContaining('Mesh sync ready'), findsOneWidget);
    expect(find.byKey(const Key('start-sos')), findsOneWidget);

    // Tap Emergency SOS card to enter Distress Request Wizard
    await tester.ensureVisible(find.byKey(const Key('start-sos')));
    await tester.tap(find.byKey(const Key('start-sos')));
    await tester.pumpAndSettle();

    // In SOS Wizard step 1
    expect(find.textContaining('Step 1 of 3: Headcount'), findsOneWidget);
    expect(find.text('How many people?'), findsOneWidget);
    expect(find.text('4'), findsOneWidget);
  });

  testWidgets('Responder role navigates to Emergency Triage Desk',
      (WidgetTester tester) async {
    tester.view.physicalSize = const Size(360, 800);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(const AaliResidentApp());
    await tester.pumpAndSettle();

    // Tap Responder Sign In
    await tester.ensureVisible(find.byKey(const Key('responder-sign-in')));
    await tester.tap(find.byKey(const Key('responder-sign-in')));
    await tester.pumpAndSettle();

    // Now on Responder Desk
    expect(find.textContaining('Emergency Triage'), findsOneWidget);
    expect(find.textContaining('SOS-7K4M'), findsOneWidget);
    expect(find.text('Acknowledge Report'), findsOneWidget);
  });

  testWidgets('Resident Home handles tower blackout and Starlink D2C fallback',
      (WidgetTester tester) async {
    tester.view.physicalSize = const Size(360, 800);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(const AaliResidentApp());
    await tester.pumpAndSettle();

    await tester.ensureVisible(find.byKey(const Key('enter-sos-help')));
    await tester.tap(find.byKey(const Key('enter-sos-help')));
    await tester.pumpAndSettle();

    await tester.ensureVisible(find.byKey(const Key('simulate-tower-outage')));
    await tester.tap(find.byKey(const Key('simulate-tower-outage')));
    await tester.pumpAndSettle();

    await tester.ensureVisible(find.text('Tower blackout active · Starlink D2C satellite fallback'));
    expect(find.text('Tower blackout active · Starlink D2C satellite fallback'), findsOneWidget);
  });

  testWidgets('Responder Desk toggles bounded Feni District Vector Map view',
      (WidgetTester tester) async {
    tester.view.physicalSize = const Size(360, 800);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(const AaliResidentApp());
    await tester.pumpAndSettle();

    // Navigate to Responder Desk
    await tester.ensureVisible(find.byKey(const Key('responder-sign-in')));
    await tester.tap(find.byKey(const Key('responder-sign-in')));
    await tester.pumpAndSettle();

    // Find and tap Map Toggle icon button
    expect(find.byIcon(Icons.map), findsOneWidget);
    await tester.tap(find.byIcon(Icons.map));
    await tester.pumpAndSettle();

    // Verify Feni District GIS map canvas and bounded badge are active
    expect(find.textContaining('Feni District GIS'), findsOneWidget);
    expect(find.text('LOCKED BOUNDS'), findsOneWidget);
    expect(find.text('Muhuri River'), findsOneWidget);

    // Toggle back to list view
    expect(find.byIcon(Icons.format_list_bulleted), findsOneWidget);
    await tester.tap(find.byIcon(Icons.format_list_bulleted));
    await tester.pumpAndSettle();
    expect(find.textContaining('SOS-7K4M'), findsOneWidget);
  });
}
