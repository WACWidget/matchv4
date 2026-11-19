# WATC Sidebar Widget

A compact, transparent-background Chess.com sidebar widget inspired by the supplied reference screenshot.

## Publish on GitHub Pages

1. Create a GitHub repository, for example `watc-sidebar-widget`.
2. Upload `index.html`, `style.css`, `script.js`, and `config.js`.
3. Open **Settings → Pages**.
4. Select **Deploy from a branch**, choose `main` and `/ (root)`, then Save.
5. Use the published GitHub Pages URL as the widget iframe/source.

## Daily matches

The widget reads the public Chess.com club matches feed:

`https://api.chess.com/pub/club/we-are-the-champions-7/matches`

The API returns `registered`, `in_progress`, and `finished` matches. The compact sidebar shows active and upcoming matches. Finished matches are intentionally omitted.

### League / Friendly classification

The public feed does not expose a League/Friendly field. By default, all active/upcoming matches appear in **League**. Add match IDs to `FRIENDLY_MATCH_IDS` in `config.js` to move those matches to **Friendly**.

Example:
```js
FRIENDLY_MATCH_IDS: ["2013300", "2013188"]
```

### Match images

The public match feed does not consistently include opponent club logos. You can add image URLs by match ID in `MATCH_IMAGES`:

```js
MATCH_IMAGES: {
  "2013300": "https://example.com/team-logo.png"
}
```

If no image is configured, the widget uses a compact chess-piece placeholder.

## Arena section

The Chess.com public club matches endpoint does not supply the club arena list. Arena cards are therefore configured in `config.js` rather than showing invented events.

Example:
```js
ARENAS: [
  {
    id: "black-hole-blitz",
    title: "Black Hole Blitz",
    subtitle: "3+2 · Rated · 24 hrs",
    group: "TVL",
    start: "2026-11-22T18:00:00+03:00",
    end: "2026-11-22T19:00:00+03:00",
    url: "https://www.chess.com/play/arena/TOURNAMENT_ID",
    image: "https://images.chesscomfiles.com/chess-flair/chess/blitz.svg"
  }
]
```

- `start` and `end` should be ISO timestamps with an explicit timezone.
- Upcoming events automatically move to Current when their start time arrives.
- The countdown updates every second.
- Remove expired events when no longer needed.

## Design notes

- Fixed maximum width: 276px.
- Page background is transparent.
- Cards and tabs are sized for the Chess.com club sidebar.
- Supplied Chess.com Daily, Arena and Blitz SVG assets are used.
- Data refresh interval: 5 minutes by default (`refreshMs` in `config.js`).
