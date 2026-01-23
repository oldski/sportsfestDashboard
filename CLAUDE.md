# Project Guidelines for Claude

## Tech Stack

- **Framework**: Next.js App Router, TypeScript, React, Node.js
- **UI**: Shadcn UI, Radix UI, Tailwind CSS
- **Key Libraries**: React Hook Form, Zod, Lucide React, NiceModal, Nuqs
- **Database**: Drizzle ORM with PostgreSQL
- **Auth**: Auth.js
- **Monorepo**: Turborepo with pnpm workspaces
- **Namespace**: `@workspace/*`

## Project Structure

```
/apps                   # Applications (executable)
  /dashboard            # Main web application
  /marketing            # Marketing pages
  /public-api           # Public API

/packages               # Shared packages
  /api-keys             # API key management
  /auth                 # Authentication logic
  /billing              # Payment handling
  /database             # Drizzle schema & client
  /email                # Email templates and sending
  /ui                   # Design system (shadcn/ui)
  /webhooks             # Webhook helpers

/tooling                # Configuration packages
  /eslint-config        # Linting rules
  /typescript-config    # TypeScript presets

/scripts                # Utility and maintenance scripts
  /reconciliation       # Data import/reconciliation scripts
  /guides               # Documentation guides
  /sql                  # SQL scripts
```

## General Principles

- Write clean, concise and well-commented TypeScript code
- Favor functional and declarative programming patterns over object-oriented approaches
- Prioritize code reuse and modularization over duplication
- Keep functions short and focused on single responsibility
- Avoid premature optimization; profile before optimizing

## TypeScript Guidelines

- Use TypeScript for all code; prefer `type` over `interface` for consistency
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`, `canSubmit`)
- Avoid `any` type completely; use `unknown` when input type is uncertain, then narrow with type guards
- Use strict null checks; prefer explicit undefined handling over loose equality
- Use Zod schemas for runtime validation and TypeScript inference
- Define explicit DTOs for API boundaries and data transfer
- Prefer union types over enums for string literals
- Use custom error classes for different error types

## Naming Conventions

- **PascalCase**: Class names, type definitions, React components
- **camelCase**: Variables, functions, methods
- **kebab-case**: File and directory names (e.g., `add-item-form.tsx`)
- **UPPERCASE**: Environment variables and constants
- Start each function name with a verb to indicate its purpose
- Avoid magic numbers by defining constants with meaningful names

### File Naming Patterns

- Schema files: `*-schema.ts` (e.g., `add-item-schema.ts`)
- Action files: `*.ts` in `/actions` folder
- Data fetching: `get-*.ts` in `/data` folder
- DTOs: `*-dto.ts` in `/types/dtos`

## Next.js Best Practices

- Favor React Server Components (RSC) where possible
- Minimize `'use client'` directives
- Optimize for performance and Web Vitals
- Use server actions for mutations instead of route handlers
- Use `next/image` for optimized image loading

## React Guidelines

- Use functional components with hooks exclusively
- Implement proper prop typing with default values
- Use discriminated unions for component variants
- Prefer composition over prop drilling
- Prefer named exports for components over default exports
- Favor small, single-purpose components over large, monolithic ones
- Separate concerns between presentational and container components

## UI & Styling

- Use Shadcn UI, Radix UI and Tailwind for components and styling
- Use components from `@workspace/ui/components`, hooks from `@workspace/ui/hooks`, utils from `@workspace/ui/lib`
- Implement responsive design with Tailwind CSS; use a mobile-first approach

## Database & Data Management

- Interact with the database using Drizzle ORM client
- Use `@workspace/database/client` and `@workspace/database/schema`
- Leverage Drizzle's column types
- Favor Drizzle's relational query builder over the query API

## Error Handling

- Implement robust error handling and logging mechanisms
- Provide clear and user-friendly error messages to end-users
- Use custom error types for consistent error handling
- Handle errors gracefully using proper error types and boundaries
