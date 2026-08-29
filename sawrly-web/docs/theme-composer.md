# Theme Composer

Theme Composer is the customer-facing Easy Mode layer above the existing Enterprise Theme Engine. It stores the small, understandable input (`preset`, three colors, accent, mood, intensity and variation) and generates the existing Material 3/WCAG tokens through `generateVisualTheme`.

## Modes

- **Easy Mode** is the single customer workflow: visual mix → mood → effect strength → live preview → Auto WOW → one save action. The advanced column is hidden here so legacy controls cannot compete with the simple workflow.
- **Advanced Mode** keeps the existing 85-token, WCAG, effect and icon controls unchanged. The old Smart Palette, background mixer, legacy presets, effects and icon library are grouped here for designers and admins; they are not a second customer-facing composer.

The preview is shared by both modes. Easy Mode writes the same generated tokens as Advanced Mode, while the saved `themeComposer` input remains available for regeneration and auditing.

## Generation

`lib/theme_composer.ts` is the single generator. It uses `buildEnterpriseFromSeed` as the source of truth, then adds safe visual metadata for mesh points, ambient glows, surface tint, header style, CTA, noise and vignette. The same input and variation always produce the same output.

The generated colors are written through the existing theme-settings API, so old clients continue to consume the legacy/M3 fields. The Easy Mode input is stored separately in `app_settings.theme_composer`, allowing a customer theme to be edited and regenerated later.

Flutter consumes the generated visual metadata for background mesh points, ambient glows, vignette/noise, header style and navigation tint. Existing glass/effect token values remain the source of truth for blur, opacity, borders and shadows.

## Backward compatibility

Themes without `theme_composer` return `null` and continue using the existing Enterprise fallback. New visual metadata is optional and defaults to disabled/subtle values.

## Adding a preset

Add a deterministic entry to `THEME_COMPOSER_PRESETS` with three base colors, an accent and mood. Do not add a second token-generation algorithm; call `generateVisualTheme`.
