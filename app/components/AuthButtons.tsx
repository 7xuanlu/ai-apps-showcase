'use client';

import { useAuth } from '@/lib/useAuth';
import { signOut } from 'next-auth/react';

export default function AuthButtons() {
  const { user, isLoading, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="text-gray-600">Loading...</span>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {user.image && (
            <img
              src={user.image}
              alt={user.name || 'User'}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-gray-800 font-medium">
            {user.name || user.email}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => window.location.href = '/auth'}
      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors duration-200 font-medium"
    >
      Login
    </button>
  );
} 