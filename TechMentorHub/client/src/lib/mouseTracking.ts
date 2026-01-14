import { apiRequest } from './queryClient';

// Settings for mouse tracking
const THROTTLE_MS = 100; // Record position every 100ms
const MAX_POINTS = 1000; // Maximum number of points to record per session
const BATCH_SIZE = 50; // Send data in batches

interface MousePosition {
  x: number;
  y: number;
  timestamp: number;
  type: 'move' | 'click';
  elementSelector?: string;
  pageUrl: string;
  viewport: {
    width: number;
    height: number;
  };
}

class MouseTracker {
  private positions: MousePosition[] = [];
  private tracking = false;
  private lastRecorded = 0;
  private pointCount = 0;
  
  // Generate a simplified CSS selector for an element
  private getSelector(element: HTMLElement): string {
    let selector = element.tagName.toLowerCase();
    
    if (element.id) {
      selector += `#${element.id}`;
    } else if (element.className && typeof element.className === 'string') {
      selector += `.${element.className.split(' ')[0]}`;
    }
    
    // Add data attribute if available
    if (element.dataset.testid) {
      selector += `[data-testid="${element.dataset.testid}"]`;
    } else if (element.dataset.section) {
      selector += `[data-section="${element.dataset.section}"]`;
    }
    
    return selector;
  }
  
  // Record mouse position with throttling
  private recordPosition = (
    event: MouseEvent, 
    type: 'move' | 'click' = 'move'
  ) => {
    const now = Date.now();
    
    // Check if we should throttle
    if (type === 'move' && now - this.lastRecorded < THROTTLE_MS) {
      return;
    }
    
    // Check if we've reached the maximum number of points
    if (this.pointCount >= MAX_POINTS) {
      return;
    }
    
    this.lastRecorded = now;
    this.pointCount++;
    
    // Get element under cursor
    let elementSelector: string | undefined;
    const target = event.target as HTMLElement;
    if (target && target.tagName) {
      elementSelector = this.getSelector(target);
    }
    
    // Create position record
    const position: MousePosition = {
      x: event.clientX,
      y: event.clientY,
      timestamp: now,
      type,
      elementSelector,
      pageUrl: window.location.pathname,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      }
    };
    
    this.positions.push(position);
    
    // Send batch if we've collected enough
    if (this.positions.length >= BATCH_SIZE) {
      this.sendBatch();
    }
  };
  
  // Handle clicks
  private handleClick = (event: MouseEvent) => {
    this.recordPosition(event, 'click');
  };
  
  // Send batch of positions to server
  private sendBatch = async () => {
    if (this.positions.length === 0) return;
    
    const batch = [...this.positions];
    this.positions = [];
    
    try {
      await apiRequest('POST', '/api/analytics/mouse-tracking', { 
        positions: batch 
      });
    } catch (error) {
      console.error('Failed to send mouse tracking data', error);
      // If sending fails, add the positions back to the queue
      this.positions = [...batch, ...this.positions];
    }
  };
  
  // Start tracking
  public startTracking() {
    if (this.tracking) return;
    
    this.tracking = true;
    this.positions = [];
    this.pointCount = 0;
    this.lastRecorded = 0;
    
    window.addEventListener('mousemove', this.recordPosition);
    window.addEventListener('click', this.handleClick);
    window.addEventListener('beforeunload', this.sendBatch);
  }
  
  // Stop tracking
  public stopTracking() {
    if (!this.tracking) return;
    
    this.tracking = false;
    window.removeEventListener('mousemove', this.recordPosition);
    window.removeEventListener('click', this.handleClick);
    window.removeEventListener('beforeunload', this.sendBatch);
    
    // Send any remaining data
    this.sendBatch();
  }
}

// Create singleton instance
export const mouseTracker = new MouseTracker();

// Scroll depth tracking
export function trackScrollDepth() {
  let maxScroll = 0;
  let docHeight = Math.max(
    document.body.scrollHeight, 
    document.documentElement.scrollHeight
  );
  
  const calculateScrollPercentage = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const scrollPercentage = (scrollTop + windowHeight) / docHeight * 100;
    
    if (scrollPercentage > maxScroll) {
      maxScroll = scrollPercentage;
      
      // Track when user reaches certain percentage thresholds
      if (maxScroll >= 25 && maxScroll < 50) {
        apiRequest('POST', '/api/analytics/event', {
          eventType: 'scroll',
          eventCategory: 'engagement',
          eventAction: 'scroll_depth_25',
          eventValue: Math.round(maxScroll)
        });
      } else if (maxScroll >= 50 && maxScroll < 75) {
        apiRequest('POST', '/api/analytics/event', {
          eventType: 'scroll',
          eventCategory: 'engagement',
          eventAction: 'scroll_depth_50',
          eventValue: Math.round(maxScroll)
        });
      } else if (maxScroll >= 75 && maxScroll < 90) {
        apiRequest('POST', '/api/analytics/event', {
          eventType: 'scroll',
          eventCategory: 'engagement',
          eventAction: 'scroll_depth_75',
          eventValue: Math.round(maxScroll)
        });
      } else if (maxScroll >= 90) {
        apiRequest('POST', '/api/analytics/event', {
          eventType: 'scroll',
          eventCategory: 'engagement',
          eventAction: 'scroll_depth_90',
          eventValue: Math.round(maxScroll)
        });
      }
    }
  };
  
  // Update document height when it might change (e.g., content loads)
  const updateDocHeight = () => {
    docHeight = Math.max(
      document.body.scrollHeight, 
      document.documentElement.scrollHeight
    );
  };
  
  window.addEventListener('scroll', calculateScrollPercentage);
  window.addEventListener('resize', updateDocHeight);
  document.addEventListener('DOMContentLoaded', updateDocHeight);
  
  // Initial calculation after content loads
  setTimeout(updateDocHeight, 1000);
  
  // Clean up
  return () => {
    window.removeEventListener('scroll', calculateScrollPercentage);
    window.removeEventListener('resize', updateDocHeight);
    document.removeEventListener('DOMContentLoaded', updateDocHeight);
  };
}

// Time on page tracking
export function trackTimeOnPage() {
  const startTime = Date.now();
  let intervalId: number | null = null;
  
  const recordTimeSpent = () => {
    const timeSpentSec = Math.floor((Date.now() - startTime) / 1000);
    
    // Track time thresholds (30 seconds, 1 minute, 2 minutes, 5 minutes)
    if (timeSpentSec === 30) {
      apiRequest('POST', '/api/analytics/event', {
        eventType: 'engagement',
        eventCategory: 'time',
        eventAction: 'time_on_page_30s',
        eventValue: 30
      });
    } else if (timeSpentSec === 60) {
      apiRequest('POST', '/api/analytics/event', {
        eventType: 'engagement',
        eventCategory: 'time',
        eventAction: 'time_on_page_1m',
        eventValue: 60
      });
    } else if (timeSpentSec === 120) {
      apiRequest('POST', '/api/analytics/event', {
        eventType: 'engagement',
        eventCategory: 'time',
        eventAction: 'time_on_page_2m',
        eventValue: 120
      });
    } else if (timeSpentSec === 300) {
      apiRequest('POST', '/api/analytics/event', {
        eventType: 'engagement',
        eventCategory: 'time',
        eventAction: 'time_on_page_5m',
        eventValue: 300
      });
    }
  };
  
  // Check every second
  intervalId = window.setInterval(recordTimeSpent, 1000);
  
  // Final time recording when leaving the page
  const recordFinalTime = () => {
    const timeSpentSec = Math.floor((Date.now() - startTime) / 1000);
    
    apiRequest('POST', '/api/analytics/event', {
      eventType: 'engagement',
      eventCategory: 'time',
      eventAction: 'total_time_on_page',
      eventValue: timeSpentSec
    });
  };
  
  window.addEventListener('beforeunload', recordFinalTime);
  
  // Clean up
  return () => {
    if (intervalId !== null) {
      window.clearInterval(intervalId);
    }
    window.removeEventListener('beforeunload', recordFinalTime);
    recordFinalTime();
  };
}

// Initialize all tracking
export function initAdvancedAnalytics() {
  mouseTracker.startTracking();
  const scrollCleanup = trackScrollDepth();
  const timeCleanup = trackTimeOnPage();
  
  return () => {
    mouseTracker.stopTracking();
    scrollCleanup();
    timeCleanup();
  };
}