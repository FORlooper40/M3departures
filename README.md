# M3 Departures — Plain JavaScript

Single-page app (no dependencies) that shows the **next three** departures:
- **From M3 Parkway** (weekday times from your PDF).
- **Connolly/Docklands → M3 Parkway (via Clonsilla)** showing departures from Dublin that reach M3.

Uses the Europe/Dublin timezone via `Intl.DateTimeFormat`. No external libs.

## Host as GitHub Pages
1. Create a new repo and upload: `index.html`, `app.js`, `styles.css`, `timetable.json`.
2. In repo settings → Pages → set the branch to `main` and folder `/ (root)`.
3. Open your Pages URL to use it anywhere.

## Host as a Gist
- Create a **public gist** with the same four files. Open the raw `index.html` in a gist viewer or copy to a repo for Pages.

## Edit the timetable
Open `timetable.json`. Add Saturday/Sunday sections if needed and extend arrays.

**Note**: Schedule-based only (no live delay data).

License: MIT.
