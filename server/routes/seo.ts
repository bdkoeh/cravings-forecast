import { Hono } from 'hono';
import { getRestaurants, getConditionMeta } from '../db/index.js';

export const seoRoutes = new Hono();

seoRoutes.get('/robots.txt', (c) => {
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${process.env.SITE_URL || 'http://localhost:3001'}/sitemap.xml`;

  return c.text(body);
});

seoRoutes.get('/sitemap.xml', (c) => {
  const siteUrl = process.env.SITE_URL || 'http://localhost:3001';
  const now = new Date().toISOString().split('T')[0];
  const restaurants = getRestaurants();
  const conditions = getConditionMeta();

  const urls: { loc: string; priority: string; changefreq: string }[] = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    { loc: '/all', priority: '0.9', changefreq: 'weekly' },
    { loc: '/about', priority: '0.7', changefreq: 'monthly' },
    { loc: '/neighborhoods', priority: '0.8', changefreq: 'monthly' },
  ];

  // Condition pages
  for (const cond of conditions) {
    urls.push({ loc: `/condition/${cond.condition}`, priority: '0.8', changefreq: 'weekly' });
  }

  // Neighborhood region pages
  const regions = ['richmond', 'sunset', 'downtown', 'north-waterfront', 'central', 'south-central', 'far-south'];
  for (const region of regions) {
    urls.push({ loc: `/neighborhoods/${region}`, priority: '0.7', changefreq: 'monthly' });
  }

  // Individual restaurant pages
  for (const r of restaurants) {
    urls.push({ loc: `/restaurant/${r.id}`, priority: '0.6', changefreq: 'monthly' });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${siteUrl}${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return c.body(xml, 200, { 'Content-Type': 'application/xml' });
});
