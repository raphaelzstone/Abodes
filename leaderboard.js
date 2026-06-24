/* Abodes leaderboard — daily fastest-solve rankings, backed by Firestore.
 *
 * Loaded as an ES module so it can import the Firebase modular SDK from the CDN.
 * It exposes the same `window.Leaderboard` interface app.js expects:
 *   - configured     true once Firebase initialised from window.AbodesFirebaseConfig
 *   - submitScore()  best-effort write of one (user, date) -> seconds result
 *   - fetchBoard()   read all results for a date (sorted client-side by app.js)
 *
 * Scores live in their own collection (abodes_scores), keyed by `${date}_${userId}`,
 * so there's exactly one row per player per day and Abodes never touches any other
 * game's data. Every call is wrapped so a network/Firebase failure degrades to a
 * quiet no-op — the local game is always the source of truth. */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, doc, setDoc, getDocs, query, where, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const COLLECTION = "abodes_scores";

let db = null;
const cfg = window.AbodesFirebaseConfig;
if (cfg && cfg.apiKey) {
  try {
    db = getFirestore(initializeApp(cfg));
  } catch (e) {
    console.warn("Abodes leaderboard: Firebase init failed", e);
  }
}

async function submitScore({ userId, name, date, seconds }) {
  if (!db) return;
  try {
    await setDoc(doc(db, COLLECTION, `${date}_${userId}`), {
      userId, name, date, seconds, createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("Abodes leaderboard: submit failed", e);
  }
}

// Returns an array of { userId, name, date, seconds } for the day, or null on
// failure. Sorting is left to the caller. The single `where` keeps this on
// Firestore's automatic single-field index — no composite index to set up.
async function fetchBoard(date) {
  if (!db) return null;
  try {
    const snap = await getDocs(query(collection(db, COLLECTION), where("date", "==", date)));
    return snap.docs.map((d) => d.data());
  } catch (e) {
    console.warn("Abodes leaderboard: fetch failed", e);
    return null;
  }
}

window.Leaderboard = { configured: !!db, submitScore, fetchBoard };
