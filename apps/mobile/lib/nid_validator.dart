import 'dart:convert';
import 'package:crypto/crypto.dart';

class MockNidValidator {
  /// Validates mock NID rules:
  /// - Exactly 10 or 17 ASCII digits
  /// - Not all the same digit (e.g. reject '1111111111')
  static String? validate(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'NID নম্বর আবশ্যক (NID is required)';
    }

    final clean = value.trim();
    if (!RegExp(r'^[0-9]+$').hasMatch(clean)) {
      return 'NID শুধুমাত্র সংখ্যার হতে হবে (Digits only)';
    }

    if (clean.length != 10 && clean.length != 17) {
      return 'NID অবশ্যই ১০ অথবা ১৭ সংখ্যার হতে হবে (Must be 10 or 17 digits)';
    }

    // Check all identical digits
    final first = clean[0];
    final allSame = clean.split('').every((ch) => ch == first);
    if (allSame) {
      return 'অবৈধ NID: সকল সংখ্যা একই হতে পারবে না (Invalid repetitive pattern)';
    }

    return null;
  }

  /// Hashes mock NID using SHA-256 with salt to prevent leaking raw PII
  static String hashNid(String rawNid, {String salt = 'aali_mock_nid_salt_2026'}) {
    final bytes = utf8.encode('$salt:${rawNid.trim()}');
    return sha256.convert(bytes).toString();
  }
}

