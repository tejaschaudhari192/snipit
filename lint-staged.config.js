export default {
  "frontend/src/**/*.{js,html,css,ts,tsx}": [
    "pnpm --filter frontend lint",
    "pnpm --filter frontend format",
    () => "pnpm --filter frontend build2"
  ],
  "backend/src/**/*.{js,ts}": [
    "pnpm --filter backend lint",
    "pnpm --filter backend format",
    () => "pnpm --filter backend build"
  ]
};