import { supabase } from './supabase';
import type { Tables, TablesInsert } from '~/shared/types/database.types';
import { isDevelopment } from '~/shared/utils/env';

type User = Tables<'users'>;
type UserInsert = TablesInsert<'users'>;

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

    // Log user creation in development
    if (isDevelopment()) {
      console.log('User created:', data);
    }

    return data;
  },
};
