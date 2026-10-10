import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject, interval, map, merge } from 'rxjs';

export interface OperationsLiveEvent {
  type: 'NEW_SOS' | 'FIELD_READING' | 'BOAT_REVIEW' | 'ALERT_CHANGE' | 'SIMULATION_STEP' | 'DEMO_MOMENT' | 'HEARTBEAT';
  timestamp: string;
  payload: Record<string, unknown>;
}

@Injectable()
export class OperationsStreamService {
  private static readonly eventBus = new Subject<OperationsLiveEvent>();

  emit(type: OperationsLiveEvent['type'], payload: Record<string, unknown>) {
    OperationsStreamService.eventBus.next({
      type,
      timestamp: new Date().toISOString(),
      payload,
    });
  }

  static emitStatic(type: OperationsLiveEvent['type'], payload: Record<string, unknown>) {
    OperationsStreamService.eventBus.next({
      type,
      timestamp: new Date().toISOString(),
      payload,
    });
  }

  getStream(): Observable<MessageEvent> {
    const events$ = OperationsStreamService.eventBus.pipe(
      map((event) => ({
        data: event,
      } as MessageEvent)),
    );

    const heartbeat$ = interval(15000).pipe(
      map(() => ({
        data: {
          type: 'HEARTBEAT',
          timestamp: new Date().toISOString(),
          payload: { status: 'ONLINE', clientsConnected: true },
        },
      } as MessageEvent)),
    );

    return merge(events$, heartbeat$);
  }
}

