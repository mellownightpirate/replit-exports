// Type definitions for Calendly global object
interface Calendly {
  initPopupWidget: (options: { url: string }) => void;
}

interface Window {
  Calendly?: Calendly;
}