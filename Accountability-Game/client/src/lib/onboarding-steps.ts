export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  route?: string;
  actions?: {
    id: string;
    label: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
    action?: "next" | "skip" | "back" | "custom";
  }[];
  isActionStep?: boolean;
  completionCheck?: () => boolean;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to Stride!",
    description: "Build better anchors with accountability partners. Let's get you set up in just a few steps.",
    route: "/",
  },
  {
    id: "anchors-decision",
    title: "Your Anchors",
    description: "We've added some starter anchors for you. Would you like to keep them, edit them, or start fresh?",
    targetSelector: '[data-tour="anchors-section"]',
    route: "/",
    isActionStep: true,
    actions: [
      { id: "delete-defaults", label: "Start fresh", variant: "destructive", action: "custom" },
      { id: "keep-defaults", label: "Keep defaults", variant: "outline", action: "next" },
      { id: "edit-defaults", label: "Edit anchors", variant: "default", action: "custom" },
    ],
  },
  {
    id: "add-anchor",
    title: "Add Your First Anchor",
    description: "Tap the + button to create a new anchor. Give it a name, choose an icon, and set your weekly target.",
    targetSelector: '[data-tour="add-anchor"]',
    route: "/habits",
  },
  {
    id: "buddies-intro",
    title: "Find Accountability Partners",
    description: "Buddies help you stay on track by checking in on your progress. Let's invite someone!",
    targetSelector: '[data-tour="buddies-tab"]',
    route: "/buddies",
  },
  {
    id: "invite-buddy",
    title: "Invite a Buddy",
    description: "Tap the invite button to add a friend by their username or email address.",
    targetSelector: '[data-tour="invite-buddy"]',
    route: "/buddies",
  },
  {
    id: "privacy-settings",
    title: "Privacy & Sharing",
    description: "Control what your buddies can see. We recommend sharing your anchors and completion status.",
    targetSelector: '[data-tour="privacy-settings"]',
    route: "/profile",
  },
  {
    id: "public-discovery",
    title: "Go Public (Optional)",
    description: "Enable public discovery so others can find you and send buddy requests. You can also search for people to connect with.",
    targetSelector: '[data-tour="public-discovery"]',
    route: "/profile",
  },
  {
    id: "discover-buddies",
    title: "Discover New Buddies",
    description: "Find accountability partners in the Discover section. Search for people by name or username and send them a buddy request.",
    targetSelector: '[data-tour="discover-section"]',
    route: "/discover",
  },
  {
    id: "projects-intro",
    title: "Team Up on Projects",
    description: "Projects let you work toward shared goals with others. Link your anchors to contribute progress together!",
    targetSelector: '[data-tour="projects-section"]',
    route: "/projects",
  },
  {
    id: "first-checkin",
    title: "Make Your First Check-in",
    description: "Tap an anchor to mark it complete. When buddies are connected, they can see your progress and send encouragement!",
    targetSelector: '[data-tour="anchor-toggle"]',
    route: "/",
  },
  {
    id: "complete",
    title: "You're All Set!",
    description: "Your anchor tracking journey begins now. Invite more buddies and stay consistent for best results!",
    route: "/",
    actions: [
      { id: "go-today", label: "Go to Today", variant: "default", action: "next" },
      { id: "invite-more", label: "Invite Another Buddy", variant: "outline", action: "custom" },
    ],
  },
];

export const TOTAL_STEPS = ONBOARDING_STEPS.length;
