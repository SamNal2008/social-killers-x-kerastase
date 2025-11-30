import { supabase } from './supabase';
import type { Tables } from '~/shared/types/database.types';

type User = Tables<'users'>;

const generateGuestName = (): string => {
  const timestamp = Date.now();
  return `Guest-${timestamp}`;
};

export const userService = {
  async create(): Promise<User> {
    const guestName = generateGuestName();

    const { data, error } = await supabase
      .from('users')
      .insert({ name: guestName })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data;
  },

  async update(userId: string, name: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ name })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data;
  },
};
