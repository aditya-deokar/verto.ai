# Vercel Deployment Guide for Verto AI

This guide covers everything you need to know to deploy this Next.js 16 application to Vercel.

## 1. Prerequisites
- A Vercel account.
- A GitHub/GitLab/Bitbucket repository with your code.
- A Neon (or other PostgreSQL) database.
- A Clerk account for authentication.
- An Inngest account for background jobs.

## 2. Environment Variables
You must configure the following environment variables in your Vercel project settings (**Settings > Environment Variables**).

### Database (PostgreSQL)
| Key | Value Source |
| :--- | :--- |
| `DATABASE_URL` | Your Neon/PostgreSQL connection string (with pooler) |
| `DIRECT_URL` | Your Neon/PostgreSQL connection string (direct) |

### Authentication (Clerk)
| Key | Value Source |
| :--- | :--- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard > API Keys |
| `CLERK_SECRET_KEY` | Clerk Dashboard > API Keys |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL` | `/callback` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL` | `/callback` |

### AI Services
| Key | Value Source |
| :--- | :--- |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI Studio API Key |
| `GEMINI_API_KEY` | (Same as above) |
| `OPENROUTER_API_KEY` | OpenRouter API Key |

### Payments (Lemon Squeezy)
| Key | Value Source |
| :--- | :--- |
| `LEMON_SQUEEZY_API_KEY` | Lemon Squeezy API Key |
| `LEMON_SQUEEZY_STORE_ID` | Your Store ID |
| `LEMON_SQUEEZY_VARIANT_ID` | Your Product Variant ID |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | Your Webhook Secret |

### Background Jobs (Inngest)
| Key | Value Source |
| :--- | :--- |
| `INNGEST_EVENT_KEY` | Inngest Dashboard > Settings |
| `INNGEST_SIGNING_KEY` | Inngest Dashboard > Settings |
| `INNGEST_DEV` | `0` (Disable dev mode in production) |

### Miscellaneous
| Key | Value Source |
| :--- | :--- |
| `NEXT_PUBLIC_HOST_URL` | Your production URL (e.g., `https://verto-ai.vercel.app`) |
| `ENCRYPTION_KEY` | A random 32-byte string (base64 encoded) |

---

## 3. Build Configuration
Vercel should automatically detect the settings from `package.json`.

- **Framework Preset**: Next.js
- **Build Command**: `next build`
- **Install Command**: `bun install` (Vercel supports Bun)
- **Root Directory**: `./`

### Prisma Setup
The `package.json` includes a `postinstall` script:
```json
"postinstall": "prisma generate"
```
This ensures the Prisma client is generated on every build. Note that we are using a custom output path (`src/generated/prisma`), which is already handled in the codebase.

---

## 4. Next.js 16 & Proxy Convention
This project uses **Next.js 16**, which has deprecated the `middleware.ts` file in favor of the **`proxy.ts`** convention.

- Your middleware logic is now located in `src/proxy.ts`.
- The export has been updated to `export const proxy = ...`.
- This ensures compatibility with the latest Next.js features and avoids deployment warnings.

---

## 5. Inngest Deployment
Once deployed, you need to tell Inngest where your functions are:
1. Go to the **Inngest Cloud Dashboard**.
2. Add a new **App**.
3. Use the URL: `https://your-app.vercel.app/api/inngest` (and `https://your-app.vercel.app/api/mobile-design/inngest` if needed).
4. Inngest will automatically discover your background functions (`generateScreens`, etc.).

---

## 6. Troubleshooting
- **Database Connection**: If you see connection issues, ensure your Neon database allows connections from Vercel's IP range or use the `@neondatabase/serverless` driver if needed (though `prisma` with the pooler should work fine).
- **Clerk Redirects**: Ensure your Clerk "Allowed Redirect URLs" include your production domain.
- **Node Version**: Ensure Vercel is using Node 20 or higher. You can set this in `package.json` under `engines` if necessary.

```json
"engines": {
  "node": ">=20.0.0"
}
```
