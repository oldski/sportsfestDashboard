# SportsFest Dashboard

A multi-tenant sports festival management platform built with Achromatic's Next.js + Drizzle + Auth.js monorepo starter kit.

## 🏗️ Architecture

This project uses the Achromatic Monorepo structure with:
- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Auth.js (NextAuth.js)
- **Email**: Resend for transactional emails
- **Monorepo**: Turborepo for build orchestration
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm

## 📦 Project Structure

```
sportsfestDashboard/
├── apps/
│   └── dashboard/          # Main Next.js application
├── packages/
│   └── database/           # Drizzle database package
├── package.json            # Root package.json with workspace config
└── pnpm-workspace.yaml     # pnpm workspace configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- PostgreSQL 14+

### 1. Clone and Install

```bash
git clone https://github.com/oldski/sportsfestDashboard.git
cd sportsfestDashboard
pnpm install
```

### 2. Database Setup

**Install PostgreSQL:**
```bash
brew install postgresql
```

**Create Database and User:**
```bash
# Connect to PostgreSQL
psql postgres

# Create user and database
CREATE USER postgres WITH PASSWORD 'password';
ALTER USER postgres WITH SUPERUSER;
CREATE DATABASE sportsfest OWNER postgres;
\q
```

**Apply Migrations:**
```bash
pnpm --filter database push
```

### 3. Environment Variables

Create the following environment files:

**`packages/database/.env`:**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/sportsfest?schema=public
```

**`apps/dashboard/.env`:**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/sportsfest?schema=public
AUTH_SECRET=your_generated_auth_secret_here
RESEND_API_KEY=your_resend_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Generate Auth Secret

```bash
cd apps/dashboard
npx auth secret
```

Copy the generated secret to your `apps/dashboard/.env` file.

### 5. Start Development Server

```bash
pnpm run dev
```

The dashboard will be available at [http://localhost:3000](http://localhost:3000)

## 📧 Email Configuration

This project uses Resend for transactional emails with a custom subdomain:

### Domain Setup
- **Sending Domain**: `mailer.sportsfest.com`
- **DNS Configuration**: Add TXT and MX records provided by Resend to your DNS provider
- **Email Templates**: Built with React Email components

### Common Email Addresses
- `noreply@mailer.sportsfest.com` - Automated notifications
- `admin@mailer.sportsfest.com` - System alerts
- `support@sportsfest.com` - Customer service (main domain)

## 🏢 Multi-Tenant Features

SportsFest supports multiple festival organizations with:
- **Tenant Isolation**: Each festival has its own data space
- **Custom Branding**: Organization-specific themes and logos
- **Role-Based Access**: Different permission levels per tenant
- **Subdomain Routing**: `festival-name.sportsfest.com` structure

## 🛠️ Development Scripts

```bash
# Start development server
pnpm run dev

# Build all packages
pnpm run build

# Run type checking
pnpm run type-check

# Run linting
pnpm run lint

# Database operations
pnpm --filter database push    # Apply schema changes
pnpm --filter database studio  # Open Drizzle Studio
```

## 📊 Database Management

### Drizzle Studio
Access the database GUI:
```bash
pnpm --filter database studio
```

### Schema Changes
1. Update schema files in `packages/database/src/schema/`
2. Generate and apply migrations:
```bash
pnpm --filter database push
```

## 🔐 Authentication

Built with Auth.js supporting:
- **Email/Password** authentication
- **OAuth Providers** (Google, GitHub, etc.)
- **Magic Links** for passwordless login
- **Role-based Authorization** with tenant scoping

## 🚀 Deployment

### Environment Setup
Ensure all production environment variables are configured:
- `DATABASE_URL` - Production PostgreSQL connection
- `AUTH_SECRET` - Cryptographically secure secret
- `RESEND_API_KEY` - Production Resend API key
- `NEXTAUTH_URL` - Production app URL

### Build Command
```bash
pnpm run build
```

## 📝 Contributing

### Code Style
- TypeScript strict mode enabled
- ESLint configuration across all packages
- Prettier for code formatting
- Conventional commits preferred

### Workflow
1. Create feature branch from `main`
2. Make changes in appropriate package
3. Ensure all tests pass: `pnpm run test`
4. Submit PR with clear description

## 🆘 Troubleshooting

### Common Issues

**Database Connection Errors:**
- Verify PostgreSQL is running: `brew services list`
- Check connection string in `.env` files
- Ensure database `sportsfest` exists

**Build Failures:**
- Clear node_modules: `rm -rf node_modules && pnpm install`
- Clear Next.js cache: `rm -rf apps/dashboard/.next`

**Email Not Sending:**
- Verify Resend API key is valid
- Check DNS records for `mailer.sportsfest.com`
- Review Resend dashboard for error logs

### Getting Help
- Check [Achromatic Documentation](https://achromatic.dev)
- Review [Next.js Documentation](https://nextjs.org/docs)
- Submit issues to project repository

## 📄 License

This project uses the Achromatic starter kit. Please refer to the Achromatic license terms for usage guidelines.

---

**Built with ❤️ for SportsFest organizers worldwide**
