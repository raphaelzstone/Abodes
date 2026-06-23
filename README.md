# Abodes

A daily **Tents** logic puzzle. One fresh 8×8 board every day, the same for
everyone — race the clock and solve it as fast as you can.

Place a tent next to every tree so that:

- each tent pairs one-to-one with an orthogonally-adjacent tree,
- no two tents touch (not even diagonally),
- each row and column holds the clued number of tents.

Every puzzle is **solvable by pure logic — no guessing required**. (Tents
mechanics are a generic, uncopyrightable puzzle type; the name, art, and code
here are original.)

## Play locally

It's a static site — no build step. Serve the folder and open it:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Files

| File                 | Purpose |
|----------------------|---------|
| `index.html`         | App shell (menu / game / results / leaderboard views). |
| `styles.css`         | Theme + board styling. |
| `app.js`             | Game logic: daily pick, board, timer, win check, share. |
| `puzzles.js`         | Auto-generated pool of validated 8×8 puzzles. |
| `generate.py`        | Puzzle generator + logic solver (see below). |
| `identity.js`        | Local player identity (random name + id). |
| `leaderboard.js`     | Placeholder — daily leaderboard is not built yet. |
| `firebase-config.js` | Placeholder config for the future leaderboard. |
| `sw.js`, `manifest.json`, `icon.svg` | PWA shell (installable, offline). |

## Generating puzzles

```sh
python3 generate.py [seed]   # rewrites puzzles.js
```

The generator builds a random valid solution, derives the row/column clues, and
then runs a **deduction solver** that only makes forced moves — ordinary
constraint propagation plus single-cell proof-by-contradiction (valid logic, not
guessing). A board is shipped only if the solver determines every cell, which
also proves the solution is unique. Boards are tagged *medium* and varied via a
random seed so there's no memorizable pattern across days.

## Not done yet

- **Leaderboard** — daily fastest-solve rankings (Firestore-backed) are stubbed
  but not implemented.
