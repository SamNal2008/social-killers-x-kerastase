-- Seed tribe_subcultures relationships
-- This migration populates the many-to-many relationship between tribes and subcultures
-- Based on the tribe descriptions in 20251126015500_seed_subcultures_and_tribes.sql

-- Insert tribe-subculture relationships
-- Each tribe belongs to one subculture based on its description

-- LEGACISTS Subculture Tribes
INSERT INTO tribe_subcultures (tribe_id, subculture_id)
SELECT t.id, s.id
FROM tribes t
CROSS JOIN subcultures s
WHERE s.name = 'LEGACISTS'
  AND t.name IN ('HERITAGE HEIRESS', 'QUIET LUXURY', 'FEMME FATALE');

-- FUNCTIONALS Subculture Tribes
INSERT INTO tribe_subcultures (tribe_id, subculture_id)
SELECT t.id, s.id
FROM tribes t
CROSS JOIN subcultures s
WHERE s.name = 'FUNCTIONALS'
  AND t.name IN ('CLEAN RITUALIST', 'LONGEVITY RITUALIST', 'CONSCIOUS HEDONIST');

-- ROMANTICS Subculture Tribes
INSERT INTO tribe_subcultures (tribe_id, subculture_id)
SELECT t.id, s.id
FROM tribes t
CROSS JOIN subcultures s
WHERE s.name = 'ROMANTICS'
  AND t.name IN ('SENSORIALIST', 'SILLAGE SEEKER', 'LITERARY', 'EMOTIONAL CREATOR', 'SISTERHOOD KEEPER');

-- CURATORS Subculture Tribes
INSERT INTO tribe_subcultures (tribe_id, subculture_id)
SELECT t.id, s.id
FROM tribes t
CROSS JOIN subcultures s
WHERE s.name = 'CURATORS'
  AND t.name IN ('CULTURE GURU', 'URBAN MUSE ENERGIZER', 'STAGEBREAKER');

-- MYSTICS Subculture Tribes
INSERT INTO tribe_subcultures (tribe_id, subculture_id)
SELECT t.id, s.id
FROM tribes t
CROSS JOIN subcultures s
WHERE s.name = 'MYSTICS'
  AND t.name IN ('SOUL HEALER', 'COSMIC EXPLORER', 'SACRED FEMININE');

-- UNAPOLOGETICS Subculture Tribes
INSERT INTO tribe_subcultures (tribe_id, subculture_id)
SELECT t.id, s.id
FROM tribes t
CROSS JOIN subcultures s
WHERE s.name = 'UNAPOLOGETICS'
  AND t.name IN ('MISFIT', 'EARLY ADOPTER', 'EDGY AESTHETE', 'STATUS SIREN');
