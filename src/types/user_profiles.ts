export type UserRole = 'admin' | 'colaborador';

export interface UserProfile {
  id: string; // uuid (auth.users.id)
  email: string;
  full_name?: string | null;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
} 