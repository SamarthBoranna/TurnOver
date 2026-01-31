# Frontend Assumptions

## Data Expectations

### User

```
{
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  avgMilesPerWeek: number
}
```

### Shoe

```
{
  id: string,
  name: string,
  brand: string,
  category: "daily" | "workout" | "race",
  tags: string[],
  drop: number,
  weight: number,
  stackHeightHeel: number,
  stackHeightForefoot: number,
  imageUrl: string
}
```

## UX Rules

* Rating required when archiving shoe
* Shoe cannot exist in rotation and graveyard simultaneously
