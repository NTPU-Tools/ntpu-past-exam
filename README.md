# 北大考古題 NTPU Past Exam Fontend

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Deployment**: [Zeabur](https://zeabur.com)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Analytics**: [Clarity Analytics](https://clarity.microsoft.com/)


## Start dev server
1. Create a ".env" file in root folder. It should contain following key:
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_CLARITY_MEASUREMENT_ID=
NEXT_PUBLIC_CLOUDFLARE_MEASUREMENT_ID=
NEXT_PUBLIC_GOOGLE_LOGIN_CLIENT_ID=

NEXT_PUBLIC_API_ORIGIN=http://127.0.0.1:8000
API_ORIGIN=http://127.0.0.1:8000
```

You should get the value from the code owner.

2. Install dependancies (we use pnpm to manage dependancies):
```shell
npm install -g pnpm
or
yarn global add pnpm
```
```shell
pnpm install
```

3. Start dev server
```shell
pnpm dev
```