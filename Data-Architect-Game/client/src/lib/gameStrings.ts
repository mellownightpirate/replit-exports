/**
 * Centralised game copy and strings
 * Easy to adjust later - all text content lives here
 */

// Game branding
export const GAME_TITLE = 'Data Architect';
export const GAME_SUBTITLE = 'Enterprise Analytics Simulation';
export const GAME_TAGLINE = 'Unify. Govern. Scale.';

// Mascot
export const MASCOT_NAME = 'Archie';
export const MASCOT_PERSONALITY = 'Your pragmatic coach and data estate guide. Calm under pressure, occasionally sarcastic about shadow IT.';

// Opening cinematic / story intro
export const STORY_INTRO = `The board room falls silent as you enter. Monitors flicker with dashboards nobody trusts, spreadsheets that contradict each other, and a legacy data warehouse groaning under technical debt.

"Welcome aboard," says the CDO. "Our data estate is fragmented across twelve systems, three cloud providers, and more shadow IT than anyone wants to admit. The regulators arrive in twelve weeks. The embedded analytics deadline for our biggest customer is even sooner."

You scan the room. Finance distrusts the revenue numbers. Product can't get self-service working. Central IT has vetoed half the backlog.

This is your mandate: unify the enterprise analytics platform, build trust across the business, and prove value—fast—before political capital runs out.

No pressure.`;

// Scenario-specific intros
export const SCENARIO_INTROS: Record<string, { title: string; intro: string }> = {
  'speed-to-value': {
    title: 'Speed to Value',
    intro: 'The board wants results yesterday. Governance is loose, adoption pressure is high, and everyone is watching your time-to-value metrics. Move fast, but mind the trust debt you accumulate.',
  },
  'governance-first': {
    title: 'Governance First',
    intro: 'After a recent audit scare, security is paramount. Governance is strong but adoption is sluggish. Your challenge: prove that data governance enables rather than blocks value creation.',
  },
  'scale-out': {
    title: 'Scale-Out Enterprise',
    intro: 'A sprawling enterprise with more nodes, more complexity, and more events. This is the full challenge—balance everything at once while navigating constant disruption.',
  },
};

// Turn flavour text for events (adds story context to event headers)
export const TURN_FLAVOUR: string[] = [
  'The coffee machine broke again. IT blames the facilities team.',
  'Slack is buzzing with rumours about the upcoming steering committee.',
  'Someone put "FIX DATA QUALITY" on the all-hands agenda. Again.',
  'The new intern asked why there are four different customer tables.',
  'Finance and Sales are arguing over whose numbers are "the truth."',
  'Central IT sent another "friendly reminder" about security policies.',
  'A business unit quietly built their own dashboard. It has errors.',
  'The CDO mentioned "data mesh" in passing. Panic ensued.',
  'Someone finally read the data dictionary. They had questions.',
  'An executive asked for "one source of truth." Silence followed.',
  'The support queue is growing. Users want self-service that works.',
  'Regulatory audit prep has started. Everyone is suddenly very busy.',
];

// Win/lose condition labels
export const WIN_CONDITION_LABELS = {
  adoption: 'Adoption',
  trust: 'Trust',
  governanceCoverage: 'Governance',
  reliability: 'Reliability',
  maxLatency: 'Latency',
  maxCostPerTurn: 'Cost/Turn',
};

export const LOSE_CONDITION_LABELS = {
  trust: 'Trust Collapse',
  reliability: 'Reliability Crisis',
  politicalCapital: 'Political Failure',
};

// Dynamic guideline rules (what to show based on state)
export interface DynamicGuideline {
  id: string;
  condition: (metrics: {
    adoption: number;
    trust: number;
    latency: number;
    cost: number;
    governanceCoverage: number;
    reliability: number;
    politicalCapital: number;
    supportLoad: number;
  }, trends?: { trustTrending: 'up' | 'down' | 'stable'; latencyTrending: 'up' | 'down' | 'stable' }) => boolean;
  guideline: string;
  coachTip: string;
  priority: number; // Lower = more important
}

export const DYNAMIC_GUIDELINES: DynamicGuideline[] = [
  {
    id: 'low-governance-high-adoption',
    condition: (m) => m.governanceCoverage < 50 && m.adoption > 50,
    guideline: 'Add governance policies before expanding self-service further.',
    coachTip: 'High adoption without governance creates trust debt. Lock it down before users lose confidence.',
    priority: 1,
  },
  {
    id: 'trust-falling',
    condition: (m, trends) => m.trust < 60 && trends?.trustTrending === 'down',
    guideline: 'Trust is falling—deploy managed dashboards or add governance.',
    coachTip: 'When trust drops, users revert to spreadsheets. Act now to retain credibility.',
    priority: 2,
  },
  {
    id: 'high-latency',
    condition: (m) => m.latency > 1500,
    guideline: 'Performance is poor—consider tuning or deploying connectors.',
    coachTip: 'Slow queries kill adoption faster than any policy. Users have no patience.',
    priority: 3,
  },
  {
    id: 'high-support-load',
    condition: (m) => m.supportLoad > 50,
    guideline: 'Support queue is swamped—run enablement or consolidate dashboards.',
    coachTip: 'High ticket volume drains your team. Self-service done right reduces the load.',
    priority: 4,
  },
  {
    id: 'low-political-capital',
    condition: (m) => m.politicalCapital < 40,
    guideline: 'Political capital is low—focus on quick wins to rebuild stakeholder trust.',
    coachTip: 'When politics tank, deployments become harder. Win some allies before expanding.',
    priority: 5,
  },
  {
    id: 'low-reliability',
    condition: (m) => m.reliability < 50,
    guideline: 'Reliability is shaky—avoid aggressive deployments until stable.',
    coachTip: 'Unreliable systems erode trust. Fix the foundations before adding features.',
    priority: 6,
  },
  {
    id: 'cost-creeping',
    condition: (m) => m.cost > 100,
    guideline: 'Costs are climbing—balance growth with efficiency.',
    coachTip: 'Budget scrutiny is real. Every deployment adds cost; make them count.',
    priority: 7,
  },
  {
    id: 'balanced-state',
    condition: (m) => m.adoption > 40 && m.trust > 50 && m.governanceCoverage > 40 && m.reliability > 50,
    guideline: 'Metrics look balanced—push adoption or governance to close the gap.',
    coachTip: 'Stability is good, but you need to hit targets. Time to accelerate.',
    priority: 10,
  },
  {
    id: 'low-adoption',
    condition: (m) => m.adoption < 40,
    guideline: 'Adoption is low—deploy VDD pilots or run enablement sessions.',
    coachTip: 'If nobody uses the platform, the value stays locked. Get users on board.',
    priority: 3,
  },
  {
    id: 'strong-position',
    condition: (m) => m.adoption > 60 && m.trust > 60 && m.governanceCoverage > 55 && m.reliability > 55,
    guideline: 'Strong position—maintain momentum and close remaining gaps.',
    coachTip: 'You are ahead. Do not let up. Finish strong before events derail progress.',
    priority: 12,
  },
];

// Get active guidelines based on current metrics
export function getActiveGuidelines(
  metrics: {
    adoption: number;
    trust: number;
    latency: number;
    cost: number;
    governanceCoverage: number;
    reliability: number;
    politicalCapital: number;
    supportLoad: number;
  },
  trends?: { trustTrending: 'up' | 'down' | 'stable'; latencyTrending: 'up' | 'down' | 'stable' },
  maxCount = 5
): DynamicGuideline[] {
  return DYNAMIC_GUIDELINES
    .filter((g) => g.condition(metrics, trends))
    .sort((a, b) => a.priority - b.priority)
    .slice(0, maxCount);
}
