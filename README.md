# Joey Kheireddine — The Chain

Personal resume site for Joey Kheireddine, CTO and AI & Web3 engineering leader.
Static HTML/CSS/JS with no build step, hosted on GitHub Pages.

**Live:** https://joeykhd.github.io/

## Concept

The career is presented as a blockchain. Each role is a block that is hashed with real
SHA-256 proof-of-work in the visitor's browser and linked to the block before it.
"Tamper with history" makes every bullet point editable: change one and the downstream
blocks break until you re-mine the chain.

Other details:

- Case studies in `work/` (Auto.fun, FLUF World and its collections), each with linked sources
- An ordered-dither (Bayer 8×8) WebGL portrait, with a true-colour lens that follows the cursor
- Light and dark themes (system default, remembered toggle) with matching patent-plate illustrations
- A scroll-scrubbed manifesto, count-up impact stats, and a sticky "current block" aside with era illustrations
- A Stack section where every skill shows where it shipped (hover, tap, or the "Show where each skill shipped" toggle)
- A two-page A4 CV, built from the print stylesheet and offered as **Download CV** (`assets/joey-kheireddine-cv.pdf`)
- Smooth scrolling with [Lenis](https://github.com/darkroomengineering/lenis) 1.3.26 (self-hosted in `assets/vendor/lenis/`, MIT); native scrolling is kept for reduced motion and touch
- `prefers-reduced-motion` support, a no-JS fallback, semantic HTML and JSON-LD `Person` schema

## Structure

```
index.html                      the resume (edit text directly)
work/*.html                     case studies
404.html                        "Block not found" page
assets/css/style.css            tokens, themes, layout, responsive and print (CV) styles
assets/js/main.js               theme, loader, reveals, chain hashing, portrait shader, menu, Lenis setup
assets/img/                     portrait, light/dark plates (*-light.webp / *-dark.webp), social card, icons
assets/fonts/                   self-hosted Instrument Serif, Geist and Geist Mono (OFL)
assets/vendor/lenis/            Lenis 1.3.26 (MIT)
assets/joey-kheireddine-cv.pdf  two-page CV, built from the print stylesheet
scripts/build-cv.mjs            rebuilds the CV PDF
robots.txt, sitemap.xml, site.webmanifest
```

To add a role, copy a `<li class="block">` in `index.html`, give it the next `data-block`
number, a `data-time`, `data-org` and `data-fig`, list its technologies in the "Built with"
tags (the Stack section links skills to roles from these), and add matching
`era-XX-light.webp` / `era-XX-dark.webp` plates to the sticky aside.

## Run locally

```sh
python -m http.server 8000
# open http://localhost:8000
```

Serve the site over HTTP rather than opening the file directly: browsers only expose
SHA-256 (`crypto.subtle`) in secure contexts, and on `file://` the chain falls back to a
non-cryptographic hash.

## Rebuild the CV PDF

After editing content, regenerate the PDF from the print stylesheet (needs Edge or Chrome):

```sh
python -m http.server 8787          # in one terminal
npm i --no-save playwright-core     # once
node scripts/build-cv.mjs           # writes assets/joey-kheireddine-cv.pdf
```

## Deploy

GitHub Pages serves `main` / `/ (root)` of `JoeyKhd/joeykhd.github.io` at https://joeykhd.github.io/.
The absolute URLs (canonical, Open Graph, JSON-LD) live in the `<head>` of `index.html`.

## Privacy

The site publishes no phone number or address. Contact goes through email, LinkedIn and
GitHub; the email address is assembled at runtime (`data-mail`) so it never appears in the
HTML source for scrapers. Source documents live in `docs/`, which is git-ignored and never pushed.
Image metadata was stripped when the images were re-encoded.

## Credits

Type: Instrument Serif, Geist and Geist Mono, self-hosted from `assets/fonts/` under the SIL Open Font License 1.1.
Patent-plate illustrations were generated with Higgsfield (GPT Image 2.5); the dark-theme plates are derived from the light ones.
