# Auth.js Setup Instructions

This guide will help you set up Auth.js (NextAuth.js v5) authentication with Google, GitHub, and username/password providers in your Next.js application.

## 1. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Auth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### How to get these values:

1. **NEXTAUTH_SECRET**: Generate a random string (32+ characters)
   ```bash
   openssl rand -hex 32
   ```

2. **NEXTAUTH_URL**: Your application URL (http://localhost:3000 for development)

## 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure:
   - **Application type**: Web application
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret to your `.env.local`

## 3. GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Configure:
   - **Application name**: Your app name
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Client Secret to your `.env.local`

## 4. Testing the Setup

1. Start your development server:
   ```bash
   yarn dev
   ```

2. Navigate to `http://localhost:3000`

3. Click the "Login" button in the navbar

4. You should see the login page with options for:
   - Google login
   - GitHub login
   - Username/password (demo credentials: demo@example.com / demo123)

## 5. Features Included

- ✅ Google OAuth Integration
- ✅ GitHub OAuth Integration
- ✅ Username/Password Authentication
- ✅ Session Management
- ✅ Protected Routes (profile page)
- ✅ Responsive UI with Tailwind CSS
- ✅ TypeScript Support
- ✅ Custom Login Page
- ✅ User Profile Display

## 6. File Structure

```
app/
├── api/auth/
│   └── [...nextauth]/
│       └── route.ts
├── components/
│   ├── AuthButtons.tsx
│   └── Navbar.js (updated)
├── login/
│   └── page.tsx
├── profile/
│   └── page.tsx
├── demo-auth/
│   └── page.tsx
└── layout.js (updated)

lib/
└── useAuth.ts

auth.ts (updated)
middleware.ts (updated)
```

## 7. Demo Credentials

For testing username/password authentication:
- **Email**: demo@example.com
- **Password**: demo123

## 8. Production Deployment

For production deployment:

1. Update environment variables with production URLs
2. Configure OAuth apps for your production domain
3. Update callback URLs in Google Cloud Console and GitHub Developer Settings
4. Set appropriate security headers

### Example production environment variables:
```env
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## 9. Troubleshooting

### Common Issues:

1. **"Invalid redirect_uri" error**
   - Check that your callback URLs are correctly configured
   - Ensure the URLs match exactly (including http vs https)

2. **"Invalid client" error**
   - Verify your OAuth Client IDs and Client Secrets
   - Check that your OAuth apps are properly configured

3. **Session not persisting**
   - Verify your NEXTAUTH_SECRET is set correctly
   - Check that cookies are enabled in your browser

4. **CORS errors**
   - Ensure your NEXTAUTH_URL is correct
   - Check that your domain is properly configured

## 10. Security Features

- ✅ Secure session management with JWT
- ✅ Protected API routes
- ✅ Environment variable protection
- ✅ CSRF protection
- ✅ Secure callback handling
- ✅ Password hashing with bcrypt

## 11. Customization

### Adding More Providers

To add more OAuth providers, install the provider package and add it to `auth.ts`:

```typescript
import Twitter from "next-auth/providers/twitter"

// Add to providers array
Twitter({
  clientId: process.env.TWITTER_CLIENT_ID!,
  clientSecret: process.env.TWITTER_CLIENT_SECRET!,
})
```

### Database Integration

For production, replace the mock user database with a real database:

```typescript
// Replace the users array with database queries
const user = await db.user.findUnique({
  where: { email: credentials.email }
})
```

The implementation is complete and ready for use! Follow these setup instructions to configure your OAuth providers and start using the authentication system. 