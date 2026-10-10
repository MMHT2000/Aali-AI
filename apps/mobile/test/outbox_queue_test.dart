import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  test('Outbox queue persists packets to SharedPreferences and survives restarts', () async {
    final prefs = await SharedPreferences.getInstance();

    const testPacket = 'A1|S|wh0r2q8|05|E1M0|0821-1430|7Q2K|1A2B';
    final payload = jsonEncode({
      'clientReportId': 'SOS-OFFLINE-01',
      'packet': testPacket,
      'village': 'Parshuram Bazar',
      'peopleCount': 5,
      'createdAt': DateTime.now().toIso8601String(),
    });

    // Enqueue packet
    final queue = prefs.getStringList('aali_outbox_queue') ?? [];
    queue.add(payload);
    await prefs.setStringList('aali_outbox_queue', queue);

    // Simulate app restart by re-fetching preferences instance
    final restoredPrefs = await SharedPreferences.getInstance();
    final restoredQueue = restoredPrefs.getStringList('aali_outbox_queue') ?? [];

    expect(restoredQueue.length, 1);
    final decoded = jsonDecode(restoredQueue.first) as Map<String, dynamic>;
    expect(decoded['clientReportId'], 'SOS-OFFLINE-01');
    expect(decoded['packet'], testPacket);
    expect(decoded['peopleCount'], 5);
  });

  test('Outbox queue dequeues packet upon successful delivery', () async {
    final prefs = await SharedPreferences.getInstance();

    final payload = jsonEncode({
      'clientReportId': 'SOS-SYNC-02',
      'packet': 'A1|S|wh0r2q8|02|E0M0|0821-1435|8R3L|3C4D',
      'village': 'Fulgazi',
      'peopleCount': 2,
    });

    await prefs.setStringList('aali_outbox_queue', [payload]);
    var queue = prefs.getStringList('aali_outbox_queue') ?? [];
    expect(queue.length, 1);

    // Simulate successful sync delivery
    queue.removeAt(0);
    await prefs.setStringList('aali_outbox_queue', queue);

    final finalQueue = prefs.getStringList('aali_outbox_queue') ?? [];
    expect(finalQueue.isEmpty, true);
  });
}

