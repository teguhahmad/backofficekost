export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'system' | 'user' | 'property' | 'payment';
  status: 'unread' | 'read';
  created_at: string;
  target_user_id?: string;
  target_property_id?: string;
}