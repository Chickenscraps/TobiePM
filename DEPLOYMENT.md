# AntiGravity Dashboard - Deployment Guide

This guide outlines the steps to deploy the **AntiGravity** project management system to production.

## 1. Prerequisites
- **Node.js**: v18+ (LTS recommended)
- **PNPM**: Package manager (`npm install -g pnpm`)
- **Database**: PostgreSQL (recommended for production) or SQLite (for small scale/demo)

## 2. Installation
Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd antigravity
pnpm install
```

## 3. Environment Configuration
Create a production `.env` file based on `.env.example`.

### Critical Variables
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Connection string for your database (e.g., Postgres) |
| `NEXTAUTH_SECRET` | 32+ char random string for session security |
| `NEXTAUTH_URL` | Your production domain (e.g., `https://dashboard.company.com`) |
| `AI_PROVIDER` | Set to `openai` or `gemini` for real AI features |
| `OPENAI_API_KEY` | Required if using OpenAI |
| `GOOGLE_AI_API_KEY` | Required if using Gemini |

## 4. Database Setup
Run migrations to set up the schema:

```bash
# Generate Prisma Client
pnpm --filter web db:generate

# Push Schema to DB (for initial setup)
pnpm --filter web db:push

# OR use Migrations (recommended for ongoing production updates)
# pnpm --filter web db:migrate
```

## 5. production Build
Build the application and agent core:

```bash
pnpm build
```

The output will be in `.next/`.

## 6. Running in Production
Start the Next.js server:

```bash
pnpm start
```

The application will be available at your configured port (default: 3000).

## 7. AI Agent Configuration
To enable the **AntiGravity** AI assistant:
1. Ensure `AI_ENABLED="true"` in `.env`.
2. Verify your API key (`OPENAI_API_KEY` or `GOOGLE_AI_API_KEY`) is valid.
3. The Global Chat Widget will automatically appear for logged-in users.

## Troubleshooting
- **Build Errors**: Ensure all workspace packages are built. Run `pnpm build` from the root.
- **Database Errors**: Check `DATABASE_URL` and ensure the database server is running.
- **AI Errors**: Check API keys and quotas. The dashboard defaults to a Mock provider if keys are missing.
