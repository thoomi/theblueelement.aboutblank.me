# Das blaue Element

Static one-page invitation site. No framework, no build step, no external dependencies.

**Live:** https://thoomi.github.io/theblueelement.aboutblank.me/

---

## Files

```
index.html   — structure and content
styles.css   — all styling (custom properties, animations, layout)
app.js       — countdown, fragment modal, URL parameter handling
```

---

## Local development

```bash
python3 -m http.server 8080
```

Open **http://localhost:8080**. For auto-refresh on save, install `livereload` in a venv and run:

```bash
python3 -c "
from livereload import Server
s = Server()
s.watch('*.html'); s.watch('*.css'); s.watch('*.js')
s.serve(port=8080, root='.')
"
```

---

## Fragment codes

Codes are validated client-side only — nothing is transmitted. The registered code is stored in `localStorage` under `dbe_fragmentCode`.

| Code | Personal confirmation |
|------|-----------------------|
| `XZ7B4N` | Das erste Zeichen ist gesetzt. |
| `KV3T9L` | Die Tiefe hat dich erkannt. |
| `NW8Z2R` | Du trägst das richtige Licht. |
| `4JT7VK` | Das Muster schließt sich. |

All four codes additionally show the shared detail line defined as `SHARED_DETAIL` in `app.js` — replace it with the real venue or instruction before distributing codes.

Unknown valid codes (6–8 chars, A–Z and 0–9) return: *Das Fragment ist unbekannt.*

---

## Before the event

Two things to update in `app.js`:

1. **`DEFAULT_ISO`** — the event date/time:
   ```js
   var DEFAULT_ISO = '2026-03-14T19:00:00+01:00';
   ```

2. **`SHARED_DETAIL`** — the venue/address shown after a valid code:
   ```js
   var SHARED_DETAIL = 'Trag ein blaues Detail — Hemd, Schmuck, Accessoire.';
   ```

---

## Deploy

```bash
git add . && git commit -m "Update" && git push
```

GitHub Pages rebuilds automatically on push to `main`.
Settings: **Repository → Settings → Pages → Source: main / root**
