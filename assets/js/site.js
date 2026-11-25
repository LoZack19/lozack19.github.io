/*
 * site.js — componenti condivisi del sito.
 *
 * Inserisce in ogni pagina:
 *   <header data-site-header></header>  -> navbar (logo, link, tema, hamburger)
 *   <nav data-breadcrumb></nav>         -> breadcrumb, da <body data-breadcrumb='[...]'>
 *   <nav data-toc></nav>                -> indice dei documenti (dagli <h2> di .prose)
 *   <footer data-site-footer></footer>  -> footer
 *
 * Per modificare navbar o footer in TUTTO il sito, cambia solo SITE qui sotto.
 */
(function () {
  "use strict";

  var SITE = {
    name: "Giovanni Zaccaria",
    alias: "LoZack19",
    monogram: "GZ",
    nav: [
      { label: "Home", href: "/" },
      { label: "Progetti", href: "/projects/" },
      { label: "Legal / Bot", href: "/legal/" },
      { label: "Risorse", href: "/resources/" },
    ],
    footer: [
      { label: "GitHub", href: "https://github.com/LoZack19" },
      { label: "Progetti", href: "/projects/" },
      { label: "Legal", href: "/legal/" },
      { label: "Risorse", href: "/resources/" },
    ],
  };

  var ICONS = {
    moon:
      '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    sun:
      '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function isExternal(href) {
    return /^https?:\/\//.test(href);
  }

  function linkAttrs(href) {
    return isExternal(href) ? ' target="_blank" rel="noopener"' : "";
  }

  // Normalizza "/legal/index.html" -> "/legal/"
  function normPath(p) {
    return p.replace(/index\.html$/, "");
  }

  function isActive(href) {
    var here = normPath(location.pathname);
    if (href === "/") return here === "/";
    return here.indexOf(href) === 0;
  }

  /* ---------- Header ---------- */

  function renderHeader(el) {
    var links = SITE.nav
      .map(function (item) {
        var current = isActive(item.href) ? ' aria-current="page"' : "";
        return (
          '<li><a class="nav-link" href="' + esc(item.href) + '"' + current + ">" +
          esc(item.label) + "</a></li>"
        );
      })
      .join("");

    el.classList.add("site-header");
    el.innerHTML =
      '<div class="container">' +
      '<a class="brand" href="/" aria-label="' + esc(SITE.name) + ' — Home">' +
      '<span class="brand-mark" aria-hidden="true">' + esc(SITE.monogram) + "</span>" +
      "<span>" + esc(SITE.name) + "</span>" +
      '<span class="brand-alias">@' + esc(SITE.alias) + "</span>" +
      "</a>" +
      '<nav class="site-nav" id="site-nav" aria-label="Principale">' +
      '<ul class="nav-list">' + links + "</ul>" +
      "</nav>" +
      '<button class="icon-btn theme-toggle" type="button" aria-label="Cambia tema">' +
      ICONS.moon + ICONS.sun +
      "</button>" +
      '<button class="icon-btn nav-toggle" type="button" aria-label="Apri menu" aria-controls="site-nav" aria-expanded="false">' +
      '<span class="bars" aria-hidden="true"><span class="bar"></span><span class="bar"></span><span class="bar"></span></span>' +
      "</button>" +
      "</div>";

    // Tema
    var themeBtn = el.querySelector(".theme-toggle");
    function syncThemeLabel() {
      var dark = window.__theme && window.__theme.get() === "dark";
      themeBtn.setAttribute("aria-label", dark ? "Passa al tema chiaro" : "Passa al tema scuro");
      themeBtn.setAttribute("title", dark ? "Tema chiaro" : "Tema scuro");
    }
    syncThemeLabel();
    themeBtn.addEventListener("click", function () {
      if (window.__theme) window.__theme.toggle();
      syncThemeLabel();
    });

    // Menu mobile
    var nav = el.querySelector(".site-nav");
    var toggle = el.querySelector(".nav-toggle");
    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Chiudi menu" : "Apri menu");
    }
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("is-open") && !el.contains(e.target)) setOpen(false);
    });
    window.matchMedia("(min-width: 48rem)").addEventListener("change", function (m) {
      if (m.matches) setOpen(false);
    });

    // Bordo inferiore quando si scrolla
    var onScroll = function () {
      el.classList.toggle("is-scrolled", window.scrollY > 4);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Breadcrumb ---------- */

  function renderBreadcrumb(el) {
    var raw = document.body.getAttribute("data-breadcrumb");
    if (!raw) return;
    var items;
    try {
      items = JSON.parse(raw);
    } catch (e) {
      console.warn("data-breadcrumb non valido:", e);
      return;
    }
    items = [{ label: "Home", href: "/" }].concat(items);

    el.classList.add("breadcrumb");
    el.setAttribute("aria-label", "Breadcrumb");
    el.innerHTML =
      '<div class="container"><ol>' +
      items
        .map(function (item, i) {
          var last = i === items.length - 1;
          if (last || !item.href) {
            return "<li><span" + (last ? ' aria-current="page"' : "") + ">" + esc(item.label) + "</span></li>";
          }
          return '<li><a href="' + esc(item.href) + '">' + esc(item.label) + "</a></li>";
        })
        .join("") +
      "</ol></div>";
  }

  /* ---------- Indice dei documenti ---------- */

  function slugify(s) {
    return s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function renderToc(el) {
    var headings = document.querySelectorAll(".prose h2");
    if (!headings.length) return;

    var used = {};
    var html = '<p class="toc-title" id="toc-title">Indice</p><ol>';
    headings.forEach(function (h) {
      if (!h.id) {
        var base = slugify(h.textContent) || "sezione";
        var id = base;
        var n = 2;
        while (used[id] || document.getElementById(id)) id = base + "-" + n++;
        h.id = id;
      }
      used[h.id] = true;
      html += '<li><a href="#' + esc(h.id) + '">' + esc(h.textContent) + "</a></li>";
    });
    html += "</ol>";

    el.classList.add("toc");
    el.setAttribute("aria-labelledby", "toc-title");
    el.innerHTML = html;

    // Evidenzia la sezione corrente
    if (!("IntersectionObserver" in window)) return;
    var links = {};
    el.querySelectorAll("a").forEach(function (a) {
      links[a.getAttribute("href").slice(1)] = a;
    });
    var active;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (active) active.classList.remove("is-active");
            active = links[entry.target.id];
            if (active) active.classList.add("is-active");
          }
        });
      },
      { rootMargin: "0px 0px -70% 0px" }
    );
    headings.forEach(function (h) {
      io.observe(h);
    });
  }

  /* ---------- Footer ---------- */

  function renderFooter(el) {
    el.classList.add("site-footer");
    el.innerHTML =
      '<div class="container">' +
      '<p class="footer-copy">© ' + new Date().getFullYear() + " " + esc(SITE.name) +
      " · <span>@" + esc(SITE.alias) + "</span></p>" +
      '<ul class="footer-links">' +
      SITE.footer
        .map(function (l) {
          return '<li><a href="' + esc(l.href) + '"' + linkAttrs(l.href) + ">" + esc(l.label) + "</a></li>";
        })
        .join("") +
      "</ul>" +
      "</div>";
  }

  /* ---------- Avvio ---------- */

  function each(sel, fn) {
    document.querySelectorAll(sel).forEach(fn);
  }

  function init() {
    each("[data-site-header]", renderHeader);
    each("[data-breadcrumb]:not(body)", renderBreadcrumb);
    each("[data-toc]", renderToc);
    each("[data-site-footer]", renderFooter);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  // Utility condivise con cards.js
  window.Site = { esc: esc, slugify: slugify, isExternal: isExternal };
})();
