try {
  document.documentElement.setAttribute("data-theme", localStorage.getItem("attacktrace_theme") || "obsidian");
} catch { /* Default tokens remain usable when browser storage is unavailable. */ }
