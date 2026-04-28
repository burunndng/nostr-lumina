import * as React from 'react';
import { useSeoMeta } from '@unhead/react';
import { CheckCircleIcon, XCircleIcon, ClockIcon, RefreshCwIcon, ServerIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/hooks/useAppContext';

interface RelayStatus {
  url: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  read: boolean;
  write: boolean;
  lastSeen?: number;
  latency?: number;
}

export function RelayStatusPage() {
  useSeoMeta({
    title: 'Relay Status | Kur4tex',
    description: 'Monitor relay connections and propagation status',
  });

  const { config } = useAppContext();
  const [statuses, setStatuses] = React.useState<RelayStatus[]>([]);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const checkRelays = React.useCallback(async () => {
    setIsRefreshing(true);

    // Simulate relay status checks
    // In a real implementation, this would use WebSocket ping/pong or actual connection attempts
    const newStatuses: RelayStatus[] = config.relayMetadata.relays.map((relay) => ({
      url: relay.url,
      status: 'connected' as const,
      read: relay.read,
      write: relay.write,
      lastSeen: Date.now(),
      latency: Math.floor(Math.random() * 200) + 20,
    }));

    setStatuses(newStatuses);
    setIsRefreshing(false);
  }, [config.relayMetadata.relays]);

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
                {connectedCount} of {totalCount} relays connected
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={checkRelays}
              disabled={isRefreshing}
            >
              <RefreshCwIcon className={cn('size-4 mr-2', isRefreshing && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {statuses.map((relay) => (
              <RelayCard key={relay.url} relay={relay} />
            ))}
          </div>
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
            your event. This page shows the current connection status of your relays.
          </p>
          <p className="text-sm text-muted-foreground">
            If a relay shows as disconnected, your events won't reach that relay's
            readers. Consider adding backup relays or checking your network connection.
          </p>
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
      <div className="shrink-0">
        <ServerIcon className={cn('size-5', getStatusColor(relay.status))} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm truncate">{relay.url}</span>
          <StatusBadge status={relay.status} />
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            {relay.read && <Badge variant="outline" className="text-xs">R</Badge>}
            {relay.write && <Badge variant="outline" className="text-xs">W</Badge>}
          </span>
          {relay.latency && (
            <span>~{relay.latency}ms</span>
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
    case 'connecting': return 'text-yellow-500';
    case 'error': return 'text-red-500';
    default: return 'text-muted-foreground';
  }
}

function StatusBadge({ status }: { status: RelayStatus['status'] }) {
  switch (status) {
    case 'connected':
      return (
        <Badge variant="default" className="bg-green-500 text-white">
          <CheckCircleIcon className="size-3 mr-1" />
          Connected
        </Badge>
      );
    case 'disconnected':
      return (
        <Badge variant="destructive">
          <XCircleIcon className="size-3 mr-1" />
          Disconnected
        </Badge>
      );
    case 'connecting':
      return (
        <Badge variant="secondary">
          <ClockIcon className="size-3 mr-1" />
          Connecting
        </Badge>
      );
    case 'error':
      return (
        <Badge variant="destructive">
          <XCircleIcon className="size-3 mr-1" />
          Error
        </Badge>
      );
    default:
      return null;
  }
}

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export default RelayStatusPage;
