-- Migration: Update Tribes, Keywords, Brands, and Subcultures
-- Description:
--   1. Adds 'text' column to subcultures table
--   2. Updates subcultures with subtitle, text, dos, and donts
--   3. Replaces all existing tribes with new 10 tribes (Title Case)
--   4. Updates keywords for new tribes
--   5. Updates brands with tribe relationships
--   6. Cleans up test user data
-- Author: Generated via Claude Code
-- Date: 2025-12-01

-- ============================================================================
-- STEP 1: Clean up test user data (safe to delete)
-- ============================================================================

DELETE FROM user_result_tribes;
DELETE FROM user_results;
DELETE FROM user_answers;

-- ============================================================================
-- STEP 2: Clean up old relationships and data
-- ============================================================================

DELETE FROM keywords;
DELETE FROM tribe_subcultures;
DELETE FROM brands;
DELETE FROM tribes;

-- ============================================================================
-- STEP 3: Add text column to subcultures table
-- ============================================================================

ALTER TABLE subcultures
  ADD COLUMN IF NOT EXISTS text TEXT;

-- ============================================================================
-- STEP 4: Update subcultures with detailed information
-- ============================================================================

-- Update LEGACISTS
UPDATE subcultures
SET
  subtitle = 'Heritage & Timeless Quality',
  text = 'Value heritage, tradition, and timeless quality. Seek products with history and legacy.',
  dos = '[]'::jsonb,
  donts = '[]'::jsonb
WHERE name = 'LEGACISTS';

-- Update FUNCTIONALS
UPDATE subcultures
SET
  subtitle = 'Practicality & Efficiency',
  text = 'Prioritize practicality, efficiency, and purpose. Choose what works best.',
  dos = '[]'::jsonb,
  donts = '[]'::jsonb
WHERE name = 'FUNCTIONALS';

-- Update ROMANTICS
UPDATE subcultures
SET
  subtitle = 'Beauty & Storytelling',
  text = 'Drawn to beauty, storytelling, and emotional connections. Value aesthetics and sentiment.',
  dos = '[]'::jsonb,
  donts = '[]'::jsonb
WHERE name = 'ROMANTICS';

-- Update CURATORS
UPDATE subcultures
SET
  subtitle = 'Curation & Discovery',
  text = 'Appreciate curation, discovery, and unique finds. Enjoy being tastemakers.',
  dos = '[]'::jsonb,
  donts = '[]'::jsonb
WHERE name = 'CURATORS';

-- Update MYSTICS
UPDATE subcultures
SET
  subtitle = 'Spiritual Meaning & Wellness',
  text = 'Seek spiritual meaning, wellness, and self-discovery. Value holistic experiences.',
  dos = '[]'::jsonb,
  donts = '[]'::jsonb
WHERE name = 'MYSTICS';

-- Update UNAPOLOGETICS
UPDATE subcultures
SET
  subtitle = 'Bold & Trend-Forward',
  text = 'Bold, confident, and trend-forward. Make statements and push boundaries.',
  dos = '[]'::jsonb,
  donts = '[]'::jsonb
WHERE name = 'UNAPOLOGETICS';

-- ============================================================================
-- STEP 5: Insert new tribes (10 tribes, Title Case)
-- ============================================================================

INSERT INTO tribes (name, description) VALUES
  -- LEGACISTS Tribes (2)
  ('Heritage Heiress', 'You have a deep appreciation for heritage and tradition, and you bring timeless beauty to everything you touch. Whether it''s classic lines, impeccable craftsmanship, or pieces that carry a story, you know how to make elegance feel personal, meaningful, and effortlessly enduring.'),
  ('Quiet Luxury', 'You live a life where luxury whispers. Experiences matter more than possessions, and subtlety guide your choices. Your style is effortless yet impeccable, from natural beauty routines to curated, intimate spaces. Every detail, from exclusive experiences to quiet elegance, reflects your refinement and confidence.'),

  -- FUNCTIONALS Tribes (2)
  ('Conscious Hedonist', 'You believe joy and ethics can coexist. You savor life''s pleasures: from clean beauty to artisanal food and eco-resorts, always with awareness. Every choice reflects quality, provenance, and care for the world. Experiences matter more than possessions, indulgence is intentional, and your refined taste is consciously luxurious.'),
  ('Clean Ritualists', 'You thrive on clarity, order, and intentionality. Your day flows with precise rituals minimalist skincare, morning matcha, Pilates, and clean scents, while your spaces remain uncluttered and calm. You value science, functionality, and refinement, turning simplicity into quiet confidence and discipline into beauty.'),

  -- ROMANTICS Tribes (1)
  ('Sillage Seeker', 'You live a life where luxury whispers. Experiences matter more than possessions, and subtlety guide your choices. Your style is effortless yet impeccable, from natural beauty routines to curated, intimate spaces. Every detail, from exclusive experiences to quiet elegance, reflects your refinement and confidence.'),

  -- CURATORS Tribes (2)
  ('Urban Muse Energizer', 'You use beauty to express joy, creativity, and individuality. Your hair is a living accessory, shifting with your mood and inspired by art, fashion, and culture. From city streets to everyday life, you blend trends and traditions with playful, effortless style, turning each day into a canvas for self-expression.'),
  ('Stagebreaker', 'You live for the spotlight, turning presence into performance. Every gesture, look, and movement is intentional, amplifying your story and energy. Your beauty performs with you glowing skin, sculpted makeup, and every detail tuned for impact. Whether on stage, on camera, or in daily life, you command attention, transforming visibility into emotion and confidence into art.'),

  -- MYSTICS Tribes (1)
  ('Cosmic Explorer', 'You navigate life guided by signs, energy, and patterns that speak to you beyond logic. Crystals, tarot, and digital tools coexist seamlessly in your space, reflecting your blend of mysticism and modernity. Every ritual — from observing the stars to mindful daily gestures — is an act of exploration, connecting you to the universe and yourself, turning ordinary days into moments of insight and meaning.'),

  -- UNAPOLOGETICS Tribes (2)
  ('Gloss Goddess', 'You live for the spotlight, turning every moment into a statement. Your beauty is armor: flawless, calculated, and ready for impact. From events to elevator mirrors, every movement and detail is intentional, blending luxury and influencer culture to convey power, composure, and confidence.'),
  ('Edgy Aesthetes', 'You turn authenticity into art and rebellion into elegance. Every choice, from clothing to words, is intentional, a manifesto for your truth. You embrace imperfection, raw emotion, and vulnerability, using fashion, beauty, and art to express what others hide. Your energy is electric, your presence powerful, and your style a bold statement of courage and individuality.');

-- ============================================================================
-- STEP 6: Create tribe-subculture relationships
-- ============================================================================

-- LEGACISTS Subculture Tribes
INSERT INTO tribe_subcultures (tribe_id, subculture_id)
SELECT t.id, s.id
FROM tribes t
CROSS JOIN subcultures s
WHERE s.name = 'LEGACISTS'
  AND t.name IN ('Heritage Heiress', 'Quiet Luxury');

-- FUNCTIONALS Subculture Tribes
INSERT INTO tribe_subcultures (tribe_id, subculture_id)
SELECT t.id, s.id
FROM tribes t
CROSS JOIN subcultures s
WHERE s.name = 'FUNCTIONALS'
  AND t.name IN ('Conscious Hedonist', 'Clean Ritualists');

-- ROMANTICS Subculture Tribes
INSERT INTO tribe_subcultures (tribe_id, subculture_id)
SELECT t.id, s.id
FROM tribes t
CROSS JOIN subcultures s
WHERE s.name = 'ROMANTICS'
  AND t.name = 'Sillage Seeker';

-- CURATORS Subculture Tribes
INSERT INTO tribe_subcultures (tribe_id, subculture_id)
SELECT t.id, s.id
FROM tribes t
CROSS JOIN subcultures s
WHERE s.name = 'CURATORS'
  AND t.name IN ('Urban Muse Energizer', 'Stagebreaker');

-- MYSTICS Subculture Tribes
INSERT INTO tribe_subcultures (tribe_id, subculture_id)
SELECT t.id, s.id
FROM tribes t
CROSS JOIN subcultures s
WHERE s.name = 'MYSTICS'
  AND t.name = 'Cosmic Explorer';

-- UNAPOLOGETICS Subculture Tribes
INSERT INTO tribe_subcultures (tribe_id, subculture_id)
SELECT t.id, s.id
FROM tribes t
CROSS JOIN subcultures s
WHERE s.name = 'UNAPOLOGETICS'
  AND t.name IN ('Gloss Goddess', 'Edgy Aesthetes');

-- ============================================================================
-- STEP 7: Insert keywords for each tribe
-- ============================================================================

-- Heritage Heiress keywords
INSERT INTO keywords (name, tribe_id)
SELECT 'legacy', id FROM tribes WHERE name = 'Heritage Heiress'
UNION ALL
SELECT 'tradition', id FROM tribes WHERE name = 'Heritage Heiress';

-- Quiet Luxury keywords
INSERT INTO keywords (name, tribe_id)
SELECT 'discretion', id FROM tribes WHERE name = 'Quiet Luxury'
UNION ALL
SELECT 'exclusivity', id FROM tribes WHERE name = 'Quiet Luxury';

-- Conscious Hedonist keywords
INSERT INTO keywords (name, tribe_id)
SELECT 'pleasure', id FROM tribes WHERE name = 'Conscious Hedonist'
UNION ALL
SELECT 'sustainability', id FROM tribes WHERE name = 'Conscious Hedonist';

-- Clean Ritualists keywords
INSERT INTO keywords (name, tribe_id)
SELECT 'discipline', id FROM tribes WHERE name = 'Clean Ritualists'
UNION ALL
SELECT 'minimalism', id FROM tribes WHERE name = 'Clean Ritualists';

-- Sillage Seeker keywords
INSERT INTO keywords (name, tribe_id)
SELECT 'home rituals', id FROM tribes WHERE name = 'Sillage Seeker'
UNION ALL
SELECT 'quiet beauty', id FROM tribes WHERE name = 'Sillage Seeker';

-- Cosmic Explorer keywords
INSERT INTO keywords (name, tribe_id)
SELECT 'introspective', id FROM tribes WHERE name = 'Cosmic Explorer'
UNION ALL
SELECT 'magnetic', id FROM tribes WHERE name = 'Cosmic Explorer';

-- Urban Muse Energizer keywords
INSERT INTO keywords (name, tribe_id)
SELECT 'creative', id FROM tribes WHERE name = 'Urban Muse Energizer'
UNION ALL
SELECT 'culturally fluent', id FROM tribes WHERE name = 'Urban Muse Energizer';

-- Stagebreaker keywords
INSERT INTO keywords (name, tribe_id)
SELECT 'performance', id FROM tribes WHERE name = 'Stagebreaker'
UNION ALL
SELECT 'bold attitude', id FROM tribes WHERE name = 'Stagebreaker';

-- Gloss Goddess keywords
INSERT INTO keywords (name, tribe_id)
SELECT 'provocation', id FROM tribes WHERE name = 'Gloss Goddess'
UNION ALL
SELECT 'fearless voice', id FROM tribes WHERE name = 'Gloss Goddess';

-- Edgy Aesthetes keywords
INSERT INTO keywords (name, tribe_id)
SELECT 'glow', id FROM tribes WHERE name = 'Edgy Aesthetes'
UNION ALL
SELECT 'red carpet energy', id FROM tribes WHERE name = 'Edgy Aesthetes';

-- ============================================================================
-- STEP 8: Insert brands with tribe relationships
-- ============================================================================

-- Heritage Heiress brands
INSERT INTO brands (name, logo_url, tribe_id)
SELECT 'Hermès', 'https://placeholder.com/hermes-logo.png', id FROM tribes WHERE name = 'Heritage Heiress'
UNION ALL
SELECT 'Cartier', 'https://placeholder.com/cartier-logo.png', id FROM tribes WHERE name = 'Heritage Heiress';

-- Quiet Luxury brands
INSERT INTO brands (name, logo_url, tribe_id)
SELECT 'The Row', 'https://placeholder.com/therow-logo.png', id FROM tribes WHERE name = 'Quiet Luxury'
UNION ALL
SELECT 'Loro Piana', 'https://placeholder.com/loropiana-logo.png', id FROM tribes WHERE name = 'Quiet Luxury';

-- Conscious Hedonist brands
INSERT INTO brands (name, logo_url, tribe_id)
SELECT 'Aesop', 'https://placeholder.com/aesop-logo.png', id FROM tribes WHERE name = 'Conscious Hedonist'
UNION ALL
SELECT 'Stella McCartney', 'https://placeholder.com/stellamccartney-logo.png', id FROM tribes WHERE name = 'Conscious Hedonist';

-- Clean Ritualists brands
INSERT INTO brands (name, logo_url, tribe_id)
SELECT 'SkinCeuticals', 'https://placeholder.com/skinceuticals-logo.png', id FROM tribes WHERE name = 'Clean Ritualists'
UNION ALL
SELECT 'Goop Beauty', 'https://placeholder.com/goopbeauty-logo.png', id FROM tribes WHERE name = 'Clean Ritualists';

-- Sillage Seeker brands
INSERT INTO brands (name, logo_url, tribe_id)
SELECT 'Chloé', 'https://placeholder.com/chloe-logo.png', id FROM tribes WHERE name = 'Sillage Seeker'
UNION ALL
SELECT 'Miu Miu', 'https://placeholder.com/miumiu-logo.png', id FROM tribes WHERE name = 'Sillage Seeker';

-- Cosmic Explorer brands
INSERT INTO brands (name, logo_url, tribe_id)
SELECT 'Serge Lutens', 'https://placeholder.com/sergelutens-logo.png', id FROM tribes WHERE name = 'Cosmic Explorer'
UNION ALL
SELECT 'Maison Margiela', 'https://placeholder.com/maisonmargiela-logo.png', id FROM tribes WHERE name = 'Cosmic Explorer';

-- Urban Muse Energizer brands
INSERT INTO brands (name, logo_url, tribe_id)
SELECT 'Ganni', 'https://placeholder.com/ganni-logo.png', id FROM tribes WHERE name = 'Urban Muse Energizer'
UNION ALL
SELECT 'Glossier', 'https://placeholder.com/glossier-logo.png', id FROM tribes WHERE name = 'Urban Muse Energizer';

-- Stagebreaker brands
INSERT INTO brands (name, tribe_id, logo_url)
SELECT 'MAC Cosmetics', id, 'https://placeholder.com/mac-logo.png' FROM tribes WHERE name = 'Stagebreaker'
UNION ALL
SELECT 'GHD', id, 'https://placeholder.com/ghd-logo.png' FROM tribes WHERE name = 'Stagebreaker';

-- Gloss Goddess brands
INSERT INTO brands (name, logo_url, tribe_id)
SELECT 'YSL Beauty', 'https://placeholder.com/yslbeauty-logo.png', id FROM tribes WHERE name = 'Gloss Goddess'
UNION ALL
SELECT 'Tom Ford', 'https://placeholder.com/tomford-logo.png', id FROM tribes WHERE name = 'Gloss Goddess';

-- Edgy Aesthetes brands
INSERT INTO brands (name, logo_url, tribe_id)
SELECT 'Diesel', 'https://placeholder.com/diesel-logo.png', id FROM tribes WHERE name = 'Edgy Aesthetes'
UNION ALL
SELECT 'Gentle Monster', 'https://placeholder.com/gentlemonster-logo.png', id FROM tribes WHERE name = 'Edgy Aesthetes';

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN subcultures.text IS 'Detailed description text for the subculture';
COMMENT ON COLUMN subcultures.subtitle IS 'Short subtitle/tagline for the subculture';
COMMENT ON COLUMN subcultures.dos IS 'JSON array of recommended actions for this subculture';
COMMENT ON COLUMN subcultures.donts IS 'JSON array of actions to avoid for this subculture';
