import { supabase } from '../lib/supabase';
import { Notification } from '../types';

export const notificationService = {
  async getAll() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`target_user_id.eq.${user.id},target_user_id.is.null`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Notification[];
  },

  async markAsRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ status: 'read' })
      .eq('id', id);
    if (error) throw error;
  },

  async markAllAsRead() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('notifications')
      .update({ status: 'read' })
      .or(`target_user_id.eq.${user.id},target_user_id.is.null`)
      .eq('status', 'unread');

    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async create(notification: Omit<Notification, 'id' | 'created_at' | 'status'>) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{ ...notification, status: 'unread' }])
      .select()
      .single();
    if (error) throw error;
    return data as Notification;
  }
};