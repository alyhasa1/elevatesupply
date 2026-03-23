CREATE TABLE IF NOT EXISTS project_listing_content_overrides (
  tracker_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  description TEXT,
  image TEXT,
  images TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (tracker_id, listing_id)
);

CREATE TABLE IF NOT EXISTS project_variation_media_overrides (
  tracker_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  variation_id TEXT NOT NULL,
  hero_image TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (tracker_id, variation_id)
);

CREATE INDEX IF NOT EXISTS idx_project_variation_media_overrides_listing
  ON project_variation_media_overrides (tracker_id, listing_id);

ALTER TABLE pakistani_jackets_variations
  ADD COLUMN hero_image TEXT;
