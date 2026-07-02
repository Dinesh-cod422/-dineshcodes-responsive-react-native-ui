# @dineshcodes/responsive-react-native-ui

A lightweight and powerful library for building fully responsive React Native
applications. It provides pre-configured design tokens, scaling utilities, and
screen-aware constants that automatically adjust to different device sizes (from
small phones to large tablets) **and stay correct at runtime** — on rotation,
split-screen, foldables, and resizable windows.

## Why v2

Every token is now **live and lazy**:

- Values are derived from the *current* window size, read on each access — not
  from a snapshot taken at import time.
- Numeric token maps (`FONTSIZE`, `HScale`, `VScale`, `BORDER_RADIUS`,
  `IconSize`, `Dvalues`) are computed on demand, so importing the library costs
  almost nothing regardless of how many tokens exist.
- `horizontalScale` / `verticalScale` / `moderateScale` now perform real linear
  scaling against a configurable guideline device (they were no-ops in v1).
- A `useResponsive()` hook re-renders components when dimensions change.

## Install

```sh
npm install @dineshcodes/responsive-react-native-ui
```

`react` and `react-native` are the only peer dependencies. **Zero native
modules** — nothing to link, no extra build steps, and the package behaves
identically on Android and iOS. Tablet detection is pure JavaScript (smallest
side ≥ 600dp, the same rule Android uses for `sw600dp` layouts).

## Usage

### Dynamic tokens with the hook (recommended)

Use `useResponsive()` so styles recompute and the component re-renders when the
device rotates or the window resizes:

```tsx
import { StyleSheet, Text, View } from 'react-native';
import { useResponsive } from '@dineshcodes/responsive-react-native-ui';

export function Card() {
  const { FONTSIZE, HScale, VScale, BORDER_RADIUS, width } = useResponsive();

  const styles = StyleSheet.create({
    card: {
      width: HScale.Width_320,
      padding: VScale.Height_16,
      borderRadius: BORDER_RADIUS.radius_12,
    },
    title: { fontSize: FONTSIZE.size_18 },
  });

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Screen width: {width}</Text>
    </View>
  );
}
```

### Module-level tokens (live, but no re-render)

The static exports are also live — each read reflects the current window size —
but they won't trigger a re-render on their own. Great for one-off measurements:

```ts
import { FONTSIZE, getScreenWidth, moderateScale } from '@dineshcodes/responsive-react-native-ui';

const base = FONTSIZE.size_16;          // computed from the current width
const padding = moderateScale(12);       // partial linear scale
const w = getScreenWidth();              // live window width
```

### Scaling helpers (orientation-aware)

```ts
import {
  horizontalScale, verticalScale, moderateScale,
  setGuidelineBaseDimensions, isLandscape,
} from '@dineshcodes/responsive-react-native-ui';

setGuidelineBaseDimensions(390, 844);   // optional: change the reference device

horizontalScale(20); // scaled by width, matched to the current orientation
verticalScale(20);   // scaled by height, matched to the current orientation
moderateScale(20, 0.5);
isLandscape();        // true when the window is wider than it is tall
```

The scale helpers compare the window's **short/long side** to the guideline's
short/long side, so rotating to landscape no longer inflates `horizontalScale`
or shrinks `verticalScale` — a value scales the same in both orientations.
Results are snapped to the nearest physical pixel (`PixelRatio`) so edges stay
crisp.

### Breakpoints

```tsx
import {
  useBreakpoint, getBreakpoint, selectByBreakpoint, setBreakpoints,
} from '@dineshcodes/responsive-react-native-ui';

setBreakpoints({ lg: 960 });            // optional: override thresholds (dp)

function Grid() {
  const bp = useBreakpoint();            // 'sm' | 'md' | 'lg' | 'xl', re-renders on resize
  const columns = selectByBreakpoint({ sm: 1, md: 2, lg: 4 }); // mobile-first cascade
  // ...
}

getBreakpoint();                         // one-off, based on current width
```

### Orientation-stable tokens, clamping & accessibility

```ts
import { setMaxReference, setRespectFontScale } from '@dineshcodes/responsive-react-native-ui';

// Token values (FONTSIZE/HScale/BORDER_RADIUS/…) derive from the short side and
// height tokens from the long side, so they don't jump on rotation.

setMaxReference(1024, 1366);  // cap the reference size so tokens stop growing on
                              // desktop/TV/foldables (default: no cap)
setRespectFontScale(true);    // multiply font tokens by the OS text-size setting
```

### Building tokens for explicit dimensions

```ts
import { createResponsive } from '@dineshcodes/responsive-react-native-ui';

const tablet = createResponsive({ width: 1024, height: 1366 });
tablet.FONTSIZE.size_16;
```

## API

| Export | Description |
| --- | --- |
| `useResponsive()` | Hook → full token surface (incl. `isLandscape`, `breakpoint`) bound to live dimensions; re-renders on change. |
| `useBreakpoint()` | Hook → active `Breakpoint`; re-renders when the width crosses a threshold. |
| `createResponsive(dims)` | Build the token surface for fixed dimensions. |
| `FONTSIZE`, `HScale`, `VScale`, `BORDER_RADIUS`, `IconSize`, `Dvalues` | Lazy, live, orientation-stable, pixel-snapped token maps. |
| `horizontalScale`, `verticalScale`, `moderateScale` | Orientation-aware linear scale helpers. |
| `calculateFont`, `calculateWidth`, `calculateHeight`, `calculateDvales` | Fraction-of-screen helpers. |
| `getScreenWidth`, `getScreenHeight`, `getScreenDimensions`, `getShortSide`, `getLongSide` | Live window size. |
| `isLandscape(w?, h?)`, `roundToPixel(v)`, `clamp(v, min, max)` | Orientation / pixel / range utilities. |
| `onDimensionsChange(cb)` | Subscribe to changes; returns an unsubscribe fn. |
| `getBreakpoint(dims?)`, `selectByBreakpoint(values, dims?)`, `setBreakpoints(overrides)`, `BREAKPOINTS` | Breakpoint API. |
| `setGuidelineBaseDimensions(w, h)` | Configure the linear-scale reference device. |
| `setMaxReference(short?, long?)` | Cap the reference size used by fraction tokens (default: uncapped). |
| `setRespectFontScale(on)` | Opt fonts into the OS text-size setting (accessibility). |
| `isTablet`, `getIsTablet()`, `isPad`, `forDevice(phone, tablet, pad?)` | Device-class helpers (`getIsTablet()` is live; `isTablet` is a snapshot). |
| `SCREEN_WIDTH`, `SCREEN_HEIGHT` | **Deprecated** import-time snapshots. Prefer the live getters. |

## Migrating from v1

- `SCREEN_WIDTH` / `SCREEN_HEIGHT` still exist but are deprecated snapshots.
  Replace with `getScreenWidth()` / `getScreenHeight()` or `useResponsive()`.
- `horizontalScale` / `verticalScale` / `moderateScale` now actually scale
  instead of returning the input unchanged. If you relied on the v1 no-op
  behaviour, remove those calls.
- All token maps and helpers keep the same names and keys — most apps upgrade
  with no code changes.
- Scale helpers and tokens are now **orientation-stable** and **pixel-snapped**.
  Exact numbers may differ slightly from v1 (rounding to device pixels) and no
  longer balloon in landscape. `horizontalScale`/`verticalScale` accept an
  optional trailing dimension argument for the opposite axis.
- The package now ships **dual CJS + ESM** builds under `dist/cjs` and
  `dist/esm` with an `exports` map; import paths are unchanged.
