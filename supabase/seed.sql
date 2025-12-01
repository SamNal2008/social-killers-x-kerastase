-- Seed file for local development testing
-- This file creates test data including moodboards, brands, users, and user answers

-- Insert test brands
INSERT INTO brands (name, logo_url) VALUES
  ('Chanel', 'https://example.com/chanel-logo.png'),
  ('Dior', 'https://example.com/dior-logo.png'),
  ('Guerlain', 'https://example.com/guerlain-logo.png'),
  ('Hermès', 'https://example.com/hermes-logo.png'),
  ('Tom Ford', 'https://example.com/tomford-logo.png'),
  ('Le Labo', 'https://example.com/lelabo-logo.png'),
  ('Byredo', 'https://example.com/byredo-logo.png'),
  ('Diptyque', 'https://example.com/diptyque-logo.png');

-- Insert new moodboards (10 options)
INSERT INTO moodboards (name, description) VALUES
  ('HERITAGE HEIRESS', 'Heritage Heiresses embody the continuity of family legacy and timeless elegance.'),
  ('QUIET LUXURY', 'Quiet Luxury is luxury without ostentation, focusing on quality and subtlety.'),
  ('Conscious Hedonists', 'Seeking pleasure and experiences while maintaining ethical and sustainable values.'),
  ('CLEAN RITUALIST', 'Purist approach to beauty and lifestyle, valuing transparency and simplicity.'),
  ('SILLAGE SEEKERS', 'Those who leave a mark through scent and presence, bold and memorable.'),
  ('URBAN MUSE ENERGIZER', 'Drawing inspiration from the city energy, dynamic and constantly moving.'),
  ('STAGEBREAKERS', 'Breaking conventions and taking center stage with innovative styles.'),
  ('THE COSMIC EXPLORER', 'Looking to the stars and future, exploring new dimensions of beauty.'),
  ('EDGY AESTHETES', 'Pushing boundaries with sharp, unconventional, and artistic choices.'),
  ('GLOSS GODDESSES', 'Radiant, high-shine, and glamorous, celebrating diverse beauty.');

-- Link brands to moodboards (store IDs for reference)
DO $$
DECLARE
  brand_chanel_id UUID;
  brand_dior_id UUID;
  brand_guerlain_id UUID;
  brand_hermes_id UUID;
  brand_lelabo_id UUID;
  brand_byredo_id UUID;

  moodboard_heritage_id UUID;
  moodboard_quiet_id UUID;
  moodboard_conscious_id UUID;
  moodboard_clean_id UUID;
  moodboard_sillage_id UUID;
BEGIN
  -- Get brand IDs
  SELECT id INTO brand_chanel_id FROM brands WHERE name = 'Chanel';
  SELECT id INTO brand_dior_id FROM brands WHERE name = 'Dior';
  SELECT id INTO brand_guerlain_id FROM brands WHERE name = 'Guerlain';
  SELECT id INTO brand_hermes_id FROM brands WHERE name = 'Hermès';
  SELECT id INTO brand_lelabo_id FROM brands WHERE name = 'Le Labo';
  SELECT id INTO brand_byredo_id FROM brands WHERE name = 'Byredo';

  -- Get moodboard IDs
  SELECT id INTO moodboard_heritage_id FROM moodboards WHERE name = 'HERITAGE HEIRESS';
  SELECT id INTO moodboard_quiet_id FROM moodboards WHERE name = 'QUIET LUXURY';
  SELECT id INTO moodboard_conscious_id FROM moodboards WHERE name = 'Conscious Hedonists';
  SELECT id INTO moodboard_clean_id FROM moodboards WHERE name = 'CLEAN RITUALIST';
  SELECT id INTO moodboard_sillage_id FROM moodboards WHERE name = 'SILLAGE SEEKERS';

  -- Link brands to HERITAGE HEIRESS
  INSERT INTO moodboard_brands (moodboard_id, brand_id) VALUES
    (moodboard_heritage_id, brand_chanel_id),
    (moodboard_heritage_id, brand_dior_id),
    (moodboard_heritage_id, brand_hermes_id);

  -- Link brands to QUIET LUXURY
  INSERT INTO moodboard_brands (moodboard_id, brand_id) VALUES
    (moodboard_quiet_id, brand_lelabo_id),
    (moodboard_quiet_id, brand_byredo_id);

  -- Link brands to Conscious Hedonists
  INSERT INTO moodboard_brands (moodboard_id, brand_id) VALUES
    (moodboard_conscious_id, brand_guerlain_id),
    (moodboard_conscious_id, brand_dior_id);
END $$;

-- Assign tribes to brands
DO $$
DECLARE
  heritage_heiress_id UUID;
  quiet_luxury_id UUID;
  sensorialist_id UUID;

  brand_chanel_id UUID;
  brand_dior_id UUID;
  brand_guerlain_id UUID;
  brand_hermes_id UUID;
  brand_tomford_id UUID;
  brand_lelabo_id UUID;
  brand_byredo_id UUID;
  brand_diptyque_id UUID;
BEGIN
  -- Get tribe IDs
  SELECT id INTO heritage_heiress_id FROM tribes WHERE name = 'HERITAGE HEIRESS';
  SELECT id INTO quiet_luxury_id FROM tribes WHERE name = 'QUIET LUXURY';
  SELECT id INTO sensorialist_id FROM tribes WHERE name = 'SENSORIALIST';

  -- Get brand IDs
  SELECT id INTO brand_chanel_id FROM brands WHERE name = 'Chanel';
  SELECT id INTO brand_dior_id FROM brands WHERE name = 'Dior';
  SELECT id INTO brand_guerlain_id FROM brands WHERE name = 'Guerlain';
  SELECT id INTO brand_hermes_id FROM brands WHERE name = 'Hermès';
  SELECT id INTO brand_tomford_id FROM brands WHERE name = 'Tom Ford';
  SELECT id INTO brand_lelabo_id FROM brands WHERE name = 'Le Labo';
  SELECT id INTO brand_byredo_id FROM brands WHERE name = 'Byredo';
  SELECT id INTO brand_diptyque_id FROM brands WHERE name = 'Diptyque';

  -- Assign tribes to brands
  UPDATE brands SET tribe_id = heritage_heiress_id WHERE id = brand_chanel_id;
  UPDATE brands SET tribe_id = heritage_heiress_id WHERE id = brand_dior_id;
  UPDATE brands SET tribe_id = heritage_heiress_id WHERE id = brand_guerlain_id;
  UPDATE brands SET tribe_id = quiet_luxury_id WHERE id = brand_hermes_id;
  UPDATE brands SET tribe_id = quiet_luxury_id WHERE id = brand_tomford_id;
  UPDATE brands SET tribe_id = sensorialist_id WHERE id = brand_lelabo_id;
  UPDATE brands SET tribe_id = sensorialist_id WHERE id = brand_byredo_id;
  UPDATE brands SET tribe_id = sensorialist_id WHERE id = brand_diptyque_id;
END $$;

-- Link moodboards to subcultures and setup tribe-subculture relationships
DO $$
DECLARE
  legacists_id UUID;
  functionals_id UUID;
  romantics_id UUID;
  curators_id UUID;
  mystics_id UUID;
  unapologetics_id UUID;

  heritage_heiress_id UUID;
  quiet_luxury_id UUID;
  clean_ritualist_id UUID;
  sensorialist_id UUID;
  culture_guru_id UUID;
  soul_healer_id UUID;
  misfit_id UUID;

  moodboard_heritage_id UUID;
  moodboard_quiet_id UUID;
  moodboard_conscious_id UUID;
  moodboard_clean_id UUID;
  moodboard_sillage_id UUID;
BEGIN
  -- Get subculture IDs
  SELECT id INTO legacists_id FROM subcultures WHERE name = 'LEGACISTS';
  SELECT id INTO functionals_id FROM subcultures WHERE name = 'FUNCTIONALS';
  SELECT id INTO romantics_id FROM subcultures WHERE name = 'ROMANTICS';
  SELECT id INTO curators_id FROM subcultures WHERE name = 'CURATORS';
  SELECT id INTO mystics_id FROM subcultures WHERE name = 'MYSTICS';
  SELECT id INTO unapologetics_id FROM subcultures WHERE name = 'UNAPOLOGETICS';

  -- Get some tribe IDs for examples
  SELECT id INTO heritage_heiress_id FROM tribes WHERE name = 'HERITAGE HEIRESS';
  SELECT id INTO quiet_luxury_id FROM tribes WHERE name = 'QUIET LUXURY';
  SELECT id INTO clean_ritualist_id FROM tribes WHERE name = 'CLEAN RITUALIST';
  SELECT id INTO sensorialist_id FROM tribes WHERE name = 'SENSORIALIST';
  SELECT id INTO culture_guru_id FROM tribes WHERE name = 'CULTURE GURU';
  SELECT id INTO soul_healer_id FROM tribes WHERE name = 'SOUL HEALER';
  SELECT id INTO misfit_id FROM tribes WHERE name = 'MISFIT';

  -- Get moodboard IDs
  SELECT id INTO moodboard_heritage_id FROM moodboards WHERE name = 'HERITAGE HEIRESS';
  SELECT id INTO moodboard_quiet_id FROM moodboards WHERE name = 'QUIET LUXURY';
  SELECT id INTO moodboard_conscious_id FROM moodboards WHERE name = 'Conscious Hedonists';
  SELECT id INTO moodboard_clean_id FROM moodboards WHERE name = 'CLEAN RITUALIST';
  SELECT id INTO moodboard_sillage_id FROM moodboards WHERE name = 'SILLAGE SEEKERS';

  -- Link moodboards to subcultures (1:1) and add placeholder images
  UPDATE moodboards SET 
    subculture_id = legacists_id,
    image_url = 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=600&fit=crop'
  WHERE id = moodboard_heritage_id;
  
  UPDATE moodboards SET 
    subculture_id = functionals_id,
    image_url = 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=600&fit=crop'
  WHERE id = moodboard_quiet_id;
  
  UPDATE moodboards SET 
    subculture_id = romantics_id,
    image_url = 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop'
  WHERE id = moodboard_conscious_id;
  
  UPDATE moodboards SET 
    subculture_id = curators_id,
    image_url = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=600&fit=crop'
  WHERE id = moodboard_clean_id;
  
  UPDATE moodboards SET 
    subculture_id = mystics_id,
    image_url = 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=400&h=600&fit=crop'
  WHERE id = moodboard_sillage_id;

  -- Note: tribe_subcultures relationships are already seeded in migration 20251201000000_seed_tribe_subcultures.sql

  -- Insert keywords linked to tribes (not subcultures)
  INSERT INTO keywords (name, tribe_id) VALUES
    ('heritage', heritage_heiress_id),
    ('classic', heritage_heiress_id),
    ('timeless', heritage_heiress_id),
    ('luxury', quiet_luxury_id),
    ('traditional', quiet_luxury_id),
    ('minimalist', clean_ritualist_id),
    ('clean', clean_ritualist_id),
    ('efficient', clean_ritualist_id),
    ('romantic', sensorialist_id),
    ('vintage', sensorialist_id),
    ('emotional', sensorialist_id),
    ('trendy', culture_guru_id),
    ('urban', culture_guru_id),
    ('curator', culture_guru_id),
    ('spiritual', soul_healer_id),
    ('wellness', soul_healer_id),
    ('holistic', soul_healer_id),
    ('bold', misfit_id),
    ('edgy', misfit_id),
    ('trendsetter', misfit_id);
END $$;

-- Insert test user
INSERT INTO users (name, connection_date) VALUES
  ('Alice Heritage', NOW()),
  ('Bob Minimalist', NOW()),
  ('Carol Romantic', NOW());

-- Insert test user answers
DO $$
DECLARE
  user_alice_id UUID;
  user_bob_id UUID;
  user_carol_id UUID;

  moodboard_heritage_id UUID;
  moodboard_quiet_id UUID;
  moodboard_conscious_id UUID;

  brand_chanel_id UUID;
  brand_dior_id UUID;
  brand_lelabo_id UUID;
  brand_byredo_id UUID;
  brand_guerlain_id UUID;

  keyword_heritage_id UUID;
  keyword_classic_id UUID;
  keyword_minimalist_id UUID;
  keyword_clean_id UUID;
  keyword_romantic_id UUID;
  keyword_vintage_id UUID;
BEGIN
  -- Get user IDs
  SELECT id INTO user_alice_id FROM users WHERE name = 'Alice Heritage';
  SELECT id INTO user_bob_id FROM users WHERE name = 'Bob Minimalist';
  SELECT id INTO user_carol_id FROM users WHERE name = 'Carol Romantic';

  -- Get moodboard IDs
  SELECT id INTO moodboard_heritage_id FROM moodboards WHERE name = 'HERITAGE HEIRESS';
  SELECT id INTO moodboard_quiet_id FROM moodboards WHERE name = 'QUIET LUXURY';
  SELECT id INTO moodboard_conscious_id FROM moodboards WHERE name = 'Conscious Hedonists';

  -- Get brand IDs
  SELECT id INTO brand_chanel_id FROM brands WHERE name = 'Chanel';
  SELECT id INTO brand_dior_id FROM brands WHERE name = 'Dior';
  SELECT id INTO brand_lelabo_id FROM brands WHERE name = 'Le Labo';
  SELECT id INTO brand_byredo_id FROM brands WHERE name = 'Byredo';
  SELECT id INTO brand_guerlain_id FROM brands WHERE name = 'Guerlain';

  -- Get keyword IDs
  SELECT id INTO keyword_heritage_id FROM keywords WHERE name = 'heritage';
  SELECT id INTO keyword_classic_id FROM keywords WHERE name = 'classic';
  SELECT id INTO keyword_minimalist_id FROM keywords WHERE name = 'minimalist';
  SELECT id INTO keyword_clean_id FROM keywords WHERE name = 'clean';
  SELECT id INTO keyword_romantic_id FROM keywords WHERE name = 'romantic';
  SELECT id INTO keyword_vintage_id FROM keywords WHERE name = 'vintage';

  -- Alice's answer
  INSERT INTO user_answers (user_id, moodboard_id, brands, keywords) VALUES
    (user_alice_id, moodboard_heritage_id,
     ARRAY[brand_chanel_id, brand_dior_id],
     ARRAY[keyword_heritage_id, keyword_classic_id]);

  -- Bob's answer
  INSERT INTO user_answers (user_id, moodboard_id, brands, keywords) VALUES
    (user_bob_id, moodboard_quiet_id,
     ARRAY[brand_lelabo_id, brand_byredo_id],
     ARRAY[keyword_minimalist_id, keyword_clean_id]);

  -- Carol's answer
  INSERT INTO user_answers (user_id, moodboard_id, brands, keywords) VALUES
    (user_carol_id, moodboard_conscious_id,
     ARRAY[brand_guerlain_id, brand_dior_id],
     ARRAY[keyword_romantic_id, keyword_vintage_id]);
END $$;

-- Display summary
SELECT
  'Data seeding complete!' as status,
  (SELECT COUNT(*) FROM brands) as brands,
  (SELECT COUNT(*) FROM moodboards) as moodboards,
  (SELECT COUNT(*) FROM subcultures) as subcultures,
  (SELECT COUNT(*) FROM tribes) as tribes,
  (SELECT COUNT(*) FROM keywords) as keywords,
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM user_answers) as user_answers;
