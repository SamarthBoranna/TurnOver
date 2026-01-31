-- TurnOver Database Schema
-- Run this in your Supabase SQL Editor or as a migration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- Stores user profile information
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    avg_miles_per_week DECIMAL(6,2) DEFAULT 0,
    preferred_categories TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SHOES TABLE
-- Master catalog of all shoes
-- ============================================
CREATE TABLE IF NOT EXISTS shoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand VARCHAR(100) NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('daily', 'workout', 'race')),
    tags TEXT[] DEFAULT '{}',
    weight DECIMAL(6,1) NOT NULL, -- in grams
    "drop" DECIMAL(4,1) NOT NULL, -- in mm (using quotes as "drop" is a reserved word)
    stack_height_heel DECIMAL(5,1) NOT NULL, -- in mm
    stack_height_forefoot DECIMAL(5,1) NOT NULL, -- in mm
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique shoe entries
    UNIQUE(brand, name)
);

-- ============================================
-- ROTATION TABLE
-- User's currently active shoes
-- ============================================
CREATE TABLE IF NOT EXISTS rotation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shoe_id UUID NOT NULL REFERENCES shoes(id) ON DELETE CASCADE,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Each user can only have a shoe in rotation once
    UNIQUE(user_id, shoe_id)
);

-- ============================================
-- GRAVEYARD TABLE
-- User's retired shoes with ratings
-- ============================================
CREATE TABLE IF NOT EXISTS graveyard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shoe_id UUID NOT NULL REFERENCES shoes(id) ON DELETE CASCADE,
    retired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    miles_run DECIMAL(8,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Each user can only have a shoe in graveyard once
    UNIQUE(user_id, shoe_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_rotation_user_id ON rotation(user_id);
CREATE INDEX IF NOT EXISTS idx_rotation_shoe_id ON rotation(shoe_id);
CREATE INDEX IF NOT EXISTS idx_graveyard_user_id ON graveyard(user_id);
CREATE INDEX IF NOT EXISTS idx_graveyard_shoe_id ON graveyard(shoe_id);
CREATE INDEX IF NOT EXISTS idx_graveyard_rating ON graveyard(rating);
CREATE INDEX IF NOT EXISTS idx_shoes_category ON shoes(category);
CREATE INDEX IF NOT EXISTS idx_shoes_brand ON shoes(brand);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rotation ENABLE ROW LEVEL SECURITY;
ALTER TABLE graveyard ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Shoes: Anyone can read, only authenticated users can create
CREATE POLICY "Anyone can view shoes"
    ON shoes FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "Authenticated users can create shoes"
    ON shoes FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Rotation: Users can only access their own rotation
CREATE POLICY "Users can view own rotation"
    ON rotation FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own rotation"
    ON rotation FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from own rotation"
    ON rotation FOR DELETE
    USING (auth.uid() = user_id);

-- Graveyard: Users can only access their own graveyard
CREATE POLICY "Users can view own graveyard"
    ON graveyard FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own graveyard"
    ON graveyard FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own graveyard entries"
    ON graveyard FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from own graveyard"
    ON graveyard FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shoes_updated_at
    BEFORE UPDATE ON shoes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_graveyard_updated_at
    BEFORE UPDATE ON graveyard
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, first_name, last_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        NEW.email
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
