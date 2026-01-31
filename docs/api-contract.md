# API Contract (Initial)

## Auth

* All endpoints require authenticated user
* User ID derived from Supabase JWT

## Endpoints

### GET /me

Returns current user profile

### PUT /me

Updates user profile

### GET /shoes

Returns shoe database

### POST /rotation

Adds shoe to rotation

### DELETE /rotation/{id}

Removes shoe from rotation

### POST /graveyard

Archives shoe with rating

### GET /recommendations

Returns ranked shoe recommendations

Response shape:

```
[
  {
    shoeId: string,
    score: number,
    explanation: string
  }
]
```
