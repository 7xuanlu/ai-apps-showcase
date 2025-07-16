'use client';

import { useAuth } from '@/lib/useAuth';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

export default function AuthDemoPage() {
  const { user, isLoading, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Auth.js Authentication Demo
        </h1>
        <p className="text-lg text-gray-600">
          This page demonstrates the Auth.js authentication functionality with Google, GitHub, and username/password providers.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Authentication Status */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Authentication Status
          </h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          ) : isAuthenticated ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-700 font-medium">Authenticated</span>
              </div>
              
              {user?.image && (
                <img
                  src={user.image}
                  alt={user.name || 'User'}
                  className="w-16 h-16 rounded-full mx-auto"
                />
              )}
              
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {user?.name || 'User'}
                </h3>
                <p className="text-gray-600">{user?.email}</p>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-red-700 font-medium">Not Authenticated</span>
              </div>
              
              <p className="text-gray-600 text-center">
                Click the button below to log in with Auth.js
              </p>
              
              <button
                onClick={() => window.location.href = '/login'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
              >
                Login with Auth.js
              </button>
            </div>
          )}
        </div>

        {/* Features List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Features Included
          </h2>
          
          <ul className="space-y-3">
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Google OAuth Integration</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>GitHub OAuth Integration</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Username/Password Authentication</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Session Management</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Protected Routes</span>
            </li>

            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Responsive UI</span>
            </li>
          </ul>
          

        </div>
      </div>

      {/* User Data Display */}
      {isAuthenticated && user && (
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            User Data
          </h2>
          <div className="bg-gray-50 p-4 rounded-md">
            <pre className="text-sm text-gray-700 overflow-x-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Setup Instructions */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-blue-900 mb-4">
          Setup Instructions
        </h2>
        <p className="text-blue-800 mb-4">
          To get this authentication working, you need to set up environment variables for Google and GitHub OAuth.
        </p>
        <div className="space-y-2 text-sm text-blue-700">
          <p>1. Create Google OAuth credentials in Google Cloud Console</p>
          <p>2. Create GitHub OAuth app in GitHub Developer Settings</p>
          <p>3. Set up environment variables in <code>.env.local</code></p>
          <p>4. Start the development server</p>
        </div>
      </div>
    </div>
  );
} 