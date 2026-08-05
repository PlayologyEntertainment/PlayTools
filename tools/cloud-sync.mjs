// Thin re-export so esbuild bundles @supabase/supabase-js locally into
// tools/cloud-sync.bundle.js instead of PlayTools.html reaching out to a
// CDN — same rationale as tools/rig-inapp.mjs bundling three.js locally
// ("so it stays crisp and offline").
//
// Lazy-imported by PlayTools.html's Auth module (see Auth.ensureClient())
// only once a player actually engages a cloud feature — the anonymous,
// local-only default path never downloads this.
export { createClient } from '@supabase/supabase-js';
