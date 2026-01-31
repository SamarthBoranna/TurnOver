# Product Requirements Document (PRD)

## Product Name

**TurnOver** 

## Overview

StrideStack is a web application that helps runners manage their current running shoe rotation, archive past shoes with ratings ("graveyard"), and discover new shoe recommendations. Recommendations are generated using similarity scoring between a user's historical shoe ratings and curated shoe metadata.

The app prioritizes a clean, modern, black-and-white aesthetic and a simple, intuitive user experience. Shoe data is manually curated to ensure quality and consistency.

---

## Goals & Objectives

### Primary Goals

* Help runners track and manage their current and past running shoes
* Provide personalized shoe recommendations based on past preferences
* Offer a minimal, elegant UI focused on usability

### Success Metrics

* % of users who add at least one shoe to rotation
* % of users who rate shoes in the graveyard
* Recommendation click-through rate
* Repeat visits / retained users

---

## Target Users

### Primary User

* Recreational to serious runners
* Runs consistently (10–70+ miles/week)
* Owns or has owned multiple running shoes
* Interested in gear optimization but not overwhelmed by technical specs

---

## Core Features

### 1. Authentication & User Profiles

**Handled by Supabase Auth**

#### User Profile Fields

* First Name
* Last Name
* Email
* Average miles run per week

#### Requirements

* Email/password authentication
* Secure session handling
* Editable profile information

---

### 2. Shoe Database (Manually Curated)

#### Shoe Attributes

* Shoe ID
* Shoe Name
* Brand Name
* Primary Category (one of):

  * Daily Trainer
  * Workout
  * Race Day
* Tags (multi-select):

  * Daily trainer
  * Workout
  * Race day
  * Max-cushion
  * Lightweight
  * Stability (optional)
* Metadata:

  * Stack height (heel / forefoot)
  * Heel-to-drop
  * Weight
  * Cushion type (text)
* Shoe Image (URL)
* Release year (optional)

#### Notes

* Metadata is intentionally limited to avoid overcomplexity
* All shoes are added and maintained manually (no external API dependency)

---

### 3. Current Shoe Rotation

#### Functionality

* Users can add shoes from the database to their current rotation
* Each rotation entry includes:

  * Shoe
  * Start date
  * Optional notes

#### UI Behavior

* Displayed as cards or a simple list
* Shows shoe image, name, brand, and category
* Ability to remove or move shoe to graveyard

---

### 4. Shoe Graveyard (Past Shoes)

#### Functionality

* Users can archive shoes they no longer run in
* Required rating (1–5 stars)
* Optional text review

#### Purpose

* Ratings are used as primary signals for recommendations
* Graveyard acts as a personal running history

---

### 5. Recommendation Engine

#### Recommendation Inputs

* User shoe ratings (from graveyard)
* Shoe metadata similarity
* Shoe category alignment

#### Recommendation Logic (High-Level)

1. Weight user's past shoes by rating
2. Compute similarity scores between past shoes and candidate shoes using:

   * Category match
   * Tag overlap
   * Numeric metadata distance (stack height, drop, weight)
3. Rank and surface top recommendations

#### Output

* Recommended shoes with:

  * Shoe image
  * Name & brand
  * Category
  * "Why recommended" explanation (simple, human-readable)

---

## UI / UX Requirements

### Design Principles

* Black & white color palette (grayscale accents allowed)
* Modern, sleek, minimal layout
* Strong typography hierarchy
* Generous whitespace

### Key Screens

1. **Landing Page**

   * Product value proposition
   * CTA to sign up / log in

2. **Dashboard**

   * Current rotation summary
   * Quick access to recommendations

3. **Shoe Database Browser**

   * Filter by brand, category, tags
   * Search by shoe name

4. **Recommendations Page**

   * Ranked list of suggested shoes
   * Simple explanation for each recommendation

5. **Profile Page**

   * User info
   * Weekly mileage
   * Edit profile

---

## Technical Architecture

### Frontend

* Framework: **Next.js (React)**
* Styling: **Tailwind CSS**
* UI Generation: **V0**
* Features:

  * Server-side rendering for SEO
  * Responsive design

### Backend

* Framework: **FastAPI (Python)**
* Responsibilities:

  * Recommendation engine
  * Business logic
  * Secure API endpoints

### Database & Auth

* **Supabase**
* PostgreSQL for relational data
* Supabase Auth for authentication

---

## Data Models (High-Level)

### User

* id
* first_name
* last_name
* email
* avg_miles_per_week

### Shoe

* id
* name
* brand
* category
* tags[]
* metadata (JSON)
* image_url

### UserShoeRotation

* id
* user_id
* shoe_id
* start_date

### UserShoeGraveyard

* id
* user_id
* shoe_id
* rating (1–5)
* review (optional)

---

## Non-Goals (Out of Scope for MVP)

* Automatic mileage tracking
* Wear-based shoe retirement predictions
* Social features (friends, sharing)
* External shoe APIs

---

## Future Enhancements

* Mileage-based wear tracking
* More advanced recommendation tuning
* Brand-neutral comparison views
* Dark/light theme toggle

---

## Risks & Considerations

* Manual shoe curation requires ongoing effort
* Recommendation quality depends on rating volume
* UI must balance simplicity with useful information

---

## MVP Definition

The MVP is successful when a user can:

1. Sign up and create a profile
2. Add shoes to their rotation
3. Archive shoes with ratings
4. Receive personalized shoe recommendations
