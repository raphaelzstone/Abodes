"use strict";

/* Leaderboard — placeholder.
 *
 * The daily leaderboard (fastest solve times) is intentionally not built yet.
 * This module exposes the interface app.js expects but reports itself as
 * unconfigured, so the menu renders a "coming soon" panel and score submission
 * is a no-op. When we build the real thing, swap this for a Firestore-backed
 * implementation that sets `configured = true`. */

window.Leaderboard = {
  configured: false,
  submitScore() { /* no-op until the leaderboard is built */ },
  async fetchBoard() { return null; },
};
