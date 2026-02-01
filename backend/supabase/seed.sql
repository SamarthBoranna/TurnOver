-- TurnOver Database Seed Data
-- Run this after the initial schema migration
-- This populates the database with curated running shoe data

-- ============================================
-- SEED SHOES DATA - DAILY TRAINERS
-- ============================================
INSERT INTO shoes (brand, name, category, tags, weight, "drop", stack_height_heel, stack_height_forefoot, image_url)
VALUES
    -- Nike Daily Trainers
    ('Nike', 'Pegasus 41', 'daily', ARRAY['cushioned', 'versatile', 'durable'], 283, 10, 36, 26, NULL),
    ('Nike', 'Invincible 3', 'daily', ARRAY['cushioned', 'plush', 'protective'], 303, 9, 38, 29, NULL),
    ('Nike', 'Infinity Run 4', 'daily', ARRAY['cushioned', 'stable', 'comfortable'], 289, 9, 37, 28, NULL),
    
    -- ASICS Daily Trainers
    ('ASICS', 'Novablast 4', 'daily', ARRAY['cushioned', 'responsive', 'lightweight'], 260, 8, 41, 33, NULL),
    ('ASICS', 'Gel-Nimbus 26', 'daily', ARRAY['cushioned', 'plush', 'neutral'], 285, 8, 38, 30, NULL),
    ('ASICS', 'Gel-Kayano 30', 'daily', ARRAY['cushioned', 'stable', 'comfortable'], 295, 10, 39, 29, NULL),
    
    -- Brooks Daily Trainers
    ('Brooks', 'Ghost 16', 'daily', ARRAY['cushioned', 'neutral', 'comfortable'], 280, 12, 37, 25, NULL),
    ('Brooks', 'Glycerin 21', 'daily', ARRAY['cushioned', 'plush', 'comfortable'], 295, 10, 38, 28, NULL),
    ('Brooks', 'Adrenaline GTS 24', 'daily', ARRAY['cushioned', 'stable', 'durable'], 291, 12, 35, 23, NULL),
    
    -- HOKA Daily Trainers
    ('HOKA', 'Clifton 9', 'daily', ARRAY['cushioned', 'plush', 'lightweight'], 248, 5, 32, 27, NULL),
    ('HOKA', 'Mach 6', 'daily', ARRAY['lightweight', 'responsive', 'versatile'], 232, 5, 35, 30, NULL),
    ('HOKA', 'Bondi 8', 'daily', ARRAY['cushioned', 'plush', 'protective'], 307, 4, 37, 33, NULL),
    
    -- New Balance Daily Trainers
    ('New Balance', 'Fresh Foam 1080v14', 'daily', ARRAY['cushioned', 'plush', 'stable'], 298, 6, 34, 28, NULL),
    ('New Balance', 'Fresh Foam 880v14', 'daily', ARRAY['cushioned', 'neutral', 'versatile'], 285, 10, 32, 22, NULL),
    
    -- Saucony Daily Trainers
    ('Saucony', 'Kinvara 14', 'daily', ARRAY['lightweight', 'responsive', 'versatile'], 218, 4, 27, 23, NULL),
    ('Saucony', 'Triumph 22', 'daily', ARRAY['cushioned', 'plush', 'comfortable'], 280, 10, 36, 26, NULL),
    ('Saucony', 'Ride 17', 'daily', ARRAY['cushioned', 'neutral', 'versatile'], 262, 8, 35, 27, NULL),
    
    -- adidas Daily Trainers
    ('adidas', 'Ultraboost Light', 'daily', ARRAY['cushioned', 'responsive', 'comfortable'], 280, 10, 28, 18, NULL),
    ('adidas', 'Supernova Rise', 'daily', ARRAY['cushioned', 'stable', 'comfortable'], 295, 9, 38, 29, NULL),

-- ============================================
-- SEED SHOES DATA - WORKOUT/TEMPO SHOES
-- ============================================
    -- Nike Workout Shoes
    ('Nike', 'Pegasus Turbo Next Nature', 'workout', ARRAY['responsive', 'lightweight', 'fast'], 238, 10, 36, 26, NULL),
    ('Nike', 'Vomero 18', 'workout', ARRAY['cushioned', 'responsive', 'versatile'], 275, 10, 38, 28, NULL),
    
    -- ASICS Workout Shoes
    ('ASICS', 'Superblast 2', 'workout', ARRAY['responsive', 'cushioned', 'fast'], 236, 8, 46, 38, NULL),
    ('ASICS', 'Magic Speed 4', 'workout', ARRAY['responsive', 'lightweight', 'fast'], 190, 5, 38, 33, NULL),
    
    -- Brooks Workout Shoes
    ('Brooks', 'Hyperion Max', 'workout', ARRAY['lightweight', 'fast', 'responsive'], 221, 8, 36, 28, NULL),
    ('Brooks', 'Hyperion Tempo', 'workout', ARRAY['lightweight', 'responsive', 'snappy'], 198, 8, 33, 25, NULL),
    
    -- HOKA Workout Shoes
    ('HOKA', 'Mach X', 'workout', ARRAY['responsive', 'cushioned', 'fast'], 250, 5, 37, 32, NULL),
    ('HOKA', 'Rocket X2', 'workout', ARRAY['responsive', 'fast', 'lightweight'], 219, 5, 39, 34, NULL),
    
    -- New Balance Workout Shoes
    ('New Balance', 'FuelCell Rebel v4', 'workout', ARRAY['responsive', 'lightweight', 'fast'], 227, 6, 35, 29, NULL),
    ('New Balance', 'FuelCell SuperComp Trainer v2', 'workout', ARRAY['responsive', 'cushioned', 'fast'], 265, 6, 42, 36, NULL),
    
    -- Saucony Workout Shoes
    ('Saucony', 'Endorphin Speed 4', 'workout', ARRAY['responsive', 'fast', 'lightweight'], 215, 8, 39.5, 31.5, NULL),
    ('Saucony', 'Kinvara Pro', 'workout', ARRAY['responsive', 'lightweight', 'fast'], 215, 6, 35, 29, NULL),
    
    -- adidas Workout Shoes
    ('adidas', 'Adizero Boston 12', 'workout', ARRAY['responsive', 'stable', 'fast'], 233, 6, 39, 33, NULL),
    ('adidas', 'Adizero SL2', 'workout', ARRAY['lightweight', 'responsive', 'versatile'], 215, 7, 36, 29, NULL),

-- ============================================
-- SEED SHOES DATA - RACE DAY SHOES
-- ============================================
    -- Nike Race Shoes
    ('Nike', 'Vaporfly 3', 'race', ARRAY['fast', 'responsive', 'lightweight'], 187, 8, 40, 32, NULL),
    ('Nike', 'Alphafly 3', 'race', ARRAY['fast', 'responsive', 'lightweight'], 212, 8, 40, 32, NULL),
    ('Nike', 'Streakfly', 'race', ARRAY['lightweight', 'fast', 'snappy'], 170, 6, 33, 27, NULL),
    
    -- ASICS Race Shoes
    ('ASICS', 'Metaspeed Sky Paris', 'race', ARRAY['fast', 'responsive', 'lightweight'], 185, 5, 42, 37, NULL),
    ('ASICS', 'Metaspeed Edge Paris', 'race', ARRAY['fast', 'responsive', 'snappy'], 182, 5, 36, 31, NULL),
    
    -- New Balance Race Shoes
    ('New Balance', 'SC Elite v4', 'race', ARRAY['fast', 'responsive', 'lightweight'], 198, 8, 39, 31, NULL),
    ('New Balance', 'FuelCell RC Elite v2', 'race', ARRAY['fast', 'responsive', 'lightweight'], 195, 8, 38, 30, NULL),
    
    -- Saucony Race Shoes
    ('Saucony', 'Endorphin Elite', 'race', ARRAY['fast', 'responsive', 'lightweight'], 195, 8, 40, 32, NULL),
    ('Saucony', 'Endorphin Pro 4', 'race', ARRAY['fast', 'responsive', 'lightweight'], 199, 8, 38, 30, NULL),
    
    -- adidas Race Shoes
    ('adidas', 'Adizero Adios Pro 3', 'race', ARRAY['fast', 'responsive', 'lightweight'], 215, 6, 39, 33, NULL),
    ('adidas', 'Adizero Prime X 2', 'race', ARRAY['fast', 'cushioned', 'responsive'], 245, 5, 50, 45, NULL),
    
    -- HOKA Race Shoes
    ('HOKA', 'Cielo X1', 'race', ARRAY['fast', 'responsive', 'lightweight'], 197, 5, 36, 31, NULL),
    ('HOKA', 'Rocket X 2', 'race', ARRAY['fast', 'responsive', 'lightweight'], 219, 5, 39, 34, NULL),
    
    -- Brooks Race Shoes
    ('Brooks', 'Hyperion Elite 4', 'race', ARRAY['fast', 'responsive', 'lightweight'], 199, 8, 37, 29, NULL),
    
    -- Puma Race Shoes
    ('Puma', 'Fast-R Nitro Elite 2', 'race', ARRAY['fast', 'responsive', 'lightweight'], 195, 8, 39, 31, NULL)

ON CONFLICT (brand, name) DO UPDATE SET
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    weight = EXCLUDED.weight,
    "drop" = EXCLUDED."drop",
    stack_height_heel = EXCLUDED.stack_height_heel,
    stack_height_forefoot = EXCLUDED.stack_height_forefoot,
    image_url = EXCLUDED.image_url,
    updated_at = NOW();

-- ============================================
-- VERIFY SEED DATA
-- ============================================
-- SELECT 'Seeded shoes count:' as status, COUNT(*) as count FROM shoes;
-- SELECT category, COUNT(*) FROM shoes GROUP BY category ORDER BY category;
