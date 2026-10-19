# Product website design QA

Date: 2026-10-19

## Visual truth and evidence

- Reference: https://chatnotch.com/ (rendered desktop and mobile captures).
- Source captures: `build/website-qa/reference-desktop.png`, `reference-mobile.png`, `reference-showcase.png`.
- Rendered implementation: `build/website-qa/implementation-desktop.png`, `implementation-mobile.png`, `implementation-showcase.png`.
- Combined comparisons opened for review: `build/website-qa/compare-desktop.png`, `compare-mobile.png`, `compare-hero-copy.png`, `compare-showcase.png`.
- Final wallpaper and complete-window evidence: `build/website-qa/final-wallpaper-desktop.png`, `final-native-player-detail.png`.
- Native window visual truth: `docs/screenshots/windows/player-monet.png` and the other 24 complete window renders.
- Evidence files in `build/` are local QA artifacts and are intentionally excluded from Git.

Desktop viewport: 1920 × 929 CSS pixels. Desktop captures were normalized from 1920 × 1050 by removing 121 pixels of browser chrome; the browser-generated implementation capture is already 1920 × 929. The side-by-side full-view comparison uses identical 0.6 scaling for both captures. Focused hero-copy crops use identical pixel bounds.

Mobile viewport: 390 × 844 CSS pixels. Source and implementation viewport crops are both 390 × 844, cropped from the same desktop device-emulation frame at 100% zoom. No density mismatch remains in those comparisons.

Native screenshots: 1316 × 554 physical pixels for a 658 × 277 logical-pixel player surface; 1316 × 434 for other full windows. The website uses intrinsic aspect ratios, transparent shoulders and no additional image border radius.

State differences: product name, logo, feature text, extension inventory, player imagery and GitHub links intentionally represent SuperIsland. The reference showcase capture selects a system-status card, while SuperIsland selects a lyrics card. That comparison judges carousel composition and MacBook framing rather than identical application content. Desktop wallpaper replaces the source's plain blue screens under the user's explicit direction. The original green website is superseded.

## Findings and comparison history

1. [P1, fixed] The initial mint/green hero did not match the reference.
   Replaced with the captured dark warm-light composition, source scene geometry, purple character, matching typography, floating navigation and orange/pink CTA. Post-fix evidence: `compare-desktop.png`, `compare-mobile.png`, `compare-hero-copy.png`.
2. [P2, fixed] Adding GitHub caused the mobile navigation pill to contain less width than its links.
   Applied max-content width with a viewport limit. Post-fix mobile comparison shows GitHub and Download inside the pill; document width remains 390 pixels.
3. [P2, fixed] The original MacBook screen rectangle exposed blue strips outside the frame.
   Aligned the screen inset with the source frame's transparent opening. Post-fix evidence: `implementation-mobile-showcase.png` and final wallpaper capture.
4. [P1, fixed] Component-only player crops used a 720 × 240 display and omitted the native outer shoulder profile.
   Rendered the production `PillShape` and production SwiftUI views with offline notch geometry. All 25 images retain transparent side shoulders; player windows use 658 × 277 logical pixels. Browser measurements give aspect ratios 2.37556 on desktop and 2.37583 on mobile, consistent with 658/277 subject to subpixel rounding. Image border radius is 0px. Post-fix evidence: `final-native-player-detail.png` and `docs/screenshots/windows/`.
5. [P2, fixed] Switching styles replaced an image in place instead of moving the complete computer.
   Replaced it with a transform-driven track of complete MacBook scenes, including two clones at each boundary. Added queued navigation, cyclic boundaries, direct selection, keyboard navigation and pointer dragging. In-browser measurement at 150ms recorded equal movement of -678.797px for both the computer frame and its player image. Last-to-first wrap returned 原版; two rapid forward clicks settled on 心象. Desktop width stayed 1920 and mobile width stayed 390.
6. [User-directed change, accepted] Solid blue preview surfaces were replaced by the reference's desktop wallpaper in MacBook screens, component cards, workflow previews and the enlarged native-window view. CTA colors remain consistent with the reference.

## Required fidelity surfaces

- Fonts/typography: same SF Pro / system / PingFang family stack, desktop hero scale, weights, tracking, line height and CTA text treatment. The longer SuperIsland name uses a smaller mobile display size to fit naturally. Full-view and focused-copy comparisons were inspected together.
- Spacing/layout rhythm: preserved hero grid, lamp anchor, character scale, button spacing, section hierarchy, floating navigation and three-card carousel composition. Mobile headings balance lines; controls fit the viewport.
- Colors/tokens: dark warm-light hero with purple ambient light and orange/pink CTA matches the reference. Wallpaper surfaces follow the user's later override; player artwork colors remain real application content.
- Image quality: locally loaded source scene assets and frame, the project's own application logo and real SwiftUI screenshots. Source provenance is recorded in docs/ATTRIBUTION.md. No substitute illustration was drawn. Native window alpha, dimensions and WebP dimensions passed for all 25 windows.
- Copy/content: describes this fork's 15 styles, 10 component views, integrations, platform requirements and actual installation limitations. No competitor reviews, contact data or software downloads are used.

## Interaction and technical checks

- All 15 style controls and 10 component controls update the intended native preview.
- Previous/next buttons move complete scenes, queue rapid clicks and wrap correctly.
- Native-window enlargement opens with the selected style; Escape closes it. Overview dialog also opens and closes.
- Hero pointer sampling produced opposite lamp angles (14.345deg / -14.687deg including spring overshoot) and eye movement. Floating, blink and hover responses use the source motion treatment.
- Browser checks confirmed viewport/document widths 1920/1920 and 390/390.
- Final browser image decode check returned no failed images. A transient local-server socket failure on one image cleared on retry; it was not a script error.
- Download URLs resolve to this repository's published Release; GitHub asset SHA-256 equals the locally verified DMG.
- node --check, HTML anchor/local-asset checks, Python syntax checks and git diff --check passed. Existing lyrics JS regression suite: 5 passed. The release binary compiled successfully; version comparison checks: 5 passed.
- Reduced-motion CSS/JS paths were reviewed. Physical iOS/Android devices and assistive-technology sessions were not available for this pass; pointer/touch handlers are implemented but physical touch-device behavior remains a test gap.

## Implementation checklist

- [x] Match captured reference hero and navigation.
- [x] Replace content and links with this project's features and repository.
- [x] Preserve complete native window proportions and both shoulder corners.
- [x] Use desktop wallpaper and animate entire computers during style changes.
- [x] Verify primary interactions, responsive widths, assets and installer link.

No actionable P0/P1/P2 findings remain within the reviewed states.

final result: passed
