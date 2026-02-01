#!/usr/bin/env python3
"""
Database seeding script for TurnOver
Populates the Supabase database with initial shoe data

Usage:
    python -m app.scripts.seed_database
    
    Or with options:
    python -m app.scripts.seed_database --clear  # Clear existing data first
    python -m app.scripts.seed_database --verify # Just verify connection
"""

import sys
import argparse
from typing import List, Dict, Any

# Add parent directory to path for imports
sys.path.insert(0, '.')

from app.core.supabase import supabase_admin
from app.core.config import settings


# ============================================
# SHOE SEED DATA
# ============================================
SHOES_DATA: List[Dict[str, Any]] = [
    # ========== DAILY TRAINERS ==========
    # Nike
    {"brand": "Nike", "name": "Pegasus 41", "category": "daily", 
     "tags": ["cushioned", "versatile", "durable"], 
     "weight": 283, "drop": 10, "stack_height_heel": 36, "stack_height_forefoot": 26},
    {"brand": "Nike", "name": "Invincible 3", "category": "daily", 
     "tags": ["cushioned", "plush", "protective"], 
     "weight": 303, "drop": 9, "stack_height_heel": 38, "stack_height_forefoot": 29},
    {"brand": "Nike", "name": "Infinity Run 4", "category": "daily", 
     "tags": ["cushioned", "stable", "comfortable"], 
     "weight": 289, "drop": 9, "stack_height_heel": 37, "stack_height_forefoot": 28},
    
    # ASICS
    {"brand": "ASICS", "name": "Novablast 4", "category": "daily", 
     "tags": ["cushioned", "responsive", "lightweight"], 
     "weight": 260, "drop": 8, "stack_height_heel": 41, "stack_height_forefoot": 33},
    {"brand": "ASICS", "name": "Gel-Nimbus 26", "category": "daily", 
     "tags": ["cushioned", "plush", "neutral"], 
     "weight": 285, "drop": 8, "stack_height_heel": 38, "stack_height_forefoot": 30},
    {"brand": "ASICS", "name": "Gel-Kayano 30", "category": "daily", 
     "tags": ["cushioned", "stable", "comfortable"], 
     "weight": 295, "drop": 10, "stack_height_heel": 39, "stack_height_forefoot": 29},
    
    # Brooks
    {"brand": "Brooks", "name": "Ghost 16", "category": "daily", 
     "tags": ["cushioned", "neutral", "comfortable"], 
     "weight": 280, "drop": 12, "stack_height_heel": 37, "stack_height_forefoot": 25},
    {"brand": "Brooks", "name": "Glycerin 21", "category": "daily", 
     "tags": ["cushioned", "plush", "comfortable"], 
     "weight": 295, "drop": 10, "stack_height_heel": 38, "stack_height_forefoot": 28},
    {"brand": "Brooks", "name": "Adrenaline GTS 24", "category": "daily", 
     "tags": ["cushioned", "stable", "durable"], 
     "weight": 291, "drop": 12, "stack_height_heel": 35, "stack_height_forefoot": 23},
    
    # HOKA
    {"brand": "HOKA", "name": "Clifton 9", "category": "daily", 
     "tags": ["cushioned", "plush", "lightweight"], 
     "weight": 248, "drop": 5, "stack_height_heel": 32, "stack_height_forefoot": 27},
    {"brand": "HOKA", "name": "Mach 6", "category": "daily", 
     "tags": ["lightweight", "responsive", "versatile"], 
     "weight": 232, "drop": 5, "stack_height_heel": 35, "stack_height_forefoot": 30},
    {"brand": "HOKA", "name": "Bondi 8", "category": "daily", 
     "tags": ["cushioned", "plush", "protective"], 
     "weight": 307, "drop": 4, "stack_height_heel": 37, "stack_height_forefoot": 33},
    
    # New Balance
    {"brand": "New Balance", "name": "Fresh Foam 1080v14", "category": "daily", 
     "tags": ["cushioned", "plush", "stable"], 
     "weight": 298, "drop": 6, "stack_height_heel": 34, "stack_height_forefoot": 28},
    {"brand": "New Balance", "name": "Fresh Foam 880v14", "category": "daily", 
     "tags": ["cushioned", "neutral", "versatile"], 
     "weight": 285, "drop": 10, "stack_height_heel": 32, "stack_height_forefoot": 22},
    
    # Saucony
    {"brand": "Saucony", "name": "Kinvara 14", "category": "daily", 
     "tags": ["lightweight", "responsive", "versatile"], 
     "weight": 218, "drop": 4, "stack_height_heel": 27, "stack_height_forefoot": 23},
    {"brand": "Saucony", "name": "Triumph 22", "category": "daily", 
     "tags": ["cushioned", "plush", "comfortable"], 
     "weight": 280, "drop": 10, "stack_height_heel": 36, "stack_height_forefoot": 26},
    {"brand": "Saucony", "name": "Ride 17", "category": "daily", 
     "tags": ["cushioned", "neutral", "versatile"], 
     "weight": 262, "drop": 8, "stack_height_heel": 35, "stack_height_forefoot": 27},
    
    # adidas
    {"brand": "adidas", "name": "Ultraboost Light", "category": "daily", 
     "tags": ["cushioned", "responsive", "comfortable"], 
     "weight": 280, "drop": 10, "stack_height_heel": 28, "stack_height_forefoot": 18},
    {"brand": "adidas", "name": "Supernova Rise", "category": "daily", 
     "tags": ["cushioned", "stable", "comfortable"], 
     "weight": 295, "drop": 9, "stack_height_heel": 38, "stack_height_forefoot": 29},

    # ========== WORKOUT/TEMPO SHOES ==========
    # Nike
    {"brand": "Nike", "name": "Pegasus Turbo Next Nature", "category": "workout", 
     "tags": ["responsive", "lightweight", "fast"], 
     "weight": 238, "drop": 10, "stack_height_heel": 36, "stack_height_forefoot": 26},
    {"brand": "Nike", "name": "Vomero 18", "category": "workout", 
     "tags": ["cushioned", "responsive", "versatile"], 
     "weight": 275, "drop": 10, "stack_height_heel": 38, "stack_height_forefoot": 28},
    
    # ASICS
    {"brand": "ASICS", "name": "Superblast 2", "category": "workout", 
     "tags": ["responsive", "cushioned", "fast"], 
     "weight": 236, "drop": 8, "stack_height_heel": 46, "stack_height_forefoot": 38},
    {"brand": "ASICS", "name": "Magic Speed 4", "category": "workout", 
     "tags": ["responsive", "lightweight", "fast"], 
     "weight": 190, "drop": 5, "stack_height_heel": 38, "stack_height_forefoot": 33},
    
    # Brooks
    {"brand": "Brooks", "name": "Hyperion Max", "category": "workout", 
     "tags": ["lightweight", "fast", "responsive"], 
     "weight": 221, "drop": 8, "stack_height_heel": 36, "stack_height_forefoot": 28},
    {"brand": "Brooks", "name": "Hyperion Tempo", "category": "workout", 
     "tags": ["lightweight", "responsive", "snappy"], 
     "weight": 198, "drop": 8, "stack_height_heel": 33, "stack_height_forefoot": 25},
    
    # HOKA
    {"brand": "HOKA", "name": "Mach X", "category": "workout", 
     "tags": ["responsive", "cushioned", "fast"], 
     "weight": 250, "drop": 5, "stack_height_heel": 37, "stack_height_forefoot": 32},
    {"brand": "HOKA", "name": "Rocket X2", "category": "workout", 
     "tags": ["responsive", "fast", "lightweight"], 
     "weight": 219, "drop": 5, "stack_height_heel": 39, "stack_height_forefoot": 34},
    
    # New Balance
    {"brand": "New Balance", "name": "FuelCell Rebel v4", "category": "workout", 
     "tags": ["responsive", "lightweight", "fast"], 
     "weight": 227, "drop": 6, "stack_height_heel": 35, "stack_height_forefoot": 29},
    {"brand": "New Balance", "name": "FuelCell SuperComp Trainer v2", "category": "workout", 
     "tags": ["responsive", "cushioned", "fast"], 
     "weight": 265, "drop": 6, "stack_height_heel": 42, "stack_height_forefoot": 36},
    
    # Saucony
    {"brand": "Saucony", "name": "Endorphin Speed 4", "category": "workout", 
     "tags": ["responsive", "fast", "lightweight"], 
     "weight": 215, "drop": 8, "stack_height_heel": 39.5, "stack_height_forefoot": 31.5},
    {"brand": "Saucony", "name": "Kinvara Pro", "category": "workout", 
     "tags": ["responsive", "lightweight", "fast"], 
     "weight": 215, "drop": 6, "stack_height_heel": 35, "stack_height_forefoot": 29},
    
    # adidas
    {"brand": "adidas", "name": "Adizero Boston 12", "category": "workout", 
     "tags": ["responsive", "stable", "fast"], 
     "weight": 233, "drop": 6, "stack_height_heel": 39, "stack_height_forefoot": 33},
    {"brand": "adidas", "name": "Adizero SL2", "category": "workout", 
     "tags": ["lightweight", "responsive", "versatile"], 
     "weight": 215, "drop": 7, "stack_height_heel": 36, "stack_height_forefoot": 29},

    # ========== RACE DAY SHOES ==========
    # Nike
    {"brand": "Nike", "name": "Vaporfly 3", "category": "race", 
     "tags": ["fast", "responsive", "lightweight"], 
     "weight": 187, "drop": 8, "stack_height_heel": 40, "stack_height_forefoot": 32},
    {"brand": "Nike", "name": "Alphafly 3", "category": "race", 
     "tags": ["fast", "responsive", "lightweight"], 
     "weight": 212, "drop": 8, "stack_height_heel": 40, "stack_height_forefoot": 32},
    {"brand": "Nike", "name": "Streakfly", "category": "race", 
     "tags": ["lightweight", "fast", "snappy"], 
     "weight": 170, "drop": 6, "stack_height_heel": 33, "stack_height_forefoot": 27},
    
    # ASICS
    {"brand": "ASICS", "name": "Metaspeed Sky Paris", "category": "race", 
     "tags": ["fast", "responsive", "lightweight"], 
     "weight": 185, "drop": 5, "stack_height_heel": 42, "stack_height_forefoot": 37},
    {"brand": "ASICS", "name": "Metaspeed Edge Paris", "category": "race", 
     "tags": ["fast", "responsive", "snappy"], 
     "weight": 182, "drop": 5, "stack_height_heel": 36, "stack_height_forefoot": 31},
    
    # New Balance
    {"brand": "New Balance", "name": "SC Elite v4", "category": "race", 
     "tags": ["fast", "responsive", "lightweight"], 
     "weight": 198, "drop": 8, "stack_height_heel": 39, "stack_height_forefoot": 31},
    {"brand": "New Balance", "name": "FuelCell RC Elite v2", "category": "race", 
     "tags": ["fast", "responsive", "lightweight"], 
     "weight": 195, "drop": 8, "stack_height_heel": 38, "stack_height_forefoot": 30},
    
    # Saucony
    {"brand": "Saucony", "name": "Endorphin Elite", "category": "race", 
     "tags": ["fast", "responsive", "lightweight"], 
     "weight": 195, "drop": 8, "stack_height_heel": 40, "stack_height_forefoot": 32},
    {"brand": "Saucony", "name": "Endorphin Pro 4", "category": "race", 
     "tags": ["fast", "responsive", "lightweight"], 
     "weight": 199, "drop": 8, "stack_height_heel": 38, "stack_height_forefoot": 30},
    
    # adidas
    {"brand": "adidas", "name": "Adizero Adios Pro 3", "category": "race", 
     "tags": ["fast", "responsive", "lightweight"], 
     "weight": 215, "drop": 6, "stack_height_heel": 39, "stack_height_forefoot": 33},
    {"brand": "adidas", "name": "Adizero Prime X 2", "category": "race", 
     "tags": ["fast", "cushioned", "responsive"], 
     "weight": 245, "drop": 5, "stack_height_heel": 50, "stack_height_forefoot": 45},
    
    # HOKA
    {"brand": "HOKA", "name": "Cielo X1", "category": "race", 
     "tags": ["fast", "responsive", "lightweight"], 
     "weight": 197, "drop": 5, "stack_height_heel": 36, "stack_height_forefoot": 31},
    {"brand": "HOKA", "name": "Rocket X 2", "category": "race", 
     "tags": ["fast", "responsive", "lightweight"], 
     "weight": 219, "drop": 5, "stack_height_heel": 39, "stack_height_forefoot": 34},
    
    # Brooks
    {"brand": "Brooks", "name": "Hyperion Elite 4", "category": "race", 
     "tags": ["fast", "responsive", "lightweight"], 
     "weight": 199, "drop": 8, "stack_height_heel": 37, "stack_height_forefoot": 29},
    
    # Puma
    {"brand": "Puma", "name": "Fast-R Nitro Elite 2", "category": "race", 
     "tags": ["fast", "responsive", "lightweight"], 
     "weight": 195, "drop": 8, "stack_height_heel": 39, "stack_height_forefoot": 31},
]


def verify_connection() -> bool:
    """Verify Supabase connection is working"""
    try:
        print(f"🔗 Connecting to Supabase: {settings.SUPABASE_URL[:50]}...")
        
        # Try a simple query to verify connection
        response = supabase_admin.table("shoes").select("count", count="exact").limit(1).execute()
        
        print(f"✅ Connection successful!")
        print(f"   Current shoe count: {response.count or 0}")
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        return False


def clear_shoes() -> bool:
    """Clear all existing shoe data"""
    try:
        print("🗑️  Clearing existing shoe data...")
        
        # Delete all shoes (this will cascade to rotation and graveyard)
        supabase_admin.table("shoes").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        
        print("✅ Shoes cleared successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Failed to clear shoes: {str(e)}")
        return False


def seed_shoes() -> bool:
    """Seed the database with shoe data"""
    try:
        print(f"🌱 Seeding {len(SHOES_DATA)} shoes...")
        
        # Insert shoes in batches for better performance
        batch_size = 20
        total_inserted = 0
        
        for i in range(0, len(SHOES_DATA), batch_size):
            batch = SHOES_DATA[i:i + batch_size]
            
            response = supabase_admin.table("shoes").upsert(
                batch,
                on_conflict="brand,name"  # Update if exists
            ).execute()
            
            batch_count = len(response.data) if response.data else 0
            total_inserted += batch_count
            print(f"   Inserted batch {i // batch_size + 1}: {batch_count} shoes")
        
        print(f"✅ Successfully seeded {total_inserted} shoes!")
        return True
        
    except Exception as e:
        print(f"❌ Failed to seed shoes: {str(e)}")
        return False


def show_stats():
    """Show current database statistics"""
    try:
        print("\n📊 Database Statistics:")
        
        # Total shoes
        response = supabase_admin.table("shoes").select("*", count="exact").execute()
        print(f"   Total shoes: {response.count or 0}")
        
        # By category
        for category in ["daily", "workout", "race"]:
            cat_response = supabase_admin.table("shoes").select("*", count="exact").eq("category", category).execute()
            print(f"   {category.capitalize()}: {cat_response.count or 0}")
        
        # By brand
        print("\n   Shoes by brand:")
        all_shoes = response.data or []
        brand_counts = {}
        for shoe in all_shoes:
            brand = shoe.get("brand", "Unknown")
            brand_counts[brand] = brand_counts.get(brand, 0) + 1
        
        for brand, count in sorted(brand_counts.items()):
            print(f"   - {brand}: {count}")
            
    except Exception as e:
        print(f"⚠️  Could not fetch stats: {str(e)}")


def main():
    parser = argparse.ArgumentParser(description="Seed the TurnOver database")
    parser.add_argument("--clear", action="store_true", help="Clear existing data before seeding")
    parser.add_argument("--verify", action="store_true", help="Only verify connection, don't seed")
    parser.add_argument("--stats", action="store_true", help="Show database statistics")
    
    args = parser.parse_args()
    
    print("=" * 50)
    print("🏃 TurnOver Database Seeding Script")
    print("=" * 50)
    
    # Always verify connection first
    if not verify_connection():
        print("\n⚠️  Please check your .env file and Supabase credentials.")
        sys.exit(1)
    
    if args.verify:
        show_stats()
        return
    
    if args.stats:
        show_stats()
        return
    
    if args.clear:
        if not clear_shoes():
            sys.exit(1)
    
    # Seed the database
    if not seed_shoes():
        sys.exit(1)
    
    # Show final stats
    show_stats()
    
    print("\n" + "=" * 50)
    print("✨ Database seeding complete!")
    print("=" * 50)


if __name__ == "__main__":
    main()
