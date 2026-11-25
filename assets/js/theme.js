/*
 * theme.js — caricato in modo SINCRONO nel <head> (senza defer) per applicare
 * il tema prima del primo paint ed evitare il "flash" di colori sbagliati.
 *
 * Priorità: scelta salvata in localStorage > prefers-color-scheme.
 * Il toggle vero e proprio è gestito da site.js tramite window.__theme.
 */
(function () {
  var KEY = "theme";
  var root = document.documentElement;
  var media = window.matchMedia("(prefers-color-scheme: dark)");

  function stored() {
    try {
      var v = localStorage.getItem(KEY);
      return v === "light" || v === "dark" ? v : null;
    } catch (e) {
      return null;
    }
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
  }

  function current() {
    return stored() || (media.matches ? "dark" : "light");
  }

  apply(current());

  // Se l'utente non ha scelto manualmente, segui il sistema in tempo reale.
  var onChange = function () {
    if (!stored()) apply(current());
  };
  if (media.addEventListener) media.addEventListener("change", onChange);
  else if (media.addListener) media.addListener(onChange);

  window.__theme = {
    get: function () {
      return root.getAttribute("data-theme");
    },
    set: function (theme) {
      try {
        localStorage.setItem(KEY, theme);
      } catch (e) {}
      apply(theme);
    },
    toggle: function () {
      this.set(this.get() === "dark" ? "light" : "dark");
      return this.get();
    },
  };
})();
