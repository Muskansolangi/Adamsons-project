# Adamsons Law Associates — Redesigned Website

## What's in this package

- `*.html` — 24 pages, ready to open directly in a browser or upload to any static host.
- `assets/css/style.css` — the full design system (colours, type, components, responsive rules).
- `assets/js/main.js` — navigation, scroll reveals, stat counters, mobile menu, consultation form.
- `assets/images/` — all photography, optimised into responsive WebP + JPG sizes.
- `build/` — the content system used to generate the site (see below). Not required to run
  the site, but very useful for future edits.

## How to preview it

Open `index.html` in a browser, or serve the folder locally, e.g.:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## How to update content later (no admin panel needed)

Every page is generated from a single content file: `build/data.py`. To change a bio, a
phone number, an office address, a practice-area description, or add a new journal entry,
edit the relevant entry in `build/data.py`, then run:

```
pip install jinja2
python3 build/generate.py
```

This regenerates all 24 HTML pages from the templates in `build/templates/`, so every page
stays consistent automatically — you never have to hand-edit the navigation or footer on
24 separate files.

If you'd rather hand-edit the HTML files directly instead, that works too — the generator
is a convenience, not a requirement.

## What still needs the client's input

- **Events & Achievements photo gallery** — no event photography was supplied, so this page
  currently shows an honest "coming soon" placeholder instead of fabricated images. Once
  photos are approved, they can be dropped into `assets/images/events/` and the gallery grid
  (`.gallery-coming` block in `events.html`) can be swapped for real thumbnails.
- **Advocate Nighat Khan** — no photo or detailed bio was available in the source material,
  so her profile currently shows a placeholder initial and a short holding note.
- **~120-word biographies** for team members — several advocates currently have short,
  factual bios pulled from the existing site. Longer bios can be dropped into `build/data.py`
  (the `TEAM` list) whenever the client supplies them.
- **Client/affiliation logos** — Selected Clients and Professional Affiliations are shown as
  text only, since no logo files were supplied or approved for use.

## Design notes

- Palette and type follow the brief exactly: black/charcoal/ivory/gold (~70/20/10 mix),
  Fraunces (serif headings) + Inter (body/nav).
- The homepage hero uses a split layout (text beside the photo, not behind it) specifically
  because the source hero photography is portrait-oriented — this keeps the images sharp
  and fully visible at every breakpoint instead of stretching/blurring them into a wide banner.
- Verified responsive at 320/375/390/430/768/1024/1280/1440px with zero horizontal overflow.
- All content is sourced from the existing site and supplied materials — nothing about the
  firm, its people, or its history has been invented.
