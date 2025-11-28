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

-- Insert test moodboards
INSERT INTO moodboards (name, description) VALUES
  ('Timeless Elegance', 'Classic sophistication with refined luxury and heritage brands'),
  ('Modern Minimalism', 'Clean lines, neutral palettes, and functional beauty'),
  ('Romantic Nostalgia', 'Vintage-inspired aesthetics with emotional storytelling'),
  ('Urban Edge', 'Contemporary street culture meets high fashion'),
  ('Spiritual Sanctuary', 'Wellness-focused with holistic and natural elements');

-- Link brands to moodboards (store IDs for reference)
DO $$
DECLARE
  brand_chanel_id UUID;
  brand_dior_id UUID;
  brand_guerlain_id UUID;
  brand_hermes_id UUID;
  brand_lelabo_id UUID;
  brand_byredo_id UUID;

  moodboard_timeless_id UUID;
  moodboard_minimalist_id UUID;
  moodboard_romantic_id UUID;
  moodboard_urban_id UUID;
  moodboard_spiritual_id UUID;
BEGIN
  -- Get brand IDs
  SELECT id INTO brand_chanel_id FROM brands WHERE name = 'Chanel';
  SELECT id INTO brand_dior_id FROM brands WHERE name = 'Dior';
  SELECT id INTO brand_guerlain_id FROM brands WHERE name = 'Guerlain';
  SELECT id INTO brand_hermes_id FROM brands WHERE name = 'Hermès';
  SELECT id INTO brand_lelabo_id FROM brands WHERE name = 'Le Labo';
  SELECT id INTO brand_byredo_id FROM brands WHERE name = 'Byredo';

  -- Get moodboard IDs
  SELECT id INTO moodboard_timeless_id FROM moodboards WHERE name = 'Timeless Elegance';
  SELECT id INTO moodboard_minimalist_id FROM moodboards WHERE name = 'Modern Minimalism';
  SELECT id INTO moodboard_romantic_id FROM moodboards WHERE name = 'Romantic Nostalgia';
  SELECT id INTO moodboard_urban_id FROM moodboards WHERE name = 'Urban Edge';
  SELECT id INTO moodboard_spiritual_id FROM moodboards WHERE name = 'Spiritual Sanctuary';

  -- Link brands to Timeless Elegance
  INSERT INTO moodboard_brands (moodboard_id, brand_id) VALUES
    (moodboard_timeless_id, brand_chanel_id),
    (moodboard_timeless_id, brand_dior_id),
    (moodboard_timeless_id, brand_hermes_id);

  -- Link brands to Modern Minimalism
  INSERT INTO moodboard_brands (moodboard_id, brand_id) VALUES
    (moodboard_minimalist_id, brand_lelabo_id),
    (moodboard_minimalist_id, brand_byredo_id);

  -- Link brands to Romantic Nostalgia
  INSERT INTO moodboard_brands (moodboard_id, brand_id) VALUES
    (moodboard_romantic_id, brand_guerlain_id),
    (moodboard_romantic_id, brand_dior_id);
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

  moodboard_timeless_id UUID;
  moodboard_minimalist_id UUID;
  moodboard_romantic_id UUID;
  moodboard_urban_id UUID;
  moodboard_spiritual_id UUID;
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
  SELECT id INTO moodboard_timeless_id FROM moodboards WHERE name = 'Timeless Elegance';
  SELECT id INTO moodboard_minimalist_id FROM moodboards WHERE name = 'Modern Minimalism';
  SELECT id INTO moodboard_romantic_id FROM moodboards WHERE name = 'Romantic Nostalgia';
  SELECT id INTO moodboard_urban_id FROM moodboards WHERE name = 'Urban Edge';
  SELECT id INTO moodboard_spiritual_id FROM moodboards WHERE name = 'Spiritual Sanctuary';

  -- Link moodboards to subcultures (1:1)
  UPDATE moodboards SET subculture_id = legacists_id WHERE id = moodboard_timeless_id;
  UPDATE moodboards SET subculture_id = functionals_id WHERE id = moodboard_minimalist_id;
  UPDATE moodboards SET subculture_id = romantics_id WHERE id = moodboard_romantic_id;
  UPDATE moodboards SET subculture_id = curators_id WHERE id = moodboard_urban_id;
  UPDATE moodboards SET subculture_id = mystics_id WHERE id = moodboard_spiritual_id;

  -- Create tribe-subculture relationships (many-to-many)
  -- LEGACISTS subculture contains these tribes
  INSERT INTO tribe_subcultures (tribe_id, subculture_id) VALUES
    (heritage_heiress_id, legacists_id),
    (quiet_luxury_id, legacists_id);

  -- FUNCTIONALS subculture contains these tribes
  INSERT INTO tribe_subcultures (tribe_id, subculture_id) VALUES
    (clean_ritualist_id, functionals_id),
    (quiet_luxury_id, functionals_id);

  -- ROMANTICS subculture contains these tribes
  INSERT INTO tribe_subcultures (tribe_id, subculture_id) VALUES
    (sensorialist_id, romantics_id);

  -- CURATORS subculture contains these tribes
  INSERT INTO tribe_subcultures (tribe_id, subculture_id) VALUES
    (culture_guru_id, curators_id),
    (misfit_id, curators_id);

  -- MYSTICS subculture contains these tribes
  INSERT INTO tribe_subcultures (tribe_id, subculture_id) VALUES
    (soul_healer_id, mystics_id);

  -- UNAPOLOGETICS subculture contains these tribes
  INSERT INTO tribe_subcultures (tribe_id, subculture_id) VALUES
    (misfit_id, unapologetics_id);

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

  moodboard_timeless_id UUID;
  moodboard_minimalist_id UUID;
  moodboard_romantic_id UUID;

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
  SELECT id INTO moodboard_timeless_id FROM moodboards WHERE name = 'Timeless Elegance';
  SELECT id INTO moodboard_minimalist_id FROM moodboards WHERE name = 'Modern Minimalism';
  SELECT id INTO moodboard_romantic_id FROM moodboards WHERE name = 'Romantic Nostalgia';

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

  -- Alice's answer: Heritage-focused (LEGACISTS)
  INSERT INTO user_answers (user_id, moodboard_id, brands, keywords) VALUES
    (user_alice_id, moodboard_timeless_id,
     ARRAY[brand_chanel_id, brand_dior_id],
     ARRAY[keyword_heritage_id, keyword_classic_id]);

  -- Bob's answer: Minimalist-focused (FUNCTIONALS)
  INSERT INTO user_answers (user_id, moodboard_id, brands, keywords) VALUES
    (user_bob_id, moodboard_minimalist_id,
     ARRAY[brand_lelabo_id, brand_byredo_id],
     ARRAY[keyword_minimalist_id, keyword_clean_id]);

  -- Carol's answer: Romantic-focused (ROMANTICS)
  INSERT INTO user_answers (user_id, moodboard_id, brands, keywords) VALUES
    (user_carol_id, moodboard_romantic_id,
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
