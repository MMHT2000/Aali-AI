import 'package:test/test.dart';
import 'package:aali_resident_app/nid_validator.dart';
import 'package:aali_resident_app/packet_encoder.dart';

void main() {
  group('MockNidValidator Unit Tests', () {
    test('accepts valid 10-digit NID', () {
      expect(MockNidValidator.validate('1984261829'), isNull);
    });

    test('accepts valid 17-digit NID', () {
      expect(MockNidValidator.validate('19842618293817264'), isNull);
    });

    test('rejects empty or whitespace NID', () {
      expect(MockNidValidator.validate(''), contains('আবশ্যক'));
      expect(MockNidValidator.validate('   '), contains('আবশ্যক'));
    });

    test('rejects non-digit characters', () {
      expect(MockNidValidator.validate('198426182A'), contains('শুধুমাত্র সংখ্যার'));
      expect(MockNidValidator.validate('1984-26182'), contains('শুধুমাত্র সংখ্যার'));
    });

    test('rejects invalid lengths', () {
      expect(MockNidValidator.validate('123456789'), contains('১০ অথবা ১৭'));
      expect(MockNidValidator.validate('12345678901'), contains('১০ অথবা ১৭'));
      expect(MockNidValidator.validate('1234567890123456'), contains('১০ অথবা ১৭'));
    });

    test('rejects all-identical repetitive digits', () {
      expect(MockNidValidator.validate('0000000000'), contains('সকল সংখ্যা একই'));
      expect(MockNidValidator.validate('1111111111'), contains('সকল সংখ্যা একই'));
      expect(MockNidValidator.validate('99999999999999999'), contains('সকল সংখ্যা একই'));
    });

    test('hashes NID into consistent sha256 hex string', () {
      final h1 = MockNidValidator.hashNid('1984261829');
      final h2 = MockNidValidator.hashNid('1984261829');
      final diff = MockNidValidator.hashNid('1984261830');

      expect(h1, equals(h2));
      expect(h1, isNot(equals(diff)));
      expect(h1.length, equals(64));
    });
  });

  group('CompactDisasterPacket Encoder Tests', () {
    test('encodes valid compact packet under 60 chars', () {
      final packet = CompactDisasterPacket(
        geohash7: 'wh0r8vy',
        peopleCount: 5,
        elderly: true,
        child: true,
        medical: false,
        trapped: true,
        timestamp: '261009-2320',
        shortId: 'MOB1',
      );

      final encoded = packet.encode();
      expect(encoded.startsWith('A1|S|wh0r8vy|05|E1C1M0T1|261009-2320|MOB1|'), isTrue);
      expect(encoded.length, lessThan(60));
    });

    test('handles empty geohash with fallback zeros', () {
      final packet = CompactDisasterPacket(
        geohash7: '',
        peopleCount: 1,
        elderly: false,
        child: false,
        medical: false,
        trapped: false,
        timestamp: '261009-2320',
        shortId: 'MOB2',
      );

      final encoded = packet.encode();
      expect(encoded.contains('|0000000|01|E0C0M0T0|'), isTrue);
    });
  });
}

