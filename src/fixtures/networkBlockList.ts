/**
 * URLs/patterns to abort before every test.
 * Blocking third-party scripts (analytics, ads, tracking) prevents them from
 * introducing timing variance and network failures that cause flaky tests.
 *
 * Rules:
 *   string  → aborted if url.href.includes(string)
 *   RegExp  → aborted if RegExp.test(url.href)
 *
 * To allow a specific URL in one test use:
 *   await page.unroute(pattern)
 */
export const BLOCKED_PATTERNS: Array<string | RegExp> = [
  // --- Google Analytics & Tag Manager ---
  'google-analytics.com',
  'analytics.google.com',
  'googletagmanager.com',
  'gtag/js',

  // --- Meta / Facebook ---
  'connect.facebook.net',
  'facebook.com/tr',

  // --- Session recording & heatmaps ---
  'hotjar.com',
  'mouseflow.com',
  'fullstory.com',
  'logrocket.com',
  'smartlook.com',

  // --- Microsoft Clarity ---
  'clarity.ms',

  // --- Customer Data Platforms ---
  'segment.com',
  'segment.io',
  'mixpanel.com',
  'amplitude.com',
  'heap.io',
  'heapanalytics.com',
  'rudderstack.com',

  // --- Advertising networks ---
  'doubleclick.net',
  'googlesyndication.com',
  'adservice.google.com',
  'ads.linkedin.com',
  'snap.licdn.com',
  'bat.bing.com',
  /twitter\.com\/i\/adsct/,
  /t\.co\/i\/adsct/,

  // --- Tag managers (others) ---
  'tealium.com',
  'tags.tiqcdn.com',
  'launch.adobe.com',

  // --- Social widgets (block unless you're testing social share) ---
  'platform.twitter.com',
  'platform.linkedin.com',
  'staticxx.facebook.com',

  // --- Chat / support widgets (uncomment if not under test) ---
  // 'intercom.io',
  // 'widget.intercom.io',
  // 'crisp.chat',
  // 'zopim.com',
  // 'zendesk.com/embeddable_framework',
];
