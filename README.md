# Insider Alert Bot

[Visit the website](https://jaredmansu.github.io/insider-alerts/) ·
[Start a seven-day trial on Discord](https://discord.gg/AXSVjJrDWR)

Filtered SEC Form 4 alerts for notable insider buys and executive sales on
NYSE/NASDAQ listings. Premium includes signal grades, available insider history
and recent quotes, ticker watchlists, insider lookups, and a weekly graded report.

Seven days of premium access require no card and never convert automatically.
Continuing access costs $5 USD/month through an opt-in Stripe checkout in Discord.
After trial expiry, members can remain in the community. This is public filing
data for research, not investment advice or a prediction of returns.

## Website

Static HTML, CSS, and JavaScript, served by GitHub Pages from `main` at `/`.
No build, trackers, paid services, or runtime dependencies.

- `index.html`: product, trial/pricing, methodology, historical examples, and FAQ.
- `styles.css`: responsive layout and scroll-driven animation states.
- `site.js`: progressive motion, reduced-motion support, pause control, and a
  copy-command shortcut. Navigation and content remain usable without JavaScript.
- `og-trial.png`: current social card matching the seven-day trial offer.
  Generated with the built-in image-generation tool; see `ASSETS.md` for the prompt.
- `og-image.png`: historical social card, preserved but no longer referenced.

Preview: `python -m http.server 4173 --bind 127.0.0.1` from this directory.
Push `main` to publish. Keep pricing, thresholds, and scoring synchronized with
the bot repository. Historical examples must be labeled; never imply a live feed.

The bot lives in a separate private repository. Do not copy its `.env`, database,
member records, or credentials into this public site.
