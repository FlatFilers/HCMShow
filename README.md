This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Up and running

1. Copy the file `.env.example` to `.env` and update the variables.

2. Adjust your `DATABASE_URL` in `.env` if you aren't using the default username/password for postgres. (If you don't have Postgres installed and are using a Mac, https://postgresapp.com/ is a great option.)

3. Next setup the database and seed the data:

```bash
npx prisma migrate dev
npx ts-node -O '{"module": "commonjs"}' prisma/seed.ts
```

4. Run the server

```bash
npm run dev
```

You should be good to go.

## Using ngrok to test space actions that need to ping HCM.show locally

Most push actions in the configs ping HCM.show, the production app.

To have hooks ping your local app, download a tool like https://ngrok.com/.

```bash
ngrok http 3000
```

(Replace `3000` with whatever port your server is running on.)

Take the ngrok URL given (something like `984187213.ngrok.app`) and use that as the hostname in the [config project](https://github.com/FlatFilers/hcm-show-config) as the `hostname`.

Deploy that config change and you should see ngrok forward requests to your localhost.

## Seeding the database

```bash
npx ts-node -O '{"module": "commonjs"}' prisma/seed.ts

# This reset the DB if you need to re-seed
# npx prisma migrate reset

# To wipe and do it again
# npx prisma migrate reset --force && npx ts-node -O '{"module": "commonjs"}' prisma/seed.ts
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
