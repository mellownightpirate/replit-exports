import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MousePointer, MousePointerClick } from "lucide-react";

interface HeatmapVisualizerProps {
  // In a real application, this would be passed from the parent component
  // For demo purposes, we'll generate sample data
  data?: {
    positions: Array<{
      x: number;
      y: number;
      type: 'move' | 'click';
    }>;
    pageUrl: string;
    viewport: {
      width: number;
      height: number;
    };
  };
}

export default function HeatmapVisualizer({ data }: HeatmapVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewMode, setViewMode] = useState<'all' | 'clicks' | 'moves'>('all');
  
  // Generate sample data if none provided
  const sampleData = {
    positions: Array(500).fill(0).map(() => ({
      x: Math.floor(Math.random() * 1000),
      y: Math.floor(Math.random() * 600),
      type: Math.random() > 0.8 ? 'click' as const : 'move' as const,
    })),
    pageUrl: '/',
    viewport: {
      width: 1024,
      height: 768
    }
  };

  const displayData = data || sampleData;
  
  // Draw heatmap on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = 1000;
    canvas.height = 600;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create mock page layout
    drawMockPageLayout(ctx);
    
    // Filter positions based on view mode
    const filteredPositions = displayData.positions.filter(pos => {
      if (viewMode === 'all') return true;
      if (viewMode === 'clicks') return pos.type === 'click';
      if (viewMode === 'moves') return pos.type === 'move';
      return true;
    });
    
    // Draw heatmap
    drawHeatmap(ctx, filteredPositions);
    
  }, [viewMode, displayData]);
  
  // Draw a mock page layout to better visualize where interactions occur
  const drawMockPageLayout = (ctx: CanvasRenderingContext2D) => {
    // Nav area
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 1000, 70);
    
    // Hero section
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 70, 1000, 200);
    
    // Content sections
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 270, 1000, 150);
    
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 420, 1000, 180);
  };
  
  // Draw the heatmap based on mouse position data
  const drawHeatmap = (ctx: CanvasRenderingContext2D, positions: Array<{x: number, y: number, type: string}>) => {
    // For clicks, draw red dots
    positions.forEach(pos => {
      if (pos.type === 'click') {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.7)'; // red
        ctx.fill();
      }
    });
    
    // For moves, create a density heatmap
    const heatmapData = positions.filter(pos => pos.type === 'move');
    
    for (let i = 0; i < heatmapData.length; i++) {
      const pos = heatmapData[i];
      
      ctx.beginPath();
      const gradient = ctx.createRadialGradient(pos.x, pos.y, 1, pos.x, pos.y, 30);
      gradient.addColorStop(0, 'rgba(6, 214, 160, 0.3)');
      gradient.addColorStop(1, 'rgba(6, 214, 160, 0)');
      
      ctx.fillStyle = gradient;
      ctx.arc(pos.x, pos.y, 30, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  
  // Toggle between different view modes
  const handleViewModeChange = (value: string) => {
    setViewMode(value as 'all' | 'clicks' | 'moves');
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>User Interaction Heatmap</CardTitle>
            <CardDescription>
              Visualize where users interact with your page
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={handleViewModeChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="View Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Interactions</SelectItem>
                <SelectItem value="clicks">
                  <div className="flex items-center gap-2">
                    <MousePointerClick size={16} />
                    <span>Clicks Only</span>
                  </div>
                </SelectItem>
                <SelectItem value="moves">
                  <div className="flex items-center gap-2">
                    <MousePointer size={16} />
                    <span>Mouse Movement</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-muted rounded-md p-1 w-full overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full rounded border border-border"
            style={{ maxHeight: '500px', objectFit: 'contain' }}
          />
        </div>
        <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-[rgba(6,214,160,0.5)]"></span>
            <span>Mouse Movement Density</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-[rgba(239,68,68,0.7)]"></span>
            <span>Click Locations</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// For use in a real application, you would fetch data from your API
export function useMouseTrackingData(pageUrl?: string) {
  // This would normally use a React Query hook to fetch real data
  // For this example, we're just returning mock data
  return {
    data: null,
    isLoading: false,
    error: null
  };
}