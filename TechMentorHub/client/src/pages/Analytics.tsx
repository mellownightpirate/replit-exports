import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HeatmapVisualizer from '@/components/analytics/HeatmapVisualizer';
import EngagementMetrics from '@/components/analytics/EngagementMetrics';
import { BarChart3, MousePointer, Timer } from 'lucide-react';

interface AnalyticsData {
  period: {
    startDate: string;
    endDate: string;
  };
  totalPageViews: number;
  conversionRates: {
    quizCompletion: {
      rate: number;
      total: number;
      converted: number;
    };
    checkoutStarted: {
      rate: number;
      total: number;
      converted: number;
    };
    checkoutCompleted: {
      rate: number;
      total: number;
      converted: number;
    };
    waitlistSignup: {
      rate: number;
      total: number;
      converted: number;
    };
  };
  ctaClicksByAction: Record<string, number>;
  pageViewsByPath: Record<string, number>;
}

export default function Analytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest(
        'GET', 
        `/api/analytics/dashboard?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      );
      const data = await response.json();
      if (data.success) {
        setAnalyticsData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch analytics data');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch analytics data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Analytics Dashboard</h1>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center">
            <label htmlFor="startDate" className="mr-2 text-sm font-medium">From:</label>
            <input
              id="startDate"
              type="date"
              className="border rounded px-2 py-1 text-sm bg-gray-800 border-gray-700"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            />
          </div>
          <div className="flex items-center">
            <label htmlFor="endDate" className="mr-2 text-sm font-medium">To:</label>
            <input
              id="endDate"
              type="date"
              className="border rounded px-2 py-1 text-sm bg-gray-800 border-gray-700"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-10 w-10 border-4 border-[#06D6A0] border-t-transparent rounded-full"></div>
        </div>
      ) : analyticsData ? (
        <Tabs defaultValue="conversions" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="conversions" className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>Conversions</span>
            </TabsTrigger>
            <TabsTrigger value="mouse-tracking" className="flex items-center">
              <MousePointer className="mr-2 h-4 w-4" />
              <span>Mouse Tracking</span>
            </TabsTrigger>
            <TabsTrigger value="engagement" className="flex items-center">
              <Timer className="mr-2 h-4 w-4" />
              <span>Engagement</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Conversions Tab */}
          <TabsContent value="conversions">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Overview Card */}
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg col-span-1 md:col-span-2 lg:col-span-4">
                <h2 className="text-xl font-semibold mb-4">Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Total Page Views</p>
                    <p className="text-2xl font-bold">{analyticsData.totalPageViews}</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Quiz Completion Rate</p>
                    <p className="text-2xl font-bold">{formatPercent(analyticsData.conversionRates.quizCompletion.rate)}</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Checkout Started Rate</p>
                    <p className="text-2xl font-bold">{formatPercent(analyticsData.conversionRates.checkoutStarted.rate)}</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Checkout Completed Rate</p>
                    <p className="text-2xl font-bold">{formatPercent(analyticsData.conversionRates.checkoutCompleted.rate)}</p>
                  </div>
                </div>
              </div>

              {/* Conversion Rates Card */}
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg col-span-1 md:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Conversion Rates</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Quiz Completion</span>
                      <span className="text-sm">{formatPercent(analyticsData.conversionRates.quizCompletion.rate)}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-[#06D6A0] h-2 rounded-full" 
                        style={{ width: `${Math.min(analyticsData.conversionRates.quizCompletion.rate, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-400">
                      <span>{analyticsData.conversionRates.quizCompletion.converted} conversions</span>
                      <span>{analyticsData.conversionRates.quizCompletion.total} total</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Waitlist Signup</span>
                      <span className="text-sm">{formatPercent(analyticsData.conversionRates.waitlistSignup.rate)}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-[#06D6A0] h-2 rounded-full" 
                        style={{ width: `${Math.min(analyticsData.conversionRates.waitlistSignup.rate, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-400">
                      <span>{analyticsData.conversionRates.waitlistSignup.converted} conversions</span>
                      <span>{analyticsData.conversionRates.waitlistSignup.total} total</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Checkout Started</span>
                      <span className="text-sm">{formatPercent(analyticsData.conversionRates.checkoutStarted.rate)}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-[#06D6A0] h-2 rounded-full" 
                        style={{ width: `${Math.min(analyticsData.conversionRates.checkoutStarted.rate, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-400">
                      <span>{analyticsData.conversionRates.checkoutStarted.converted} conversions</span>
                      <span>{analyticsData.conversionRates.checkoutStarted.total} total</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Checkout Completed</span>
                      <span className="text-sm">{formatPercent(analyticsData.conversionRates.checkoutCompleted.rate)}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-[#06D6A0] h-2 rounded-full" 
                        style={{ width: `${Math.min(analyticsData.conversionRates.checkoutCompleted.rate, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-400">
                      <span>{analyticsData.conversionRates.checkoutCompleted.converted} conversions</span>
                      <span>{analyticsData.conversionRates.checkoutCompleted.total} total</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Clicks Card */}
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4">CTA Button Clicks</h2>
                {Object.keys(analyticsData.ctaClicksByAction).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(analyticsData.ctaClicksByAction)
                      .sort(([, a], [, b]) => b - a)
                      .map(([action, count]) => (
                        <div key={action}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm truncate max-w-[70%]" title={action}>{action}</span>
                            <span className="text-sm">{count}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-[#06D6A0] h-2 rounded-full" 
                              style={{ 
                                width: `${Math.round((count / Math.max(...Object.values(analyticsData.ctaClicksByAction))) * 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-6">No CTA click data available</p>
                )}
              </div>

              {/* Most Viewed Pages Card */}
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Most Viewed Pages</h2>
                {Object.keys(analyticsData.pageViewsByPath).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(analyticsData.pageViewsByPath)
                      .sort(([, a], [, b]) => b - a)
                      .map(([path, count]) => (
                        <div key={path}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm truncate max-w-[70%]" title={path}>{path || '/'}</span>
                            <span className="text-sm">{count}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-[#06D6A0] h-2 rounded-full" 
                              style={{ 
                                width: `${Math.round((count / Math.max(...Object.values(analyticsData.pageViewsByPath))) * 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-6">No page view data available</p>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Mouse Tracking Tab */}
          <TabsContent value="mouse-tracking">
            <div className="space-y-8">
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-6">Mouse Tracking Heatmap</h2>
                <p className="text-gray-400 mb-6">
                  Visualize where users hover and click on your landing page to understand engagement patterns and optimize conversion elements.
                </p>
                <HeatmapVisualizer />
              </div>
            </div>
          </TabsContent>
          
          {/* Engagement Tab */}
          <TabsContent value="engagement">
            <div className="space-y-8">
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-6">User Engagement Metrics</h2>
                <p className="text-gray-400 mb-6">
                  Analyze how users engage with your landing page through scroll depth, time on page, and interaction metrics.
                </p>
                <EngagementMetrics />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
          <p className="text-gray-400">No analytics data available</p>
        </div>
      )}
    </div>
  );
}