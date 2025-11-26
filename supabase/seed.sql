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

-- Insert test keywords for each subculture
DO $$
DECLARE
  legacists_id UUID;
  functionals_id UUID;
  romantics_id UUID;
  curators_id UUID;
  mystics_id UUID;
  unapologetics_id UUID;
BEGIN
  -- Get subculture IDs
  SELECT id INTO legacists_id FROM subcultures WHERE name = 'LEGACISTS';
  SELECT id INTO functionals_id FROM subcultures WHERE name = 'FUNCTIONALS';
  SELECT id INTO romantics_id FROM subcultures WHERE name = 'ROMANTICS';
  SELECT id INTO curators_id FROM subcultures WHERE name = 'CURATORS';
  SELECT id INTO mystics_id FROM subcultures WHERE name = 'MYSTICS';
  SELECT id INTO unapologetics_id FROM subcultures WHERE name = 'UNAPOLOGETICS';

  -- Insert keywords for LEGACISTS
  INSERT INTO keywords (name, subculture_id) VALUES
    ('heritage', legacists_id),
    ('classic', legacists_id),
    ('timeless', legacists_id),
    ('luxury', legacists_id),
    ('traditional', legacists_id);

  -- Insert keywords for FUNCTIONALS
  INSERT INTO keywords (name, subculture_id) VALUES
    ('minimalist', functionals_id),
    ('clean', functionals_id),
    ('efficient', functionals_id),
    ('practical', functionals_id),
    ('simple', functionals_id);

  -- Insert keywords for ROMANTICS
  INSERT INTO keywords (name, subculture_id) VALUES
    ('romantic', romantics_id),
    ('vintage', romantics_id),
    ('emotional', romantics_id),
    ('storytelling', romantics_id),
    ('nostalgic', romantics_id);

  -- Insert keywords for CURATORS
  INSERT INTO keywords (name, subculture_id) VALUES
    ('trendy', curators_id),
    ('urban', curators_id),
    ('curator', curators_id),
    ('cultural', curators_id),
    ('exclusive', curators_id);

  -- Insert keywords for MYSTICS
  INSERT INTO keywords (name, subculture_id) VALUES
    ('spiritual', mystics_id),
    ('wellness', mystics_id),
    ('holistic', mystics_id),
    ('mindful', mystics_id),
    ('natural', mystics_id);

  -- Insert keywords for UNAPOLOGETICS
  INSERT INTO keywords (name, subculture_id) VALUES
    ('bold', unapologetics_id),
    ('edgy', unapologetics_id),
    ('trendsetter', unapologetics_id),
    ('statement', unapologetics_id),
    ('confident', unapologetics_id);
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
