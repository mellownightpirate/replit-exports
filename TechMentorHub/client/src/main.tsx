import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { trackPageView } from "./lib/analytics";

// Track initial page view
trackPageView(window.location.pathname);

// Setup listener for route changes to track page views
const originalPushState = history.pushState;
history.pushState = function(state, title, url) {
  originalPushState.call(this, state, title, url);
  if (typeof url === 'string') {
    trackPageView(new URL(url, window.location.origin).pathname);
  }
};

// Listen for popstate (back/forward navigation)
window.addEventListener('popstate', () => {
  trackPageView(window.location.pathname);
});

createRoot(document.getElementById("root")!).render(<App />);
