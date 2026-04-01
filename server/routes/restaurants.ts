import { Hono } from 'hono';
import { getRestaurants, getRestaurantById, getConditionStats, getConditionMeta, getSitePage } from '../db/index.js';

export const restaurantRoutes = new Hono();

// GET /condition-stats -- spots and picks counts per condition
restaurantRoutes.get('/condition-stats', (c) => {
  return c.json(getConditionStats());
});

// GET /condition-meta -- condition descriptions and tags
restaurantRoutes.get('/condition-meta', (c) => {
  return c.json(getConditionMeta());
});

// GET /restaurants -- list all, optionally filter by condition and/or neighborhood
restaurantRoutes.get('/restaurants', (c) => {
  const condition = c.req.query('condition');
  const neighborhood = c.req.query('neighborhood');
  const restaurants = getRestaurants(condition, neighborhood);
  return c.json(restaurants);
});

// GET /pages/:slug -- site page content (about, etc.)
restaurantRoutes.get('/pages/:slug', (c) => {
  const slug = c.req.param('slug');
  const page = getSitePage(slug);
  if (!page) return c.json({ error: 'Not found' }, 404);
  return c.json(page);
});

// GET /restaurants/:id -- single restaurant detail
restaurantRoutes.get('/restaurants/:id', (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);
  const restaurant = getRestaurantById(id);
  if (!restaurant) return c.json({ error: 'Not found' }, 404);
  return c.json(restaurant);
});
