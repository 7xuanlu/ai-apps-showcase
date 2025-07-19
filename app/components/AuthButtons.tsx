'use client';

import { useAuth } from '@/lib/useAuth';
import { signOut } from 'next-auth/react';

export default function AuthButtons() {
  const { user, isLoading, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center space-x-2 md:space-x-4">
        <div className="flex items-center space-x-2">
          {user.image && (
            <img
              src={user.image}
              alt={user.name || 'User'}
              className="w-6 h-6 md:w-8 md:h-8 rounded-full"
            />
          )}
          <span className="text-gray-800 font-medium text-sm md:text-base hidden sm:block">
            {user.name || user.email}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-md transition-colors duration-200 text-sm md:text-base"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => window.location.href = '/auth'}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 md:px-6 md:py-2 rounded-md transition-colors duration-200 font-medium text-sm md:text-base w-full md:w-auto"
    >
      Login
    </button>
  );
} 