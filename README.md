docker pull postgres
docker run --name postgres -e POSTGRES_PASSWORD=docker -p 5432:5432 -d postgres
npm install
npx prisma generate dev
pnpm run test ./tests/bug.test.ts