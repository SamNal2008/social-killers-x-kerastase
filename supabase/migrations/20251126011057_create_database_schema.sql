-- Migration: Create Database Schema
-- Description: Creates all tables for the Social Killers x Kérastase application
-- Author: Generated via Claude Code
-- Date: 2025-11-26

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE REFERENCE TABLES
-- ============================================================================

-- Tribes table: Cultural archetypes/tribes
CREATE TABLE tribes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subcultures table: Sub-categories within tribes
CREATE TABLE subcultures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Keywords table: Keywords associated with subcultures
CREATE TABLE keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subculture_id UUID NOT NULL REFERENCES subcultures(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, subculture_id)
);

-- Brands table: Brand information
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Moodboards table: Moodboard collections
CREATE TABLE moodboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- JUNCTION TABLES
-- ============================================================================

-- Moodboard-Brand relationship (many-to-many)
CREATE TABLE moodboard_brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moodboard_id UUID NOT NULL REFERENCES moodboards(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(moodboard_id, brand_id)
);

-- ============================================================================
-- USER TABLES
-- ============================================================================

-- Users table: User information
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  connection_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Answers table: User questionnaire responses
CREATE TABLE user_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  moodboard_id UUID NOT NULL REFERENCES moodboards(id) ON DELETE RESTRICT,
  keywords UUID[] NOT NULL DEFAULT '{}',
  brands UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Results table: Calculated user tribe/subculture results
CREATE TABLE user_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_answer_id UUID NOT NULL REFERENCES user_answers(id) ON DELETE CASCADE,
  tribe_id UUID NOT NULL REFERENCES tribes(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_answer_id)
);

-- User Result Subcultures junction table: Subculture percentage breakdown
CREATE TABLE user_result_subcultures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_result_id UUID NOT NULL REFERENCES user_results(id) ON DELETE CASCADE,
  subculture_id UUID NOT NULL REFERENCES subcultures(id) ON DELETE CASCADE,
  percentage DECIMAL(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_result_id, subculture_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Keywords indexes
CREATE INDEX idx_keywords_subculture_id ON keywords(subculture_id);
CREATE INDEX idx_keywords_name ON keywords(name);

-- Moodboard-Brand indexes
CREATE INDEX idx_moodboard_brands_moodboard_id ON moodboard_brands(moodboard_id);
CREATE INDEX idx_moodboard_brands_brand_id ON moodboard_brands(brand_id);

-- User Answers indexes
CREATE INDEX idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX idx_user_answers_moodboard_id ON user_answers(moodboard_id);
CREATE INDEX idx_user_answers_keywords ON user_answers USING GIN(keywords);
CREATE INDEX idx_user_answers_brands ON user_answers USING GIN(brands);

-- User Results indexes
CREATE INDEX idx_user_results_user_id ON user_results(user_id);
CREATE INDEX idx_user_results_user_answer_id ON user_results(user_answer_id);
CREATE INDEX idx_user_results_tribe_id ON user_results(tribe_id);

-- User Result Subcultures indexes
CREATE INDEX idx_user_result_subcultures_user_result_id ON user_result_subcultures(user_result_id);
CREATE INDEX idx_user_result_subcultures_subculture_id ON user_result_subcultures(subculture_id);
CREATE INDEX idx_user_result_subcultures_percentage ON user_result_subcultures(percentage);

-- ============================================================================
-- FUNCTIONS FOR UPDATED_AT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- ============================================================================

CREATE TRIGGER update_tribes_updated_at BEFORE UPDATE ON tribes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subcultures_updated_at BEFORE UPDATE ON subcultures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_keywords_updated_at BEFORE UPDATE ON keywords
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_moodboards_updated_at BEFORE UPDATE ON moodboards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_answers_updated_at BEFORE UPDATE ON user_answers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_results_updated_at BEFORE UPDATE ON user_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE tribes IS 'Cultural archetypes/tribes that users can be categorized into';
COMMENT ON TABLE subcultures IS 'Sub-categories within tribes for more granular classification';
COMMENT ON TABLE keywords IS 'Keywords associated with specific subcultures';
COMMENT ON TABLE brands IS 'Brand information including logos';
COMMENT ON TABLE moodboards IS 'Moodboard collections for user selection';
COMMENT ON TABLE moodboard_brands IS 'Many-to-many relationship between moodboards and brands';
COMMENT ON TABLE users IS 'Application users';
COMMENT ON TABLE user_answers IS 'User responses to questionnaires including selected keywords and brands';
COMMENT ON TABLE user_results IS 'Calculated results showing users primary tribe';
COMMENT ON TABLE user_result_subcultures IS 'Percentage breakdown of subcultures for each user result';
