/*
  # Clean up notifications table

  1. Changes
    - Remove unused columns
    - Add proper constraints
    - Clean up redundant fields
    
  2. Security
    - Maintain existing RLS policies
*/

-- Remove unused columns
ALTER TABLE notifications
DROP COLUMN IF EXISTS sender_id,
DROP COLUMN IF EXISTS property_id,
DROP COLUMN IF EXISTS room_id,
DROP COLUMN IF EXISTS metadata,
DROP COLUMN IF EXISTS recipient_type,
DROP COLUMN IF EXISTS is_system_generated;

-- Add NOT NULL constraints where appropriate
ALTER TABLE notifications
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN message SET NOT NULL,
ALTER COLUMN type SET NOT NULL,
ALTER COLUMN status SET NOT NULL;

-- Add type constraint to ensure valid values
ALTER TABLE notifications
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('system', 'user', 'property', 'payment', 'maintenance'));

-- Add status constraint
ALTER TABLE notifications
ADD CONSTRAINT notifications_status_check
CHECK (status IN ('read', 'unread'));