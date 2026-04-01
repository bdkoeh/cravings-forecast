import { Hono } from 'hono';
import bcrypt from 'bcrypt';
import { setSignedCookie, getSignedCookie, deleteCookie } from 'hono/cookie';
import { requireAuth, SESSION_SECRET } from '../middleware/auth.js';
import {
  createRestaurant, updateRestaurant, deleteRestaurant,
  getRestaurants, getRestaurantById,
  getAllCrawlMessages, createCrawlMessage, updateCrawlMessage, deleteCrawlMessage,
  getConditionMeta, updateConditionMeta,
  getCuisines, createCuisine, updateCuisine, deleteCuisine,
  getNeighborhoods, createNeighborhood, updateNeighborhood, deleteNeighborhood,
  getSitePage, updateSitePage
} from '../db/index.js';
import type { RestaurantInput } from '../db/index.js';

const admin = new Hono();
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';

// --- Public routes (no auth required) ---

admin.post('/login', async (c) => {
  const body = await c.req.json<{ password?: string }>();
  if (!body.password) {
    return c.json({ error: 'Password required' }, 400);
  }

  if (!ADMIN_PASSWORD_HASH) {
    return c.json({ error: 'Admin password not configured' }, 500);
  }

  const valid = await bcrypt.compare(body.password, ADMIN_PASSWORD_HASH);
  if (!valid) {
    return c.json({ error: 'Invalid password' }, 401);
  }

  await setSignedCookie(c, 'session', 'authenticated', SESSION_SECRET, {
    path: '/',
    httpOnly: true,
    secure: false,
    sameSite: 'Lax',
    maxAge: 604800,
  });

  return c.json({ success: true });
});

admin.post('/logout', (c) => {
  deleteCookie(c, 'session', { path: '/' });
  return c.json({ success: true });
});

admin.get('/session', async (c) => {
  const session = await getSignedCookie(c, SESSION_SECRET, 'session');
  return c.json({ authenticated: !!session });
});

// --- Apply auth middleware for all routes below ---
admin.use('/*', requireAuth);

// --- Protected restaurant routes ---

admin.post('/restaurants', async (c) => {
  const data = await c.req.json<RestaurantInput>();

  if (!data.name || !data.neighborhood_id) {
    return c.json({ error: 'Name and neighborhood are required' }, 400);
  }
  if (!data.conditions || !Array.isArray(data.conditions) || data.conditions.length === 0) {
    return c.json({ error: 'At least one condition is required' }, 400);
  }

  const restaurant = createRestaurant(data);
  return c.json(restaurant, 201);
});

admin.put('/restaurants/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

  const data = await c.req.json<RestaurantInput>();

  if (!data.name || !data.neighborhood_id) {
    return c.json({ error: 'Name and neighborhood are required' }, 400);
  }
  if (!data.conditions || !Array.isArray(data.conditions) || data.conditions.length === 0) {
    return c.json({ error: 'At least one condition is required' }, 400);
  }

  const restaurant = updateRestaurant(id, data);
  if (!restaurant) return c.json({ error: 'Not found' }, 404);
  return c.json(restaurant);
});

admin.delete('/restaurants/:id', (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

  const deleted = deleteRestaurant(id);
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

// --- Protected cuisine routes ---

admin.get('/cuisines', (c) => {
  return c.json(getCuisines());
});

admin.post('/cuisines', async (c) => {
  const body = await c.req.json<{ name?: string }>();
  if (!body.name?.trim()) {
    return c.json({ error: 'Name is required' }, 400);
  }
  try {
    const cuisine = createCuisine(body.name.trim());
    return c.json(cuisine, 201);
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) {
      return c.json({ error: 'Cuisine already exists' }, 409);
    }
    throw e;
  }
});

admin.put('/cuisines/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

  const body = await c.req.json<{ name?: string }>();
  if (!body.name?.trim()) {
    return c.json({ error: 'Name is required' }, 400);
  }

  try {
    const cuisine = updateCuisine(id, body.name.trim());
    if (!cuisine) return c.json({ error: 'Not found' }, 404);
    return c.json(cuisine);
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) {
      return c.json({ error: 'Cuisine already exists' }, 409);
    }
    throw e;
  }
});

admin.delete('/cuisines/:id', (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

  try {
    const deleted = deleteCuisine(id);
    if (!deleted) return c.json({ error: 'Not found' }, 404);
    return c.json({ success: true });
  } catch (e: any) {
    if (e.message?.includes('FOREIGN KEY')) {
      return c.json({ error: 'Cannot delete: cuisine is in use by restaurants' }, 409);
    }
    throw e;
  }
});

// --- Protected neighborhood routes ---

admin.get('/neighborhoods', (c) => {
  return c.json(getNeighborhoods());
});

admin.post('/neighborhoods', async (c) => {
  const body = await c.req.json<{ name?: string }>();
  if (!body.name?.trim()) {
    return c.json({ error: 'Name is required' }, 400);
  }
  try {
    const neighborhood = createNeighborhood(body.name.trim());
    return c.json(neighborhood, 201);
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) {
      return c.json({ error: 'Neighborhood already exists' }, 409);
    }
    throw e;
  }
});

admin.put('/neighborhoods/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

  const body = await c.req.json<{ name?: string }>();
  if (!body.name?.trim()) {
    return c.json({ error: 'Name is required' }, 400);
  }

  try {
    const neighborhood = updateNeighborhood(id, body.name.trim());
    if (!neighborhood) return c.json({ error: 'Not found' }, 404);
    return c.json(neighborhood);
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) {
      return c.json({ error: 'Neighborhood already exists' }, 409);
    }
    throw e;
  }
});

admin.delete('/neighborhoods/:id', (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

  try {
    const deleted = deleteNeighborhood(id);
    if (!deleted) return c.json({ error: 'Not found' }, 404);
    return c.json({ success: true });
  } catch (e: any) {
    if (e.message?.includes('FOREIGN KEY')) {
      return c.json({ error: 'Cannot delete: neighborhood is in use by restaurants' }, 409);
    }
    throw e;
  }
});

// --- Protected site pages routes ---

admin.get('/pages/:slug', (c) => {
  const page = getSitePage(c.req.param('slug'));
  if (!page) return c.json({ error: 'Not found' }, 404);
  return c.json(page);
});

admin.put('/pages/:slug', async (c) => {
  const body = await c.req.json<{ content?: string }>();
  if (body.content === undefined) return c.json({ error: 'Content is required' }, 400);
  const page = updateSitePage(c.req.param('slug'), body.content);
  return c.json(page);
});

// --- Protected condition meta routes ---

admin.get('/condition-meta', (c) => {
  return c.json(getConditionMeta());
});

admin.put('/condition-meta/:condition', async (c) => {
  const condition = c.req.param('condition');
  const body = await c.req.json();
  const updated = updateConditionMeta(condition, body);
  if (!updated) return c.json({ error: 'Not found' }, 404);
  return c.json(updated);
});

// --- Protected crawl message routes ---

admin.get('/crawl-messages', (c) => {
  return c.json(getAllCrawlMessages());
});

admin.post('/crawl-messages', async (c) => {
  const body = await c.req.json<{ message?: string; sort_order?: number }>();
  if (!body.message) {
    return c.json({ error: 'Message is required' }, 400);
  }
  const msg = createCrawlMessage(body.message, body.sort_order);
  return c.json(msg, 201);
});

admin.put('/crawl-messages/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

  const data = await c.req.json<{ message?: string; sort_order?: number; active?: number }>();
  const msg = updateCrawlMessage(id, data);
  if (!msg) return c.json({ error: 'Not found' }, 404);
  return c.json(msg);
});

admin.delete('/crawl-messages/:id', (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

  const deleted = deleteCrawlMessage(id);
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

export { admin as adminRoutes };
