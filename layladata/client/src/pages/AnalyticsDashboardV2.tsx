import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity, TrendingUp, Eye, Users } from 'lucide-react';

const DAILY_GOAL = parseInt(import.meta.env.VITE_DAILY_GOAL || '150', 10);

interface Summary {
  all_time_uniques: number;
  today_uniques: number;
  today_pageviews: number;
  live_visitors: number;
  last_60d: Array<{ date: string; uniques: number; pageviews: number }>;
  top_pages: Array<{ path: string; uniques_7d: number; pageviews_7d: number }>;
  top_referrers_7d: Array<{ referrer: string; pageviews: number }>;
}

interface RecentHit {
  id: number;
  ts: string;
  visitor_id: string;
  path: string;
  referrer: string | null;
  is_bot: number;
}

export default function AnalyticsDashboardV2() {
  const [todayUniques, setTodayUniques] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  // Add robots meta tag to prevent search engine indexing
  useEffect(() => {
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'noindex, nofollow';
    document.head.appendChild(metaRobots);

    return () => {
      document.head.removeChild(metaRobots);
    };
  }, []);

  // Fetch summary data
  const { data: summary, refetch, error: summaryError } = useQuery<Summary>({
    queryKey: ['/api/analytics/summary'],
    refetchInterval: 30000, // Refresh every 30 seconds
    queryFn: async () => {
      const res = await fetch('/api/analytics/summary');
      if (!res.ok) {
        throw new Error('Failed to fetch summary');
      }
      return res.json();
    },
  });

  // Fetch recent hits for debug
  const { data: recentData } = useQuery<{ hits: RecentHit[] }>({
    queryKey: ['/api/analytics/recent'],
    enabled: showDebug,
    queryFn: async () => {
      const res = await fetch('/api/analytics/recent?limit=10');
      if (!res.ok) throw new Error('Failed to fetch recent');
      return res.json();
    },
  });

  // SSE connection for live updates
  useEffect(() => {
    const eventSource = new EventSource('/api/analytics/stream');

    eventSource.onopen = () => {
      setIsLive(true);
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setTodayUniques(data.today_uniques);
      refetch(); // Refresh summary when new data comes in
    };

    eventSource.onerror = () => {
      setIsLive(false);
    };

    return () => {
      eventSource.close();
    };
  }, [refetch]);

  // Update today uniques from summary
  useEffect(() => {
    if (summary) {
      setTodayUniques(summary.today_uniques);
    }
  }, [summary]);

  if (summaryError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-400">Error Loading Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 mb-4">
              Failed to load analytics data. Please check the server logs or try refreshing the page.
            </p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              data-testid="button-reload"
            >
              Reload Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Loading analytics...</p>
      </div>
    );
  }

  const goalProgress = (todayUniques / DAILY_GOAL) * 100;
  const goalMet = todayUniques >= DAILY_GOAL;

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-slate-100">Layla Analytics</h1>
            <p className="text-slate-400 text-sm">Private analytics URL. Please do not share.</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={isLive ? 'default' : 'secondary'} data-testid="badge-live-status">
              {isLive ? '● LIVE' : '○ Offline'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDebug(!showDebug)}
              data-testid="button-toggle-debug"
            >
              {showDebug ? 'Hide' : 'Show'} Debug
            </Button>
          </div>
        </div>

        {/* Stats tiles */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card data-testid="card-all-time-uniques">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">All-Time Uniques</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-all-time-uniques">
                {summary.all_time_uniques.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-today-uniques">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Uniques</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2" data-testid="text-today-uniques">
                {todayUniques.toLocaleString()}
              </div>
              <div className="space-y-1">
                <Progress value={goalProgress} className="h-2" data-testid="progress-daily-goal" />
                <p className="text-xs text-muted-foreground">
                  {goalMet ? (
                    <span className="text-green-400">✓ Goal met!</span>
                  ) : (
                    `${Math.round(goalProgress)}% to goal of ${DAILY_GOAL}`
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-today-pageviews">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Page Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-today-pageviews">
                {summary.today_pageviews.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-live-visitors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live Visitors</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-live-visitors">
                {summary.live_visitors}
              </div>
              <p className="text-xs text-muted-foreground">Last 5 minutes</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card data-testid="card-60-day-chart">
          <CardHeader>
            <CardTitle>Daily Unique Visitors (Last 60 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={summary.last_60d}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8"
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '6px'
                  }}
                />
                <ReferenceLine y={DAILY_GOAL} stroke="#f59e0b" strokeDasharray="3 3" />
                <Line 
                  type="monotone" 
                  dataKey="uniques" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Pages */}
          <Card data-testid="card-top-pages">
            <CardHeader>
              <CardTitle>Top Pages (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {summary.top_pages.map((page, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-slate-300 truncate">{page.path}</span>
                    <div className="flex gap-4 text-slate-500">
                      <span>{page.uniques_7d} uniques</span>
                      <span>{page.pageviews_7d} views</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Referrers */}
          <Card data-testid="card-top-referrers">
            <CardHeader>
              <CardTitle>Top Referrers (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {summary.top_referrers_7d.map((ref, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-slate-300 truncate">{ref.referrer}</span>
                    <span className="text-slate-500">{ref.pageviews} views</span>
                  </div>
                ))}
                {summary.top_referrers_7d.length === 0 && (
                  <p className="text-slate-500 text-sm">No referrer data yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debug Panel */}
        {showDebug && recentData && (
          <Card data-testid="card-debug-panel">
            <CardHeader>
              <CardTitle>Recent Hits (Last 10)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-xs">
                {recentData.hits.map((hit) => (
                  <div key={hit.id} className="flex gap-4 text-slate-400">
                    <span>{new Date(hit.ts).toLocaleTimeString()}</span>
                    <span>{hit.path}</span>
                    <span>{hit.visitor_id.substring(0, 6)}...</span>
                    <span>{hit.referrer || '(direct)'}</span>
                    {hit.is_bot === 1 && <Badge variant="secondary">BOT</Badge>}
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-slate-900 rounded text-xs">
                <p className="text-slate-400 mb-2">Test tracking in console:</p>
                <code className="text-amber-400">
                  fetch('/api/track',{'{'}method:'POST',headers:{'{'}
                  'Content-Type':'application/json'{'}'},body:JSON.stringify({'{'}
                  path:'/test',referrer:document.referrer,ua:navigator.userAgent{'}'})
                  {'}'})
                </code>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
