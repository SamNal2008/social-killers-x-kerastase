-- Seed file for local development testing
-- This file creates test data for local development only
-- NOTE: Moodboards are seeded in migrations - this file only adds test users/answers

-- ============================================================================
-- STEP 1: Insert test users
-- ============================================================================

INSERT INTO users (name, connection_date) VALUES
  ('Alice Heritage', NOW()),
  ('Bob Minimalist', NOW()),
  ('Carol Romantic', NOW());

-- ============================================================================
-- STEP 2: Insert test user answers
-- ============================================================================

DO $$
DECLARE
  user_alice_id UUID;
  user_bob_id UUID;
  user_carol_id UUID;

  moodboard_legacists_id UUID;
  moodboard_functionals_id UUID;
  moodboard_romantics_id UUID;

  legacists_id UUID;
  functionals_id UUID;
  romantics_id UUID;

  keyword_legacy_id UUID;
  keyword_tradition_id UUID;
  keyword_discipline_id UUID;
  keyword_minimalism_id UUID;
  keyword_home_rituals_id UUID;
  keyword_quiet_beauty_id UUID;
BEGIN
  -- Get user IDs
  SELECT id INTO user_alice_id FROM users WHERE name = 'Alice Heritage';
  SELECT id INTO user_bob_id FROM users WHERE name = 'Bob Minimalist';
  SELECT id INTO user_carol_id FROM users WHERE name = 'Carol Romantic';

  -- Get subculture IDs
  SELECT id INTO legacists_id FROM subcultures WHERE name = 'LEGACISTS';
  SELECT id INTO functionals_id FROM subcultures WHERE name = 'FUNCTIONALS';
  SELECT id INTO romantics_id FROM subcultures WHERE name = 'ROMANTICS';

  -- Get moodboard IDs via subculture link
  SELECT id INTO moodboard_legacists_id FROM moodboards WHERE subculture_id = legacists_id;
  SELECT id INTO moodboard_functionals_id FROM moodboards WHERE subculture_id = functionals_id;
  SELECT id INTO moodboard_romantics_id FROM moodboards WHERE subculture_id = romantics_id;

  -- Get keyword IDs (from migration data)
  SELECT id INTO keyword_legacy_id FROM keywords WHERE name = 'legacy';
  SELECT id INTO keyword_tradition_id FROM keywords WHERE name = 'tradition';
  SELECT id INTO keyword_discipline_id FROM keywords WHERE name = 'discipline';
  SELECT id INTO keyword_minimalism_id FROM keywords WHERE name = 'minimalism';
  SELECT id INTO keyword_home_rituals_id FROM keywords WHERE name = 'home rituals';
  SELECT id INTO keyword_quiet_beauty_id FROM keywords WHERE name = 'quiet beauty';

  -- Alice's answer (LEGACISTS subculture)
  INSERT INTO user_answers (user_id, moodboard_id, brands, keywords) VALUES
    (user_alice_id, moodboard_legacists_id,
     ARRAY[]::UUID[],
     ARRAY[keyword_legacy_id, keyword_tradition_id]);

  -- Bob's answer (FUNCTIONALS subculture)
  INSERT INTO user_answers (user_id, moodboard_id, brands, keywords) VALUES
    (user_bob_id, moodboard_functionals_id,
     ARRAY[]::UUID[],
     ARRAY[keyword_discipline_id, keyword_minimalism_id]);

  -- Carol's answer (ROMANTICS subculture)
  INSERT INTO user_answers (user_id, moodboard_id, brands, keywords) VALUES
    (user_carol_id, moodboard_romantics_id,
     ARRAY[]::UUID[],
     ARRAY[keyword_home_rituals_id, keyword_quiet_beauty_id]);
END $$;

-- ============================================================================
-- Display summary
-- ============================================================================

SELECT
  'Data seeding complete!' as status,
  (SELECT COUNT(*) FROM brands) as brands,
  (SELECT COUNT(*) FROM moodboards) as moodboards,
  (SELECT COUNT(*) FROM subcultures) as subcultures,
  (SELECT COUNT(*) FROM tribes) as tribes,
  (SELECT COUNT(*) FROM keywords) as keywords,
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM user_answers) as user_answers;
