import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, MousePointer, Users, Eye, Activity, ExternalLink } from "lucide-react";
import { useState, useMemo } from "react";

interface AnalyticsStats {
  totalViews: number;
  uniqueSessions: number;
  topPages: Array<{ url: string; views: number }>;
  topReferrers: Array<{ referrer_domain: string; views: number }>;
  recentEvents: Array<{
    id: string;
    session_id: string;
    event_type: string;
    url: string;
    referrer?: string;
    user_agent?: string;
    element_text?: string;
    timestamp: number;
  }>;
  viewsLast24h: number;
  viewsLast7d: number;
}

// Helper functions defined outside component to avoid recreating on each render
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

const getEventIcon = (type: string) => {
  switch (type) {
    case 'page_view': return <Eye className="h-4 w-4" />;
    case 'click': return <MousePointer className="h-4 w-4" />;
    case 'heartbeat': return <Activity className="h-4 w-4" />;
    default: return null;
  }
};

// Extract domain from referrer URL
const extractDomain = (referrer: string | null | undefined): string => {
  if (!referrer || referrer.trim() === '') {
    return 'Direct';
  }
  
  try {
    const url = new URL(referrer);
    let hostname = url.hostname;
    
    // Remove 'www.' prefix
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    
    return hostname;
  } catch {
    return 'Direct';
  }
};

export default function AnalyticsDashboard() {
  const [referrerFilter, setReferrerFilter] = useState("");
  
  const { data: stats, isLoading } = useQuery<AnalyticsStats>({
    queryKey: ['/analytics/stats'],
  });

  // Filter recent events by referrer domain
  // Must be called before conditional returns to follow Rules of Hooks
  const filteredEvents = useMemo(() => {
    if (!stats || !referrerFilter.trim()) {
      return stats?.recentEvents || [];
    }
    
    const filterLower = referrerFilter.toLowerCase();
    return stats.recentEvents.filter(event => {
      const domain = extractDomain(event.referrer).toLowerCase();
      return domain.includes(filterLower);
    });
  }, [stats, referrerFilter]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-slate-400">Loading analytics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-slate-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-light text-slate-100 mb-2" data-testid="text-analytics-title">
            Layla Analytics
          </h1>
          <p className="text-slate-400 font-light">
            First-party analytics dashboard · Privacy-friendly tracking
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-light text-slate-300">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light text-slate-100">{stats.totalViews}</div>
              <p className="text-xs text-slate-500 mt-1">All time page views</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-light text-slate-300">Unique Sessions</CardTitle>
              <Users className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light text-slate-100">{stats.uniqueSessions}</div>
              <p className="text-xs text-slate-500 mt-1">Anonymous visitors</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-light text-slate-300">Last 24 Hours</CardTitle>
              <Calendar className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light text-slate-100">{stats.viewsLast24h}</div>
              <p className="text-xs text-slate-500 mt-1">Recent activity</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-light text-slate-300">Last 7 Days</CardTitle>
              <Calendar className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light text-slate-100">{stats.viewsLast7d}</div>
              <p className="text-xs text-slate-500 mt-1">Weekly views</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Pages */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl font-light text-slate-100">Top Pages</CardTitle>
              <CardDescription className="text-slate-500">Most visited pages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topPages.length > 0 ? (
                  stats.topPages.map((page, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                      <span className="text-slate-300 font-light text-sm truncate flex-1">{page.url}</span>
                      <span className="text-amber-400 font-light ml-4">{page.views}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">No page views yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Referrers */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl font-light text-slate-100">Top Referrers</CardTitle>
              <CardDescription className="text-slate-500">Traffic sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topReferrers.length > 0 ? (
                  stats.topReferrers.map((referrer, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {referrer.referrer_domain !== 'Direct' && (
                          <ExternalLink className="h-3 w-3 text-slate-500 flex-shrink-0" />
                        )}
                        <span className="text-slate-300 font-light text-sm truncate">
                          {referrer.referrer_domain}
                        </span>
                      </div>
                      <span className="text-amber-400 font-light ml-4">{referrer.views}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">No referrer data yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Events */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl font-light text-slate-100">Recent Events</CardTitle>
              <CardDescription className="text-slate-500">Latest tracked activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {stats.recentEvents.slice(0, 10).map((event) => (
                  <div key={event.id} className="flex items-start gap-3 py-2 border-b border-slate-800/50 last:border-0">
                    <div className="text-amber-400 mt-1">
                      {getEventIcon(event.event_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase text-slate-500">{event.event_type.replace('_', ' ')}</span>
                        {event.element_text && (
                          <span className="text-xs text-slate-600">· {event.element_text.substring(0, 30)}</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-300 truncate">{event.url}</p>
                      <p className="text-xs text-slate-600">{formatDate(event.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Events Table */}
        <Card className="bg-slate-900 border-slate-800 mt-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-light text-slate-100">Event Details</CardTitle>
                <CardDescription className="text-slate-500">Filter by referrer source</CardDescription>
              </div>
              <Input
                type="text"
                placeholder="Filter by referrer (e.g., linkedin.com)"
                value={referrerFilter}
                onChange={(e) => setReferrerFilter(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 max-w-xs"
                data-testid="input-referrer-filter"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-3 px-2 text-slate-400 font-light">Type</th>
                    <th className="text-left py-3 px-2 text-slate-400 font-light">URL</th>
                    <th className="text-left py-3 px-2 text-slate-400 font-light">Referrer</th>
                    <th className="text-left py-3 px-2 text-slate-400 font-light">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.length > 0 ? (
                    filteredEvents.slice(0, 20).map((event) => (
                      <tr key={event.id} className="border-b border-slate-800/50 hover-elevate">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="text-amber-400">
                              {getEventIcon(event.event_type)}
                            </div>
                            <span className="text-slate-400 text-xs uppercase">
                              {event.event_type.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-slate-300 truncate max-w-xs">
                          {event.url}
                          {event.element_text && (
                            <span className="text-slate-600 text-xs ml-2">
                              · {event.element_text.substring(0, 30)}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1">
                            {extractDomain(event.referrer) !== 'Direct' && (
                              <ExternalLink className="h-3 w-3 text-slate-500" />
                            )}
                            <span className="text-slate-400 text-xs">
                              {extractDomain(event.referrer)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-slate-500 text-xs">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
                        {referrerFilter ? 'No events match your filter' : 'No events yet'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {filteredEvents.length > 20 && (
              <p className="text-xs text-slate-600 mt-4 text-center">
                Showing latest 20 of {filteredEvents.length} filtered events
              </p>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 p-4 bg-slate-900 border border-slate-800 rounded-md">
          <h3 className="text-sm font-light text-slate-300 mb-2">Privacy Notice</h3>
          <p className="text-xs text-slate-500">
            This analytics system uses only first-party tracking with no external services. 
            Session IDs are anonymous and stored locally. No personally identifiable information is collected.
            All data is stored on this server in SQLite database (analytics.db).
          </p>
        </div>
      </div>
    </div>
  );
}
