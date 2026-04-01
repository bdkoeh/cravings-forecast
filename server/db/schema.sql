-- SF Cravings Forecast - Restaurant Database Schema
-- Normalized cuisines and neighborhoods with lookup tables

CREATE TABLE IF NOT EXISTS cuisines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS neighborhoods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS restaurants (
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
);

-- Junction table for many-to-many restaurant<->condition
CREATE TABLE IF NOT EXISTS restaurant_conditions (
  restaurant_id INTEGER NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('foggy', 'night', 'sunny')),
  PRIMARY KEY (restaurant_id, condition),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Index for fast condition lookups
CREATE INDEX IF NOT EXISTS idx_restaurant_conditions_condition
  ON restaurant_conditions(condition);

-- Condition metadata (editable descriptions and tags)
CREATE TABLE IF NOT EXISTS condition_meta (
  condition TEXT PRIMARY KEY CHECK (condition IN ('foggy', 'sunny', 'night')),
  tag TEXT NOT NULL,
  description TEXT NOT NULL
);

-- Site pages (about, etc.) with markdown content
CREATE TABLE IF NOT EXISTS site_pages (
  slug TEXT PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '',
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Seed default about page if not exists
INSERT OR IGNORE INTO site_pages (slug, content) VALUES ('about', 'Welcome to SF Cravings Forecast.');

-- Crawl messages for the bottom ticker bar
CREATE TABLE IF NOT EXISTS crawl_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
