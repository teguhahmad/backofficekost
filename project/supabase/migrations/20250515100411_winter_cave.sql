/*
  # Clean up notifications table

  1. Changes
    - Drop unused columns while preserving dependencies
    - Add NOT NULL constraints for required fields
    - Add CHECK constraints for type and status values
    - Update RLS policies to work with new schema

  2. Security
    - Recreate policies to maintain security rules
    - Ensure proper access control is maintained
*/

-- First drop the existing policies
DROP POLICY IF EXISTS "Property owners can view their property notifications" ON notifications;
DROP POLICY IF EXISTS "Recipients can view their notifications" ON notifications;
DROP POLICY IF EXISTS "Property managers can view their property notifications" ON notifications;
DROP POLICY IF EXISTS "Superadmins can create manual notifications" ON notifications;
DROP POLICY IF EXISTS "Superadmins can delete all notifications" ON notifications;
DROP POLICY IF EXISTS "Superadmins can update all notifications" ON notifications;
DROP POLICY IF EXISTS "Superadmins can view all notifications" ON notifications;
DROP POLICY IF EXISTS "System can create automated notifications" ON notifications;
DROP POLICY IF EXISTS "Tenants can view their notifications" ON notifications;
DROP POLICY IF EXISTS "Users can mark their notifications as read" ON notifications;

-- Now we can safely remove the unused columns
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

-- Recreate the policies with updated conditions
CREATE POLICY "Users can view their notifications"
ON notifications
FOR SELECT
TO authenticated
USING (
  target_user_id = auth.uid() OR 
  target_user_id IS NULL
);

CREATE POLICY "Users can mark their notifications as read"
ON notifications
FOR UPDATE
TO authenticated
USING (target_user_id = auth.uid())
WITH CHECK (
  target_user_id = auth.uid() AND 
  status = 'read'
);

CREATE POLICY "Superadmins can manage all notifications"
ON notifications
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM backoffice_users
    WHERE user_id = auth.uid()
    AND role = 'superadmin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM backoffice_users
    WHERE user_id = auth.uid()
    AND role = 'superadmin'
  )
);