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

### Quick start (no setup)

```bash
python3 -m http.server 8080
```

Open **http://localhost:8080** — then `Ctrl+C` to stop.

### With a virtual environment (livereload)

Using a venv keeps the dev dependency isolated and gives you automatic
browser refresh on every file save.

```bash
# Create and activate the venv
python3 -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate

# Install livereload
pip install livereload

# Start the dev server
python3 -c "
from livereload import Server
server = Server()
server.watch('*.html')
server.watch('*.css')
server.watch('*.js')
server.serve(port=8080, root='.')
"
```

Open **http://localhost:8080** — the browser refreshes automatically whenever
`index.html`, `styles.css`, or `app.js` is saved.

To deactivate the venv when done:

```bash
deactivate
```

`.venv/` is intentionally not committed — add it to `.gitignore` if needed.

---

## URL parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `?t=` | Target event date (ISO 8601) | `?t=2026-03-14T19:00:00+01:00` |
| `?title=` | Custom page title | `?title=Das%20blaue%20Element` |

Invalid or missing values fall back to the defaults defined at the top of `app.js`.

**Useful test URLs:**
```
# Normal countdown
http://localhost:8080/?t=2026-03-14T19:00:00+01:00

# Trigger "Es beginnt." immediately (past date)
http://localhost:8080/?t=2020-01-01T00:00:00Z

# Invalid date → fallback to default
http://localhost:8080/?t=garbage
```

---

## Fragment codes

Codes are validated client-side only. No data is transmitted.
Registered codes are stored in `localStorage` under the key `dbe_fragmentCode`.

| Code | Response |
|------|----------|
| `BLAU01` | Das erste Fragment ist erkannt. |
| `AZUR77` | Deine Farbe ist bekannt. |
| `TIEFE8` | Du kommst aus der Tiefe. |
| `MOND42` | Das Licht folgt dir. |
| `KOBALT` | Die Schicht ist vollständig. |
| *(any other valid code)* | Fragment erkannt. |

Valid format: **6–8 characters, A–Z and 0–9.**
To add or change codes, edit the `CODE_MAP` object in `app.js`.

---

## Changing the default event date

Edit the `DEFAULT_ISO` constant at the top of `app.js`:

```js
var DEFAULT_ISO = '2026-03-14T19:00:00+01:00';
```

---

## Deploy to GitHub Pages

```bash
git add .
git commit -m "Update"
git push
```

GitHub Pages rebuilds automatically on every push to `main`.
Settings: **Repository → Settings → Pages → Source: main / root**

---

## Accessibility

- Semantic HTML5 landmarks and headings
- `aria-live` on the countdown SR region (polite, every ~30 s)
- `aria-live="assertive"` on the "Es beginnt." message
- Native `<dialog>` element — focus trap and ESC handling built in
- All interactive elements have `:focus-visible` rings
- `prefers-reduced-motion` disables all CSS animations and JS transitions
