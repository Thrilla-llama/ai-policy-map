# Website design

Static AI Policy Map website design exported September 9, 2026.

## Run locally

From the repository root, run `python3 -m http.server 8000`, then open http://localhost:8000. An HTTP server is needed for the CSV/JSON requests. No package installation or build is required; a static host can serve the repository root.

## Files

- `index.html`: page layout.
- `styles.css`: base styling.
- `steep.css`: current visual theme, gradients, responsive layout, hover states.
- `app.js`: CSV parsing and district search.
- `district-map.js`: spaced geographic dots, scroll assembly, and district details.
- `assets/`: generated pencil illustrations.
- `data/districts.csv`: public design dataset with entity names and policy classifications only.
- `data/locations.json`: 215 approximate Georgia entity locations.

## Public export

The original research includes personal contact fields. Those fields, narrative notes, and record source URLs are excluded from this public export. The original private review site is unchanged. District search and map selection work with the included classification data; detailed narrative and source links require an appropriately reviewed dataset.

There are 393 total records, including 300 Georgia entities. Washington and unmapped Georgia entities remain available separately. Map positions derive from linked school ZIP codes or counties and are adjusted to a spaced grid, not precise addresses or district boundaries.

Coordinate reference: https://github.com/millbj92/US-Zip-Codes-JSON.

The theme references Signifier and Sohne but does not contain licensed font files; configured fallback fonts are used.

JavaScript syntax and settled-dot spacing were checked. Full browser visual and interaction testing remains outstanding. This upload does not enable GitHub Pages, CI, or automatic synchronization with the private review site.
