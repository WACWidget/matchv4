/*
  WATC SIDEBAR CONFIGURATION

  Daily matches:
  The Chess.com public club matches feed does not identify "League" vs
  "Friendly" as a separate field. Add match IDs to FRIENDLY_MATCH_IDS to
  classify them. Anything not listed appears under League.

  Arenas:
  Chess.com PubAPI does not provide a public club-arena feed in the same
  format as the daily club-matches endpoint. Add/edit arena events below.
  Times must be ISO date strings with timezone, e.g. 2026-11-22T18:00:00+03:00.
*/
window.WATC_CONFIG = {
  clubSlug: "we-are-the-champions-7",
  refreshMs: 5 * 60 * 1000,
  maxDailyCards: 4,

  // Put the numeric Chess.com match IDs for Friendly matches here.
  // Example: ["2013300", "2013188"]
  FRIENDLY_MATCH_IDS: [],

  // Optional images keyed by match ID. Use direct image URLs.
  MATCH_IMAGES: {},

  // Add your club arenas here. Leave [] if there are no confirmed events.
  ARENAS: [
    // {
    //   id: "black-hole-blitz-nov",
    //   title: "Black Hole Blitz",
    //   subtitle: "3+2 · Rated · 24 hrs",
    //   group: "TVL",
    //   start: "2026-11-22T18:00:00+03:00",
    //   end: "2026-11-22T19:00:00+03:00",
    //   url: "https://www.chess.com/play/arena/TOURNAMENT_ID",
    //   image: "https://images.chesscomfiles.com/chess-flair/chess/blitz.svg"
    // }
  ]
};
