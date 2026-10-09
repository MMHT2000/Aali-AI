import 'dart:convert';
import 'dart:io';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import 'nid_validator.dart';
import 'packet_encoder.dart';

void main() {
  runApp(const AaliResidentApp());
}

class AaliResidentApp extends StatelessWidget {
  const AaliResidentApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'আলি এআই — রেসিডেন্ট এসওএস',
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        primaryColor: const Color(0xFF0284C7),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0284C7),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: const ResidentHomeScreen(),
    );
  }
}

class ResidentHomeScreen extends StatefulWidget {
  const ResidentHomeScreen({super.key});

  @override
  State<ResidentHomeScreen> createState() => _ResidentHomeScreenState();
}

class _ResidentHomeScreenState extends State<ResidentHomeScreen> {
  // Configurable Server Endpoint (Defaults to PC LAN IP or Emulator loopback)
  String _apiBase = 'http://192.168.0.101:3001/api/v1';

  // Demo Simulation Switches
  bool _simulateBlackout = false;

  // Onboarding / Identity State
  bool _isOnboarded = false;
  final TextEditingController _nameController = TextEditingController(text: 'আব্দুল কাদের');
  final TextEditingController _phoneController = TextEditingController(text: '01712345678');
  final TextEditingController _nidController = TextEditingController(text: '1984261829');
  String? _nidError;
  String? _accessToken;
  String? _pendingPayload;
  bool _working = false;
  String? _operationMessage;

  // 3-Step SOS State
  int _peopleCount = 4;
  bool _flagTrapped = true;
  bool _flagElderly = true;
  bool _flagChild = false;
  bool _flagMedical = false;
  String _selectedVillage = 'চিথলিয়া (Chitholia)';

  // Outbox & Handoff State
  String? _outboxPacket;
  String _sosState = 'IDLE'; // IDLE, QUEUED_OFFLINE, SENT_ONLINE, HANDED_OFF_SMS, D2C_RELAYED

  @override
  void initState() {
    super.initState();
    _restoreLocalState();
  }

  Future<void> _restoreLocalState() async {
    final prefs = await SharedPreferences.getInstance();
    if (!mounted) return;
    setState(() {
      _apiBase = prefs.getString('aali_server_url') ?? _apiBase;
      _accessToken = prefs.getString('aali_resident_access_token');
      _pendingPayload = prefs.getString('aali_pending_sos_payload');
      _outboxPacket = prefs.getString('aali_pending_sos_packet');
      _isOnboarded = _accessToken != null || prefs.getBool('aali_local_onboarded') == true;
      if (_outboxPacket != null) _sosState = 'QUEUED_OFFLINE';
    });
  }

  Future<Map<String, dynamic>> _postJson(String path, Map<String, dynamic> payload) async {
    final client = HttpClient()..connectionTimeout = const Duration(seconds: 6);
    try {
      final request = await client.postUrl(Uri.parse('$_apiBase$path'));
      request.headers.contentType = ContentType.json;
      if (_accessToken != null) request.headers.set(HttpHeaders.authorizationHeader, 'Bearer $_accessToken');
      request.write(jsonEncode(payload));
      final response = await request.close();
      final body = await response.transform(utf8.decoder).join();
      final decoded = body.isEmpty ? <String, dynamic>{} : jsonDecode(body) as Map<String, dynamic>;
      return {'statusCode': response.statusCode, 'body': decoded};
    } finally {
      client.close(force: true);
    }
  }

  void _showServerConfigDialog() {
    final controller = TextEditingController(text: _apiBase);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('সার্ভার আইপি কনফিগারেশন', style: TextStyle(color: Color(0xFF38BDF8))),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'আপনার ল্যাপটপের ওয়াইফাই আইপি বা এমুলেটর অ্যাড্রেস লিখুন:',
              style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              decoration: const InputDecoration(
                labelText: 'API Base URL',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              children: [
                ActionChip(
                  label: const Text('Wi-Fi LAN (192.168.0.101)', style: TextStyle(fontSize: 11)),
                  onPressed: () => controller.text = 'http://192.168.0.101:3001/api/v1',
                ),
                ActionChip(
                  label: const Text('Emulator (10.0.2.2)', style: TextStyle(fontSize: 11)),
                  onPressed: () => controller.text = 'http://10.0.2.2:3001/api/v1',
                ),
              ],
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('বাতিল'),
          ),
          ElevatedButton(
            onPressed: () async {
              final newUrl = controller.text.trim();
              if (newUrl.isNotEmpty) {
                final prefs = await SharedPreferences.getInstance();
                await prefs.setString('aali_server_url', newUrl);
                setState(() => _apiBase = newUrl);
              }
              if (ctx.mounted) Navigator.pop(ctx);
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0284C7)),
            child: const Text('সংরক্ষণ করুন'),
          ),
        ],
      ),
    );
  }

  Future<void> _handleOnboard() async {
    final err = MockNidValidator.validate(_nidController.text);
    if (err != null) {
      setState(() {
        _nidError = err;
      });
      return;
    }

    setState(() { _working = true; _nidError = null; _operationMessage = null; });
    try {
      if (_simulateBlackout) {
        throw const SocketException('Simulated Blackout active during onboarding');
      }

      final result = await _postJson('/auth/resident-register', {
        'fullName': _nameController.text.trim(),
        'phoneNumber': _phoneController.text.trim(),
        'mockNid': _nidController.text.trim(),
      });
      if (result['statusCode'] == 201 || result['statusCode'] == 200) {
        _accessToken = result['body']['accessToken'] as String?;
        final prefs = await SharedPreferences.getInstance();
        if (_accessToken != null) await prefs.setString('aali_resident_access_token', _accessToken!);
        await prefs.setBool('aali_local_onboarded', true);
        if (mounted) setState(() { _isOnboarded = true; _operationMessage = 'রেজিস্ট্রেশন সার্ভার দ্বারা স্বীকৃত। এটি পরিচয় প্রমাণ নয়।'; });
      } else {
        final body = result['body'] as Map<String, dynamic>;
        if (mounted) setState(() => _nidError = body['message']?.toString() ?? 'নিবন্ধন প্রত্যাখ্যাত (${result['statusCode']})।');
      }
    } on SocketException {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('aali_local_onboarded', true);
      if (mounted) setState(() { _isOnboarded = true; _operationMessage = 'ইন্টারনেট সংযোগ নেই। মক এনআইডি স্থানীয়ভাবে গৃহীত হয়েছে; অফলাইন মোড সক্রিয়।'; });
    } catch (_) {
      if (mounted) setState(() => _nidError = 'নিবন্ধন সম্পন্ন করা সম্ভব হয়নি। সার্ভার আইপি যাচাই করুন।');
    } finally {
      if (mounted) setState(() => _working = false);
      _nidController.clear();
    }
  }

  Future<void> _handleCreateSos() async {
    final now = DateTime.now();
    final yy = now.year.toString().substring(2);
    final mm = now.month.toString().padLeft(2, '0');
    final dd = now.day.toString().padLeft(2, '0');
    final hh = now.hour.toString().padLeft(2, '0');
    final min = now.minute.toString().padLeft(2, '0');

    final clientReportId = 'mobile-${now.microsecondsSinceEpoch}-${Random.secure().nextInt(0x7fffffff).toRadixString(36)}';
    final isChitholia = _selectedVillage.contains('Chitholia');
    final packet = CompactDisasterPacket(
      geohash7: isChitholia ? 'wh0xs4a' : 'wh0xsk0',
      peopleCount: _peopleCount,
      elderly: _flagElderly,
      child: _flagChild,
      medical: _flagMedical,
      trapped: _flagTrapped,
      timestamp: '$yy$mm$dd-$hh$min',
      shortId: Random.secure().nextInt(1679616).toRadixString(36).toUpperCase().padLeft(4, '0'),
    );

    final encoded = packet.encode();
    final payload = <String, dynamic>{
      'clientReportId': clientReportId,
      'eventId': '11111111-1111-1111-1111-111111111103',
      'areaId': isChitholia ? '22222222-2222-2222-2222-222222222205' : '22222222-2222-2222-2222-222222222204',
      'peopleCount': _peopleCount,
      'elderlyCount': _flagElderly ? 1 : 0,
      'hasChild': _flagChild,
      'hasMedicalNeed': _flagMedical,
      'isTrapped': _flagTrapped,
      'sourceType': 'NEW_USER',
      'packet': encoded,
      'messageOriginal': 'Resident app mobile packet submission',
    };
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('aali_pending_sos_packet', encoded);
    await prefs.setString('aali_pending_sos_payload', jsonEncode(payload));
    setState(() {
      _outboxPacket = encoded;
      _pendingPayload = jsonEncode(payload);
      _sosState = 'QUEUED_OFFLINE';
    });
    await _submitPendingSos();
  }

  Future<void> _submitPendingSos() async {
    final rawPayload = _pendingPayload;
    if (rawPayload == null) return;
    setState(() { _working = true; _operationMessage = null; });
    try {
      if (_simulateBlackout) {
        throw const SocketException('Simulated cellular blackout');
      }

      final result = await _postJson('/sos', jsonDecode(rawPayload) as Map<String, dynamic>);
      if (result['statusCode'] == 200 || result['statusCode'] == 201) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.remove('aali_pending_sos_payload');
        await prefs.remove('aali_pending_sos_packet');
        if (mounted) setState(() { _pendingPayload = null; _sosState = 'API_ACKNOWLEDGED'; _operationMessage = 'সার্ভার রিপোর্ট গ্রহণ করেছে (API Acknowledged)। রেসকিউ টিম কন্ট্রোল রুমে দেখতে পাচ্ছে।'; });
      } else if (mounted) {
        setState(() { _sosState = 'QUEUED_OFFLINE'; _operationMessage = 'সার্ভার একনলেজ করেনি (${result['statusCode']}); এসওএস লোকাল আউটবক্সে জমা আছে।'; });
      }
    } on SocketException {
      if (mounted) {
        setState(() {
          _sosState = 'QUEUED_OFFLINE';
          _operationMessage = _simulateBlackout
              ? 'টেলিকম ব্ল্যাকআউট সিমুলেশন সক্রিয়। ইন্টারনেট বন্ধ থাকায় এসওএস লোকাল আউটবক্সে সংরক্ষিত হয়েছে।'
              : 'ইন্টারনেট সংযোগ নেই। এসওএস লোকাল আউটবক্সে জমা আছে; অফলাইন এসএমএস বা ডি২সি স্যাটেলাইট রিলে বিকল্প ব্যবহার করুন।';
        });
      }
    } catch (_) {
      if (mounted) setState(() { _sosState = 'QUEUED_OFFLINE'; _operationMessage = 'অনলাইনে পাঠানো যায়নি; এসওএস স্থানীয় আউটবক্সে সংরক্ষিত আছে।'; });
    } finally {
      if (mounted) setState(() => _working = false);
    }
  }

  Future<void> _simulateSatelliteD2cRelay() async {
    if (_outboxPacket == null) return;
    setState(() { _working = true; _operationMessage = null; });
    try {
      // Simulate D2C carrier/satellite forwarding to the gateway ingest endpoint
      final result = await _postJson('/gateway/simulated/ingest', {
        'packet': _outboxPacket,
        'gatewayId': 'sim-satellite-d2c-feni',
      });
      if (result['statusCode'] == 200 || result['statusCode'] == 201) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.remove('aali_pending_sos_payload');
        await prefs.remove('aali_pending_sos_packet');
        if (mounted) {
          setState(() {
            _sosState = 'SATELLITE_D2C_INGESTED';
            _operationMessage = '📡 স্যাটেলাইট D2C গেটওয়ে সিমুলেশন দ্বারা গৃহীত হয়েছে (CRC16 যাচাই সম্পন্ন)। কন্ট্রোল সেন্টারে রিপোর্ট প্রদর্শিত হচ্ছে।';
          });
        }
      } else {
        if (mounted) setState(() => _operationMessage = 'গেটওয়ে সিমুলেশন একনলেজ করেনি (${result['statusCode']})।');
      }
    } catch (_) {
      if (mounted) setState(() => _operationMessage = 'স্যাটেলাইট গেটওয়ে রিলে ব্যর্থ হয়েছে। সার্ভার আইপি চেক করুন।');
    } finally {
      if (mounted) setState(() => _working = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('আলি এআই (Aali AI) — রেসিডেন্ট'),
        backgroundColor: const Color(0xFF1E293B),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            tooltip: 'সার্ভার আইপি সেটিংস',
            onPressed: _showServerConfigDialog,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Prototype notice banner
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0x22FBBF24),
                border: Border.all(color: const Color(0xFFCA8A04)),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                '⚠️ সিদ্ধান্ত-সহায়তা প্রোটোটাইপ:\n'
                'Aali AI কোনো স্বয়ংক্রিয় জরুরি পরিষেবা নয়। ইন্টারনেট না থাকলে এসওএস লোকাল আউটবক্সে জমা থাকে এবং এসএমএস কম্পোজার মাধ্যমে অফলাইন হ্যান্ডঅফ করতে হয়।',
                style: TextStyle(fontSize: 12, color: Color(0xFFFEF08A)),
              ),
            ),
            const SizedBox(height: 12),

            // Demo Simulation Controls Card
            Card(
              color: const Color(0xFF1E293B),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
                child: Row(
                  children: [
                    Icon(
                      _simulateBlackout ? Icons.signal_cellular_connected_no_internet_4_bar : Icons.wifi,
                      color: _simulateBlackout ? const Color(0xFFF87171) : const Color(0xFF4ADE80),
                      size: 24,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _simulateBlackout ? 'ব্ল্যাকআউট সিমুলেশন (D2C মোড)' : 'ইন্টারনেট কানেকশন সক্রিয়',
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                          Text(
                            _simulateBlackout ? 'ইন্টারনেট অফলাইন; এসএমএস ও স্যাটেলাইট মোড' : 'সার্ভার: $_apiBase',
                            style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    Switch(
                      value: _simulateBlackout,
                      activeThumbColor: const Color(0xFFF87171),
                      onChanged: (val) => setState(() => _simulateBlackout = val),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Step 1: Onboarding Card
            if (!_isOnboarded) ...[
              Card(
                color: const Color(0xFF1E293B),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        '১. রেসিডেন্ট অনবোর্ডিং (Mock NID Check)',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF38BDF8)),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        '* Demo NID format check — not identity verification.',
                        style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _nameController,
                        decoration: const InputDecoration(labelText: 'নাম (Name)'),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _phoneController,
                        decoration: const InputDecoration(labelText: 'মোবাইল নম্বর (Phone)'),
                        keyboardType: TextInputType.phone,
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _nidController,
                        decoration: InputDecoration(
                          labelText: 'মক এনআইডি (১০ বা ১৭ ডিজিট)',
                          errorText: _nidError,
                        ),
                        keyboardType: TextInputType.number,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _working ? null : () => _handleOnboard(),
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0284C7)),
                        child: const Text('অনবোর্ড নিশ্চিত করুন (Save & Continue)'),
                      ),
                    ],
                  ),
                ),
              ),
            ] else ...[
              // Step 2: 3-Step SOS Card
              Card(
                color: const Color(0xFF1E293B),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        '২. তিন-ট্যাপ এসওএস (3-Step Flood SOS)',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFFF87171)),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('আটকে পড়া মানুষের সংখ্যা:'),
                          Row(
                            children: [
                              IconButton(
                                icon: const Icon(Icons.remove_circle_outline),
                                onPressed: _peopleCount > 1 ? () => setState(() => _peopleCount--) : null,
                              ),
                              Text('$_peopleCount জন', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                              IconButton(
                                icon: const Icon(Icons.add_circle_outline),
                                onPressed: _peopleCount < 20 ? () => setState(() => _peopleCount++) : null,
                              ),
                            ],
                          ),
                        ],
                      ),
                      const Divider(color: Color(0xFF334155)),
                      CheckboxListTile(
                        title: const Text('পানিবন্দী / ছাদে বা গাছে আটকা (Trapped on roof/attic)'),
                        value: _flagTrapped,
                        onChanged: (val) => setState(() => _flagTrapped = val ?? false),
                      ),
                      CheckboxListTile(
                        title: const Text('বৃদ্ধ / বয়স্ক সদস্য আছেন (Elderly person at risk)'),
                        value: _flagElderly,
                        onChanged: (val) => setState(() => _flagElderly = val ?? false),
                      ),
                      CheckboxListTile(
                        title: const Text('শিশু / বাচ্চা আছেন (Infant or child present)'),
                        value: _flagChild,
                        onChanged: (val) => setState(() => _flagChild = val ?? false),
                      ),
                      CheckboxListTile(
                        title: const Text('জরুরি চিকিৎসা প্রয়োজন (Medical emergency)'),
                        value: _flagMedical,
                        onChanged: (val) => setState(() => _flagMedical = val ?? false),
                      ),
                      const SizedBox(height: 8),
                      DropdownButtonFormField<String>(
                        initialValue: _selectedVillage,
                        items: const [
                          DropdownMenuItem(value: 'চিথলিয়া (Chitholia)', child: Text('চিথলিয়া (Chitholia)')),
                          DropdownMenuItem(value: 'মির্জানগর (Mirzanagar)', child: Text('মির্জানগর (Mirzanagar)')),
                        ],
                        onChanged: (val) => setState(() => _selectedVillage = val ?? _selectedVillage),
                        decoration: const InputDecoration(labelText: 'গ্রাম / এলাকা'),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _working ? null : () => _handleCreateSos(),
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE11D48), padding: const EdgeInsets.symmetric(vertical: 12)),
                        child: const Text('🚨 এসওএস পাঠান (SUBMIT SOS)', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ),
              ),

              // Step 3: Outbox & Handoff Card
              if (_outboxPacket != null) ...[
                const SizedBox(height: 16),
                Card(
                  color: const Color(0xFF1E293B),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('৩. লোকাল আউটবক্স ও অফলাইন হ্যান্ডঅফ', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFFFBBF24))),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(4)),
                          child: Text(_outboxPacket!, style: const TextStyle(fontFamily: 'monospace', color: Color(0xFF38BDF8))),
                        ),
                        const SizedBox(height: 8),
                        Text('স্ট্যাটাস: $_sosState', style: const TextStyle(fontSize: 12, color: Color(0xFF4ADE80))),
                        if (_operationMessage != null) Padding(padding: const EdgeInsets.symmetric(vertical: 8), child: Text(_operationMessage!, style: const TextStyle(fontSize: 12, color: Color(0xFFFDE68A)))),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            ElevatedButton.icon(
                              onPressed: () async {
                                final launched = await launchUrl(Uri(scheme: 'sms', path: '1090', queryParameters: {'body': _outboxPacket!}));
                                if (mounted) setState(() { _sosState = launched ? 'SMS_COMPOSER_OPENED' : _sosState; _operationMessage = launched ? 'এসএমএস কম্পোজার ওপেন হয়েছে। এটি বার্তা পৌঁছানোর নিশ্চয়তা দেয় না।' : 'এসএমএস কম্পোজার চালু করা সম্ভব হয়নি।'; });
                              },
                              icon: const Icon(Icons.sms),
                              label: const Text('জরুরি এসএমএস কম্পোজার (1090)'),
                              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0284C7)),
                            ),
                            ElevatedButton.icon(
                              onPressed: _working ? null : () => _simulateSatelliteD2cRelay(),
                              icon: const Icon(Icons.satellite_alt),
                              label: const Text('📡 স্যাটেলাইট D2C রিলে (Simulated)'),
                              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0D9488)),
                            ),
                            if (_pendingPayload != null) OutlinedButton.icon(
                              onPressed: _working ? null : () => _submitPendingSos(),
                              icon: const Icon(Icons.refresh),
                              label: const Text('Retry API submission'),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ],
          ],
        ),
      ),
    );
  }
}
