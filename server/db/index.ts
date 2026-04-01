import Database from 'better-sqlite3';
import { readFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', '..', 'data', 'restaurants.db');

// Ensure data directory exists
mkdirSync(dirname(DB_PATH), { recursive: true });

// Open database connection
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
// Enable foreign key enforcement
db.pragma('foreign_keys = ON');

// Initialize schema
const schemaSql = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schemaSql);

// --- Migration: old schema (text neighborhood/cuisine_type) to new (FK IDs) ---
const tableInfo = db.prepare("PRAGMA table_info(restaurants)").all() as { name: string; type: string }[];
const hasOldSchema = tableInfo.some(col => col.name === 'neighborhood' && col.type === 'TEXT');

if (hasOldSchema) {
  db.exec('BEGIN TRANSACTION');
  try {
    // Populate lookup tables from existing data
    db.exec(`INSERT OR IGNORE INTO neighborhoods (name) SELECT DISTINCT neighborhood FROM restaurants`);
    db.exec(`INSERT OR IGNORE INTO cuisines (name) SELECT DISTINCT cuisine_type FROM restaurants WHERE cuisine_type IS NOT NULL AND cuisine_type != ''`);

    // Rebuild restaurants table with FK columns
    db.exec(`
      CREATE TABLE restaurants_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        link TEXT,
        neighborhood_id INTEGER NOT NULL,
        cuisine_id INTEGER,
        description TEXT,
        highlighted INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (neighborhood_id) REFERENCES neighborhoods(id),
        FOREIGN KEY (cuisine_id) REFERENCES cuisines(id)
      )
    `);

    db.exec(`
      INSERT INTO restaurants_new (id, name, link, neighborhood_id, cuisine_id, description, highlighted, created_at, updated_at)
      SELECT r.id, r.name, r.link, n.id, c.id, r.description, r.highlighted, r.created_at, r.updated_at
      FROM restaurants r
      JOIN neighborhoods n ON r.neighborhood = n.name
      LEFT JOIN cuisines c ON r.cuisine_type = c.name
    `);

    db.exec(`DROP TABLE restaurants`);
    db.exec(`ALTER TABLE restaurants_new RENAME TO restaurants`);

    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

// Seed data if table is empty
const count = db.prepare('SELECT COUNT(*) as count FROM restaurants').get() as { count: number };
if (count.count === 0) {
  const seedSql = readFileSync(join(__dirname, 'seed.sql'), 'utf-8');
  db.exec(seedSql);
}

// --- Interfaces ---

interface RestaurantRow {
  id: number;
  name: string;
  link: string | null;
  neighborhood_id: number;
  cuisine_id: number | null;
  neighborhood: string;
  cuisine_type: string | null;
  description: string | null;
  highlighted: number;
  created_at: string;
  updated_at: string;
  conditions: string | null;
}

interface Restaurant {
  id: number;
  name: string;
  link: string | null;
  neighborhood_id: number;
  cuisine_id: number | null;
  neighborhood: string;
  cuisine_type: string | null;
  description: string | null;
  highlighted: number;
  created_at: string;
  updated_at: string;
  conditions: string[];
}

interface RestaurantInput {
  name: string;
  link?: string | null;
  neighborhood_id: number;
  cuisine_id?: number | null;
  description?: string | null;
  highlighted?: number;
  conditions: string[];
}

interface Cuisine {
  id: number;
  name: string;
}

interface Neighborhood {
  id: number;
  name: string;
}

interface CrawlMessage {
  id: number;
  message: string;
  sort_order: number;
  active: number;
  created_at: string;
  updated_at: string;
}

interface ConditionStats {
  condition: string;
  spots: number;
  picks: number;
}

interface ConditionMeta {
  condition: string;
  tag: string;
  description: string;
}

function rowToRestaurant(row: RestaurantRow): Restaurant {
  return {
    ...row,
    conditions: row.conditions ? row.conditions.split(',') : [],
  };
}

// --- Restaurant Queries ---

function getRestaurants(condition?: string, neighborhood?: string): Restaurant[] {
  let query = `
    SELECT r.id, r.name, r.link, r.neighborhood_id, r.cuisine_id,
           r.description, r.highlighted, r.created_at, r.updated_at,
           n.name as neighborhood, c.name as cuisine_type,
           GROUP_CONCAT(rc.condition) as conditions
    FROM restaurants r
    JOIN neighborhoods n ON r.neighborhood_id = n.id
    LEFT JOIN cuisines c ON r.cuisine_id = c.id
    LEFT JOIN restaurant_conditions rc ON r.id = rc.restaurant_id
  `;
  const params: string[] = [];
  const wheres: string[] = [];

  if (condition) {
    wheres.push('rc.condition = ?');
    params.push(condition);
  }
  if (neighborhood) {
    wheres.push('n.name = ?');
    params.push(neighborhood);
  }

  if (wheres.length > 0) {
    query += ' WHERE ' + wheres.join(' AND ');
  }
  query += ' GROUP BY r.id ORDER BY r.name';

  const rows = db.prepare(query).all(...params) as RestaurantRow[];
  return rows.map(rowToRestaurant);
}

function getRestaurantById(id: number): Restaurant | null {
  const row = db.prepare(`
    SELECT r.id, r.name, r.link, r.neighborhood_id, r.cuisine_id,
           r.description, r.highlighted, r.created_at, r.updated_at,
           n.name as neighborhood, c.name as cuisine_type,
           GROUP_CONCAT(rc.condition) as conditions
    FROM restaurants r
    JOIN neighborhoods n ON r.neighborhood_id = n.id
    LEFT JOIN cuisines c ON r.cuisine_id = c.id
    LEFT JOIN restaurant_conditions rc ON r.id = rc.restaurant_id
    WHERE r.id = ?
    GROUP BY r.id
  `).get(id) as RestaurantRow | undefined;

  if (!row) return null;
  return rowToRestaurant(row);
}

// --- Restaurant Mutations ---

const createRestaurant = db.transaction((data: RestaurantInput): Restaurant | null => {
  const result = db.prepare(
    `INSERT INTO restaurants (name, link, neighborhood_id, cuisine_id, description, highlighted)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(data.name, data.link ?? null, data.neighborhood_id, data.cuisine_id ?? null, data.description ?? null, data.highlighted ?? 0);

  const restaurantId = result.lastInsertRowid as number;

  const insertCondition = db.prepare(
    'INSERT INTO restaurant_conditions (restaurant_id, condition) VALUES (?, ?)'
  );
  for (const condition of data.conditions) {
    insertCondition.run(restaurantId, condition);
  }

  return getRestaurantById(restaurantId);
});

const updateRestaurant = db.transaction((id: number, data: RestaurantInput): Restaurant | null => {
  const result = db.prepare(
    `UPDATE restaurants SET name = ?, link = ?, neighborhood_id = ?, cuisine_id = ?, description = ?, highlighted = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(data.name, data.link ?? null, data.neighborhood_id, data.cuisine_id ?? null, data.description ?? null, data.highlighted ?? 0, id);

  if (result.changes === 0) return null;

  db.prepare('DELETE FROM restaurant_conditions WHERE restaurant_id = ?').run(id);

  const insertCondition = db.prepare(
    'INSERT INTO restaurant_conditions (restaurant_id, condition) VALUES (?, ?)'
  );
  for (const condition of data.conditions) {
    insertCondition.run(id, condition);
  }

  return getRestaurantById(id);
});

function deleteRestaurant(id: number): boolean {
  const result = db.prepare('DELETE FROM restaurants WHERE id = ?').run(id);
  return result.changes > 0;
}

// --- Cuisines ---

function getCuisines(): Cuisine[] {
  return db.prepare('SELECT id, name FROM cuisines ORDER BY name').all() as Cuisine[];
}

function createCuisine(name: string): Cuisine {
  const result = db.prepare('INSERT INTO cuisines (name) VALUES (?)').run(name);
  return db.prepare('SELECT id, name FROM cuisines WHERE id = ?').get(result.lastInsertRowid) as Cuisine;
}

function updateCuisine(id: number, name: string): Cuisine | null {
  const result = db.prepare("UPDATE cuisines SET name = ?, updated_at = datetime('now') WHERE id = ?").run(name, id);
  if (result.changes === 0) return null;
  return db.prepare('SELECT id, name FROM cuisines WHERE id = ?').get(id) as Cuisine;
}

function deleteCuisine(id: number): boolean {
  const result = db.prepare('DELETE FROM cuisines WHERE id = ?').run(id);
  return result.changes > 0;
}

// --- Neighborhoods ---

function getNeighborhoods(): Neighborhood[] {
  return db.prepare('SELECT id, name FROM neighborhoods ORDER BY name').all() as Neighborhood[];
}

function createNeighborhood(name: string): Neighborhood {
  const result = db.prepare('INSERT INTO neighborhoods (name) VALUES (?)').run(name);
  return db.prepare('SELECT id, name FROM neighborhoods WHERE id = ?').get(result.lastInsertRowid) as Neighborhood;
}

function updateNeighborhood(id: number, name: string): Neighborhood | null {
  const result = db.prepare("UPDATE neighborhoods SET name = ?, updated_at = datetime('now') WHERE id = ?").run(name, id);
  if (result.changes === 0) return null;
  return db.prepare('SELECT id, name FROM neighborhoods WHERE id = ?').get(id) as Neighborhood;
}

function deleteNeighborhood(id: number): boolean {
  const result = db.prepare('DELETE FROM neighborhoods WHERE id = ?').run(id);
  return result.changes > 0;
}

// --- Crawl Messages ---

function getCrawlMessages(): CrawlMessage[] {
  return db.prepare(
    'SELECT * FROM crawl_messages WHERE active = 1 ORDER BY sort_order ASC, id ASC'
  ).all() as CrawlMessage[];
}

function getAllCrawlMessages(): CrawlMessage[] {
  return db.prepare(
    'SELECT * FROM crawl_messages ORDER BY sort_order ASC, id ASC'
  ).all() as CrawlMessage[];
}

function createCrawlMessage(message: string, sortOrder: number = 0): CrawlMessage {
  const result = db.prepare(
    'INSERT INTO crawl_messages (message, sort_order) VALUES (?, ?)'
  ).run(message, sortOrder);
  return db.prepare('SELECT * FROM crawl_messages WHERE id = ?').get(result.lastInsertRowid) as CrawlMessage;
}

function updateCrawlMessage(id: number, data: { message?: string; sort_order?: number; active?: number }): CrawlMessage | null {
  const fields: string[] = [];
  const params: (string | number)[] = [];

  if (data.message !== undefined) { fields.push('message = ?'); params.push(data.message); }
  if (data.sort_order !== undefined) { fields.push('sort_order = ?'); params.push(data.sort_order); }
  if (data.active !== undefined) { fields.push('active = ?'); params.push(data.active); }

  if (fields.length === 0) {
    return db.prepare('SELECT * FROM crawl_messages WHERE id = ?').get(id) as CrawlMessage | null;
  }

  fields.push("updated_at = datetime('now')");
  params.push(id);

  const result = db.prepare(
    `UPDATE crawl_messages SET ${fields.join(', ')} WHERE id = ?`
  ).run(...params);

  if (result.changes === 0) return null;
  return db.prepare('SELECT * FROM crawl_messages WHERE id = ?').get(id) as CrawlMessage;
}

function deleteCrawlMessage(id: number): boolean {
  const result = db.prepare('DELETE FROM crawl_messages WHERE id = ?').run(id);
  return result.changes > 0;
}

// --- Condition Stats & Meta ---

function getConditionStats(): ConditionStats[] {
  return db.prepare(`
    SELECT rc.condition,
      COUNT(DISTINCT r.id) as spots,
      COUNT(DISTINCT CASE WHEN r.highlighted = 1 THEN r.id END) as picks
    FROM restaurant_conditions rc
    JOIN restaurants r ON r.id = rc.restaurant_id
    GROUP BY rc.condition
  `).all() as ConditionStats[];
}

function getConditionMeta(): ConditionMeta[] {
  return db.prepare('SELECT * FROM condition_meta ORDER BY condition').all() as ConditionMeta[];
}

function updateConditionMeta(condition: string, data: { tag?: string; description?: string }): ConditionMeta | null {
  const fields: string[] = [];
  const params: string[] = [];

  if (data.tag !== undefined) { fields.push('tag = ?'); params.push(data.tag); }
  if (data.description !== undefined) { fields.push('description = ?'); params.push(data.description); }
  if (fields.length === 0) return null;

  params.push(condition);
  const result = db.prepare(`UPDATE condition_meta SET ${fields.join(', ')} WHERE condition = ?`).run(...params);
  if (result.changes === 0) return null;
  return db.prepare('SELECT * FROM condition_meta WHERE condition = ?').get(condition) as ConditionMeta;
}

// --- Site Pages ---

interface SitePage {
  slug: string;
  content: string;
  updated_at: string;
}

function getSitePage(slug: string): SitePage | null {
  return db.prepare('SELECT * FROM site_pages WHERE slug = ?').get(slug) as SitePage | null;
}

function updateSitePage(slug: string, content: string): SitePage | null {
  db.prepare(
    `INSERT INTO site_pages (slug, content, updated_at) VALUES (?, ?, datetime('now'))
     ON CONFLICT(slug) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at`
  ).run(slug, content);
  return getSitePage(slug);
}

export {
  db, getRestaurants, getRestaurantById,
  getCrawlMessages, getAllCrawlMessages, createCrawlMessage, updateCrawlMessage, deleteCrawlMessage,
  createRestaurant, updateRestaurant, deleteRestaurant,
  getConditionStats, getConditionMeta, updateConditionMeta,
  getCuisines, createCuisine, updateCuisine, deleteCuisine,
  getNeighborhoods, createNeighborhood, updateNeighborhood, deleteNeighborhood,
  getSitePage, updateSitePage
};
export type { Restaurant, CrawlMessage, RestaurantInput, ConditionStats, ConditionMeta, Cuisine, Neighborhood, SitePage };
