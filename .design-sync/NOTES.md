# design-sync notes — うちの区ちゃん

## Repo shape
- This is a Next.js **app**, not a packaged design system: no dist/, no Storybook. Sync runs in package shape with a hand-written entry `.design-sync/ds-entry.ts` (re-exports the 6 UI components from `src/ui/` plus `wardTheme`/`ssrImage`/`loadWards`/`DATA_SOURCES`). `cfg.entry` points at it; the converter bundles it directly.
- `cfg.buildCmd` regenerates `.design-sync/styles-entry.css` by concatenating `app/globals.css` + `app/zukan.css` (the two stylesheets `app/layout.tsx` imports). Run it before the converter whenever app CSS changed.
- `ResultPage`/`WardPage` are deliberately excluded (`componentSrcMap: null`) — they're routes depending on `next/link` and sessionStorage, not reusable parts.

## Character portraits (known limitation)
- `Zukan`/`WardDetail`/`ShareCard` render `<img src="/characters/ssr/<slug>-w{512,896}.webp">` (absolute paths into the app's `public/`). Those assets are NOT uploaded to the design project, so in claude.ai/design the portraits show as broken/placeholder. Everything else (parchment cards, radar, tables) renders correctly.
- For local capture/validate, copy them into the bundle after every build: `cp -r public/characters ds-bundle/characters` (the build wipes ds-bundle; `characters/` is outside the upload plan so it never uploads).
- Possible future app-side fix: onError fallback to `.zukan-card-placeholder` so broken portraits degrade gracefully.

## Fonts
- The app's stack is OS system fonts (`Hiragino Mincho ProN`, `Yu Mincho`, `Noto Serif JP`, serif) — nothing to ship, so validate prints `[FONT_MISSING]` (known warn, accepted). A Google-Fonts remote `@import` for Noto Serif JP was tried and reverted: headless-chromium font requests stall in this sandbox and it made captures unreliable. macOS/iOS viewers get Hiragino natively; others fall back to their serif.

## Capture harness quirk (re-apply after re-staging .ds-sync/)
- Chromium's `img.decode()` never settles on pages with many images (Zukan = 23 webp) — both headless-shell and full chromium. The staged `.ds-sync/package-capture.mjs` `settle()` was patched to race a 10s timeout. `.ds-sync/` is re-copied from the skill on every re-sync, so if a capture hangs forever on Zukan, re-apply that patch (wrap the settle `page.evaluate` in `Promise.race` with a 10s timer). `package-validate.mjs` has a similar decode await in its contact-sheet tiler (~line 762) — it hasn't hung so far, but it's the same pattern.

## Playwright
- Use playwright@1.58.0 — its chromium build (1208) matches the user's ms-playwright cache. Installed in `.ds-sync/`, not the repo.
- Repo npm config uses allow-scripts; esbuild/playwright postinstall warnings are harmless (binaries resolve fine).

## Known render warns
- `[FONT_MISSING] "Hiragino Mincho ProN", "Yu Mincho"` — accepted (system-font stack by design, see Fonts above).
- WardDetail/ShareCard/Zukan `variants render identically` has never fired; if a `[RENDER_THIN]`-class warn appears for Diagnosis (dark card, mostly empty), it renders correctly — check the sheet before chasing.

## Previews
- `Diagnosis` can only show question 1 statically (answering requires clicks) — recorded as the FirstQuestion cell.
- StatBar cells wrap themselves in an inline parchment container (the component is designed to sit on `.ward-detail` parchment; on the page's dark leather background it would be illegible).

## Re-sync risks
- `.design-sync/styles-entry.css` is generated from app CSS by buildCmd — if someone adds a third global stylesheet to `app/layout.tsx`, update buildCmd or the design project silently misses it.
- `ds-entry.ts` is a hand-maintained export list — new components in `src/ui/` must be added there AND to `componentSrcMap`.
- The `.ds-sync/package-capture.mjs` settle patch is transient (see Capture harness quirk).
- Character-image copy into ds-bundle is manual per build; forgetting it makes Zukan capture hang (10s-per-page slowdown after the patch) and portraits render broken locally.
