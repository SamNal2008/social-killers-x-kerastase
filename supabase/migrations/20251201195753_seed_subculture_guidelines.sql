-- Migration: Seed subculture guidelines (subtitle, dos, donts)
-- Description: Populates textual guidelines for existing subcultures.

-- FUNCTIONALS / LEGACISTS guidelines used in UI/tests
UPDATE subcultures
SET
  subtitle = 'You make timeless elegance your own',
  dos = '["Choose quality over quantity","Invest in timeless pieces"]'::jsonb,
  donts = '["Follow every trend","Compromise on craftsmanship"]'::jsonb
WHERE name IN ('FUNCTIONALS', 'LEGACISTS');

