import React, { useState, useRef, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  ArrowRight, 
  ArrowDown, 
  Filter, 
  BarChart2, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon,
  Move,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useToast } from "../hooks/use-toast";

// Fintech sample data
const initialData = [
  { category: 'Payment Processing', value: 425, month: 'Jan', growth: 18, customers: 3200, revenue: 158000, transactions: 42500 },
  { category: 'Fraud Detection', value: 380, month: 'Feb', growth: 23, customers: 3450, revenue: 175000, transactions: 38400 },
  { category: 'Digital Banking', value: 520, month: 'Mar', growth: 15, customers: 3700, revenue: 185000, transactions: 52100 },
  { category: 'Lending', value: 330, month: 'Apr', growth: 28, customers: 3900, revenue: 192000, transactions: 33500 },
  { category: 'Investment', value: 470, month: 'May', growth: 32, customers: 4100, revenue: 210000, transactions: 48200 },
  { category: 'Insurance', value: 290, month: 'Jun', growth: 12, customers: 4250, revenue: 225000, transactions: 29800 },
];

type ChartType = 'bar' | 'pie' | 'line';
type ChartSize = 'small' | 'medium' | 'large';

interface DashboardItem {
  id: string;
  type: ChartType;
  title: string;
  size: ChartSize;
  filter?: string;
}

const COLORS = ['#000000', '#444444', '#666666', '#888888', '#aaaaaa', '#cccccc'];

export default function InteractiveDashboard() {
  const { toast } = useToast();
  const MAX_WIDGETS = 6; // Maximum number of widgets allowed in dashboard
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>([
    { id: '1', type: 'bar', title: 'Fintech Revenue by Category', size: 'medium' },
    { id: '2', type: 'pie', title: 'Market Distribution', size: 'small' },
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<{ x: number, y: number } | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  const [placeholderPosition, setPlaceholderPosition] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Filter data based on selection
  const filteredData = selectedCategory 
    ? initialData.filter(item => item.category === selectedCategory)
    : initialData;

  // Handle category selection (drill down)
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  // Add new chart to dashboard
  const addChart = (type: ChartType) => {
    // Check if we've reached the maximum number of widgets
    if (dashboardItems.length >= MAX_WIDGETS) {
      toast({
        title: "Widget limit reached",
        description: `Maximum of ${MAX_WIDGETS} widgets allowed. Remove a widget before adding a new one.`,
        variant: "destructive",
      });
      return;
    }
    
    const newChart: DashboardItem = {
      id: Math.random().toString(36).substring(7),
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Chart`,
      size: 'medium',
      filter: selectedCategory || undefined
    };
    
    setDashboardItems([...dashboardItems, newChart]);
  };

  // Remove chart from dashboard
  const removeChart = (id: string) => {
    setDashboardItems(dashboardItems.filter(item => item.id !== id));
  };

  // Handle drag start
  const handleDragStart = (id: string) => {
    setIsDragging(true);
    setDraggedItem(id);
  };

  // Handle drag over - show drop placeholder and dashboard outline
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
    
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dashboardRect = document.querySelector('.dashboard-outline')?.getBoundingClientRect();
      
      if (dashboardRect) {
        // Only show placeholder when within dashboard boundaries
        if (
          e.clientX >= dashboardRect.left && 
          e.clientX <= dashboardRect.right &&
          e.clientY >= dashboardRect.top && 
          e.clientY <= dashboardRect.bottom
        ) {
          setPlaceholderPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          });
          setShowPlaceholder(true);
        } else {
          setShowPlaceholder(false);
        }
      }
    }
  };
  
  // Handle drag leave - hide drop placeholder
  const handleDragLeave = (e: React.DragEvent) => {
    // Only hide when actually leaving the container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggingOver(false);
      setShowPlaceholder(false);
    }
  };

  // Handle drop - reorder charts by swapping positions
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedItem) return;
    
    // Get drop target
    const targetElement = e.target as HTMLElement;
    const chartContainer = targetElement.closest('.chart-container');
    
    if (chartContainer) {
      const targetId = chartContainer.getAttribute('data-id');
      
      if (targetId && targetId !== draggedItem) {
        // Find indexes
        const items = [...dashboardItems];
        const draggedIndex = items.findIndex(item => item.id === draggedItem);
        const targetIndex = items.findIndex(item => item.id === targetId);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
          // Remove dragged item
          const [draggedItemData] = items.splice(draggedIndex, 1);
          // Insert at target position
          items.splice(targetIndex, 0, draggedItemData);
          // Update state
          setDashboardItems(items);
        }
      }
    } else {
      // Dropping in empty space - add to end
      const emptySpace = e.currentTarget.closest('.dashboard-outline');
      if (emptySpace) {
        const items = [...dashboardItems];
        const draggedIndex = items.findIndex(item => item.id === draggedItem);
        
        if (draggedIndex !== -1) {
          const [draggedItemData] = items.splice(draggedIndex, 1);
          items.push(draggedItemData);
          setDashboardItems(items);
        }
      }
    }
    
    // Reset states
    setIsDragging(false);
    setDraggedItem(null);
    setDropPosition(null);
    setShowPlaceholder(false);
    setIsDraggingOver(false);
  };
  
  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedItem(null);
    setDropPosition(null);
    setShowPlaceholder(false);
    setIsDraggingOver(false);
  };

  // Resize chart
  const resizeChart = (id: string, newSize: ChartSize) => {
    setDashboardItems(dashboardItems.map(item => 
      item.id === id ? { ...item, size: newSize } : item
    ));
  };

  // Get size class for chart container
  const getSizeClass = (size: ChartSize) => {
    switch(size) {
      case 'small': return 'col-span-1 self-start';
      case 'medium': return 'col-span-2 self-start';
      case 'large': return 'col-span-4 self-start';
      default: return 'col-span-2 self-start';
    }
  };

  // Render appropriate chart based on type
  const renderChart = (item: DashboardItem) => {
    const chartData = item.filter 
      ? initialData.filter(dataItem => dataItem.category === item.filter) 
      : initialData;
    
    // We're using aspect ratio for responsive sizing instead of fixed heights
    
    // Common tooltip style with accent highlight
    const tooltipStyle = { 
      backgroundColor: '#ffffff', 
      border: '2px solid hsl(var(--accent))',
      borderRadius: 0,
      fontFamily: 'monospace'
    };
    
    switch(item.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%" aspect={4/3}>
            <BarChart data={chartData}>
              <XAxis dataKey="category" tick={{ fill: '#000000' }} axisLine={{ stroke: '#000000' }} />
              <YAxis tick={{ fill: '#000000' }} axisLine={{ stroke: '#000000' }} />
              <Tooltip 
                contentStyle={tooltipStyle}
                formatter={(value, name) => {
                  if (name === 'value') return [`$${Number(value).toLocaleString()}`, 'Revenue'];
                  return [value, name];
                }}
              />
              <Bar 
                dataKey="revenue" 
                onClick={(data) => handleCategoryClick(data.category)}
                cursor="pointer"
                animationDuration={500}
                name="Revenue"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={selectedCategory === entry.category ? 'hsl(var(--accent))' : COLORS[index % COLORS.length]} 
                    stroke="#000000"
                    strokeWidth={1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%" aspect={4/3}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={item.size === 'small' ? 60 : item.size === 'medium' ? 80 : 100}
                fill="#000000"
                dataKey="transactions"
                onClick={(data) => handleCategoryClick(data.category)}
                cursor="pointer"
                animationDuration={500}
                label={({ category }) => category}
                labelLine={false}
                name="Transactions"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={selectedCategory === entry.category ? 'hsl(var(--accent))' : COLORS[index % COLORS.length]} 
                    stroke="#000000"
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={tooltipStyle}
                formatter={(value) => [Number(value).toLocaleString(), 'Transactions']}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%" aspect={4/3}>
            <LineChart data={chartData}>
              <XAxis dataKey="month" tick={{ fill: '#000000' }} axisLine={{ stroke: '#000000' }} />
              <YAxis tick={{ fill: '#000000' }} axisLine={{ stroke: '#000000' }} />
              <Tooltip 
                contentStyle={tooltipStyle}
                formatter={(value, name) => {
                  if (name === 'growth') return [`${value}%`, 'Growth'];
                  if (name === 'customers') return [Number(value).toLocaleString(), 'Customers'];
                  return [value, name];
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="customers" 
                stroke="hsl(var(--accent))" 
                strokeWidth={2}
                activeDot={{ r: 8 }}
                dot={{ stroke: 'hsl(var(--accent))', strokeWidth: 2, fill: '#ffffff' }}
                name="Active Customers"
              />
              <Line 
                type="monotone" 
                dataKey="growth" 
                stroke="#000000" 
                strokeWidth={2}
                activeDot={{ r: 6 }}
                dot={{ stroke: '#000000', strokeWidth: 2, fill: '#ffffff' }}
                name="Growth (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <section id="interactive-dashboard" className="py-20 border-b border-foreground pixel-grid">
      <div 
        className="container mx-auto px-4 md:px-6 lg:px-8 eink-container" 
        ref={containerRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="grid grid-cols-1 gap-16">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-block border border-accent px-3 py-1 mb-4">
              <span className="text-xs font-mono accent-text">INTERACTIVE DEMO</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-normal mb-6">
              <span className="highlighter">DATA VISUALIZATION</span>
            </h2>
            <div className="eink-divider w-16 mx-auto mb-6"></div>
            <p className="font-mono mb-2">
              Try this interactive dashboard to experience how financial data can be visualized 
              for better decision making.
            </p>
            <p className="font-mono text-sm opacity-70 mb-6">
              Click on chart elements to drill down, drag charts to rearrange, or add new visualizations.
            </p>
          </div>

          {/* Dashboard Controls */}
          <div className="eink-card p-4 max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center">
                <div className="font-mono text-xs mr-4 accent-text">ADD VISUALIZATION:</div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => addChart('bar')} 
                    className={`eink-btn-accent p-2 flex items-center gap-1 ${dashboardItems.length >= MAX_WIDGETS ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={dashboardItems.length >= MAX_WIDGETS}
                    title={dashboardItems.length >= MAX_WIDGETS ? 'Maximum widgets reached' : 'Add bar chart'}
                  >
                    <BarChart2 size={16} />
                    <span className="text-xs">BAR</span>
                  </button>
                  <button 
                    onClick={() => addChart('pie')} 
                    className={`eink-btn p-2 flex items-center gap-1 ${dashboardItems.length >= MAX_WIDGETS ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={dashboardItems.length >= MAX_WIDGETS}
                    title={dashboardItems.length >= MAX_WIDGETS ? 'Maximum widgets reached' : 'Add pie chart'}
                  >
                    <PieChartIcon size={16} />
                    <span className="text-xs">PIE</span>
                  </button>
                  <button 
                    onClick={() => addChart('line')} 
                    className={`eink-btn p-2 flex items-center gap-1 ${dashboardItems.length >= MAX_WIDGETS ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={dashboardItems.length >= MAX_WIDGETS}
                    title={dashboardItems.length >= MAX_WIDGETS ? 'Maximum widgets reached' : 'Add line chart'}
                  >
                    <LineChartIcon size={16} />
                    <span className="text-xs">LINE</span>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="font-mono text-xs mr-4">FILTER:</div>
                <div className="border border-foreground px-2 py-1 flex items-center">
                  <Filter size={14} className="mr-2" />
                  <select 
                    className="bg-transparent border-none font-mono text-xs focus:outline-none"
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                  >
                    <option value="">All Fintech Sectors</option>
                    {initialData.map((item, index) => (
                      <option key={index} value={item.category}>{item.category}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Area - Fixed perimeter */}
          <div 
            className={`p-6 max-w-4xl mx-auto ${isDraggingOver ? 'dashboard-outline-active' : 'dashboard-outline'}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {showPlaceholder && (
              <div 
                className="drag-placeholder fixed p-4 rounded-sm"
                style={{
                  left: `${placeholderPosition.x}px`,
                  top: `${placeholderPosition.y}px`,
                  width: '120px',
                  height: '80px',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                  pointerEvents: 'none'
                }}
              >
                <p className="text-xs font-mono text-center">Drop Here</p>
              </div>
            )}
            
            {/* Dashboard Grid - Fixed width columns with auto height for better proportions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full overflow-auto" style={{ gridAutoRows: "min-content" }}>
              {dashboardItems.map((item) => (
                <div 
                  key={item.id}
                  data-id={item.id}
                  className={`eink-card p-0 ${getSizeClass(item.size)} transition-all duration-200 chart-container ${draggedItem === item.id ? 'opacity-50 scale-95' : ''}`}
                  draggable
                  onDragStart={() => handleDragStart(item.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  {/* Chart Header */}
                  <div className="border-b border-foreground p-2 flex items-center justify-between bg-secondary">
                    <div className="font-mono text-xs overflow-hidden text-ellipsis">{item.title}</div>
                    <div className="flex items-center gap-1 shrink-0">
                      <div className="flex">
                        <button 
                          onClick={() => resizeChart(item.id, 'small')}
                          className={`w-3 h-3 border ${item.size === 'small' ? 'bg-accent' : 'bg-transparent'} border-foreground`}
                          title="Small"
                        />
                        <button 
                          onClick={() => resizeChart(item.id, 'medium')}
                          className={`w-3 h-3 border ${item.size === 'medium' ? 'bg-accent' : 'bg-transparent'} border-foreground`}
                          title="Medium"
                        />
                        <button 
                          onClick={() => resizeChart(item.id, 'large')}
                          className={`w-3 h-3 border ${item.size === 'large' ? 'bg-accent' : 'bg-transparent'} border-foreground`}
                          title="Large"
                        />
                      </div>
                      <button 
                        onClick={() => removeChart(item.id)}
                        className="ml-2 opacity-70 hover:opacity-100"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="ml-2 cursor-move p-1 bg-background/20 hover:bg-background/40 rounded-sm" title="Drag to move">
                        <Move size={12} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Chart Content */}
                  <div className="p-4 w-full">
                    <div className="chart-wrapper w-full overflow-hidden" style={{ 
                      height: item.size === 'small' ? '180px' : item.size === 'medium' ? '220px' : '250px',
                      maxWidth: '100%'
                    }}>
                      {renderChart(item)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="text-center max-w-2xl mx-auto">
            <p className="font-mono text-sm mb-6">
              This is just a sample of what's possible with modern analytics tools. 
              Imagine what we could build for your specific business needs.
            </p>
            
            <a 
              href="https://calendly.com/amin-hasan" 
              target="_blank" 
              rel="noopener noreferrer"
              className="eink-btn eink-btn-primary inline-flex items-center gap-2"
            >
              DISCUSS YOUR ANALYTICS NEEDS
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}