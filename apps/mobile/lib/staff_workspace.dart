import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';

class StaffWorkspace extends StatefulWidget {
  const StaffWorkspace(
      {super.key,
      required this.apiBase,
      required this.accessToken,
      required this.role,
      required this.displayName,
      required this.onSignOut});

  final String apiBase;
  final String accessToken;
  final String role;
  final String displayName;
  final VoidCallback onSignOut;

  @override
  State<StaffWorkspace> createState() => _StaffWorkspaceState();
}

class _StaffWorkspaceState extends State<StaffWorkspace> {
  bool _loading = true;
  String? _error;
  String? _feedback;
  List<Map<String, dynamic>> _incidents = [];
  List<Map<String, dynamic>> _villages = [];
  String? _selectedAreaId;
  final _levelController = TextEditingController();
  final _noteController = TextEditingController();

  bool get _isResponder => widget.role == 'RESPONDER';

  @override
  void initState() {
    super.initState();
    _loadWorkspace();
  }

  @override
  void dispose() {
    _levelController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  Future<Map<String, dynamic>> _request(String path,
      {String method = 'GET', Map<String, dynamic>? body}) async {
    final client = HttpClient()..connectionTimeout = const Duration(seconds: 6);
    try {
      final request =
          await client.openUrl(method, Uri.parse('${widget.apiBase}$path'));
      request.headers.contentType = ContentType.json;
      request.headers
          .set(HttpHeaders.authorizationHeader, 'Bearer ${widget.accessToken}');
      if (body != null) request.write(jsonEncode(body));
      final response = await request.close();
      final text = await response.transform(utf8.decoder).join();
      final decoded = text.isEmpty ? <String, dynamic>{} : jsonDecode(text);
      return {'statusCode': response.statusCode, 'body': decoded};
    } finally {
      client.close(force: true);
    }
  }

  Future<void> _loadWorkspace() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      if (_isResponder) {
        final result = await _request('/incidents');
        if (result['statusCode'] != 200) {
          throw HttpException(
              'Incident list unavailable (${result['statusCode']}).');
        }
        _incidents = (result['body'] as List<dynamic>)
            .whereType<Map<String, dynamic>>()
            .toList();
      } else {
        final result = await _request('/operations/snapshot');
        if (result['statusCode'] != 200) {
          throw HttpException(
              'Village list unavailable (${result['statusCode']}).');
        }
        final body = result['body'] as Map<String, dynamic>;
        final layers = body['mapLayers'] as Map<String, dynamic>? ?? {};
        _villages = (layers['areas'] as List<dynamic>? ?? [])
            .whereType<Map<String, dynamic>>()
            .where((area) => area['areaType'] == 'VILLAGE')
            .toList();
        if (_selectedAreaId == null && _villages.isNotEmpty) {
          _selectedAreaId = _villages.first['id']?.toString();
        }
      }
    } on SocketException {
      _error = 'Cannot reach the API. Check server address and network.';
    } catch (error) {
      _error = error.toString();
    }
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _review(String incidentId, String path,
      Map<String, dynamic> body, String label) async {
    try {
      final result = await _request('/incidents/$incidentId/$path',
          method: 'POST', body: body);
      if (result['statusCode'] < 200 || result['statusCode'] >= 300) {
        throw HttpException('Action rejected (${result['statusCode']}).');
      }
      if (mounted) setState(() => _feedback = label);
      await _loadWorkspace();
    } catch (error) {
      if (mounted) setState(() => _feedback = 'Action failed: $error');
    }
  }

  Future<void> _submitReading() async {
    final level = double.tryParse(_levelController.text.trim());
    if (level == null || level < 0 || level > 20 || _selectedAreaId == null) {
      setState(() => _feedback =
          'Enter a water level from 0 to 20 metres and choose a village.');
      return;
    }
    try {
      final result = await _request('/field-readings', method: 'POST', body: {
        'areaId': _selectedAreaId,
        'levelM': level,
        'note': _noteController.text.trim()
      });
      if (result['statusCode'] != 201 && result['statusCode'] != 200) {
        throw HttpException('Report not accepted (${result['statusCode']}).');
      }
      _levelController.clear();
      _noteController.clear();
      if (mounted) {
        setState(() => _feedback = 'Field reading acknowledged by the API.');
      }
    } catch (error) {
      if (mounted) setState(() => _feedback = 'Reading not sent: $error');
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final title = _isResponder ? 'Rescue operations' : 'Field reporting';
    return Scaffold(
      appBar: AppBar(
        title: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(title),
          Text(widget.displayName,
              style: Theme.of(context)
                  .textTheme
                  .labelSmall
                  ?.copyWith(color: colors.onSurfaceVariant))
        ]),
        actions: [
          IconButton(
              onPressed: _loadWorkspace,
              icon: const Icon(Icons.refresh),
              tooltip: 'Refresh workspace'),
          IconButton(
              onPressed: widget.onSignOut,
              icon: const Icon(Icons.logout),
              tooltip: 'Sign out')
        ],
      ),
      body: RefreshIndicator(
          onRefresh: _loadWorkspace,
          child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
              children: [
                _WorkspaceNotice(role: widget.role),
                const SizedBox(height: 16),
                if (_feedback != null) ...[
                  _InlineFeedback(message: _feedback!),
                  const SizedBox(height: 12)
                ],
                if (_loading)
                  const Padding(
                      padding: EdgeInsets.all(36),
                      child: Center(child: CircularProgressIndicator()))
                else if (_error != null)
                  _ErrorCard(message: _error!, onRetry: _loadWorkspace)
                else if (_isResponder)
                  ..._buildIncidents(colors)
                else
                  _buildFieldForm(colors),
              ])),
    );
  }

  List<Widget> _buildIncidents(ColorScheme colors) {
    if (_incidents.isEmpty) {
      return [
        const _EmptyCard(
            title: 'No open incidents',
            detail:
                'New reports will appear here when the operations API includes them.')
      ];
    }
    return [
      _SummaryStrip(
          icon: Icons.sos,
          title: '${_incidents.length} incidents',
          detail:
              'Synthetic exercise and API reports are labelled by provenance.'),
      const SizedBox(height: 12),
      ..._incidents.map((incident) {
        final candidate =
            incident['duplicateCandidate'] as Map<String, dynamic>?;
        final boat = incident['suggestedBoat'] as Map<String, dynamic>?;
        final flags = incident['urgencyFlags'] as Map<String, dynamic>? ?? {};
        final reasons = (incident['confidenceReasons'] as List<dynamic>? ?? [])
            .map((value) => value.toString())
            .toList();
        return Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(children: [
                        Expanded(
                            child: Text(
                                incident['summary']?.toString() ?? 'Incident',
                                style: Theme.of(context)
                                    .textTheme
                                    .titleMedium
                                    ?.copyWith(fontWeight: FontWeight.w700))),
                        _StatusChip(
                            label: incident['status']?.toString() ?? 'OPEN')
                      ]),
                      const SizedBox(height: 10),
                      Text(
                          '${incident['areaName'] ?? 'Location unavailable'} · ${incident['peopleCount'] ?? 0} people',
                          style: Theme.of(context).textTheme.bodyMedium),
                      const SizedBox(height: 7),
                      Wrap(spacing: 6, runSpacing: 6, children: [
                        _MetricChip(
                            label:
                                'Confidence ${(100 * ((incident['confidence'] as num?)?.toDouble() ?? 0)).round()}%'),
                        if (flags['trapped'] == true)
                          const _MetricChip(
                              label: 'Trapped', color: Color(0xFFB54736)),
                        if (flags['medical'] == true)
                          const _MetricChip(
                              label: 'Medical need', color: Color(0xFFB54736)),
                        if (flags['child'] == true)
                          const _MetricChip(
                              label: 'Child present', color: Color(0xFF93610A)),
                        if (flags['elderly'] == true)
                          const _MetricChip(
                              label: 'Older adult', color: Color(0xFF93610A)),
                      ]),
                      if (reasons.isNotEmpty) ...[
                        const SizedBox(height: 9),
                        Text('Rule evidence',
                            style: Theme.of(context).textTheme.labelLarge),
                        const SizedBox(height: 3),
                        Text(reasons.join(' · '),
                            style: Theme.of(context)
                                .textTheme
                                .bodySmall
                                ?.copyWith(color: colors.onSurfaceVariant))
                      ],
                      const SizedBox(height: 10),
                      if (candidate != null && candidate['status'] == 'PENDING')
                        Wrap(spacing: 8, children: [
                          OutlinedButton(
                              onPressed: () => _review(
                                  incident['id'].toString(),
                                  'duplicate-candidates/${candidate['candidateId']}/review',
                                  {
                                    'decision': 'ACCEPT',
                                    'reason':
                                        'Responder reviewed in mobile workspace'
                                  },
                                  'Duplicate accepted for review.'),
                              child: const Text('Accept duplicate')),
                          TextButton(
                              onPressed: () => _review(
                                  incident['id'].toString(),
                                  'duplicate-candidates/${candidate['candidateId']}/review',
                                  {
                                    'decision': 'REJECT',
                                    'reason':
                                        'Responder reviewed in mobile workspace'
                                  },
                                  'Duplicate rejected.'),
                              child: const Text('Keep separate')),
                        ]),
                      if (boat != null && boat['status'] == 'PROPOSED') ...[
                        const Divider(height: 24),
                        Text(
                            'Suggested asset: ${boat['name']} · ${boat['capacity']} people',
                            style: Theme.of(context).textTheme.bodyMedium),
                        const SizedBox(height: 8),
                        OutlinedButton(
                            onPressed: () => _review(
                                incident['id'].toString(),
                                'boat-recommendation/review',
                                {
                                  'decision': 'ACCEPT',
                                  'reason': 'Responder acknowledged suggestion'
                                },
                                'Suggestion acknowledged; no dispatch was sent.'),
                            child: const Text('Acknowledge suggestion')),
                        Text('Acknowledgment does not dispatch a boat.',
                            style: Theme.of(context)
                                .textTheme
                                .bodySmall
                                ?.copyWith(color: colors.onSurfaceVariant)),
                      ],
                      const SizedBox(height: 8),
                      Text(
                          'Source: ${incident['provenance'] ?? 'Synthetic incident fixture'}',
                          style: Theme.of(context)
                              .textTheme
                              .labelSmall
                              ?.copyWith(color: colors.onSurfaceVariant)),
                    ])));
      }),
    ];
  }

  Widget _buildFieldForm(ColorScheme colors) {
    if (_villages.isEmpty) {
      return const _EmptyCard(
          title: 'Village list unavailable',
          detail: 'Refresh when the API connection is available.');
    }
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      const _SummaryStrip(
          icon: Icons.water_drop_outlined,
          title: 'Share a field water reading',
          detail:
              'This is a volunteer report, not an official gauge observation.'),
      const SizedBox(height: 14),
      Card(
          child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text('Reading details',
                        style: Theme.of(context)
                            .textTheme
                            .titleMedium
                            ?.copyWith(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 14),
                    DropdownButtonFormField<String>(
                        initialValue: _selectedAreaId,
                        decoration: const InputDecoration(labelText: 'Village'),
                        items: _villages
                            .map((area) => DropdownMenuItem(
                                value: area['id']?.toString(),
                                child: Text(area['name']?.toString() ??
                                    'Feni village')))
                            .toList(),
                        onChanged: (value) =>
                            setState(() => _selectedAreaId = value)),
                    const SizedBox(height: 12),
                    TextField(
                        controller: _levelController,
                        keyboardType: const TextInputType.numberWithOptions(
                            decimal: true),
                        decoration: const InputDecoration(
                            labelText: 'Observed water level',
                            suffixText: 'metres',
                            helperText: 'Enter a value from 0 to 20 m.')),
                    const SizedBox(height: 12),
                    TextField(
                        controller: _noteController,
                        maxLength: 500,
                        maxLines: 3,
                        decoration: const InputDecoration(
                            labelText: 'Field note (optional)',
                            alignLabelWithHint: true)),
                    const SizedBox(height: 8),
                    FilledButton.icon(
                        onPressed: _submitReading,
                        icon: const Icon(Icons.send_outlined),
                        label: const Text('Submit reading')),
                    const SizedBox(height: 10),
                    Text(
                        'The API records your signed-in account as the submitter.',
                        style: Theme.of(context)
                            .textTheme
                            .bodySmall
                            ?.copyWith(color: colors.onSurfaceVariant)),
                  ]))),
    ]);
  }
}

class _WorkspaceNotice extends StatelessWidget {
  const _WorkspaceNotice({required this.role});
  final String role;
  @override
  Widget build(BuildContext context) => Card(
      color: const Color(0xFFEAF5F2),
      child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Icon(Icons.shield_outlined, color: Color(0xFF087F75)),
            const SizedBox(width: 10),
            Expanded(
                child: Text(
                    role == 'RESPONDER'
                        ? 'Human-reviewed rescue workspace. Suggestions never dispatch teams automatically.'
                        : 'Field reports support verification. A missing reading does not mean a village is safe.',
                    style: Theme.of(context).textTheme.bodySmall))
          ])));
}

class _SummaryStrip extends StatelessWidget {
  const _SummaryStrip(
      {required this.icon, required this.title, required this.detail});
  final IconData icon;
  final String title;
  final String detail;
  @override
  Widget build(BuildContext context) => Card(
      child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(children: [
            Icon(icon, color: const Color(0xFF087F75), size: 25),
            const SizedBox(width: 12),
            Expanded(
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                  Text(title,
                      style: Theme.of(context)
                          .textTheme
                          .titleMedium
                          ?.copyWith(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 3),
                  Text(detail, style: Theme.of(context).textTheme.bodySmall)
                ]))
          ])));
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.label});
  final String label;
  @override
  Widget build(BuildContext context) => Chip(
      label: Text(label),
      visualDensity: VisualDensity.compact,
      side: BorderSide.none,
      backgroundColor: const Color(0xFFEAF5F2));
}

class _MetricChip extends StatelessWidget {
  const _MetricChip(
      {required this.label, this.color = const Color(0xFF087F75)});
  final String label;
  final Color color;
  @override
  Widget build(BuildContext context) => Chip(
      label: Text(label),
      labelStyle:
          TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w600),
      visualDensity: VisualDensity.compact,
      side: BorderSide.none,
      backgroundColor: color.withValues(alpha: .09));
}

class _InlineFeedback extends StatelessWidget {
  const _InlineFeedback({required this.message});
  final String message;
  @override
  Widget build(BuildContext context) => Semantics(
      liveRegion: true,
      child: Card(
          color: const Color(0xFFEAF5F2),
          child: Padding(
              padding: const EdgeInsets.all(12), child: Text(message))));
}

class _EmptyCard extends StatelessWidget {
  const _EmptyCard({required this.title, required this.detail});
  final String title;
  final String detail;
  @override
  Widget build(BuildContext context) => Card(
      child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(children: [
            const Icon(Icons.inbox_outlined, size: 32),
            const SizedBox(height: 10),
            Text(title, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 5),
            Text(detail,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodySmall)
          ])));
}

class _ErrorCard extends StatelessWidget {
  const _ErrorCard({required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;
  @override
  Widget build(BuildContext context) => Card(
      child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(children: [
            const Icon(Icons.cloud_off_outlined, size: 32),
            const SizedBox(height: 8),
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: 10),
            OutlinedButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh),
                label: const Text('Try again'))
          ])));
}
