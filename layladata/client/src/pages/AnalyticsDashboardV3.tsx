import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Users, Eye, MousePointerClick, ShoppingCart, Activity, TrendingUp, ExternalLink, Globe } from "lucide-react";
import { Helmet } from "react-helmet";
import { Badge } from "@/components/ui/badge";

type SummaryStats = {
  todayUniques: number;
  todayPageviews: number;
  todayClicks: number;
  todayPurchases: number;
  liveVisitors: number;
  dailyGoal: number;
  yesterdayUniques: number;
  last7DaysUniques: number;
};

type FunnelStats = {
  todayFunnel: {
    visitors: number;
    clicks: number;
    purchases: number;
  };
  last7DaysFunnel: {
    visitors: number;
    clicks: number;
    purchases: number;
  };
};

type DailyUniquePoint = {
  date: string;
  uniques: number;
};

type SourceRow = {
  source: string;
  visitors: number;
  clicks: number;
  purchases: number;
  conversionRate: number;
};

type ReferrerRow = {
  referrer: string;
  visitors: number;
  percentage: number;
};

type RecentHit = {
  timestamp: string;
  event: string;
  path: string;
  referrer?: string;
  source?: string;
};

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  trendLabel 
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  icon: any; 
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
}) {
  return (
    <Card data-testid={`card-stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
        <CardTitle className="text-sm font-light text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold" data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}-value`}>
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
        {trendLabel && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
            {trendLabel}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function FunnelCard({ 
  title, 
  visitors, 
  clicks, 
  purchases 
}: { 
  title: string; 
  visitors: number; 
  clicks: number; 
  purchases: number; 
}) {
  const clickRate = visitors > 0 ? ((clicks / visitors) * 100).toFixed(1) : '0.0';
  const purchaseRate = clicks > 0 ? ((purchases / clicks) * 100).toFixed(1) : '0.0';

  return (
    <Card data-testid={`card-funnel-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader>
        <CardTitle className="text-base font-light">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Visitors</span>
            <span className="text-lg font-semibold" data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}-visitors`}>
              {visitors}
            </span>
          </div>
          <Progress value={100} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Ticket Clicks</span>
            <span className="text-lg font-semibold" data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}-clicks`}>
              {clicks}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={visitors > 0 ? (clicks / visitors) * 100 : 0} className="h-2" />
            <span className="text-xs text-muted-foreground min-w-[3rem]">{clickRate}%</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Purchases</span>
            <span className="text-lg font-semibold" data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}-purchases`}>
              {purchases}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={clicks > 0 ? (purchases / clicks) * 100 : 0} className="h-2" />
            <span className="text-xs text-muted-foreground min-w-[3rem]">{purchaseRate}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsDashboardV3() {
  const { data: summary } = useQuery<SummaryStats>({
    queryKey: ['/api/stats/summary'],
    refetchInterval: 30000, // Refresh every 30s
  });

  const { data: funnel } = useQuery<FunnelStats>({
    queryKey: ['/api/stats/funnel'],
    refetchInterval: 30000,
  });

  const { data: dailyUniques } = useQuery<DailyUniquePoint[]>({
    queryKey: ['/api/stats/daily-uniques'],
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: sources } = useQuery<SourceRow[]>({
    queryKey: ['/api/stats/sources'],
    refetchInterval: 30000,
  });

  const { data: referrers } = useQuery<ReferrerRow[]>({
    queryKey: ['/api/stats/top-referrers'],
    refetchInterval: 30000,
  });

  const { data: recent } = useQuery<RecentHit[]>({
    queryKey: ['/api/stats/recent'],
    refetchInterval: 10000, // Refresh every 10s
  });

  const goalProgress = summary
    ? Math.min((summary.todayUniques / summary.dailyGoal) * 100, 100)
    : 0;

  const yesterdayChange = summary && summary.yesterdayUniques > 0
    ? ((summary.todayUniques - summary.yesterdayUniques) / summary.yesterdayUniques * 100).toFixed(0)
    : null;

  return (
    <>
      <Helmet>
        <title>Analytics Dashboard - Layla</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="min-h-screen bg-background p-6 space-y-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-light mb-2" data-testid="text-dashboard-title">
              Layla Analytics
            </h1>
            <p className="text-muted-foreground">
              Goal-oriented visitor tracking and funnel analysis
            </p>
          </div>

          {/* Top Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <Card className="md:col-span-3 lg:col-span-1" data-testid="card-daily-goal">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
                <CardTitle className="text-sm font-light text-muted-foreground">
                  Today's Goal
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold mb-2" data-testid="text-today-uniques">
                  {summary?.todayUniques ?? 0} / {summary?.dailyGoal ?? 150}
                </div>
                <Progress value={goalProgress} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">
                  {goalProgress.toFixed(0)}% of daily goal
                  {yesterdayChange && (
                    <span className="ml-2">
                      ({yesterdayChange > 0 ? '+' : ''}{yesterdayChange}% vs yesterday)
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>

            <StatCard
              title="Page Views"
              value={summary?.todayPageviews ?? 0}
              subtitle="Today"
              icon={Eye}
            />

            <StatCard
              title="Ticket Clicks"
              value={summary?.todayClicks ?? 0}
              subtitle="Today"
              icon={MousePointerClick}
            />

            <StatCard
              title="Purchases"
              value={summary?.todayPurchases ?? 0}
              subtitle="Today"
              icon={ShoppingCart}
            />

            <StatCard
              title="Live Visitors"
              value={summary?.liveVisitors ?? 0}
              subtitle="Last 5 minutes"
              icon={Activity}
            />
          </div>

          {/* Funnel Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <FunnelCard
              title="Today's Funnel"
              visitors={funnel?.todayFunnel.visitors ?? 0}
              clicks={funnel?.todayFunnel.clicks ?? 0}
              purchases={funnel?.todayFunnel.purchases ?? 0}
            />
            <FunnelCard
              title="Last 7 Days Funnel"
              visitors={funnel?.last7DaysFunnel.visitors ?? 0}
              clicks={funnel?.last7DaysFunnel.clicks ?? 0}
              purchases={funnel?.last7DaysFunnel.purchases ?? 0}
            />
          </div>

          {/* Daily Uniques Chart */}
          <Card className="mb-6" data-testid="card-daily-chart">
            <CardHeader>
              <CardTitle className="text-base font-light">Daily Unique Visitors (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {dailyUniques && dailyUniques.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyUniques}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="uniques" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Two Column Layout: Sources and Referrers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* UTM Sources Performance */}
            <Card data-testid="card-sources">
              <CardHeader>
                <CardTitle className="text-base font-light">Source Performance (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                {sources && sources.length > 0 ? (
                  <div className="space-y-3">
                    {sources.map((source, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                        data-testid={`row-source-${idx}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Globe className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium truncate">{source.source}</span>
                          </div>
                          <div className="text-xs text-muted-foreground space-x-3">
                            <span>{source.visitors} visitors</span>
                            <span>{source.clicks} clicks</span>
                            <span>{source.purchases} purchases</span>
                          </div>
                        </div>
                        <Badge variant={source.conversionRate > 5 ? "default" : "secondary"}>
                          {source.conversionRate.toFixed(1)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No source data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Referrers */}
            <Card data-testid="card-referrers">
              <CardHeader>
                <CardTitle className="text-base font-light">Top Referrers (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                {referrers && referrers.length > 0 ? (
                  <div className="space-y-3">
                    {referrers.map((ref, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                        data-testid={`row-referrer-${idx}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium truncate">{ref.referrer}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {ref.visitors} visitors
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {ref.percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No referrer data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card data-testid="card-recent-activity">
            <CardHeader>
              <CardTitle className="text-base font-light">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recent && recent.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {recent.map((hit, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between py-2 px-3 rounded-md hover-elevate text-sm"
                      data-testid={`row-activity-${idx}`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Badge variant={
                          hit.event === 'purchase' ? 'default' :
                          hit.event === 'click_ticket' ? 'secondary' :
                          'outline'
                        }>
                          {hit.event}
                        </Badge>
                        <span className="truncate text-muted-foreground">
                          {hit.path}
                        </span>
                        {hit.source && (
                          <span className="text-xs text-muted-foreground truncate">
                            via {hit.source}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-3">
                        {new Date(hit.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No recent activity
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
