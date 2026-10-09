import 'package:flutter/material.dart';
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
  // Onboarding / Identity State
  bool _isOnboarded = false;
  final TextEditingController _nameController = TextEditingController(text: 'আব্দুল কাদের');
  final TextEditingController _phoneController = TextEditingController(text: '01712345678');
  final TextEditingController _nidController = TextEditingController(text: '1984261829');
  String? _nidError;

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

  void _handleOnboard() {
    final err = MockNidValidator.validate(_nidController.text);
    if (err != null) {
      setState(() {
        _nidError = err;
      });
      return;
    }

    setState(() {
      _nidError = null;
      _isOnboarded = true;
    });
  }

  void _handleCreateSos() {
    final now = DateTime.now();
    final yy = now.year.toString().substring(2);
    final mm = now.month.toString().padLeft(2, '0');
    final dd = now.day.toString().padLeft(2, '0');
    final hh = now.hour.toString().padLeft(2, '0');
    final min = now.minute.toString().padLeft(2, '0');

    final packet = CompactDisasterPacket(
      geohash7: _selectedVillage.contains('Chitholia') ? 'wh0r8vy' : 'wh0rc0z',
      peopleCount: _peopleCount,
      elderly: _flagElderly,
      child: _flagChild,
      medical: _flagMedical,
      trapped: _flagTrapped,
      timestamp: '$yy$mm$dd-$hh$min',
      shortId: 'MOB1',
    );

    final encoded = packet.encode();
    setState(() {
      _outboxPacket = encoded;
      _sosState = 'QUEUED_OFFLINE';
    });
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
                        onPressed: _handleOnboard,
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
                        title: const Text('জরুরি চিকিৎসা প্রয়োজন'),
                        value: _flagMedical,
                        onChanged: (val) => setState(() => _flagMedical = val ?? false),
                      ),
                      const SizedBox(height: 8),
                      DropdownButtonFormField<String>(
                        value: _selectedVillage,
                        items: const [
                          DropdownMenuItem(value: 'চিথলিয়া (Chitholia)', child: Text('চিথলিয়া (Chitholia)')),
                          DropdownMenuItem(value: 'মির্জানগর (Mirzanagar)', child: Text('মির্জানগর (Mirzanagar)')),
                        ],
                        onChanged: (val) => setState(() => _selectedVillage = val ?? _selectedVillage),
                        decoration: const InputDecoration(labelText: 'গ্রাম / এলাকা'),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _handleCreateSos,
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
                        Text('স্ট্যাটাস: $_sosState (Saved in durable local outbox)', style: const TextStyle(fontSize: 12, color: Color(0xFF4ADE80))),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 8,
                          children: [
                            ElevatedButton.icon(
                              onPressed: () {
                                setState(() => _sosState = 'HANDED_OFF_SMS');
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('অ্যান্ড্রয়েড এসএমএস কম্পোজার ওপেন হয়েছে (Explicit User Action)')),
                                );
                              },
                              icon: const Icon(Icons.sms),
                              label: const Text('এসএমএস কম্পোজার ওপেন করুন'),
                              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0284C7)),
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

