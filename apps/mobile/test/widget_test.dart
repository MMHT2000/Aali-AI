import 'package:flutter_test/flutter_test.dart';
import 'package:aali_resident_app/main.dart';

void main() {
  testWidgets('AaliResidentApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const AaliResidentApp());
    expect(find.textContaining('Aali AI'), findsWidgets);
  });
}
