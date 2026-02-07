#!/usr/bin/env python3
"""
Shoe Image Fetcher for TurnOver
Fetches shoe images from The Sneaker Database API (RapidAPI) and updates the database

Usage:
    python -m app.scripts.fetch_shoe_images
    
    Or with options:
    python -m app.scripts.fetch_shoe_images --dry-run    # Preview without updating DB
    python -m app.scripts.fetch_shoe_images --limit 5    # Process only first 5 shoes
    python -m app.scripts.fetch_shoe_images --force      # Re-fetch even if image exists
"""

import sys
import argparse
import time
import httpx
from typing import Optional, Dict, Any, List

# Add parent directory to path for imports
sys.path.insert(0, '.')

from app.core.supabase import supabase_admin
from app.core.config import settings


# ============================================
# API CONFIGURATION
# ============================================
RAPIDAPI_HOST = "the-sneaker-database.p.rapidapi.com"
API_BASE_URL = f"https://{RAPIDAPI_HOST}"

# Rate limiting - be respectful of API limits
REQUEST_DELAY_SECONDS = 0.5  # Delay between API requests


def get_headers() -> Dict[str, str]:
    """Get API request headers"""
    return {
        "X-RapidAPI-Key": settings.RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST
    }


def search_sneaker(brand: str, name: str) -> Optional[Dict[str, Any]]:
    """
    Search for a sneaker in The Sneaker Database
    
    Args:
        brand: The shoe brand (e.g., "Nike", "ASICS")
        name: The shoe model name (e.g., "Pegasus 41")
    
    Returns:
        The best matching sneaker data, or None if not found
    """
    try:
        # The Sneaker Database API endpoint: /sneakers with brand, name, and limit params
        # Limit must be between 10-100
        params = {
            "limit": 10,
            "brand": brand,
            "name": name
        }
        url = f"{API_BASE_URL}/sneakers"
        
        with httpx.Client(timeout=15.0) as client:
            response = client.get(url, headers=get_headers(), params=params)
        
        if response.status_code == 200:
            data = response.json()
            
            # API returns {"count": N, "results": [...]}
            results = data.get('results', [])
            if results and len(results) > 0:
                # Return the first (best) match
                return results[0]
            else:
                print(f"   ⚠️  No results found")
        
        elif response.status_code == 404:
            print(f"   ⚠️  No results found for: {brand} {name}")
        else:
            print(f"   ❌ API error ({response.status_code}): {response.text[:100]}")
            
    except httpx.TimeoutException:
        print(f"   ⏱️  Timeout searching for: {brand} {name}")
    except httpx.RequestError as e:
        print(f"   ❌ Request error: {str(e)[:100]}")
    except Exception as e:
        print(f"   ❌ Unexpected error: {str(e)[:100]}")
    
    return None


def extract_image_url(sneaker_data: Dict[str, Any]) -> Optional[str]:
    """
    Extract the best image URL from sneaker data
    
    The API may return images in various formats. This function handles
    the different possible structures.
    """
    if not sneaker_data:
        return None
    
    # Try common image field names
    image_fields = [
        'image',
        'thumbnail', 
        'imageUrl',
        'image_url',
        'main_picture_url',
        'grid_picture_url',
        'small_picture_url',
        'original_picture_url'
    ]
    
    for field in image_fields:
        if field in sneaker_data and sneaker_data[field]:
            url = sneaker_data[field]
            # Handle nested image objects
            if isinstance(url, dict):
                url = url.get('original') or url.get('small') or url.get('thumbnail')
            if url and isinstance(url, str) and url.startswith('http'):
                return url
    
    # Check for nested media/images array
    media = sneaker_data.get('media', {})
    if isinstance(media, dict):
        for field in ['imageUrl', 'smallImageUrl', 'thumbUrl']:
            if field in media and media[field]:
                return media[field]
    
    # Check for images array
    images = sneaker_data.get('images', [])
    if images and len(images) > 0:
        if isinstance(images[0], str):
            return images[0]
        elif isinstance(images[0], dict):
            return images[0].get('url') or images[0].get('src')
    
    return None


def get_all_shoes() -> List[Dict[str, Any]]:
    """Fetch all shoes from the database"""
    try:
        response = supabase_admin.table("shoes").select("*").order("brand").execute()
        return response.data or []
    except Exception as e:
        print(f"❌ Failed to fetch shoes: {str(e)}")
        return []


def update_shoe_image(shoe_id: str, image_url: str) -> bool:
    """Update a shoe's image URL in the database"""
    try:
        supabase_admin.table("shoes").update({
            "image_url": image_url
        }).eq("id", shoe_id).execute()
        return True
    except Exception as e:
        print(f"   ❌ Failed to update database: {str(e)}")
        return False


def fetch_and_update_images(
    dry_run: bool = False,
    limit: Optional[int] = None,
    force: bool = False
) -> Dict[str, int]:
    """
    Main function to fetch images and update the database
    
    Args:
        dry_run: If True, don't actually update the database
        limit: Maximum number of shoes to process
        force: If True, re-fetch even if image already exists
    
    Returns:
        Stats dictionary with counts
    """
    stats = {
        "total": 0,
        "skipped": 0,
        "found": 0,
        "not_found": 0,
        "updated": 0,
        "errors": 0
    }
    
    print("📋 Fetching shoes from database...")
    shoes = get_all_shoes()
    
    if not shoes:
        print("❌ No shoes found in database")
        return stats
    
    # Apply limit if specified
    if limit:
        shoes = shoes[:limit]
    
    stats["total"] = len(shoes)
    print(f"📦 Processing {len(shoes)} shoes...\n")
    
    for i, shoe in enumerate(shoes, 1):
        shoe_id = shoe['id']
        brand = shoe['brand']
        name = shoe['name']
        current_image = shoe.get('image_url')
        
        print(f"[{i}/{len(shoes)}] {brand} {name}")
        
        # Skip if already has image (unless force flag is set)
        if current_image and not force:
            print(f"   ✓ Already has image, skipping")
            stats["skipped"] += 1
            continue
        
        # Search for the sneaker
        sneaker_data = search_sneaker(brand, name)
        
        if sneaker_data:
            image_url = extract_image_url(sneaker_data)
            
            if image_url:
                print(f"   🖼️  Found image: {image_url[:60]}...")
                stats["found"] += 1
                
                if not dry_run:
                    if update_shoe_image(shoe_id, image_url):
                        print(f"   ✅ Updated in database")
                        stats["updated"] += 1
                    else:
                        stats["errors"] += 1
                else:
                    print(f"   🔍 [DRY RUN] Would update database")
            else:
                print(f"   ⚠️  Found shoe data but no image URL")
                stats["not_found"] += 1
        else:
            stats["not_found"] += 1
        
        # Rate limiting
        if i < len(shoes):
            time.sleep(REQUEST_DELAY_SECONDS)
    
    return stats


def print_stats(stats: Dict[str, int], dry_run: bool):
    """Print summary statistics"""
    print("\n" + "=" * 50)
    print("📊 Summary")
    print("=" * 50)
    print(f"   Total processed: {stats['total']}")
    print(f"   Already had images: {stats['skipped']}")
    print(f"   Images found: {stats['found']}")
    print(f"   Images not found: {stats['not_found']}")
    if not dry_run:
        print(f"   Successfully updated: {stats['updated']}")
        print(f"   Errors: {stats['errors']}")
    else:
        print(f"   [DRY RUN - No changes made]")


def test_api_connection():
    """Test the API connection with a known sneaker"""
    print("🔗 Testing API connection...")
    
    # Test with a popular shoe that should definitely be in the database
    test_data = search_sneaker("Nike", "Air Max")
    
    if test_data:
        print("✅ API connection successful!")
        print(f"   Sample response keys: {list(test_data.keys())[:5]}")
        
        image_url = extract_image_url(test_data)
        if image_url:
            print(f"   Sample image URL: {image_url[:60]}...")
        else:
            print("   ⚠️  No image found in sample response")
            print(f"   Full response: {test_data}")
        return True
    else:
        print("❌ API connection failed or no results returned")
        print("   Please verify your API key and subscription")
        return False


def main():
    parser = argparse.ArgumentParser(description="Fetch shoe images from The Sneaker Database API")
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without updating database")
    parser.add_argument("--limit", type=int, help="Maximum number of shoes to process")
    parser.add_argument("--force", action="store_true", help="Re-fetch even if image already exists")
    parser.add_argument("--test", action="store_true", help="Test API connection only")
    
    args = parser.parse_args()
    
    print("=" * 50)
    print("🏃 TurnOver Shoe Image Fetcher")
    print("=" * 50)
    
    # Check Supabase connection
    if not supabase_admin:
        print("❌ Supabase not configured. Please check your .env file.")
        sys.exit(1)
    
    # Check RapidAPI key
    if not settings.RAPIDAPI_KEY:
        print("❌ RAPIDAPI_KEY not configured. Please add it to your .env file.")
        print("   Example: RAPIDAPI_KEY=your_key_here")
        sys.exit(1)
    
    print(f"🔑 Using RapidAPI key: {settings.RAPIDAPI_KEY[:10]}...")
    
    # Test API connection first
    if args.test or not test_api_connection():
        if args.test:
            return
        print("\n⚠️  Continuing anyway - some requests may fail")
    
    print()
    
    # Run the main fetch and update process
    stats = fetch_and_update_images(
        dry_run=args.dry_run,
        limit=args.limit,
        force=args.force
    )
    
    # Print summary
    print_stats(stats, args.dry_run)
    
    print("\n" + "=" * 50)
    print("✨ Shoe image fetch complete!")
    print("=" * 50)


if __name__ == "__main__":
    main()
