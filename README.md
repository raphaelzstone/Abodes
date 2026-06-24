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

## Leaderboard (Firebase / Firestore)

Daily fastest-solve rankings are backed by Cloud Firestore. The web config lives
in `firebase-config.js` (public by design — see the note in that file), and
`leaderboard.js` reads/writes a dedicated `abodes_scores` collection, one document
per player per day (`${date}_${userId}`).

To enable it:

1. **Firestore** — in the Firebase console, open *Firestore Database* and create a
   database if you don't have one.
2. **Config** — paste your project's web config into `firebase-config.js`. (It's
   currently set to the shared `word-split` project; swap in an Abodes-specific
   project if you'd prefer them fully separate.)
3. **Security rules** — Abodes uses an anonymous per-device id (no Firebase Auth),
   so writes are open but shape-validated. **Add** this block to your existing
   rules (don't replace them, or you'll break other apps in the same project):

   ```
   match /abodes_scores/{docId} {
     allow read: if true;
     allow create, update: if
       request.resource.data.keys().hasOnly(['userId','name','date','seconds','createdAt'])
       && request.resource.data.userId is string
       && request.resource.data.name is string
       && request.resource.data.name.size() <= 20
       && request.resource.data.date is string
       && request.resource.data.seconds is number
       && request.resource.data.seconds > 0
       && docId == request.resource.data.date + '_' + request.resource.data.userId;
     allow delete: if false;
   }
   ```

   This is a casual-game posture: anyone could in principle spoof a score since
   there's no auth. Fine for a friends board; add Firebase Auth if you ever need
   it to be tamper-proof.

That's it — once configured, the menu's 🏆 Leaderboard shows Today and Yesterday
ranked by fastest time, with your own row highlighted.
