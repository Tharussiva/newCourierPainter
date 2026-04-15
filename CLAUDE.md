# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**newCourierPainter** is a custom Shopify theme built on top of Shopify's [Dawn](https://github.com/Shopify/dawn) base theme. Custom work is layered on top of Dawn using the `hps-` prefix (House Painting Service). The design aesthetic is stark: full-viewport black pages with Courier New monospace typography and a sidebar + scrollable grid layout.

## Development Commands

```bash
# Start local dev server (hot-reload via Shopify CLI)
shopify theme dev

# Push theme files to a store
shopify theme push

# Pull theme files from a store
shopify theme pull

# Lint with Theme Check
shopify theme check
```

Requires [Shopify CLI](https://shopify.dev/docs/themes/tools/cli) and Node.js 20.10+.

To sync Dawn upstream changes:
```bash
git fetch upstream
git pull upstream main
```

## Architecture

### Custom vs. Dawn

Everything prefixed `hps-` is custom to this project. All other files are inherited Dawn and should be modified minimally to stay mergeable with Dawn upstream updates.

| Custom file | Purpose |
|---|---|
| `sections/hps-homepage.liquid` | Homepage section — sidebar + product grid from a chosen collection |
| `sections/hps-collection.liquid` | Collection page section — same sidebar + grid but paginated via `collection.products` |
| `sections/hps-product.liquid` | Product page — 3-column layout (thumbs / main image / info panel) |
| `sections/hps-footer.liquid` | Footer — 3 configurable link columns + copyright |
| `snippets/hps-sidebar.liquid` | Left-nav sidebar rendered by homepage and collection sections |
| `assets/hps-global.css` | Site-wide overrides: Courier New font, full-viewport body on index/collection, white background on product |
| `assets/hps-homepage.css` | Layout for `.hps-page`, `.hps-content-row`, `.hps-sidebar`, `.hps-grid`, `.hps-product-card` |
| `assets/hps-product.css` | 3-column product gallery layout |
| `assets/hps-footer.css` | Footer column layout |

### Page Templates

Templates live in `templates/` as JSON and wire sections to page types:

- `index.json` → `hps-homepage` section
- `collection.json` → `hps-collection` section
- `product.json` → `hps-product` section (uses Dawn's built-in block types: title, description, price, variant_picker, buy_buttons)

### Layout & CSS Strategy

`hps-global.css` is loaded globally via `layout/theme.liquid` and applies:
- `font-family: 'Courier New', monospace !important` on every element
- `.template-index` and `.template-collection` bodies: `display: flex; height: 100vh; overflow: hidden` — the pages do **not** scroll at body level; only the product grid column scrolls internally
- `.template-product` body: white background

Page-specific CSS files (`hps-homepage.css`, `hps-product.css`, etc.) are loaded at the top of each section via `{{ 'file.css' | asset_url | stylesheet_tag }}`.

### Design Token Conventions

CSS custom properties scoped per section via `{% style %}`:
- `--hps-cols` — number of grid columns (set on `.hps-grid`)
- `--hps-content-top-gap` — spacing above the sidebar+grid content row
- `--hps-nav-grid-gap` — gap between the sidebar and the grid

Global colour tokens in `hps-global.css`:
- `--hps-black: #000000`
- `--hps-white: #ffffff`
- `--hps-overlay: rgba(0,0,0,0.45)`

### Sidebar Dev Fallback

Both `hps-homepage` and `hps-collection` sections fall back to the hardcoded handle `new-courier-painter-menu` when no menu is selected in section settings (or when the default `main-menu` is used). This is a dev convenience — remove before final handoff.

### Cart Integration

`snippets/hps-sidebar.liquid` listens for a custom `cart:refresh` DOM event to update `.hps-cart-count` and `.hps-cart-total` elements. This event is dispatched by Dawn's pubsub system (`pubsub.js`).
