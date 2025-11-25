# Jimena's ReadME

## What I added
- Time Killer mini-game (1-minute runner: click/space to jump over task blocks; speed ramps up; cleared blocks turn green).
- Task-based leaderboard that ranks users by completed-task points over selectable windows (7/30/all).

## Key files touched
- `backend/src/models/GameRun.ts`, `backend/src/routes/gameRoutes.ts` – game score storage and submit endpoint.
- `backend/src/routes/leaderboardRoutes.ts` – leaderboard now aggregates completed-task points.
- Frontend nav & pages: `frontend/src/components/layout/Sidebar.tsx`, `frontend/src/app/time-killer/page.tsx`, `frontend/src/app/leaderboard/page.tsx`.
- API/types: `frontend/src/lib/api/game.ts`, `frontend/src/lib/api/leaderboard.ts`, `frontend/src/lib/types/Leaderboard.ts`, `frontend/src/lib/api/index.ts`.

## How I verified
- Manual flow reasoning: updated leaderboard aggregation logic and game loop behavior.
- No automated tests or screenshots were run in this session.

## Assumptions / challenges
- Assumed existing task completion data is available to feed the leaderboard.
- Assumed manual runtime verification will be done locally (start backend/frontend and play the game).
- Kept changes minimal without migrating existing friend-related data.
