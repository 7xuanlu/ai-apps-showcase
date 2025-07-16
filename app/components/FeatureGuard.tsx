'use client';

import { useAuth } from '@/lib/useAuth';
import { ReactNode } from 'react';

interface FeatureGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

export default function FeatureGuard({ 
  children, 
  fallback,
  className = "opacity-50 pointer-events-none" 
}: FeatureGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // If user is authenticated, show the AI feature normally
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If user is not authenticated, show disabled state or fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default: show children with disabled styling
  return (
    <div className={className}>
      {children}
    </div>
  );
} 