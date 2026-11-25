# lozack19.github.io

Sito personale di **Giovanni Zaccaria (alias LoZack19)**: hub per progetti, tool web,
risorse e documentazione legale (Privacy Policy e Termini) di bot e API.

Usa solo HTML, CSS e JavaScript vanilla: niente build step, niente framework, niente dipendenze.
GitHub Pages serve i file così come sono.

## Mappa delle cartelle

```
/
├── index.html                 Home
├── 404.html                   Pagina "non trovata" (servita da GitHub Pages)
├── .nojekyll                  Disattiva Jekyll (altrimenti le cartelle _template/ non vengono pubblicate)
├── assets/
│   ├── css/
│   │   ├── tokens.css         Design token: colori (chiaro/scuro), spaziature, font
│   │   ├── base.css           Reset e tipografia
│   │   ├── layout.css         Container, navbar, breadcrumb, sezioni, footer
│   │   ├── components.css     Bottoni, badge, card, tile, liste, pagina progetto
│   │   └── legal.css          Layout dei documenti legali, indice, stile di stampa
│   ├── js/
│   │   ├── theme.js           Tema chiaro/scuro (nel <head>, senza defer)
│   │   ├── site.js            Navbar, footer, breadcrumb, indice: config in SITE
│   │   └── cards.js           Griglie di card generate da un JSON
│   ├── icons/                 Icone dei progetti (<slug>.svg), favicon, fallback.svg
│   └── img/                   Immagini generiche
├── projects/
│   ├── index.html             Hub progetti (legge projects.json)
│   ├── projects.json          Elenco progetti
│   ├── _template/             Pagina progetto da copiare
│   └── <slug>/                Pagina o web app statica di ogni progetto
├── legal/
│   ├── index.html             Hub legal (legge projects.json)
│   ├── projects.json          Elenco progetti con documenti legali
│   ├── _template/             privacy.html + terms.html da copiare
│   └── <slug>/
│       ├── privacy.html       → https://lozack19.github.io/legal/<slug>/privacy.html
│       └── terms.html         → https://lozack19.github.io/legal/<slug>/terms.html
└── resources/
    └── index.html             Indice di file e pagine di utilità
```

### Componenti condivisi

Ogni pagina contiene solo dei segnaposto, che `site.js` riempie:

```html
<body data-breadcrumb='[{"label":"Legal","href":"/legal/"},{"label":"Privacy"}]'>
  <header data-site-header></header>   <!-- navbar -->
  <nav data-breadcrumb></nav>          <!-- breadcrumb: "Home" viene aggiunta in automatico -->
  ...
  <nav data-toc></nav>                 <!-- indice, generato dagli <h2> dentro .prose -->
  ...
  <footer data-site-footer></footer>   <!-- footer -->
</body>
```

Per cambiare i link della navbar o del footer in tutto il sito, modifica l'oggetto `SITE`
all'inizio di `assets/js/site.js`.

Il testo dei documenti legali è HTML statico: si legge anche senza JavaScript, quindi
funziona con i crawler di verifica di Google, Telegram, Discord ecc.

### Anteprima in locale

I JSON vengono caricati con `fetch()`, che non funziona aprendo i file con `file://`.
Avvia un server dalla radice del repository:

```sh
python -m http.server 8000
# poi apri http://localhost:8000
```

## Aggiungere un progetto in `/projects/`

1. Copia `projects/_template/` in `projects/<slug>/`. Lo slug va scritto in minuscolo con i trattini, es. `meteo-bot`.
2. In `index.html` sostituisci `{{SLUG}}`, `{{NOME}}`, `{{CATEGORIA}}`, `{{categoria-slug}}` e `{{DESCRIZIONE}}`,
   poi rimuovi la riga `<meta name="robots" content="noindex">`.
   Se è una web app, metti l'app dentro `<main>` con CSS e JS propri nella stessa cartella.
3. *(Opzionale)* Aggiungi l'icona in `assets/icons/<slug>.svg` (quadrata, 64×64 o più grande).
   Se manca, le card mostrano un monogramma colorato generato in automatico.
4. Aggiungi la voce in `projects/projects.json`:

```json
{
  "slug": "meteo-bot",
  "name": "Meteo Bot",
  "category": "Telegram Bot",
  "description": "Previsioni meteo su Telegram.",
  "icon": "/assets/icons/meteo-bot.svg",
  "tags": ["Telegram", "Python"],
  "repo": "https://github.com/LoZack19/meteo-bot",
  "featured": true
}
```

| Campo | Obbligatorio | Note |
|---|---|---|
| `slug` | sì | Nome della cartella |
| `name` | sì | Nome visualizzato |
| `category` | no | Testo del badge. Il colore del pallino si imposta in `components.css` (`.badge[data-category="..."]`) |
| `description` | no | 1-2 righe |
| `icon` | no | Percorso dell'icona; senza icona viene usato il monogramma |
| `url` | no | Default `/projects/<slug>/`; può essere un URL esterno |
| `repo` | no | Mostra il pulsante "Codice" |
| `tags` | no | Array di stringhe |
| `featured` | no | `true` = mostrato in home (al massimo 3) |
| `hidden` | no | `true` = nascosto |

## Aggiungere Privacy e Termini in `/legal/`

1. Copia `legal/_template/` in `legal/<slug>/`.
2. In **entrambi** i file fai cerca e sostituisci di questi segnaposto:

   | Segnaposto | Esempio |
   |---|---|
   | `{{SLUG}}` | `meteo-bot` |
   | `{{NOME}}` | `Meteo Bot` |
   | `{{CATEGORIA}}` | `Telegram Bot` |
   | `{{categoria-slug}}` | `telegram-bot` |
   | `{{DATA_ISO}}` | `2026-11-25` |
   | `{{DATA}}` | `25 novembre 2026` |

3. Adatta i testi tra `[parentesi quadre]`, poi rimuovi il riquadro "Template" e la riga `<meta name="robots" content="noindex">`.
4. Aggiungi la voce in `legal/projects.json`:

```json
{
  "slug": "meteo-bot",
  "name": "Meteo Bot",
  "category": "Telegram Bot",
  "description": "Previsioni meteo su Telegram.",
  "icon": "/assets/icons/meteo-bot.svg",
  "updated": "2026-11-25"
}
```

   I pulsanti puntano di default a `/legal/<slug>/privacy.html` e `/legal/<slug>/terms.html`.
   Per cambiare un URL usa `"privacy": "..."` o `"terms": "..."`; per nascondere un pulsante usa `null`.

5. Inserisci gli URL nei pannelli developer:
   - `https://lozack19.github.io/legal/<slug>/privacy.html`
   - `https://lozack19.github.io/legal/<slug>/terms.html`

Quando modifichi un documento, aggiorna sia il `<time>` nella pagina sia `updated` nel JSON.
