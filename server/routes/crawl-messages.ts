import { Hono } from 'hono';
import { getCrawlMessages } from '../db/index.js';

export const crawlMessageRoutes = new Hono();

// GET /crawl-messages -- public, returns active messages ordered by sort_order
crawlMessageRoutes.get('/crawl-messages', (c) => {
  const messages = getCrawlMessages();
  return c.json(messages);
});
