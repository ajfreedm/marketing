# Company Website

A multi-page static business site built with HTML, Tailwind CSS 4, and vanilla JavaScript — no frameworks or build step required.

This site lives in `midpointsolutions/marketing/`. All asset and component paths below are relative to that folder.

## Project structure

```
marketing/
├── index.html                  # Home
├── services.html               # Services
├── portfolio.html              # Portfolio
├── about.html                  # About
├── contact.html                # Contact / Get Started
│
├── assets/
│   ├── css/
│   │   └── main.css            # Global styles and form overrides
│   ├── js/
│   │   └── main.js             # Contact form and back-to-top
│   └── images/
│       └── logo.jpg            # Company logo
│
├── components/
│   ├── site-header.html        # Sticky nav with page links
│   ├── site-footer.html        # Shared footer
│   └── chatbot-widget.js       # Static chatbot (Shadow DOM)
│
└── layouts/
    ├── base-layout.html        # Template reference for new pages
    └── load-layout.js          # Injects header and footer via fetch
```

## Architecture

How the pieces load at runtime:

1. Each HTML page owns its own main content and mounts empty shells for shared chrome:
   - `#site-header`
   - `#site-footer`
2. **`layouts/load-layout.js`** fetches and injects:
   - `components/site-header.html` → `#site-header`
   - `components/site-footer.html` → `#site-footer`
   then wires the mobile menu toggle and marks the active nav item from the current filename.
3. **`components/chatbot-widget.js`** attaches the floating support chat (Shadow DOM).
4. **`assets/js/main.js`** handles contact form submit feedback and the back-to-top control.
5. **`assets/css/main.css`** provides global styles on top of Tailwind CSS 4 (CDN).

Script load order at the bottom of every page:

```text
layouts/load-layout.js
components/chatbot-widget.js
assets/js/main.js
```

`layouts/base-layout.html` is not served as a live page. Use it as a reference when adding another HTML entry that should reuse the same header/footer injection pattern.

Because layout pieces are loaded with `fetch`, paths must resolve over HTTP from the site root (`marketing/`). Opening files via `file://` will leave the header and footer empty.

## Getting started

Serve from this folder:

```bash
cd marketing
python -m http.server 8765
```

Then open [http://localhost:8765](http://localhost:8765).

## Pages

Navigation in `components/site-header.html` maps to these files:

| Page | File | Content |
|------|------|---------|
| Home | `index.html` | Hero with primary CTAs |
| Services | `services.html` | Six service categories with deliverables |
| Portfolio | `portfolio.html` | Mock client websites in browser previews |
| About | `about.html` | Solo developer story and working principles |
| Get Started | `contact.html` | Contact details and message form |

## Components

### Header and footer

Defined in `components/site-header.html` and `components/site-footer.html`. Loaded by `layouts/load-layout.js` into the `#site-header` and `#site-footer` mounts on every page.

The header logo path is `assets/images/logo.jpg` (resolved from the site root).

### Chatbot widget

`components/chatbot-widget.js` renders a floating support chat via the **Shadow DOM**. Uses predefined keyword responses — no AI backend required. Customize `CONFIG`, `QUICK_REPLIES`, and `RESPONSES` inside that file.

## Design

- **Background:** `#02457C`
- **Text:** `#FFFFFF`
- **Font:** Inter (Google Fonts)
- **CSS framework:** Tailwind CSS 4 (CDN)
- **Style:** Minimal, high-contrast, thin white borders

## Tech stack

- HTML5
- Tailwind CSS 4 (browser CDN)
- Vanilla JavaScript (ES6+)
- Shadow DOM (chatbot widget)
