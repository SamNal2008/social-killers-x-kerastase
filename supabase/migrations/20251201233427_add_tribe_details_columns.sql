-- Migration: Add Detail Columns to Tribes Table
-- Description: Adds subtitle, text, dos, and donts columns to tribes table
--              and populates them with tribe-specific content
-- Author: Generated via Claude Code
-- Date: 2025-12-01

-- ============================================================================
-- STEP 1: Add columns to tribes table
-- ============================================================================

ALTER TABLE tribes
  ADD COLUMN IF NOT EXISTS subtitle TEXT,
  ADD COLUMN IF NOT EXISTS text TEXT,
  ADD COLUMN IF NOT EXISTS dos JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS donts JSONB DEFAULT '[]'::jsonb;

-- ============================================================================
-- STEP 2: Update each tribe with their specific content
-- ============================================================================

-- Heritage Heiress
UPDATE tribes
SET
  subtitle = 'You make timeless elegance your own.',
  text = 'You have a deep appreciation for heritage and tradition, and you bring timeless beauty to everything you touch. Whether it''s classic lines, impeccable craftsmanship, or pieces that carry a story, you know how to make elegance feel personal, meaningful, and effortlessly enduring.',
  dos = '["Choose quality over quantity.", "Keep it classic", "Notice the details"]'::jsonb,
  donts = '["Skip the story", "Overdo it", "Settle for \"just okay\""]'::jsonb
WHERE name = 'Heritage Heiress';

-- Quiet Luxury
UPDATE tribes
SET
  subtitle = 'You thrive on quality, not showiness.',
  text = 'You live a life where luxury whispers. Experiences matter more than possessions, and subtlety guide your choices. Your style is effortless yet impeccable, from natural beauty routines to curated, intimate spaces. Every detail, from exclusive experiences to quiet elegance, reflects your refinement and confidence.',
  dos = '["Let discretion speak", "Curate intimate spaces", "Choose subtle elegance"]'::jsonb,
  donts = '["Clutter your space", "Overcomplicate your look", "Show off brands loudly"]'::jsonb
WHERE name = 'Quiet Luxury';

-- Conscious Hedonist
UPDATE tribes
SET
  subtitle = 'You combine refined taste with conscious choices.',
  text = 'You believe joy and ethics can coexist. You savor life''s pleasures: from clean beauty to artisanal food and eco-resorts, always with awareness. Every choice reflects quality, provenance, and care for the world. Experiences matter more than possessions, indulgence is intentional, and your refined taste is consciously luxurious.',
  dos = '["Savor experiences, not just things", "Align self-care with care for the world", "Appreciate craftsmanship"]'::jsonb,
  donts = '["Overconsume", "Sacrifice quality", "Follow trends blindly"]'::jsonb
WHERE name = 'Conscious Hedonist';

-- Clean Ritualists
UPDATE tribes
SET
  subtitle = 'You curate your world with quiet confidence.',
  text = 'You thrive on clarity, order, and intentionality. Your day flows with precise rituals minimalist skincare, morning matcha, Pilates, and clean scents, while your spaces remain uncluttered and calm. You value science, functionality, and refinement, turning simplicity into quiet confidence and discipline into beauty.',
  dos = '["Create order in your day", "Prioritize credibility", "Embrace calm"]'::jsonb,
  donts = '["Skip rituals", "Neglect precision", "Overcomplicate"]'::jsonb
WHERE name = 'Clean Ritualists';

-- Sillage Seeker
UPDATE tribes
SET
  subtitle = 'You curate moments that soothe the senses.',
  text = 'You live a life where luxury whispers. Experiences matter more than possessions, and subtlety guide your choices. Your style is effortless yet impeccable, from natural beauty routines to curated, intimate spaces. Every detail, from exclusive experiences to quiet elegance, reflects your refinement and confidence.',
  dos = '["Savor slow", "Leave a personal signature", "Blend beauty and fragrance"]'::jsonb,
  donts = '["Rush your routines", "Treat self-care as a trend", "Skip moments of reflexion"]'::jsonb
WHERE name = 'Sillage Seeker';

-- Cosmic Explorer
UPDATE tribes
SET
  subtitle = 'You see the invisible threads that connect everything.',
  text = 'You navigate life guided by signs, energy, and patterns that speak to you beyond logic. Crystals, tarot, and digital tools coexist seamlessly in your space, reflecting your blend of mysticism and modernity. Every ritual — from observing the stars to mindful daily gestures — is an act of exploration, connecting you to the universe and yourself, turning ordinary days into moments of insight and meaning.',
  dos = '["Follow your intuition", "Seek meaning in the everyday", "Curate symbolic objects with care"]'::jsonb,
  donts = '["Limit yourself to logic alone", "Lose connection with your cosmic self", "Treat rituals as superficials"]'::jsonb
WHERE name = 'Cosmic Explorer';

-- Urban Muse Energizer
UPDATE tribes
SET
  subtitle = 'You thrive on creativity, motion, and cultural inspiration.',
  text = 'You use beauty to express joy, creativity, and individuality. Your hair is a living accessory, shifting with your mood and inspired by art, fashion, and culture. From city streets to everyday life, you blend trends and traditions with playful, effortless style, turning each day into a canvas for self-expression.',
  dos = '["Draw inspiration from art and culture", "Play with colors", "Celebrate individuality"]'::jsonb,
  donts = '["Fear bold choices", "Forget joy in self-expression", "Limit yourself to one aesthetic"]'::jsonb
WHERE name = 'Urban Muse Energizer';

-- Stagebreaker
UPDATE tribes
SET
  subtitle = 'You move, speak, and shine with intention.',
  text = 'You live for the spotlight, turning presence into performance. Every gesture, look, and movement is intentional, amplifying your story and energy. Your beauty performs with you glowing skin, sculpted makeup, and every detail tuned for impact. Whether on stage, on camera, or in daily life, you command attention, transforming visibility into emotion and confidence into art.',
  dos = '["Celebrate energy", "Use movement with intent", "Make every detail perform"]'::jsonb,
  donts = '["Hold back confidence", "Treat beauty as passive", "Neglect your presence"]'::jsonb
WHERE name = 'Stagebreaker';

-- Gloss Goddess
UPDATE tribes
SET
  subtitle = 'You move through life flawlessly, always in the spotlight.',
  text = 'You live for the spotlight, turning every moment into a statement. Your beauty is armor: flawless, calculated, and ready for impact. From events to elevator mirrors, every movement and detail is intentional, blending luxury and influencer culture to convey power, composure, and confidence.',
  dos = '["Blend glamour with control", "Move with intention", "Master precision"]'::jsonb,
  donts = '["Neglect your presence", "Overlook the power of detail", "Underestimate visibility"]'::jsonb
WHERE name = 'Gloss Goddess';

-- Edgy Aesthetes
UPDATE tribes
SET
  subtitle = 'You make imperfection your signature.',
  text = 'You turn authenticity into art and rebellion into elegance. Every choice, from clothing to words, is intentional, a manifesto for your truth. You embrace imperfection, raw emotion, and vulnerability, using fashion, beauty, and art to express what others hide. Your energy is electric, your presence powerful, and your style a bold statement of courage and individuality.',
  dos = '["Channel raw emotion into creativity", "Express authenticity", "Challenge norms thoughtfully"]'::jsonb,
  donts = '["Conform for comfort", "Dilute your presence", "Chase perfection"]'::jsonb
WHERE name = 'Edgy Aesthetes';

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN tribes.subtitle IS 'Short subtitle/tagline for the tribe';
COMMENT ON COLUMN tribes.text IS 'Detailed description text for the tribe';
COMMENT ON COLUMN tribes.dos IS 'JSON array of recommended actions for this tribe';
COMMENT ON COLUMN tribes.donts IS 'JSON array of actions to avoid for this tribe';
