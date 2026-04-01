import { createMiddleware } from 'hono/factory';
import { getSignedCookie } from 'hono/cookie';
import { timingSafeEqual } from 'node:crypto';

export const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-change-in-production';

export const requireAuth = createMiddleware(async (c, next) => {
  const session = await getSignedCookie(c, SESSION_SECRET, 'session');
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});

const API_TOKEN = process.env.API_TOKEN || '';

export const requireApiToken = createMiddleware(async (c, next) => {
  if (!API_TOKEN) {
    return c.json({ error: 'API token not configured' }, 500);
  }

  const header = c.req.header('Authorization');
  if (!header?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing Authorization: Bearer <token> header' }, 401);
  }

  const token = header.slice(7);
  const tokenBuf = Buffer.from(token);
  const expectedBuf = Buffer.from(API_TOKEN);

  if (tokenBuf.length !== expectedBuf.length || !timingSafeEqual(tokenBuf, expectedBuf)) {
    return c.json({ error: 'Invalid API token' }, 401);
  }

  await next();
});
