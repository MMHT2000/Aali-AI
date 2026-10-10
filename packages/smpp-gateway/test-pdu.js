/**
 * SMPP v3.4 Test Client Script
 * Connects to the Aali SMPP gateway, sends BIND_TRANSCEIVER, and submits an emergency Disaster Packet PDU.
 */

const net = require('net');
const { fork } = require('child_process');
const path = require('path');

const PORT = 2775;
const HOST = '127.0.0.1';

let serverProc = null;

function runClient() {
  const client = new net.Socket();

  client.connect(PORT, HOST, () => {
    console.log('[Test Client] Connected to SMPP gateway. Sending BIND_TRANSCEIVER...');

    // 1. Send BIND_TRANSCEIVER
    const bindPdu = Buffer.alloc(16);
    bindPdu.writeUInt32BE(16, 0); // length
    bindPdu.writeUInt32BE(0x00000009, 4); // BIND_TRANSCEIVER
    bindPdu.writeUInt32BE(0, 8); // command_status
    bindPdu.writeUInt32BE(1, 12); // sequence_number
    client.write(bindPdu);
  });

client.on('data', (data) => {
  const cmdId = data.readUInt32BE(4);
  const seq = data.readUInt32BE(12);

  if (cmdId === 0x80000009) {
    console.log('[Test Client] BIND_TRANSCEIVER_RESP received. Session active! Sending emergency SUBMIT_SM PDU...');

    // 2. Send SUBMIT_SM with Disaster Packet
    const packet = 'A1|S|wh0r2q8|05|E1M0|0821-1430|7Q2K';
    const packetBuf = Buffer.from(packet, 'utf8');
    const pduLen = 16 + packetBuf.length;

    const submitPdu = Buffer.alloc(pduLen);
    submitPdu.writeUInt32BE(pduLen, 0);
    submitPdu.writeUInt32BE(0x00000004, 4); // SUBMIT_SM
    submitPdu.writeUInt32BE(0, 8);
    submitPdu.writeUInt32BE(2, 12);
    packetBuf.copy(submitPdu, 16);

    client.write(submitPdu);
  } else if (cmdId === 0x80000004) {
    const msgId = data.subarray(16).toString('ascii').replace(/\0/g, '');
    console.log(`[Test Client] SUBMIT_SM_RESP received! Operator Msg ID: ${msgId}`);
    console.log('✅ SMPP v3.4 Ingestion Gateway test PASSED successfully!');
    client.destroy();
    if (serverProc) serverProc.kill();
    process.exit(0);
  }
});

  client.on('error', (err) => {
    if (err.code === 'ECONNREFUSED' && !serverProc) {
      console.log('[Test Client] Gateway not running. Spawning server.js...');
      serverProc = fork(path.join(__dirname, 'server.js'), [], { stdio: 'ignore' });
      setTimeout(runClient, 800);
      return;
    }
    console.error('[Test Client Error]', err.message);
    if (serverProc) serverProc.kill();
    process.exit(1);
  });
}

runClient();
