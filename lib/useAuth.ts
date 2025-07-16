'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const login = () => {
    router.push('/auth');
  };

  const logout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return {
    user: session?.user,
    error: null,
    isLoading: status === 'loading',
    login,
    logout,
    isAuthenticated: !!session,
  };
} 