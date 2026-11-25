/*
 * cards.js — genera griglie di card da un file JSON.
 *
 * Uso:
 *   <ul class="card-grid"
 *       data-cards="legal"                 (legal | projects)
 *       data-src="/legal/projects.json"
 *       data-limit="3"                     (opzionale)
 *       data-featured></ul>                (opzionale: solo "featured": true)
 *
 * Schema dei JSON: vedi README.md.
 */
(function () {
  "use strict";

  var esc = window.Site.esc;
  var slugify = window.Site.slugify;

  var ICON = {
    shield:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    doc:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg>',
    code:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/></svg>',
  };

  /* Monogramma SVG usato quando l'icona manca o non si carica. */
  function monogram(name) {
    var words = String(name).replace(/[-_]/g, " ").trim().split(/\s+/);
    var initials = (words.length > 1 ? words[0][0] + words[1][0] : words[0].slice(0, 2)).toUpperCase();
    var hash = 0;
    for (var i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    var hue = hash % 360;
    var id = "g" + hash.toString(36);
    return (
      '<svg viewBox="0 0 64 64" role="img" aria-label="' + esc(name) + '">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="hsl(' + hue + ' 70% 58%)"/>' +
      '<stop offset="1" stop-color="hsl(' + ((hue + 40) % 360) + ' 70% 42%)"/>' +
      "</linearGradient></defs>" +
      '<rect width="64" height="64" fill="url(#' + id + ')"/>' +
      '<path d="M0 44 L64 20 L64 64 L0 64Z" fill="#fff" opacity=".08"/>' +
      '<text x="50%" y="50%" dy=".35em" text-anchor="middle" fill="#fff" ' +
      'font-family="ui-sans-serif,system-ui,sans-serif" font-size="24" font-weight="700" letter-spacing="-1">' +
      esc(initials) + "</text></svg>"
    );
  }

  function iconHtml(item) {
    var fallback = monogram(item.name);
    if (!item.icon) return '<div class="project-icon">' + fallback + "</div>";
    return (
      '<div class="project-icon" data-fallback="' + esc(fallback) + '">' +
      '<img src="' + esc(item.icon) + '" alt="" width="48" height="48" loading="lazy" decoding="async"></div>'
    );
  }

  function badge(category) {
    if (!category) return "";
    return '<span class="badge" data-category="' + esc(slugify(category)) + '">' + esc(category) + "</span>";
  }

  function head(item, titleHtml) {
    return (
      '<div class="card-head">' + iconHtml(item) +
      "<div>" + '<h3 class="card-title">' + titleHtml + "</h3>" + badge(item.category) + "</div>" +
      "</div>" +
      (item.description ? '<p class="card-desc">' + esc(item.description) + "</p>" : "")
    );
  }

  /* ---------- Card legal ---------- */

  function legalCard(item) {
    var base = "/legal/" + item.slug + "/";
    var privacy = item.privacy === undefined ? base + "privacy.html" : item.privacy;
    var terms = item.terms === undefined ? base + "terms.html" : item.terms;
    var buttons = "";
    if (privacy) {
      buttons +=
        '<a class="btn btn-primary" href="' + esc(privacy) + '" aria-label="Privacy Policy di ' + esc(item.name) + '">' +
        ICON.shield + "Privacy Policy</a>";
    }
    if (terms) {
      buttons +=
        '<a class="btn" href="' + esc(terms) + '" aria-label="Termini di Servizio di ' + esc(item.name) + '">' +
        ICON.doc + "Termini di Servizio</a>";
    }
    var meta = item.updated ? '<p class="card-meta">Aggiornato il ' + esc(formatDate(item.updated)) + "</p>" : "";
    return (
      '<li><article class="card" id="' + esc(item.slug) + '">' +
      head(item, esc(item.name)) + meta +
      '<div class="card-foot">' + buttons + "</div>" +
      "</article></li>"
    );
  }

  /* ---------- Card progetti ---------- */

  function projectCard(item) {
    var url = item.url || "/projects/" + item.slug + "/";
    var ext = window.Site.isExternal(url) ? ' target="_blank" rel="noopener"' : "";
    var title = '<a class="card-link" href="' + esc(url) + '"' + ext + ">" + esc(item.name) + "</a>";
    var foot = "";
    if (item.tags && item.tags.length) {
      foot += '<span class="card-meta">' + item.tags.map(esc).join(" · ") + "</span>";
    }
    if (item.repo) {
      foot +=
        '<a class="btn btn-sm btn-end" href="' + esc(item.repo) + '" target="_blank" rel="noopener">' +
        ICON.code + "Codice</a>";
    }
    return (
      '<li><article class="card">' + head(item, title) +
      (foot ? '<div class="card-foot">' + foot + "</div>" : "") +
      "</article></li>"
    );
  }

  /* ---------- Utility ---------- */

  function formatDate(iso) {
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
  }

  function state(el, msg) {
    el.innerHTML = '<li class="card-state">' + msg + "</li>";
    el.setAttribute("aria-busy", "false");
  }

  // Sostituisce le icone che non si caricano con il monogramma
  function wireFallbacks(el) {
    el.querySelectorAll(".project-icon[data-fallback] img").forEach(function (img) {
      function swap() {
        img.parentNode.innerHTML = img.parentNode.getAttribute("data-fallback");
      }
      if (img.complete && img.naturalWidth === 0) swap();
      else img.addEventListener("error", swap, { once: true });
    });
  }

  function render(el) {
    var kind = el.getAttribute("data-cards");
    var src = el.getAttribute("data-src");
    var limit = parseInt(el.getAttribute("data-limit"), 10);
    var featuredOnly = el.hasAttribute("data-featured");
    var tpl = kind === "legal" ? legalCard : projectCard;

    el.setAttribute("aria-busy", "true");

    fetch(src, { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status + " " + r.statusText);
        return r.json();
      })
      .then(function (data) {
        var items = (Array.isArray(data) ? data : data.projects || []).filter(function (p) {
          return !p.hidden && (!featuredOnly || p.featured);
        });
        if (limit > 0) items = items.slice(0, limit);
        if (!items.length) return state(el, "Nessun elemento ancora. Torna presto.");
        el.innerHTML = items.map(tpl).join("");
        el.setAttribute("aria-busy", "false");
        wireFallbacks(el);
      })
      .catch(function (err) {
        console.error("cards.js:", src, err);
        var hint =
          location.protocol === "file:"
            ? " Apri il sito con un server locale (vedi README)."
            : "";
        state(el, "Impossibile caricare l'elenco." + hint);
      });
  }

  function init() {
    document.querySelectorAll("[data-cards]").forEach(render);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
