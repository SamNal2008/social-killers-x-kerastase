-- Seed initial subcultures and tribes data
-- This migration populates the database with the cultural framework

-- Insert Subcultures
INSERT INTO subcultures (name, description) VALUES
  ('LEGACISTS', 'Value heritage, tradition, and timeless quality. Seek products with history and legacy.'),
  ('FUNCTIONALS', 'Prioritize practicality, efficiency, and purpose. Choose what works best.'),
  ('ROMANTICS', 'Drawn to beauty, storytelling, and emotional connections. Value aesthetics and sentiment.'),
  ('CURATORS', 'Appreciate curation, discovery, and unique finds. Enjoy being tastemakers.'),
  ('MYSTICS', 'Seek spiritual meaning, wellness, and self-discovery. Value holistic experiences.'),
  ('UNAPOLOGETICS', 'Bold, confident, and trend-forward. Make statements and push boundaries.');

-- Insert Tribes
INSERT INTO tribes (name, description) VALUES
  -- LEGACISTS Tribes
  ('HERITAGE HEIRESS', 'LEGACISTS - Values classic luxury and timeless elegance'),
  ('QUIET LUXURY', 'LEGACISTS - Appreciates understated quality and refined taste'),
  ('FEMME FATALE', 'LEGACISTS - Embraces bold femininity with vintage charm'),

  -- FUNCTIONALS Tribes
  ('CLEAN RITUALIST', 'FUNCTIONALS - Minimalist approach to beauty and wellness'),
  ('LONGEVITY RITUALIST', 'FUNCTIONALS - Focuses on long-term health and sustainable practices'),
  ('CONSCIOUS HEDONIST', 'FUNCTIONALS - Balances pleasure with mindful choices'),

  -- ROMANTICS Tribes
  ('SENSORIALIST', 'ROMANTICS - Seeks sensory experiences and emotional depth'),
  ('SILLAGE SEEKER', 'ROMANTICS - Drawn to lasting impressions and memorable scents'),
  ('LITERARY', 'ROMANTICS - Finds beauty in stories and narratives'),
  ('EMOTIONAL CREATOR', 'ROMANTICS - Expresses through art and creative outlets'),
  ('SISTERHOOD KEEPER', 'ROMANTICS - Values community and feminine bonds'),

  -- CURATORS Tribes
  ('CULTURE GURU', 'CURATORS - Expert in trends and cultural movements'),
  ('URBAN MUSE ENERGIZER', 'CURATORS - Inspires through city culture and energy'),
  ('STAGEBREAKER', 'CURATORS - Sets trends and breaks conventions'),

  -- MYSTICS Tribes
  ('SOUL HEALER', 'MYSTICS - Focuses on spiritual wellness and healing'),
  ('COSMIC EXPLORER', 'MYSTICS - Seeks metaphysical experiences and consciousness'),
  ('SACRED FEMININE', 'MYSTICS - Connects with divine feminine energy'),

  -- UNAPOLOGETICS Tribes
  ('MISFIT', 'UNAPOLOGETICS - Proudly different and unconventional'),
  ('EARLY ADOPTER', 'UNAPOLOGETICS - First to embrace new trends'),
  ('EDGY AESTHETE', 'UNAPOLOGETICS - Bold artistic expression'),
  ('STATUS SIREN', 'UNAPOLOGETICS - Commands attention and prestige');
