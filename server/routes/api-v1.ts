import { Hono } from 'hono';
import { requireApiToken } from '../middleware/auth.js';
import {
  getRestaurants, getRestaurantById,
  createRestaurant, updateRestaurant, deleteRestaurant,
  getCuisines, createCuisine, updateCuisine, deleteCuisine,
  getNeighborhoods, createNeighborhood, updateNeighborhood, deleteNeighborhood,
  getAllCrawlMessages, createCrawlMessage, updateCrawlMessage, deleteCrawlMessage,
  getConditionMeta, updateConditionMeta
} from '../db/index.js';
import type { RestaurantInput } from '../db/index.js';

const api = new Hono();

// All routes require Bearer token
api.use('/*', requireApiToken);

// --- Restaurants ---

api.get('/restaurants', (c) => {
  const condition = c.req.query('condition');
  const neighborhood = c.req.query('neighborhood');
  return c.json(getRestaurants(condition, neighborhood));
});

api.get('/restaurants/:id', (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);
  const restaurant = getRestaurantById(id);
  if (!restaurant) return c.json({ error: 'Not found' }, 404);
  return c.json(restaurant);
});

api.post('/restaurants', async (c) => {
  const data = await c.req.json<RestaurantInput>();
  if (!data.name || !data.neighborhood_id) {
    return c.json({ error: 'Name and neighborhood_id are required' }, 400);
  }
  if (!data.conditions || !Array.isArray(data.conditions) || data.conditions.length === 0) {
    return c.json({ error: 'At least one condition is required (foggy, sunny, night)' }, 400);
  }
  const restaurant = createRestaurant(data);
  return c.json(restaurant, 201);
});

api.put('/restaurants/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);
  const data = await c.req.json<RestaurantInput>();
  if (!data.name || !data.neighborhood_id) {
    return c.json({ error: 'Name and neighborhood_id are required' }, 400);
  }
  if (!data.conditions || !Array.isArray(data.conditions) || data.conditions.length === 0) {
    return c.json({ error: 'At least one condition is required (foggy, sunny, night)' }, 400);
  }
  const restaurant = updateRestaurant(id, data);
  if (!restaurant) return c.json({ error: 'Not found' }, 404);
  return c.json(restaurant);
});

api.delete('/restaurants/:id', (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);
  const deleted = deleteRestaurant(id);
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

// --- Cuisines ---

api.get('/cuisines', (c) => {
  return c.json(getCuisines());
});

api.post('/cuisines', async (c) => {
  const body = await c.req.json<{ name?: string }>();
  if (!body.name?.trim()) return c.json({ error: 'Name is required' }, 400);
  try {
    return c.json(createCuisine(body.name.trim()), 201);
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) return c.json({ error: 'Cuisine already exists' }, 409);
    throw e;
  }
});

api.put('/cuisines/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);
  const body = await c.req.json<{ name?: string }>();
  if (!body.name?.trim()) return c.json({ error: 'Name is required' }, 400);
  try {
    const cuisine = updateCuisine(id, body.name.trim());
    if (!cuisine) return c.json({ error: 'Not found' }, 404);
    return c.json(cuisine);
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) return c.json({ error: 'Cuisine already exists' }, 409);
    throw e;
  }
});

api.delete('/cuisines/:id', (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);
  try {
    const deleted = deleteCuisine(id);
    if (!deleted) return c.json({ error: 'Not found' }, 404);
    return c.json({ success: true });
  } catch (e: any) {
    if (e.message?.includes('FOREIGN KEY')) return c.json({ error: 'Cannot delete: cuisine is in use by restaurants' }, 409);
    throw e;
  }
});

// --- Neighborhoods ---

api.get('/neighborhoods', (c) => {
  return c.json(getNeighborhoods());
});

api.post('/neighborhoods', async (c) => {
  const body = await c.req.json<{ name?: string }>();
  if (!body.name?.trim()) return c.json({ error: 'Name is required' }, 400);
  try {
    return c.json(createNeighborhood(body.name.trim()), 201);
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) return c.json({ error: 'Neighborhood already exists' }, 409);
    throw e;
  }
});

api.put('/neighborhoods/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);
  const body = await c.req.json<{ name?: string }>();
  if (!body.name?.trim()) return c.json({ error: 'Name is required' }, 400);
  try {
    const neighborhood = updateNeighborhood(id, body.name.trim());
    if (!neighborhood) return c.json({ error: 'Not found' }, 404);
    return c.json(neighborhood);
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) return c.json({ error: 'Neighborhood already exists' }, 409);
    throw e;
  }
});

api.delete('/neighborhoods/:id', (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);
  try {
    const deleted = deleteNeighborhood(id);
    if (!deleted) return c.json({ error: 'Not found' }, 404);
    return c.json({ success: true });
  } catch (e: any) {
    if (e.message?.includes('FOREIGN KEY')) return c.json({ error: 'Cannot delete: neighborhood is in use by restaurants' }, 409);
    throw e;
  }
});

// --- Crawl Messages ---

api.get('/crawl-messages', (c) => {
  return c.json(getAllCrawlMessages());
});

api.post('/crawl-messages', async (c) => {
  const body = await c.req.json<{ message?: string; sort_order?: number }>();
  if (!body.message) return c.json({ error: 'Message is required' }, 400);
  return c.json(createCrawlMessage(body.message, body.sort_order), 201);
});

api.put('/crawl-messages/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);
  const data = await c.req.json<{ message?: string; sort_order?: number; active?: number }>();
  const msg = updateCrawlMessage(id, data);
  if (!msg) return c.json({ error: 'Not found' }, 404);
  return c.json(msg);
});

api.delete('/crawl-messages/:id', (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);
  const deleted = deleteCrawlMessage(id);
  if (!deleted) return c.json({ error: 'Not found' }, 404);
  return c.json({ success: true });
});

// --- Condition Meta ---

api.get('/condition-meta', (c) => {
  return c.json(getConditionMeta());
});

api.put('/condition-meta/:condition', async (c) => {
  const condition = c.req.param('condition');
  const body = await c.req.json();
  const updated = updateConditionMeta(condition, body);
  if (!updated) return c.json({ error: 'Not found' }, 404);
  return c.json(updated);
});

export { api as apiV1Routes };
