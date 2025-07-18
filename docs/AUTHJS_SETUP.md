# Auth.js Setup Instructions

This guide will help you set up Auth.js (NextAuth.js v5) authentication with Google, GitHub, and username/password providers in your Next.js application.

## 1. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Database
DATABASE_URL="file:./dev.db"

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

## 4. Database Setup

1. The project uses SQLite with Prisma for data persistence
2. The database will be automatically created when you run the setup
3. A demo user is automatically seeded into the database

## 5. Testing the Setup

1. Start your development server:
   ```bash
   yarn dev
   ```

2. Navigate to `http://localhost:3000`

3. Click the "Login" button in the navbar

4. You should see the unified authentication page with options for:
   - Google authentication
   - GitHub authentication
   - Email/password login
   - Email/password signup (toggle between modes)
   - Demo credentials: demo@example.com / demo123

## 6. Features Included

- ✅ Google OAuth Integration
- ✅ GitHub OAuth Integration
- ✅ Username/Password Authentication
- ✅ User Registration (Signup)
- ✅ SQLite Database with Prisma
- ✅ Session Management
- ✅ Protected Routes (profile page)
- ✅ Responsive UI with Tailwind CSS
- ✅ TypeScript Support
- ✅ Unified Authentication Page (Login/Signup)
- ✅ User Profile Display

## 7. File Structure

```
app/
├── api/auth/
│   ├── [...nextauth]/
│   │   └── route.ts
│   └── signup/
│       └── route.ts
├── auth/
│   └── page.tsx (unified login/signup)
├── components/
│   ├── AuthButtons.tsx
│   └── Navbar.js (updated)
├── login/
│   └── page.tsx (redirects to /auth)
├── signup/
│   └── page.tsx (redirects to /auth)
├── profile/
│   └── page.tsx
├── demo-auth/
│   └── page.tsx
└── layout.js (updated)

lib/
├── useAuth.ts
└── prisma.ts

prisma/
├── schema.prisma
└── seed.ts

auth.ts (updated)
middleware.ts (updated)
```

## 8. Demo Credentials

For testing username/password authentication:
- **Email**: demo@example.com
- **Password**: demo123

The demo user is automatically created when you run the seed script.

## 9. Production Deployment

For production deployment:

1. Update environment variables with production URLs
2. Configure OAuth apps for your production domain
3. Update callback URLs in Google Cloud Console and GitHub Developer Settings
4. Set appropriate security headers
5. Consider using a production database like PostgreSQL instead of SQLite

### Example production environment variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## 10. Troubleshooting

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

5. **Database connection issues**
   - Ensure DATABASE_URL is set correctly
   - Run `npx prisma db push` to sync the database schema
   - Run `yarn db:seed` to populate the database with demo data

## 11. Security Features

- ✅ Secure session management with JWT
- ✅ Protected API routes
- ✅ Environment variable protection
- ✅ CSRF protection
- ✅ Secure callback handling
- ✅ Password hashing with bcrypt
- ✅ SQL injection protection with Prisma
- ✅ Input validation and sanitization

## 12. Customization

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

### Database Schema Changes

To modify the database schema, edit `prisma/schema.prisma` and run:

```bash
npx prisma db push
npx prisma generate
```

### Adding User Fields

To add more fields to the User model, update the schema and regenerate:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String
  role      String   @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

The implementation is complete and ready for use! The system now includes:

- ✅ **SQLite Database**: Lightweight, file-based database perfect for development
- ✅ **Prisma ORM**: Type-safe database queries and migrations
- ✅ **User Registration**: Complete signup functionality with validation
- ✅ **Authentication**: Login with email/password, Google, and GitHub
- ✅ **Session Management**: Secure JWT-based sessions
- ✅ **Demo Data**: Automatic seeding with demo user

Follow these setup instructions to configure your OAuth providers and start using the authentication system. 