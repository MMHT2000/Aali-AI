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
  static const String _apiBase = String.fromEnvironment('AALI_API_URL', defaultValue: 'http://10.0.2.2:3001/api/v1');
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
  String _sosState = 'IDLE'; // IDLE, QUEUED_OFFLINE, SENT_ONLINE, HANDED_OFF_SMS

  @override
  void initState() {
    super.initState();
    _restoreLocalState();
  }

  Future<void> _restoreLocalState() async {
    final prefs = await SharedPreferences.getInstance();
    if (!mounted) return;
    setState(() {
      _accessToken = prefs.getString('aali_resident_access_token');
      _pendingPayload = prefs.getString('aali_pending_sos_payload');
      _outboxPacket = prefs.getString('aali_pending_sos_packet');
      _isOnboarded = _accessToken != null || prefs.getBool('aali_local_onboarded') == true;
      if (_outboxPacket != null) _sosState = 'QUEUED_OFFLINE';
    });
  }

  Future<Map<String, dynamic>> _postJson(String path, Map<String, dynamic> payload) async {
    final client = HttpClient()..connectionTimeout = const Duration(seconds: 5);
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
        if (mounted) setState(() { _isOnboarded = true; _operationMessage = 'Demo registration acknowledged by Aali API. This is not identity verification.'; });
      } else {
        final body = result['body'] as Map<String, dynamic>;
        if (mounted) setState(() => _nidError = body['message']?.toString() ?? 'Registration was rejected (${result['statusCode']}).');
      }
    } on SocketException {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('aali_local_onboarded', true);
      if (mounted) setState(() { _isOnboarded = true; _operationMessage = 'API unavailable. NID uniqueness is not checked offline; SOS will stay queued until submitted.'; });
    } catch (_) {
      if (mounted) setState(() => _nidError = 'Could not complete registration. Check the API address and try again.');
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
      'messageOriginal': 'Resident app packet submission',
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
      final result = await _postJson('/sos', jsonDecode(rawPayload) as Map<String, dynamic>);
      if (result['statusCode'] == 200 || result['statusCode'] == 201) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.remove('aali_pending_sos_payload');
        await prefs.remove('aali_pending_sos_packet');
        if (mounted) setState(() { _pendingPayload = null; _sosState = 'API_ACKNOWLEDGED'; _operationMessage = 'API acknowledged the report. This does not mean rescue or SMS delivery.'; });
      } else if (mounted) {
        setState(() { _sosState = 'QUEUED_OFFLINE'; _operationMessage = 'API did not acknowledge the report (${result['statusCode']}); it remains in the local outbox.'; });
      }
    } on SocketException {
      if (mounted) setState(() { _sosState = 'QUEUED_OFFLINE'; _operationMessage = 'No internet connection. SOS remains saved locally; SMS handoff is a separate user action.'; });
    } catch (_) {
      if (mounted) setState(() { _sosState = 'QUEUED_OFFLINE'; _operationMessage = 'Submission failed; the SOS remains saved locally for retry.'; });
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
            const SizedBox(height: 16),

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
              // Verified Citizen Card
              Card(
                color: const Color(0xFF1E293B),
                child: Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('নাগরিক: ${_nameController.text}', style: const TextStyle(fontWeight: FontWeight.bold)),
                          Text('এনআইডি: ****${_nidController.text.substring(_nidController.text.length - 4)}', style: const TextStyle(fontSize: 12, color: Color(0xFF38BDF8))),
                        ],
                      ),
                      const Chip(label: Text('ভেরিফাইড মক', style: TextStyle(fontSize: 10)), backgroundColor: Color(0xFF065F46)),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Step 2: 3-Tap SOS
              Card(
                color: const Color(0xFF1E293B),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        '২. দ্রুত ৩-ট্যাপ এসওএস তৈরি (3-Tap SOS)',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFFF43F5E)),
                      ),
                      const SizedBox(height: 12),
                      Text('মানুষের সংখ্যা: $_peopleCount জন'),
                      Slider(
                        value: _peopleCount.toDouble(),
                        min: 1,
                        max: 20,
                        divisions: 19,
                        onChanged: (val) => setState(() => _peopleCount = val.toInt()),
                      ),
                      CheckboxListTile(
                        title: const Text('পানিবন্দী / ছাদে আটকা'),
                        value: _flagTrapped,
                        onChanged: (val) => setState(() => _flagTrapped = val ?? false),
                      ),
                      CheckboxListTile(
                        title: const Text('বয়স্ক বা অসুস্থ সদস্য'),
                        value: _flagElderly,
                        onChanged: (val) => setState(() => _flagElderly = val ?? false),
                      ),
                      CheckboxListTile(
                        title: const Text('শিশু সদস্য আছে (Has Infant/Child)'),
                        value: _flagChild,
                        onChanged: (val) => setState(() => _flagChild = val ?? false),
                      ),
                      CheckboxListTile(
                        title: const Text('জরুরি চিকিৎসা প্রয়োজন'),
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
                        child: const Text('🚨 এসওএস জেনারেট করুন (SUBMIT SOS)', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ),
              ),

              // Step 3: Outbox & Handoff
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
                          children: [
                            ElevatedButton.icon(
                              onPressed: () async {
                                final launched = await launchUrl(Uri(scheme: 'sms', path: '16604', queryParameters: {'body': _outboxPacket!}));
                                if (mounted) setState(() { _sosState = launched ? 'SMS_COMPOSER_OPENED' : _sosState; _operationMessage = launched ? 'SMS composer opened by your action. The message has not been sent or acknowledged.' : 'Could not open an SMS composer on this device.'; });
                              },
                              icon: const Icon(Icons.sms),
                              label: const Text('এসএমএস কম্পোজার ওপেন করুন'),
                              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0284C7)),
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

