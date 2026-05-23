# HEXENWERK Site

Next.js site for HEXENWERK TOBACCO — dark industrial brutalist brand showcase.

## Stack

- Next.js (App Router)
- TypeScript
- ESLint
- Tailwind CSS
- Geist (Vercel)

## Local workflow

After changes, run install, build, and start (full local production cycle):

```bash
npm run install:all
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000).

If port 3000 is already in use, stop the existing process before running `npm start`.

`npm run dev` is available for hot-reload during rapid iteration, but the default workflow is install + build + start.

## GitHub + Vercel

Remote: `https://github.com/PatrickNita/hexenwerk.git`

Vercel auto-deploys on push when the repo is connected. Push only when ready.