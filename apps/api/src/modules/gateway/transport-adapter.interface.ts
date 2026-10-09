export type TransportType =
  | 'APP_DIRECT'
  | 'GATEWAY_SIMULATED'
  | 'SATELLITE_SIMULATED'
  | 'OFFLINE_SMS_HANDOFF';

export type TransportStatus =
  | 'QUEUED'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'FAILED'
  | 'REJECTED';

export interface TransportResult {
  success: boolean;
  transportType: TransportType;
  status: TransportStatus;
  simulation: boolean;
  messageId?: string;
  failureReason?: string;
  timestamp: string;
}

export interface TransportAdapter {
  readonly transportType: TransportType;
  readonly isSimulation: boolean;
  sendPacket(packet: string, recipientMetadata?: Record<string, unknown>): Promise<TransportResult>;
}

export interface SmsGatewayIngestResult {
  simulation: true;
  gatewayId: string;
  reportId: string;
  clientReportId: string;
  packetChecksum: string;
  isIdempotentDuplicate: boolean;
  status: 'ACCEPTED' | 'DUPLICATE_IGNORED' | 'PARSE_FAILED';
  receivedAt: string;
  failureReason?: string;
}

