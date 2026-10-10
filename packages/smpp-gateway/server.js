/**
 * Lightweight Telecom SMPP v3.4 Ingestion Gateway (ACT-08)
 * Translates mobile operator SMSC short-code messages (1090/999) to Aali AI Disaster Packets.
 */

const net = require('net');
const http = require('http');

const SMPP_PORT = parseInt(process.env.SMPP_PORT || '2775', 10);
const HTTP_ADMIN_PORT = parseInt(process.env.HTTP_ADMIN_PORT || '2776', 10);
const API_ENDPOINT = process.env.API_ENDPOINT || 'http://127.0.0.1:3001/api/v1/gateway/sms';
const SHORTCODE = process.env.EMERGENCY_SHORTCODE || '1090';

// Command IDs according to SMPP v3.4 specification
const SMPP_CMD = {
  BIND_RECEIVER: 0x00000001,
  BIND_TRANSMITTER: 0x00000002,
  BIND_TRANSCEIVER: 0x00000009,
  BIND_RESP: 0x80000009,
  SUBMIT_SM: 0x00000004,
  SUBMIT_SM_RESP: 0x80000004,
  DELIVER_SM: 0x00000005,
  ENQUIRE_LINK: 0x00000015,
  ENQUIRE_LINK_RESP: 0x80000015,
  UNBIND: 0x00000006,
  UNBIND_RESP: 0x80000006,
};

let packetsIngested = 0;
let lastIngestedPacket = null;

async function forwardToAaliApi(packetPayload, senderMsisdn) {
  try {
    const payload = JSON.stringify({
      rawPacket: packetPayload,
      senderMsisdn: senderMsisdn || '+8801900000001',
      operator: 'BANGLALINK_STARLINK_D2C',
      carrierCode: '04',
      shortCode: SHORTCODE,
    });

    const parsedUrl = new URL(API_ENDPOINT);
    const req = http.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 3001,
        path: parsedUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'X-Telecom-Gateway': 'SMPP-v3.4-Bridge',
        },
      },
      (res) => {
        packetsIngested++;
        lastIngestedPacket = {
          packet: packetPayload,
          status: res.statusCode,
          timestamp: new Date().toISOString(),
        };
        console.log(`[SMPP -> API] Forwarded packet: ${packetPayload} -> HTTP ${res.statusCode}`);
      }
    );

    req.on('error', (err) => {
      console.warn(`[SMPP -> API Warning] Forward failed: ${err.message}`);
    });

    req.write(payload);
    req.end();
  } catch (err) {
    console.warn(`[SMPP -> API Error] ${err.message}`);
  }
}

// TCP SMPP Server
const smppServer = net.createServer((socket) => {
  console.log(`[SMPP] SMSC Connection established from ${socket.remoteAddress}:${socket.remotePort}`);

  socket.on('data', (buffer) => {
    if (buffer.length < 16) return;

    const commandLength = buffer.readUInt32BE(0);
    const commandId = buffer.readUInt32BE(4);
    const commandStatus = buffer.readUInt32BE(8);
    const sequenceNumber = buffer.readUInt32BE(12);

    console.log(`[SMPP PDU] Cmd: 0x${commandId.toString(16)}, Seq: ${sequenceNumber}, Len: ${commandLength}`);

    // 1. Handshake Bind Response
    if (
      commandId === SMPP_CMD.BIND_TRANSCEIVER ||
      commandId === SMPP_CMD.BIND_RECEIVER ||
      commandId === SMPP_CMD.BIND_TRANSMITTER
    ) {
      const resp = Buffer.alloc(16);
      resp.writeUInt32BE(16, 0);
      resp.writeUInt32BE((commandId | 0x80000000) >>> 0, 4);
      resp.writeUInt32BE(0, 8); // ESME_ROK
      resp.writeUInt32BE(sequenceNumber, 12);
      socket.write(resp);
      console.log(`[SMPP] Handshake OK for session.`);
      return;
    }

    // 2. Keepalive Enquire Link
    if (commandId === SMPP_CMD.ENQUIRE_LINK) {
      const resp = Buffer.alloc(16);
      resp.writeUInt32BE(16, 0);
      resp.writeUInt32BE(SMPP_CMD.ENQUIRE_LINK_RESP, 4);
      resp.writeUInt32BE(0, 8);
      resp.writeUInt32BE(sequenceNumber, 12);
      socket.write(resp);
      return;
    }

    // 3. Inbound Short-Code Message (SUBMIT_SM / DELIVER_SM)
    if (commandId === SMPP_CMD.SUBMIT_SM || commandId === SMPP_CMD.DELIVER_SM) {
      // Extract body string from PDU
      const pduBody = buffer.subarray(16).toString('utf8');
      const packetMatch = pduBody.match(/A1\|S\|[a-z0-9]+\|\d+\|[A-Za-z0-9]+\|\d{4}-\d{4}\|[A-Z0-9]{4}/);
      const packetString = packetMatch ? packetMatch[0] : pduBody.trim();

      forwardToAaliApi(packetString, '+8801912345678');

      // Return SUBMIT_SM_RESP with synthetic message ID
      const msgId = `AALI-${Date.now().toString(36).toUpperCase()}`;
      const resp = Buffer.alloc(16 + msgId.length + 1);
      resp.writeUInt32BE(16 + msgId.length + 1, 0);
      resp.writeUInt32BE(SMPP_CMD.SUBMIT_SM_RESP, 4);
      resp.writeUInt32BE(0, 8); // ESME_ROK
      resp.writeUInt32BE(sequenceNumber, 12);
      resp.write(msgId, 16, 'ascii');
      resp.writeUInt8(0, 16 + msgId.length); // null terminator
      socket.write(resp);
      return;
    }
  });

  socket.on('error', (err) => {
    console.warn(`[SMPP Socket Error] ${err.message}`);
  });
});

smppServer.listen(SMPP_PORT, '0.0.0.0', () => {
  console.log(`📡 [Aali SMPP Gateway] Listening on SMPP Port ${SMPP_PORT} (Short-Code: ${SHORTCODE})`);
});

// Admin Health & Status HTTP Server
const adminServer = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'UP',
        service: 'Aali SMPP v3.4 Ingestion Gateway',
        smppPort: SMPP_PORT,
        shortCode: SHORTCODE,
        targetApi: API_ENDPOINT,
        packetsIngested,
        lastIngestedPacket,
        uptimeSeconds: process.uptime(),
      })
    );
    return;
  }
  res.writeHead(404);
  res.end();
});

adminServer.listen(HTTP_ADMIN_PORT, '0.0.0.0', () => {
  console.log(`🌐 [SMPP Gateway Admin] Status endpoint listening on port ${HTTP_ADMIN_PORT}`);
});
