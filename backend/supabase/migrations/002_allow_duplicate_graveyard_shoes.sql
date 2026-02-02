-- Allow users to have the same shoe in their graveyard multiple times
-- This is common for runners who buy the same shoe multiple times

-- Drop the unique constraint on graveyard (user_id, shoe_id)
ALTER TABLE graveyard DROP CONSTRAINT IF EXISTS graveyard_user_id_shoe_id_key;

-- Add index for faster lookups (since we removed the unique constraint which had implicit index)
CREATE INDEX IF NOT EXISTS idx_graveyard_user_shoe ON graveyard(user_id, shoe_id);
