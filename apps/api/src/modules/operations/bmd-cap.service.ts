import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';
import { OperationsProvenance, OperationsSourceStatus } from './operations-context';

export interface BmdCapAdvisory {
  id: string;
  headline: string;
  description: string | null;
  instruction: string | null;
  severity: string | null;
  urgency: string | null;
  certainty: string | null;
  areas: string[];
  issuedAt: string | null;
  effectiveAt: string | null;
  expiresAt: string;
  sourceUrl: string;
  fetchedAt: string;
  provenance: OperationsProvenance.EXTERNAL_OBSERVATION;
}

interface CapFeedSnapshot {
  alerts: BmdCapAdvisory[];
  status: OperationsSourceStatus;
}

const FEED_URL = process.env.BMD_CAP_RSS_URL ?? 'https://cap.bmd.gov.bd/api/cap/rss.xml';
const FEED_HOST = 'cap.bmd.gov.bd';
const REFRESH_INTERVAL_MS = 10 * 60 * 1000;
const MAX_FEED_ITEMS = 20;
const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  trimValues: true,
  parseTagValue: false,
});

function list<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function text(value: unknown): string | null {
  if (typeof value === 'string' || typeof value === 'number') {
    const result = String(value).trim();
    return result.length ? result : null;
  }
  return null;
}

function capDate(value: unknown): string | null {
  const raw = text(value);
  if (!raw) return null;
  const timestamp = Date.parse(raw);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function capValue(info: Record<string, unknown>, key: string): string | null {
  return text(info[key]);
}

@Injectable()
export class BmdCapService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BmdCapService.name);
  private timer?: NodeJS.Timeout;
  private current: CapFeedSnapshot = {
    alerts: [],
    status: {
      id: 'bmd', label: 'BMD CAP public alerts', availability: 'UNAVAILABLE',
      lastCheckedAt: null, latestObservedAt: null, ageSeconds: null,
      message: 'Public CAP feed has not been checked yet.',
      provenance: OperationsProvenance.EXTERNAL_OBSERVATION,
    },
  };
  private inFlight?: Promise<void>;

  onModuleInit(): void {
    void this.refresh();
    this.timer = setInterval(() => void this.refresh(), REFRESH_INTERVAL_MS);
    this.timer.unref();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async getSnapshot(): Promise<CapFeedSnapshot> {
    const checkedAt = this.current.status.lastCheckedAt;
    if (!checkedAt || Date.now() - Date.parse(checkedAt) >= REFRESH_INTERVAL_MS) await this.refresh();
    return this.current;
  }

  async refresh(): Promise<void> {
    if (this.inFlight) return this.inFlight;
    this.inFlight = this.fetchFeed().finally(() => { this.inFlight = undefined; });
    return this.inFlight;
  }

  private async fetchFeed(): Promise<void> {
    const checkedAt = new Date().toISOString();
    try {
      const feedUrl = new URL(FEED_URL);
      if (feedUrl.protocol !== 'https:' || feedUrl.hostname !== FEED_HOST) throw new Error('Configured feed must use the official HTTPS BMD CAP host.');
      const response = await fetch(feedUrl, { signal: AbortSignal.timeout(12_000), headers: { Accept: 'application/rss+xml, application/xml, text/xml' } });
      if (!response.ok) throw new Error(`CAP RSS returned HTTP ${response.status}.`);
      const parsed = parser.parse(await response.text()) as Record<string, unknown>;
      const rss = parsed.rss as Record<string, unknown> | undefined;
      const channel = rss?.channel as Record<string, unknown> | undefined;
      if (!channel) throw new Error('CAP RSS response has no channel.');
      const channelDate = capDate(channel.lastBuildDate);
      const rssItems = list(channel.item as Record<string, unknown> | Record<string, unknown>[] | undefined).slice(0, MAX_FEED_ITEMS);
      const details = await this.mapLimit(rssItems, 4, async (item) => {
        const link = text(item.link);
        if (!link) return null;
        const url = new URL(link);
        if (url.protocol !== 'https:' || url.hostname !== FEED_HOST || !url.pathname.startsWith('/api/cap/')) return null;
        const detailResponse = await fetch(url, { signal: AbortSignal.timeout(12_000), headers: { Accept: 'application/xml, text/xml' } });
        if (!detailResponse.ok) throw new Error(`CAP alert detail returned HTTP ${detailResponse.status}.`);
        const xml = parser.parse(await detailResponse.text()) as Record<string, unknown>;
        const capAlert = (xml.alert ?? xml) as Record<string, unknown>;
        return { item, alert: capAlert, sourceUrl: url.toString() };
      });

      const resolved = details.filter((item): item is NonNullable<typeof item> => item !== null);
      const superseded = new Set<string>();
      for (const detail of resolved) {
        const msgType = text(detail.alert.msgType);
        if (msgType === 'Update' || msgType === 'Cancel') {
          for (const reference of list(detail.alert.references as unknown | unknown[])) {
            const parts = text(reference)?.split(',');
            if (parts?.[1]) superseded.add(parts[1].trim());
          }
        }
      }

      const now = Date.now();
      const alerts = resolved.flatMap(({ item, alert, sourceUrl }) => {
        const identifier = text(alert.identifier);
        if (!identifier || superseded.has(identifier) || text(alert.status) !== 'Actual') return [];
        const msgType = text(alert.msgType);
        if (msgType !== 'Alert' && msgType !== 'Update') return [];
        const infos = list(alert.info as Record<string, unknown> | Record<string, unknown>[] | undefined);
        const info = infos.find((entry) => text(entry.language)?.toLowerCase().startsWith('en')) ?? infos[0];
        if (!info) return [];
        const effectiveAt = capDate(info.effective);
        const expiresAt = capDate(info.expires);
        if (!expiresAt || Date.parse(expiresAt) <= now || (effectiveAt && Date.parse(effectiveAt) > now)) return [];
        const areas = list(info.area as Record<string, unknown> | Record<string, unknown>[] | undefined)
          .map((area) => text(area.areaDesc)).filter((area): area is string => area !== null);
        return [{
          id: identifier,
          headline: text(info.headline) ?? text(item.title) ?? 'BMD CAP alert (headline unavailable)',
          description: capValue(info, 'description'),
          instruction: capValue(info, 'instruction'),
          severity: capValue(info, 'severity'),
          urgency: capValue(info, 'urgency'),
          certainty: capValue(info, 'certainty'),
          areas,
          issuedAt: capDate(alert.sent),
          effectiveAt,
          expiresAt,
          sourceUrl,
          fetchedAt: checkedAt,
          provenance: OperationsProvenance.EXTERNAL_OBSERVATION,
        } satisfies BmdCapAdvisory];
      }).sort((a, b) => Date.parse(b.issuedAt ?? '') - Date.parse(a.issuedAt ?? ''));

      this.current = {
        alerts,
        status: {
          id: 'bmd', label: 'BMD CAP public alerts', availability: 'AVAILABLE',
          lastCheckedAt: checkedAt, latestObservedAt: channelDate,
          ageSeconds: channelDate ? Math.max(0, Math.floor((Date.now() - Date.parse(channelDate)) / 1000)) : null,
          message: alerts.length
            ? `${alerts.length} current unexpired Actual CAP alert${alerts.length === 1 ? '' : 's'} from the public RSS entries. Feed last built ${channelDate ?? 'at an unknown time'}.`
            : `Feed fetched; no current unexpired Actual CAP alerts in the latest ${rssItems.length} entries. Feed last built ${channelDate ?? 'at an unknown time'}. No alert does not establish safety.`,
          provenance: OperationsProvenance.EXTERNAL_OBSERVATION,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown CAP feed error.';
      this.logger.warn(`BMD CAP feed check failed: ${message}`);
      this.current = {
        ...this.current,
        status: {
          ...this.current.status,
          availability: 'UNAVAILABLE',
          lastCheckedAt: checkedAt,
          message: `CAP feed check failed; cached alerts, if any, may be stale. ${message}`,
        },
      };
    }
  }

  private async mapLimit<T, R>(values: T[], concurrency: number, fn: (value: T) => Promise<R>): Promise<R[]> {
    const output = new Array<R>(values.length);
    let index = 0;
    const workers = Array.from({ length: Math.min(concurrency, values.length) }, async () => {
      while (index < values.length) {
        const currentIndex = index++;
        output[currentIndex] = await fn(values[currentIndex]);
      }
    });
    await Promise.all(workers);
    return output;
  }
}
