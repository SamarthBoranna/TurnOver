# Recommendation Logic

## Inputs

* User graveyard shoes
* User ratings
* Shoe metadata

## Scoring Strategy (Initial)

1. For each graveyard shoe:

   * Weight = rating / 5

2. Similarity dimensions:

   * Category match (high weight)
   * Tag overlap
   * Numeric distance (drop, stack height, weight)

3. Final Score:

```
score = Σ(weight × similarity)
```

## Output

* Top N shoes
* Exclude shoes already used by user
