'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LeaderboardAPI } from '@/lib/api';
import { LeaderboardEntry, LeaderboardWindow } from '@/lib/types';
import { TrophyIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const windowOptions: { label: string; value: LeaderboardWindow }[] = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'All time', value: 'all' },
];

const RankRow = ({ entry }: { entry: LeaderboardEntry }) => (
  <div className="flex items-center justify-between rounded-lg border px-4 py-3 hover:border-primary/40 transition-colors">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
        {entry.avatar ? (
          <img src={entry.avatar} alt={entry.name} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          entry.name.charAt(0).toUpperCase()
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">
          #{entry.rank} {entry.name}
        </p>
        <p className="text-xs text-muted-foreground">{entry.email}</p>
      </div>
    </div>
    <div className="flex items-center gap-4 text-sm">
      <div className="text-primary font-semibold">{entry.points} pts</div>
      <div className="text-muted-foreground">{entry.totalTasks} tasks</div>
    </div>
  </div>
);

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [windowValue, setWindowValue] = useState<LeaderboardWindow>(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await LeaderboardAPI.getLeaderboard({
        window: windowValue,
      });
      setEntries(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowValue]);

  const top3 = useMemo(() => entries.slice(0, 3), [entries]);
  const rest = useMemo(() => entries.slice(3), [entries]);

  return (
    <Sidebar>
      <div className="min-h-screen bg-muted/30">
        <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <TrophyIcon className="h-6 w-6 text-amber-500" />
                Leaderboard
              </h1>
              <p className="text-sm text-muted-foreground">Top taskers by completed task points.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchLeaderboard} disabled={loading}>
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Card>
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Best Time Killer runs by window.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {windowOptions.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={windowValue === opt.value ? 'primary' : 'outline'}
                    onClick={() => setWindowValue(opt.value)}
                    size="sm"
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Podium</CardTitle>
                <CardDescription>Top three performers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {top3.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
                {top3.map((entry) => (
                  <RankRow key={entry.userId} entry={entry} />
                ))}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
                <CardDescription>Window: {windowValue} days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {loading && <p className="text-sm text-muted-foreground">Loading leaderboard...</p>}
                {!loading && entries.length === 0 && (
                  <p className="text-sm text-muted-foreground">No leaderboard data for this filter.</p>
                )}
                {!loading &&
                  rest.map((entry) => (
                    <RankRow key={entry.userId} entry={entry} />
                  ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
