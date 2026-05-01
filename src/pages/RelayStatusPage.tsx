import * as React from 'react';
import { useSeoMeta } from '@unhead/react';
import { AlertTriangleIcon, RefreshCwIcon, ServerIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/hooks/useAppContext';
import { cn } from '@/lib/utils';

interface RelayStatus {
  url: string;
  status: 'connected' | 'disconnected' | 'checking';
  read: boolean;
  write: boolean;
  latency?: number;
  error?: string;
}

/**
 * Actually test a WebSocket connection to a relay.
 * Returns latency in ms, or throws on failure.
 */
async function pingRelay(url: string, timeoutMs = 5000): Promise<number> {
  return new Promise((resolve, reject) => {
    let ws: WebSocket;
    const timeout = setTimeout(() => {
      try { ws.close(); } catch { /* ignore */ }
      reject(new Error('Connection timed out'));
    }, timeoutMs);

    try {
      ws = new WebSocket(url);
    } catch (err) {
      clearTimeout(timeout);
      reject(err);
      return;
    }

    ws.onopen = () => {
      // Send a trivial CLOSE immediately — we just want to verify connectivity
      ws.send(JSON.stringify(['CLOSE', 'ping-test']));
    };

    ws.onmessage = () => {
      clearTimeout(timeout);
      try { ws.close(); } catch { /* ignore */ }
      resolve(Date.now()); // rough timing; we'd need more precision for real latency
    };

    ws.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('WebSocket connection failed'));
    };

    ws.onclose = (ev) => {
      clearTimeout(timeout);
      // A normal close after we sent CLOSE is fine
      if (ev.code !== 1000 && ev.code !== 1005) {
        reject(new Error(`Closed with code ${ev.code}`));
      }
    };
  });
}

/**
 * Check a relay and return full status with timing.
 */
async function checkRelay(
  url: string,
  read: boolean,
  write: boolean,
): Promise<RelayStatus> {
  const start = performance.now();
  try {
    await pingRelay(url);
    return {
      url,
      status: 'connected',
      read,
      write,
      latency: Math.round(performance.now() - start),
    };
  } catch (err) {
    return {
      url,
      status: 'disconnected',
      read,
      write,
      error: err instanceof Error ? err.message : 'Unknown error',
      latency: Math.round(performance.now() - start),
    };
  }
}

export function RelayStatusPage() {
  useSeoMeta({
    title: 'Relay Status | KUR4TEK',
    description: 'Monitor relay connections and propagation status',
  });

  const { config } = useAppContext();
  const [statuses, setStatuses] = React.useState<RelayStatus[]>([]);
  const [isChecking, setIsChecking] = React.useState(false);
  const [lastChecked, setLastChecked] = React.useState<number | null>(null);

  const checkRelays = React.useCallback(async () => {
    setIsChecking(true);
    // Set all to checking first
    setStatuses(
      config.relayMetadata.relays.map((relay) => ({
        url: relay.url,
        status: 'checking' as const,
        read: relay.read,
        write: relay.write,
      })),
    );

    // Check all relays concurrently
    const results = await Promise.all(
      config.relayMetadata.relays.map((relay) =>
        checkRelay(relay.url, relay.read, relay.write),
      ),
    );

    setStatuses(results);
    setLastChecked(Date.now());
    setIsChecking(false);
  }, [config.relayMetadata.relays]);

  // Check on mount
  React.useEffect(() => {
    checkRelays();
  }, [checkRelays]);

  const connectedCount = statuses.filter((s) => s.status === 'connected').length;
  const totalCount = statuses.length;

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Relay Status</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your relay connections and propagation health
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Connection Overview</CardTitle>
              <CardDescription>
                {isChecking ? (
                  <span className="flex items-center gap-2">
                    <RefreshCwIcon className="size-3 animate-spin" />
                    Checking relays...
                  </span>
                ) : (
                  <>{connectedCount} of {totalCount} relays connected</>
                )}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={checkRelays}
              disabled={isChecking}
            >
              <RefreshCwIcon className={cn('size-4 mr-2', isChecking && 'animate-spin')} />
              {isChecking ? 'Checking...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {statuses.map((relay) => (
              <RelayCard key={relay.url} relay={relay} />
            ))}
            {statuses.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-2 text-center py-4">
                No relays configured. Add relays in your Nostr account settings.
              </p>
            )}
          </div>
          {lastChecked && (
            <p className="text-xs text-muted-foreground mt-4 text-right">
              Last checked: {new Date(lastChecked).toLocaleTimeString()}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About Relay Propagation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            When you publish a list, it's sent to all your configured write relays.
            Each relay may take different amounts of time to accept and propagate
            your event. This page shows the live WebSocket connection status of your relays.
          </p>
          <p className="text-sm text-muted-foreground">
            If a relay shows as disconnected, your events won't reach that relay's
            readers. Consider adding backup relays or checking your network connection.
          </p>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
            <AlertTriangleIcon className="size-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Relay status is tested via WebSocket ping. Some relays may block
              rapid connections, so don't refresh too frequently. Latency is
              approximate — actual event propagation depends on relay load and
              network conditions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface RelayCardProps {
  relay: RelayStatus;
}

function RelayCard({ relay }: RelayCardProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border">
      <div className="shrink-0 mt-0.5">
        <ServerIcon className={cn('size-5', getStatusColor(relay.status))} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-medium text-sm truncate">{relay.url.replace('wss://', '')}</span>
          <StatusBadge status={relay.status} />
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            {relay.read && <Badge variant="outline" className="text-[10px] h-4 px-1.5">Read</Badge>}
            {relay.write && <Badge variant="outline" className="text-[10px] h-4 px-1.5">Write</Badge>}
          </span>
          {relay.latency !== undefined && relay.status === 'connected' && (
            <span className="text-green-500">{relay.latency}ms</span>
          )}
          {relay.error && (
            <span className="text-red-400 truncate max-w-[180px]" title={relay.error}>
              {relay.error}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: RelayStatus['status']): string {
  switch (status) {
    case 'connected': return 'text-green-500';
    case 'disconnected': return 'text-red-500';
    case 'checking': return 'text-yellow-500 animate-pulse';
    default: return 'text-muted-foreground';
  }
}

function StatusBadge({ status }: { status: RelayStatus['status'] }) {
  switch (status) {
    case 'connected':
      return (
        <Badge variant="default" className="bg-green-600 text-white text-[10px] h-4 px-1.5">
          Connected
        </Badge>
      );
    case 'disconnected':
      return (
        <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
          Disconnected
        </Badge>
      );
    case 'checking':
      return (
        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
          <RefreshCwIcon className="size-2.5 mr-1 animate-spin" />
          Checking
        </Badge>
      );
    default:
      return null;
  }
}

export default RelayStatusPage;
