class CompactDisasterPacket {
  final String version = 'A1';
  final String type = 'S';
  final String geohash7;
  final int peopleCount;
  final bool elderly;
  final bool child;
  final bool medical;
  final bool trapped;
  final String timestamp;
  final String shortId;

  CompactDisasterPacket({
    required this.geohash7,
    required this.peopleCount,
    required this.elderly,
    required this.child,
    required this.medical,
    required this.trapped,
    required this.timestamp,
    required this.shortId,
  });

  /// Encodes to compact canonical ASCII packet (<60 chars)
  /// Format: A1|S|<geohash7>|<people2>|E<0|1>C<0|1>M<0|1>T<0|1>|<YYMMDD-HHMM>|<shortId>|<checksum>
  String encode() {
    final geo = (geohash7.isEmpty ? '0000000' : geohash7).toLowerCase().padRight(7, '0').substring(0, 7);
    final count = peopleCount.clamp(1, 99).toString().padLeft(2, '0');
    final flags = 'E${elderly ? 1 : 0}C${child ? 1 : 0}M${medical ? 1 : 0}T${trapped ? 1 : 0}';
    final sid = shortId.toUpperCase().padRight(4, 'X').substring(0, 4);

    final payload = '$version|$type|$geo|$count|$flags|$timestamp|$sid';
    // Simplified deterministic base36 4-char CRC for in-app mobile encoder
    final crc = (payload.codeUnits.fold<int>(0, (acc, c) => (acc + c * 31) & 0xFFFF)).toRadixString(36).toUpperCase().padLeft(4, '0');

    return '$payload|$crc';
  }
}

