# Introduction

Next 15 starter kit based on Next.js, Auth.js and Drizzle designed to accelerate the development of web-based (SaaS) applications.

# Quickstart

Get started in about 30 minutes by following these steps.

## Preparation

1. Unpack the Archive

2. Switch to the project's root directory

```bash
cd monorepo-next-drizzle-authjs
```

2. Install PNPM if not already installed

```bash
npm i -g pnpm
```

3. Install the package dependencies of the whole monorepo

```bash
pnpm i
```

4. Copy the sample configurations

```bash
cp apps/dashboard/.env.example apps/dashboard/.env
cp apps/marketing/.env.example apps/marketing/.env
cp apps/public-api/.env.example apps/public-api/.env
cp packages/database/.env.example packages/database/.env
```

## Services

### Database

#### Install PostgreSQL

1.  Install PostgreSQL via Homebrew, Chocolatey or download it from the [website](https://www.postgresql.org/download/).

```bash
brew install postgresql
```

2. Add an initial user.

```bash
sudo -u postgres psql
CREATE USER postgres WITH PASSWORD 'password';
ALTER USER postgres WITH SUPERUSER;
\q
```

3.  Update database `packages/database/.env` with your credentials.

```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/database?schema=public
```

4. Create the database

```bash
psql -U postgres -c "CREATE DATABASE database;"
```

5. Apply the database migrations.

```bash
pnpm --filter database push
```

6. Update also the dashboard `apps/dashboard/.env` with your credentials.

```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/database?schema=public
```

### Google Login (Optional)

1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Create an account if you don't have one already.
3. Navigate to APIs or [click here](https://console.cloud.google.com/apis)
4. Configure the `OAuth consent screen` and add yourself as test user.
5. Click on `Credentials`, create new OAuth credentials and save those credentials.
6. Add the Authorized JavaScript origin to the credential settings.

```bash
http://localhost:3000
```

7. Add the Authorized redirect URI to the credential settings.

```bash
http://localhost:3000/api/auth/callback/google
```

8. Update dashboard `apps/dashboard/.env` with the created credentials.

```bash
AUTH_GOOGLE_CLIENT_ID=
AUTH_GOOGLE_CLIENT_SECRET=
```

### Microsoft Login (Optional)

1. Visit the [Azure Portal](https://portal.azure.com/).
2. Create an account if you don't have one already.
3. Navigate to your Entra ID (Active Directory).
4. Register a new application with platform web.
5. Click on `Authentication` in the menu and add the redirect URIs

```bash
http://localhost:3000
http://localhost:3000/api/auth/callback/microsoft-entra-id
```

6. Under `Certificates & Secrets`, create a new client secret.
7. Update dashboard `apps/dashboard/.env` with the created secret.

```bash
AUTH_MICROSOFT_ENTRA_ID_CLIENT_ID=
AUTH_MICROSOFT_ENTRA_ID_CLIENT_SECRET=
```

### Stripe

1. Visit the [Stripe Dashboard](https://dashboard.stripe.com/).
2. Create an account if you don't have one already.
3. Activate test mode.
4. Activate the customer billing portal.
5. Create a product.
6. Create a price for the product.
7. Navigate to developer section and copy the API credentials.
8. Update dashboard `apps/dashboard/.env` with the IDs and credentials.

```bash
NEXT_PUBLIC_BILLING_PRICE_PRO_MONTH_ID=
NEXT_PUBLIC_BILLING_PRICE_PRO_YEAR_ID=
NEXT_PUBLIC_BILLING_PRICE_LIFETIME_ID=
NEXT_PUBLIC_BILLING_PRICE_ENTERPRISE_MONTH_ID=
NEXT_PUBLIC_BILLING_PRICE_ENTERPRISE_YEAR_ID=
BILLING_STRIPE_SECRET_KEY=
BILLING_STRIPE_WEBHOOK_SECRET=
```

### SMTP Provider

The starter kit supports Nodemailer (SMTP) and Resend.

1. Choose an SMTP provider in `packages/email/provider/index.ts`.
2. Update dashboard `apps/dashboard/.env` with SMTP credentials.

```bash
EMAIL_FROM=

# Provider: NodeMailer

EMAIL_NODEMAILER_URL=

# Provider: Postmark
EMAIL_POSTMARK_SERVER_TOKEN=

# Provider: Resend
EMAIL_RESEND_API_KEY=

# Provider: SendGrid
EMAIL_SENDGRID_API_KEY=
```

For Gmail you need an **app-specific password** and set it up like this

```bash
EMAIL_NODEMAILER_URL=smtp://myemail@gmail.com:suyz yeba qtgv xrnp@smtp.gmail.com:465
```

We recommend Resend for the ease of use.

<Callout>SMTP provider is mandatory for credentials login.</Callout>

## Dashboard Application

1. Start the dashboard application

```bash
pnpm --filter dashboard dev
```

2. Navigate to http://localhost:3000

You’re all set to start!

## Marketing Application

1. Start the marketing application

```bash
pnpm --filter marketing dev
```

2. Navigate to http://localhost:3001

You’re all set to start!

## Public API Application

1. Start the public API application

```bash
pnpm --filter public-api dev
```

2. Navigate to http://localhost:3002

You’re all set to start!

## Troubleshoot

### It seems that I can't login

The database is probably not set up.

### NPM throws an error

In the monorepo version npm is no longer supported. It's all pnpm now. The problem is that npm, yarn and pnpm have different workspace syntax and package hoisting patterns. Supporting all package managers is not possible in a monorepo setup and pnpm is the most popular one.
