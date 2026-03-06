/**
 * @typedef {'ai-native' | 'platform'} FeatureType
 *
 * @typedef {Object} Feature
 * @property {string} slug
 * @property {string} name
 * @property {FeatureType} type
 * @property {string|null} badge        — 'coming-soon' or null
 * @property {string|null} screenshot   — relative public path or null
 * @property {string|null} video        — embed URL or null
 */

/** @type {Feature[]} */
export const features = [
  // ── AI-Native Features ──────────────────────────────────────────────────
  {
    slug: 'omni-channel',
    name: 'Omni Channel Communications',
    type: 'ai-native',
    badge: null,
    screenshot: null,
    video: null,
  },
  {
    slug: 'patient-profile',
    name: 'Agentic Patient Profile',
    type: 'ai-native',
    badge: null,
    screenshot: "/screenshots/agentic-patient-profile.png",
    video: null,
  },
  {
    slug: 'agentic-tasks',
    name: 'Agentic Task Completion',
    type: 'ai-native',
    badge: null,
    screenshot: "/screenshots/agentic-tasks.png",
    video: "/animations/agentic-tasks-summary.gif",
  },
  {
    slug: 'agentic-queues',
    name: 'Agentic Queue Management',
    type: 'ai-native',
    badge: null,
    screenshot: null,
    video: null,
  },

  // ── Platform Features ────────────────────────────────────────────────────
  {
    slug: 'workflows',
    name: 'Formal Workflows',
    type: 'platform',
    badge: null,
    screenshot: "/screenshots/workflows.png",
    video: null,
  },
  {
    slug: 'informal',
    name: 'Informal Workflows',
    type: 'platform',
    badge: null,
    screenshot: "/screenshots/workflows.png",
    video: null,
  },
  {
    slug: 'queues',
    name: 'Task Queues',
    type: 'platform',
    badge: null,
    screenshot: "/screenshots/queues.png",
    video: "/animations/queues.gif",
  },
  {
    slug: 'workspace',
    name: 'Workspace',
    type: 'platform',
    badge: null,
    screenshot: "/screenshots/workspace.png",
    video: "/animations/workspace.gif",
  },
  {
    slug: 'crm',
    name: 'CRM',
    type: 'platform',
    badge: null,
    screenshot: null,
    video: null,
  },
  {
    slug: 'scheduling',
    name: 'Scheduling',
    type: 'platform',
    badge: null,
    screenshot: null,
    video: null,
  },
  {
    slug: 'acd-module',
    name: 'Appropriate Coding',
    type: 'platform',
    badge: null,
    screenshot: null,
    video: null,
  },
];

/**
 * Returns a single feature by slug, or undefined if not found.
 * @param {string} slug
 * @returns {Feature|undefined}
 */
export function getFeatureBySlug(slug) {
  return features.find(function(f) { return f.slug === slug; });
}

/** @type {Feature[]} */
export const aiNativeFeatures = features.filter(function(f) { return f.type === 'ai-native'; });

/** @type {Feature[]} */
export const platformFeatures = features.filter(function(f) { return f.type === 'platform'; });
