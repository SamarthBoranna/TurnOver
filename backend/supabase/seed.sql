-- Seed data for TurnOver
-- Run this after the initial schema migration

-- ============================================
-- SEED SHOES DATA
-- ============================================
INSERT INTO shoes (brand, name, category, tags, weight, "drop", stack_height_heel, stack_height_forefoot, image_url)
VALUES
    -- Daily Trainers
    ('Nike', 'Pegasus 41', 'daily', ARRAY['cushioned', 'versatile', 'durable'], 283, 10, 36, 26, NULL),
    ('ASICS', 'Novablast 4', 'daily', ARRAY['cushioned', 'responsive', 'lightweight'], 260, 8, 41, 33, NULL),
    ('Brooks', 'Ghost 15', 'daily', ARRAY['cushioned', 'neutral', 'comfortable'], 280, 12, 37, 25, NULL),
    ('HOKA', 'Clifton 9', 'daily', ARRAY['cushioned', 'plush', 'lightweight'], 248, 5, 32, 27, NULL),
    ('HOKA', 'Mach 6', 'daily', ARRAY['lightweight', 'responsive', 'versatile'], 232, 5, 35, 30, NULL),
    ('New Balance', 'Fresh Foam 1080v13', 'daily', ARRAY['cushioned', 'plush', 'stable'], 298, 6, 34, 28, NULL),
    ('Saucony', 'Kinvara 14', 'daily', ARRAY['lightweight', 'responsive', 'versatile'], 218, 4, 27, 23, NULL),
    ('Brooks', 'Glycerin 21', 'daily', ARRAY['cushioned', 'plush', 'comfortable'], 295, 10, 38, 28, NULL),
    
    -- Workout/Tempo Shoes
    ('Saucony', 'Endorphin Speed 4', 'workout', ARRAY['responsive', 'fast', 'lightweight'], 215, 8, 39.5, 31.5, NULL),
    ('New Balance', 'FuelCell Rebel v4', 'workout', ARRAY['responsive', 'lightweight', 'fast'], 227, 6, 35, 29, NULL),
    ('Brooks', 'Hyperion Max', 'workout', ARRAY['lightweight', 'fast', 'responsive'], 221, 8, 36, 28, NULL),
    ('ASICS', 'Superblast 2', 'workout', ARRAY['responsive', 'cushioned', 'fast'], 236, 8, 46, 38, NULL),
    ('Nike', 'Pegasus Turbo Next Nature', 'workout', ARRAY['responsive', 'lightweight', 'fast'], 238, 10, 36, 26, NULL),
    ('adidas', 'Adizero Boston 12', 'workout', ARRAY['responsive', 'stable', 'fast'], 233, 6, 39, 33, NULL),
    
    -- Race Day Shoes
    ('Nike', 'Vaporfly 3', 'race', ARRAY['fast', 'responsive', 'lightweight'], 187, 8, 40, 32, NULL),
    ('Nike', 'Alphafly 3', 'race', ARRAY['fast', 'responsive', 'lightweight'], 212, 8, 40, 32, NULL),
    ('ASICS', 'Metaspeed Sky Paris', 'race', ARRAY['fast', 'responsive', 'lightweight'], 185, 5, 42, 37, NULL),
    ('New Balance', 'SC Elite v4', 'race', ARRAY['fast', 'responsive', 'lightweight'], 198, 8, 39, 31, NULL),
    ('Saucony', 'Endorphin Elite', 'race', ARRAY['fast', 'responsive', 'lightweight'], 195, 8, 40, 32, NULL),
    ('adidas', 'Adizero Adios Pro 3', 'race', ARRAY['fast', 'responsive', 'lightweight'], 215, 6, 39, 33, NULL),
    ('HOKA', 'Cielo X1', 'race', ARRAY['fast', 'responsive', 'lightweight'], 197, 5, 36, 31, NULL)
ON CONFLICT (brand, name) DO NOTHING;
