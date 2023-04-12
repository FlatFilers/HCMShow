This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## ENV vars

Copy `.env.example` to `.env` and update the variables.

## Database setup

Set your `DATABASE_URL` in `.env`.

Migrate:

```bash
npx prisma migrate dev
```

## Seeding the database

```bash
npx ts-node -O '{"module": "commonjs"}' prisma/seed.ts

# This reset the DB if you need to re-seed
# npx prisma migrate reset

# To wipe and do it again
# npx prisma migrate reset --force && npx ts-node -O '{"module": "commonjs"}' prisma/seed.ts
```

## Production configs

Currently the production app is running configs in one account (john.mosesman+hcmshow@flatfile.io), with each flow in a different environment:

```
ONBOARDING_ENVIRONMENT_ID=us_env_zxH9wUWW
ONBOARDING_SPACE_CONFIG_ID=us_sc_rac9hkch
WORKBOOK_UPLOAD_WORKBOOK_NAME="HCM Workbook"

FILEFEED_ENVIRONMENT_ID=us_env_V9OGQOUo
FILEFEED_SPACE_CONFIG_ID=us_sc_RhaG8IOT

EMBEDDED_ENVIRONMENT_ID=us_env_GKfWJ5c0
EMBEDDED_SPACE_CONFIG_ID=us_sc_aGKb2DST

DYNAMIC_TEMPLATES_ENVIRONMENT_ID=us_env_n0cbQ7IH
DYNAMIC_TEMPLATES_SPACE_CONFIG_ID=us_sc_MhfblItm
DYNAMIC_TEMPLATES_WORKBOOK_NAME="Dynamic Templates Workbook"
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
