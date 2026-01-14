import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, MousePointer, MousePointerClick, ArrowDownToLine } from "lucide-react";

interface EngagementMetricsProps {
  // For demo purposes - would normally come from API
  data?: {
    scrollDepth: {
      averagePercentage: number;
      reachedBottom: number;
      total: number;
    };
    timeOnPage: {
      averageSeconds: number;
      buckets: {
        lessThan30s: number;
        between30sAnd2m: number;
        between2mAnd5m: number;
        moreThan5m: number;
      };
    };
    interactions: {
      totalMouseMovements: number;
      totalClicks: number;
      clicksPerVisit: number;
    };
  };
}

export default function EngagementMetrics({ data }: EngagementMetricsProps) {
  // Sample data for demonstration
  const sampleData = {
    scrollDepth: {
      averagePercentage: 68,
      reachedBottom: 42,
      total: 100
    },
    timeOnPage: {
      averageSeconds: 127,
      buckets: {
        lessThan30s: 25,
        between30sAnd2m: 45,
        between2mAnd5m: 20,
        moreThan5m: 10
      }
    },
    interactions: {
      totalMouseMovements: 15768,
      totalClicks: 342,
      clicksPerVisit: 3.42
    }
  };

  const displayData = data || sampleData;
  
  // Format time in a human-readable way
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Scroll Depth Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Scroll Depth</CardTitle>
              <CardDescription>How far users scroll down the page</CardDescription>
            </div>
            <ArrowDownToLine className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Average Scroll Depth</span>
                <span className="font-medium">{displayData.scrollDepth.averagePercentage}%</span>
              </div>
              <Progress value={displayData.scrollDepth.averagePercentage} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-2xl font-bold">{displayData.scrollDepth.reachedBottom}</div>
                <div className="text-xs text-muted-foreground">Reached Bottom</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-2xl font-bold">{displayData.scrollDepth.total}</div>
                <div className="text-xs text-muted-foreground">Total Visits</div>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{Math.round(displayData.scrollDepth.reachedBottom / displayData.scrollDepth.total * 100)}%</span> of visitors scrolled to the bottom of the page
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Time on Page Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Time on Page</CardTitle>
              <CardDescription>How long users stay on the page</CardDescription>
            </div>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{formatTime(displayData.timeOnPage.averageSeconds)}</div>
              <div className="text-xs text-muted-foreground">Average Time on Page</div>
            </div>
            
            <div>
              <div className="text-sm font-medium mb-2">Time Distribution</div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Less than 30s</span>
                    <span>{displayData.timeOnPage.buckets.lessThan30s}%</span>
                  </div>
                  <Progress value={displayData.timeOnPage.buckets.lessThan30s} className="h-1" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>30s - 2m</span>
                    <span>{displayData.timeOnPage.buckets.between30sAnd2m}%</span>
                  </div>
                  <Progress value={displayData.timeOnPage.buckets.between30sAnd2m} className="h-1" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>2m - 5m</span>
                    <span>{displayData.timeOnPage.buckets.between2mAnd5m}%</span>
                  </div>
                  <Progress value={displayData.timeOnPage.buckets.between2mAnd5m} className="h-1" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>More than 5m</span>
                    <span>{displayData.timeOnPage.buckets.moreThan5m}%</span>
                  </div>
                  <Progress value={displayData.timeOnPage.buckets.moreThan5m} className="h-1" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Mouse Interactions Card */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Mouse Interactions</CardTitle>
              <CardDescription>How users interact with the page using their mouse</CardDescription>
            </div>
            <MousePointer className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Total Mouse Movements</div>
                <div className="text-2xl font-bold">
                  {displayData.interactions.totalMouseMovements.toLocaleString()}
                </div>
              </div>
              <MousePointer className="h-8 w-8 text-primary opacity-50" />
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Total Clicks</div>
                <div className="text-2xl font-bold">
                  {displayData.interactions.totalClicks.toLocaleString()}
                </div>
              </div>
              <MousePointerClick className="h-8 w-8 text-primary opacity-50" />
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Clicks per Visit</div>
                <div className="text-2xl font-bold">{displayData.interactions.clicksPerVisit}</div>
              </div>
              <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary/20 text-primary font-medium">
                {displayData.interactions.clicksPerVisit}x
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}