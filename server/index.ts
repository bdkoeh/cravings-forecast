import 'dotenv/config';
import { Hono } from 'hono';
import { compress } from 'hono/compress';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { readFileSync, existsSync } from 'node:fs';
import { restaurantRoutes } from './routes/restaurants.js';
import { crawlMessageRoutes } from './routes/crawl-messages.js';
import { adminRoutes } from './routes/admin.js';
import { apiV1Routes } from './routes/api-v1.js';
import { seoRoutes } from './routes/seo.js';

const app = new Hono();

// Gzip compression for all responses
app.use('*', compress());

// SEO routes (robots.txt, sitemap.xml) — must be before static files
app.route('/', seoRoutes);

// API routes (take precedence over static files)
app.route('/api', restaurantRoutes);
app.route('/api', crawlMessageRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api/v1', apiV1Routes);

// In production, serve Vite build output as static files
const distPath = './dist';
if (existsSync(distPath)) {
  app.use('/*', serveStatic({ root: distPath }));

  // SPA fallback: serve index.html for any unmatched non-API route
  // (Hono has no built-in SPA fallback -- see Pitfall 3 in RESEARCH.md)
  app.get('*', (c) => {
    const html = readFileSync(`${distPath}/index.html`, 'utf-8');
    return c.html(html);
  });
}

const port = Number(process.env.PORT) || 3001;
console.log(`Server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
