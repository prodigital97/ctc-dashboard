# Developer Guide & Codebase Brief
This document outlines the architecture, tech stack, and key modules of the **Classy Travel Couples (CTC) Trend Intelligence Dashboard**. Use this as a brief for AI coding assistants (like Claude Code) to quickly understand the project.

---

## 1. Project Overview
The CTC Trend Intelligence Engine is a dashboard designed for couples-travel bloggers. It automates:
1. **Trend Detection**: Scans 40+ competitor RSS feeds and extracts trending couples-travel topics.
2. **Instagram Carousel Planner**: Scrapes Instagram posts (using hashtags) and generates slide-by-slide romantic travel carousel post outlines.
3. **AI Blog Writing**: Generates long-form, SEO-optimized blog posts using Gemini.
4. **WordPress Integration**: Publishes drafts directly to the WordPress site.
5. **AIGC Image Prep**: Resizes and optimizes images for WordPress.
6. **Fact-Checking & Audit**: Audits WordPress posts to verify factuality and formats.

---

## 2. Technical Stack
* **Backend**: Node.js, Express, `rss-parser`, `xlsx` (Excel read/write), `jimp` (image manipulation).
* **Frontend**: Vanilla HTML5, Vanilla CSS, and Vanilla JavaScript (SPA framework built inside a single file: `index.html`).
* **AI Models**: Google Gemini (via Gemini API, default model `gemini-2.5-flash`).
* **Authentication**: Cookie-based session verification. Session tokens are checked via middleware in `server.js`.
* **Database**: Local storage (`localStorage`) on the client side (`ctc_history`, `ctc_ig_history`, settings) and Excel sheets/JSON pools on the backend (`rendered_blogs`, `renders_pool.json`, `trends_history.xlsx`).

---

## 3. Directory & File Structure
* **`server.js`**: Main backend entry point containing express configuration, RSS parsers, Gemini prompt logic, scrapers, and WordPress API client.
* **`index.html`**: Main frontend SPA. Handles UI panels, mobile mockup view, settings, and calls backend API endpoints.
* **`login.html`**: Glassmorphic password security gate.
* **`.env`**: Server configuration (e.g. `PORT`, `GEMINI_API_KEY`, `DASHBOARD_PASSWORD`, `WP_APPLICATION_PASSWORD`). *Never commit this file.*
* **`DEVELOPER_GUIDE.md`**: This guide.

---

## 4. Key Configurations & Guidelines
* **The India Exclusion Rule (CRITICAL)**: Across all trend analysis prompts, scraper filters, and carousel outlines, the AI must **never** recommend, suggest, or include destinations, stays, or itineraries located in India.
* **Security & Auth**:
  * Unauthenticated static page visits are redirected to `/login`.
  * API routes starting with `/api/` (except login/public status) require the `ctc_auth_token` cookie or `Authorization` header. If absent/expired, they return a `401 Unauthorized` response.
  * In `index.html`, a global `fetch` interceptor automatically catches `401` responses and redirects the browser to `/login`.
* **Mobile Friendly**: Designed to fit mobile screens. Can be added to the home screen on iOS/Android as a standalone app.

---

## 5. Main API Endpoints
* **`POST /api/login`**: Accepts `{ password }`. On success, generates a 32-byte hex token, saves it in an in-memory `Set`, sets a `ctc_auth_token` HTTP cookie, and returns `{ success: true, token }`.
* **`POST /api/logout`**: Removes token from active session list and clears the auth cookie.
* **`POST /api/trends`**: Scans external travel RSS feeds, runs deduplication against the blog's own RSS feed, and calls Gemini to extract matching trends for a specific travel category.
* **`POST /api/trends/instagram/carousels`**: Scrapes live posts under couple travel hashtags (via Apify or RapidAPI) and asks Gemini to synthesize slide-by-slide carousel outlines.
* **`POST /api/generate`**: Creates detailed blog article outlines and full-text drafts based on a selected trend.
* **`POST /api/publish`**: Publishes drafts directly to WordPress via the WordPress REST API.
