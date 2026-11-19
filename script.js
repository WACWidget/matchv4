(() => {
  "use strict";

  const cfg = window.WATC_CONFIG || {};
  const clubSlug = cfg.clubSlug || "we-are-the-champions-7";
  const API = `https://api.chess.com/pub/club/${encodeURIComponent(clubSlug)}/matches`;
  const CLUB_URL = `https://www.chess.com/club/${encodeURIComponent(clubSlug)}`;
  const $ = id => document.getElementById(id);

  let matches = [];
  let dailyTab = "league";
  let arenaTab = "current";
  let lastSync = null;

  const friendlyIds = new Set((cfg.FRIENDLY_MATCH_IDS || []).map(String));

  function matchId(m) {
    const raw = m["@id"] || m.url || "";
    const found = raw.match(/\/match\/(\d+)/i);
    return found ? found[1] : "";
  }

  function matchHref(m) {
    const id = matchId(m);
    return id ? `https://www.chess.com/club/matches/${id}` : CLUB_URL;
  }

  function dateLabel(timestamp) {
    if (!timestamp) return "DATE TBA";
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      month: "short", day: "numeric"
    }).toUpperCase();
  }

  function dateTimeLabel(timestamp) {
    if (!timestamp) return "Daily match";
    return new Date(timestamp * 1000).toLocaleString("en-GB", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
    });
  }

  function clubLabel(url) {
    if (!url) return "WATC";
    const slug = url.split("/").filter(Boolean).pop() || "WATC";
    return slug.replace(/-\d+$/, "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  }

  function makePlaceholder(symbol) {
    const node = document.createElement("div");
    node.className = "match-placeholder";
    node.textContent = symbol;
    return node;
  }

  function makeImage(src, alt, fallbackSymbol) {
    if (!src) return makePlaceholder(fallbackSymbol);
    const img = document.createElement("img");
    img.className = "match-art";
    img.src = src;
    img.alt = alt || "";
    img.loading = "lazy";
    img.onerror = () => {
      const replacement = makePlaceholder(fallbackSymbol);
      img.replaceWith(replacement);
    };
    return img;
  }

  function makeCard({ title, meta, group, state, stateClass, href, image, symbol = "♟", arena = false }) {
    const a = document.createElement("a");
    a.className = `match-card${arena ? " arena-card" : ""}`;
    a.href = href || CLUB_URL;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.append(makeImage(image, title, symbol));

    const copy = document.createElement("span");
    copy.className = "match-copy";

    const heading = document.createElement("span");
    heading.className = "match-title";
    heading.textContent = title;

    const detail = document.createElement("span");
    detail.className = "match-meta";
    detail.textContent = meta;

    const bottom = document.createElement("span");
    bottom.className = "match-bottom";

    const club = document.createElement("span");
    club.className = "match-club";
    club.textContent = group || "";

    const status = document.createElement("span");
    status.className = `match-state ${stateClass || ""}`;
    status.textContent = state || "";

    bottom.append(club, status);
    copy.append(heading, detail, bottom);
    a.append(copy);
    return a;
  }

  function renderDaily() {
    const box = $("dailyCards");
    box.replaceChildren();

    const selected = matches.filter(m => {
      const isFriendly = friendlyIds.has(matchId(m));
      return dailyTab === "friendly" ? isFriendly : !isFriendly;
    });

    // Keep active and upcoming matches ahead of finished matches.
    const active = selected.filter(m => m.type === "in_progress");
    const upcoming = selected.filter(m => m.type === "registered");
    const list = [...active, ...upcoming].slice(0, Number(cfg.maxDailyCards) || 4);

    if (!list.length) {
      const empty = document.createElement("div");
      empty.className = "empty-card";
      empty.textContent = dailyTab === "friendly"
        ? "No friendly matches added yet."
        : "No active or upcoming league matches.";
      box.append(empty);
      return;
    }

    list.forEach(m => {
      const isLive = m.type === "in_progress";
      const title = m.name || "Club Match";
      const image = (cfg.MATCH_IMAGES || {})[matchId(m)] || "";
      const time = m.start_time ? dateLabel(m.start_time) : "DATE TBA";
      const state = isLive ? "LIVE" : `${time} · JOIN`;
      const meta = `${m.time_class === "daily" ? "Daily" : (m.time_class || "Club")} · ${isLive ? "In progress" : "Open"}`;
      box.append(makeCard({
        title,
        meta,
        group: clubLabel(m.opponent),
        state,
        stateClass: isLive ? "live" : "upcoming",
        href: matchHref(m),
        image,
        symbol: "♟"
      }));
    });
  }

  function countdown(start) {
    const diff = new Date(start).getTime() - Date.now();
    if (diff <= 0) return "STARTED";
    const total = Math.floor(diff / 1000);
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    if (days) return `${days}D ${String(hours).padStart(2,"0")}:${String(mins).padStart(2,"0")}`;
    return `${String(hours).padStart(2,"0")}:${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;
  }

  function renderArenas() {
    const box = $("arenaCards");
    box.replaceChildren();
    const now = Date.now();
    const events = (cfg.ARENAS || []).filter(e => {
      const start = new Date(e.start).getTime();
      const end = e.end ? new Date(e.end).getTime() : start + 24 * 3600 * 1000;
      return arenaTab === "current" ? now >= start && now <= end : now < start;
    }).sort((a,b) => new Date(a.start) - new Date(b.start));

    if (!events.length) {
      const empty = document.createElement("div");
      empty.className = "empty-card";
      empty.textContent = arenaTab === "current"
        ? "No current WATC arenas."
        : "No upcoming WATC arenas configured.";
      box.append(empty);
      return;
    }

    events.slice(0, 3).forEach(e => {
      const isCurrent = arenaTab === "current";
      const icon = e.image || "https://images.chesscomfiles.com/chess-flair/chess/blitz.svg";
      const when = isCurrent ? countdown(e.end || e.start) : countdown(e.start);
      box.append(makeCard({
        title: e.title || "WATC Arena",
        meta: e.subtitle || "Club Arena",
        group: e.group || "WATC",
        state: when,
        stateClass: isCurrent ? "live" : "upcoming",
        href: e.url || CLUB_URL,
        image: icon,
        symbol: "⚡",
        arena: true
      }));
    });
  }

  function setTab(which, value) {
    if (which === "daily") {
      dailyTab = value;
      $("leagueTab").classList.toggle("active", value === "league");
      $("friendlyTab").classList.toggle("active", value === "friendly");
      $("leagueTab").setAttribute("aria-selected", String(value === "league"));
      $("friendlyTab").setAttribute("aria-selected", String(value === "friendly"));
      renderDaily();
    } else {
      arenaTab = value;
      $("currentTab").classList.toggle("active", value === "current");
      $("upcomingTab").classList.toggle("active", value === "upcoming");
      $("currentTab").setAttribute("aria-selected", String(value === "current"));
      $("upcomingTab").setAttribute("aria-selected", String(value === "upcoming"));
      renderArenas();
    }
  }

  async function loadMatches() {
    $("syncStatus").textContent = "Syncing Chess.com…";
    try {
      const response = await fetch(API, {
        method: "GET",
        headers: { "Accept": "application/json" },
        cache: "no-store"
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      matches = [];
      ["in_progress", "registered"].forEach(type => {
        (Array.isArray(data[type]) ? data[type] : []).forEach(m => {
          matches.push({ ...m, type });
        });
      });
      matches.sort((a,b) => {
        if (a.type !== b.type) return a.type === "in_progress" ? -1 : 1;
        return (a.start_time || 0) - (b.start_time || 0);
      });
      lastSync = new Date();
      renderDaily();
      $("syncStatus").textContent = `${matches.length} matches · Updated ${lastSync.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}`;
    } catch (error) {
      $("syncStatus").textContent = "Could not sync Chess.com";
      const box = $("dailyCards");
      box.replaceChildren();
      const message = document.createElement("div");
      message.className = "error-card";
      message.textContent = "Live matches unavailable. Tap ↻ to retry.";
      box.append(message);
    }
  }

  $("leagueTab").addEventListener("click", () => setTab("daily", "league"));
  $("friendlyTab").addEventListener("click", () => setTab("daily", "friendly"));
  $("currentTab").addEventListener("click", () => setTab("arena", "current"));
  $("upcomingTab").addEventListener("click", () => setTab("arena", "upcoming"));
  $("refreshButton").addEventListener("click", () => {
    loadMatches();
    renderArenas();
  });

  renderArenas();
  loadMatches();
  window.setInterval(() => {
    loadMatches();
    renderArenas();
  }, Math.max(60000, Number(cfg.refreshMs) || 300000));
  window.setInterval(renderArenas, 1000);
})();
