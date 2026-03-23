CREATE TABLE IF NOT EXISTS project_listing_price_overrides (
  tracker_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  base_price REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (tracker_id, listing_id)
);

CREATE TABLE IF NOT EXISTS project_variation_price_overrides (
  tracker_id TEXT NOT NULL,
  variation_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  base_price REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (tracker_id, variation_id)
);

CREATE INDEX IF NOT EXISTS idx_project_variation_price_overrides_listing
  ON project_variation_price_overrides (tracker_id, listing_id);

CREATE TABLE IF NOT EXISTS project_listing_shipping_overrides (
  tracker_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  shipping_price REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (tracker_id, listing_id)
);

CREATE TABLE IF NOT EXISTS pakistani_jackets_listings (
  listing_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image TEXT,
  images TEXT NOT NULL DEFAULT '[]',
  url TEXT,
  currency TEXT NOT NULL DEFAULT 'GBP',
  base_price REAL NOT NULL DEFAULT 0,
  shipping_price REAL,
  ended INTEGER NOT NULL DEFAULT 0,
  out_of_stock INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pakistani_jackets_variations (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL,
  var_id TEXT NOT NULL,
  name TEXT,
  currency TEXT NOT NULL DEFAULT 'GBP',
  base_price REAL NOT NULL DEFAULT 0,
  out_of_stock INTEGER NOT NULL DEFAULT 0,
  selects TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (listing_id) REFERENCES pakistani_jackets_listings(listing_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pakistani_jackets_variations_listing
  ON pakistani_jackets_variations (listing_id);

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  tracker_id TEXT,
  listing_id TEXT,
  variation_id TEXT,
  details TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
