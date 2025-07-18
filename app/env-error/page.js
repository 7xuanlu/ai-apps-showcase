'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function EnvironmentErrorPage() {
  const searchParams = useSearchParams()
  const [errors, setErrors] = useState([])
  const [warnings, setWarnings] = useState([])
  const [isProduction, setIsProduction] = useState(false)
  const [timestamp, setTimestamp] = useState('')
  
  useEffect(() => {
    // Parse errors and warnings from URL parameters
    try {
      const errorParam = searchParams.get('errors')
      const warningParam = searchParams.get('warnings')
      const productionParam = searchParams.get('production')
      const timestampParam = searchParams.get('timestamp')
      
      if (errorParam) {
        setErrors(JSON.parse(errorParam))
      }
      
      if (warningParam) {
        setWarnings(JSON.parse(warningParam))
      }
      
      setIsProduction(productionParam === 'true')
      setTimestamp(timestampParam || new Date().toISOString())
    } catch (e) {
      console.error('Failed to parse error parameters:', e)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full">
        <div className="flex items-center mb-6">
          <div className="bg-red-100 p-3 rounded-full">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold">Environment Configuration Error</h1>
            {timestamp && (
              <p className="text-sm text-gray-500 mt-1">
                Detected at: {new Date(timestamp).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          {isProduction ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <h2 className="text-lg font-semibold text-red-800 mb-2">Production Configuration Error</h2>
              <p className="text-red-700 mb-3">
                The application cannot start due to environment configuration issues in production.
              </p>
              <p className="text-red-700 text-sm">
                For security reasons, detailed error information is not displayed in production.
                Please check your server logs or contact your system administrator.
              </p>
            </div>
          ) : (
            <p className="text-gray-700 mb-4">
              The application cannot start because of environment configuration issues.
              Please fix the following errors before continuing:
            </p>
          )}
          
          {!isProduction && errors.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <h2 className="text-lg font-semibold text-red-800 mb-2">Configuration Errors</h2>
              <ul className="list-disc pl-5 space-y-2">
                {errors.map((error, index) => (
                  <li key={index} className="text-red-700 text-sm leading-relaxed">{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          {!isProduction && warnings.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
              <h2 className="text-lg font-semibold text-yellow-800 mb-2">Configuration Warnings</h2>
              <ul className="list-disc pl-5 space-y-2">
                {warnings.map((warning, index) => (
                  <li key={index} className="text-yellow-700 text-sm leading-relaxed">{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-3 text-blue-800">Development Setup</h2>
            <ul className="list-disc pl-5 space-y-2 text-blue-700 text-sm">
              <li>Copy <code className="bg-blue-100 px-1 rounded">.env.example</code> to <code className="bg-blue-100 px-1 rounded">.env.local</code></li>
              <li>Set <code className="bg-blue-100 px-1 rounded">DATABASE_PROVIDER="sqlite"</code></li>
              <li>Set <code className="bg-blue-100 px-1 rounded">DATABASE_URL="file:./dev.db"</code></li>
              <li>Generate secret: <code className="bg-blue-100 px-1 rounded">openssl rand -base64 32</code></li>
              <li>Set <code className="bg-blue-100 px-1 rounded">NEXTAUTH_URL="http://localhost:3000"</code></li>
              <li>Run: <code className="bg-blue-100 px-1 rounded">npm run env:validate</code></li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-3 text-green-800">Production Setup</h2>
            <ul className="list-disc pl-5 space-y-2 text-green-700 text-sm">
              <li>Create Supabase project and get credentials</li>
              <li>Set <code className="bg-green-100 px-1 rounded">DATABASE_PROVIDER="postgresql"</code></li>
              <li>Configure <code className="bg-green-100 px-1 rounded">SUPABASE_URL</code> and <code className="bg-green-100 px-1 rounded">SUPABASE_ANON_KEY</code></li>
              <li>Set production domain in <code className="bg-green-100 px-1 rounded">NEXTAUTH_URL</code></li>
              <li>Use secure <code className="bg-green-100 px-1 rounded">NEXTAUTH_SECRET</code></li>
              <li>Configure all variables in Vercel dashboard</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="bg-white p-3 rounded border">
                <h3 className="font-medium mb-2">Validate Configuration</h3>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded block">npm run env:validate</code>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white p-3 rounded border">
                <h3 className="font-medium mb-2">Check Database</h3>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded block">npm run db:validate</code>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white p-3 rounded border">
                <h3 className="font-medium mb-2">View Example</h3>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded block">cat .env.example</code>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="font-semibold text-yellow-800 mb-2">💡 Need Help?</h3>
          <p className="text-yellow-700 text-sm">
            After fixing the configuration issues, restart your development server or redeploy to production.
            If problems persist, check the application logs for additional details.
          </p>
        </div>
      </div>
    </div>
  )
}