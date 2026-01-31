# Supabase Schema

## users

* id (uuid, PK)
* first_name
* last_name
* email
* avg_miles_per_week

## shoes

* id
* name
* brand
* category
* tags (text[])
* metadata (jsonb)
* image_url

## user_rotation

* id
* user_id (FK)
* shoe_id (FK)
* start_date

## user_graveyard

* id
* user_id (FK)
* shoe_id (FK)
* rating (1–5)
* review

## RLS Principles

* Users can only access their own rotation + graveyard
* Shoe table is read-only for users
