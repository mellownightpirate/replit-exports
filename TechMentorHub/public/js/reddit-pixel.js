/**
 * Reddit Pixel Base Code
 * This file is for direct inclusion in HTML for maximum reliability
 */

// Reddit Pixel Base Code
!function(w,d) {
  if(!w.rdt) {
    var p = w.rdt = function() {
      p.sendEvent ? p.sendEvent.apply(p, arguments) : p.callQueue.push(arguments)
    };
    
    p.callQueue = [];
    
    var t = d.createElement("script");
    t.src = "https://www.redditstatic.com/ads/pixel.js";
    t.async = true;
    
    var s = d.getElementsByTagName("script")[0];
    if(s) {
      s.parentNode.insertBefore(t,s);
    } else {
      d.head.appendChild(t);
    }
  }
}(window, document);

// Initialize with pixel ID from data attribute (set in HTML)
rdt('init', document.currentScript?.dataset?.pixelId || 'a2_gtxp2aek62bn');

// Track initial page view
rdt('track', 'PageVisit');

console.log('Reddit Pixel initialized from static script');