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

- An ordered-dither (Bayer 8×8) WebGL portrait, with a true-colour lens that follows the cursor
- A scroll-scrubbed manifesto, count-up impact stats, and a sticky "current block" aside with era illustrations
- A print stylesheet: **Print resume** in the footer (or Ctrl/Cmd + P) gives a clean, light, paginated CV
- `prefers-reduced-motion` support, a no-JS fallback, semantic HTML and JSON-LD `Person` schema

## Structure

```
index.html            all resume content lives here (edit text directly)
assets/css/style.css  design tokens, layout, responsive and print styles
assets/js/main.js     loader, reveals, chain hashing, portrait shader, cursor
assets/img/           portrait, era illustrations, social card, icons
```

To add a role, copy a `<li class="block">` in `index.html`, give it the next `data-block`
number and a `data-time`, and add a matching `era-XX.webp` image in the sticky aside.

## Run locally

```sh
python -m http.server 8000
# open http://localhost:8000
```

Serve the site over HTTP rather than opening the file directly: browsers only expose
SHA-256 (`crypto.subtle`) in secure contexts, and on `file://` the chain falls back to a
non-cryptographic hash.

## Deploy

GitHub Pages serves `main` / `/ (root)` of `JoeyKhd/joeykhd.github.io` at https://joeykhd.github.io/.
The absolute URLs (canonical, Open Graph, JSON-LD) live in the `<head>` of `index.html`.

## Privacy

The site publishes no phone number or address. Contact goes through email, LinkedIn and
GitHub; the email address is assembled at runtime (`data-mail`) so it never appears in the
HTML source for scrapers. Source documents live in `docs/`, which is git-ignored and never pushed.
Image metadata was stripped when the images were re-encoded.

## Credits

Type: Instrument Serif, Geist and Geist Mono (Google Fonts, OFL).
Era illustrations were generated with Higgsfield.
