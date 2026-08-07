import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:phosphoricons_flutter/phosphoricons_flutter.dart';

/* ------------------------------------------------------------------ */
/* 1. TONAL PALETTE  (24 tone-steg per färgfamilj, per Material 3)    */
/* ------------------------------------------------------------------ */
const List<int> kToneSteps = [0,4,6,10,12,17,20,22,24,30,40,50,60,70,80,87,90,92,94,95,96,98,99,100];

class TonalPalette {
  final Map<int, Color> _tones;
  const TonalPalette(this._tones);

  Color call(int tone) => toneOf(tone);
  Color toneOf(int tone) {
    if (_tones.containsKey(tone)) return _tones[tone]!;
    int best = kToneSteps.first;
    int bestD = 1000000;
    for (final t in kToneSteps) {
      final d = (t - tone).abs();
      if (d < bestD) { bestD = d; best = t; }
    }
    return _tones[best] ?? const Color(0xFF000000);
  }

  static TonalPalette parse(dynamic raw) {
    final Map<int, Color> out = {};
    if (raw is Map) {
      for (final entry in raw.entries) {
        final k = int.tryParse(entry.key.toString());
        final v = _parseHexColor(entry.value);
        if (k != null && v != null) out[k] = v;
      }
    }
    for (final t in kToneSteps) {
      out.putIfAbsent(t, () => const Color(0xFF000000));
    }
    return TonalPalette(out);
  }
}

/* ------------------------------------------------------------------ */
/* 2. STATE LAYERS + SHADOWS + EFFECTS                                */
/* ------------------------------------------------------------------ */
class EnterpriseThemeStateLayers {
  final double hover;
  final double focus;
  final double pressed;
  final double dragged;
  const EnterpriseThemeStateLayers({
    required this.hover, required this.focus, required this.pressed, required this.dragged,
  });
  static const EnterpriseThemeStateLayers defaults = EnterpriseThemeStateLayers(
    hover: 0.08, focus: 0.12, pressed: 0.1, dragged: 0.16,
  );
  static EnterpriseThemeStateLayers parse(dynamic raw) {
    if (raw is! Map) return defaults;
    double pick(String k, double fb) => _parseDouble(raw[k], fb, min: 0, max: 1);
    return EnterpriseThemeStateLayers(
      hover: pick('hover', defaults.hover),
      focus: pick('focus', defaults.focus),
      pressed: pick('pressed', defaults.pressed),
      dragged: pick('dragged', defaults.dragged),
    );
  }
}

class EnterpriseThemeShadows {
  final Color level1;
  final Color level2;
  final Color level3;
  const EnterpriseThemeShadows({required this.level1, required this.level2, required this.level3});
  static const EnterpriseThemeShadows defaults = EnterpriseThemeShadows(
    level1: Color(0x24000000),
    level2: Color(0x2E000000),
    level3: Color(0x3D000000),
  );
  static Color _parseRgba(dynamic raw, Color fb) {
    if (raw is String) {
      final s = raw.trim();
      if (s.startsWith('rgba(') && s.endsWith(')')) {
        final inner = s.substring(5, s.length - 1);
        final parts = inner.split(',').map((e) => e.trim()).toList();
        if (parts.length == 4) {
          final r = int.tryParse(parts[0]) ?? 0;
          final g = int.tryParse(parts[1]) ?? 0;
          final b = int.tryParse(parts[2]) ?? 0;
          final a = double.tryParse(parts[3]) ?? 1.0;
          return Color.fromRGBO(r.clamp(0, 255), g.clamp(0, 255), b.clamp(0, 255), a.clamp(0.0, 1.0));
        }
      }
      final h = _parseHexColor(s);
      if (h != null) return h;
    }
    return fb;
  }
  static EnterpriseThemeShadows parse(dynamic raw) {
    if (raw is! Map) return defaults;
    return EnterpriseThemeShadows(
      level1: _parseRgba(raw['level1'], defaults.level1),
      level2: _parseRgba(raw['level2'], defaults.level2),
      level3: _parseRgba(raw['level3'], defaults.level3),
    );
  }
}

/* ------------------------------------------------------------------ */
/* 3. ENTERPRISE THEME — alla 85 M3 + semantiska tokens              */
/* ------------------------------------------------------------------ */
class EnterpriseThemeColors {
  final Color primary;
  final Color onPrimary;
  final Color primaryContainer;
  final Color onPrimaryContainer;
  final Color primaryFixed;
  final Color primaryFixedDim;
  final Color onPrimaryFixed;
  final Color onPrimaryFixedVariant;

  final Color secondary;
  final Color onSecondary;
  final Color secondaryContainer;
  final Color onSecondaryContainer;
  final Color secondaryFixed;
  final Color secondaryFixedDim;
  final Color onSecondaryFixed;
  final Color onSecondaryFixedVariant;

  final Color tertiary;
  final Color onTertiary;
  final Color tertiaryContainer;
  final Color onTertiaryContainer;
  final Color tertiaryFixed;
  final Color tertiaryFixedDim;
  final Color onTertiaryFixed;
  final Color onTertiaryFixedVariant;

  final Color error;
  final Color onError;
  final Color errorContainer;
  final Color onErrorContainer;

  final Color surface;
  final Color onSurface;
  final Color surfaceDim;
  final Color surfaceBright;
  final Color surfaceContainerLowest;
  final Color surfaceContainerLow;
  final Color surfaceContainer;
  final Color surfaceContainerHigh;
  final Color surfaceContainerHighest;
  final Color onSurfaceVariant;

  final Color outline;
  final Color outlineVariant;
  final Color background;
  final Color onBackground;

  final Color inverseSurface;
  final Color inverseOnSurface;
  final Color inversePrimary;
  final Color shadow;
  final Color scrim;

  final Color success;
  final Color onSuccess;
  final Color successContainer;
  final Color onSuccessContainer;
  final Color warning;
  final Color onWarning;
  final Color warningContainer;
  final Color onWarningContainer;
  final Color info;
  final Color onInfo;
  final Color infoContainer;
  final Color onInfoContainer;

  final Color divider;
  final Color splash;
  final Color disabled;
  final Color onDisabled;
  final Color disabledContainer;

  final Color heroStart;
  final Color heroMid;
  final Color heroEnd;
  final Color cardBackground;
  final Color cardBorder;
  final Color badge;
  final Color onBadge;
  final Color snackbarBackground;
  final Color snackbarText;
  final Color shimmerBase;
  final Color shimmerHighlight;
  final Color accentPink;
  final Color onAccentPink;
  final Color menuBackground;
  final Color textPrimary;
  final Color textSecondary;
  final Color textTertiary;
  final Color border;
  final Color borderLight;
  final Color surfaceLight;

  const EnterpriseThemeColors({
    required this.primary, required this.onPrimary, required this.primaryContainer, required this.onPrimaryContainer,
    required this.primaryFixed, required this.primaryFixedDim, required this.onPrimaryFixed, required this.onPrimaryFixedVariant,
    required this.secondary, required this.onSecondary, required this.secondaryContainer, required this.onSecondaryContainer,
    required this.secondaryFixed, required this.secondaryFixedDim, required this.onSecondaryFixed, required this.onSecondaryFixedVariant,
    required this.tertiary, required this.onTertiary, required this.tertiaryContainer, required this.onTertiaryContainer,
    required this.tertiaryFixed, required this.tertiaryFixedDim, required this.onTertiaryFixed, required this.onTertiaryFixedVariant,
    required this.error, required this.onError, required this.errorContainer, required this.onErrorContainer,
    required this.surface, required this.onSurface, required this.surfaceDim, required this.surfaceBright,
    required this.surfaceContainerLowest, required this.surfaceContainerLow, required this.surfaceContainer,
    required this.surfaceContainerHigh, required this.surfaceContainerHighest, required this.onSurfaceVariant,
    required this.outline, required this.outlineVariant, required this.background, required this.onBackground,
    required this.inverseSurface, required this.inverseOnSurface, required this.inversePrimary, required this.shadow, required this.scrim,
    required this.success, required this.onSuccess, required this.successContainer, required this.onSuccessContainer,
    required this.warning, required this.onWarning, required this.warningContainer, required this.onWarningContainer,
    required this.info, required this.onInfo, required this.infoContainer, required this.onInfoContainer,
    required this.divider, required this.splash, required this.disabled, required this.onDisabled, required this.disabledContainer,
    required this.heroStart, required this.heroMid, required this.heroEnd,
    required this.cardBackground, required this.cardBorder,
    required this.badge, required this.onBadge,
    required this.snackbarBackground, required this.snackbarText,
    required this.shimmerBase, required this.shimmerHighlight,
    required this.accentPink, required this.onAccentPink,
    required this.menuBackground,
    required this.textPrimary, required this.textSecondary, required this.textTertiary,
    required this.border, required this.borderLight, required this.surfaceLight,
  });

  static EnterpriseThemeColors parse(dynamic raw, { EnterpriseThemeColors? fallback }) {
    fallback ??= _DefaultEnterpriseTheme.colors;
    if (raw is! Map) return fallback;
    Color? pick(String k) => _parseHexColor(raw[k]);
    return EnterpriseThemeColors(
      primary: pick('primary') ?? fallback.primary,
      onPrimary: pick('onPrimary') ?? fallback.onPrimary,
      primaryContainer: pick('primaryContainer') ?? fallback.primaryContainer,
      onPrimaryContainer: pick('onPrimaryContainer') ?? fallback.onPrimaryContainer,
      primaryFixed: pick('primaryFixed') ?? fallback.primaryFixed,
      primaryFixedDim: pick('primaryFixedDim') ?? fallback.primaryFixedDim,
      onPrimaryFixed: pick('onPrimaryFixed') ?? fallback.onPrimaryFixed,
      onPrimaryFixedVariant: pick('onPrimaryFixedVariant') ?? fallback.onPrimaryFixedVariant,

      secondary: pick('secondary') ?? fallback.secondary,
      onSecondary: pick('onSecondary') ?? fallback.onSecondary,
      secondaryContainer: pick('secondaryContainer') ?? fallback.secondaryContainer,
      onSecondaryContainer: pick('onSecondaryContainer') ?? fallback.onSecondaryContainer,
      secondaryFixed: pick('secondaryFixed') ?? fallback.secondaryFixed,
      secondaryFixedDim: pick('secondaryFixedDim') ?? fallback.secondaryFixedDim,
      onSecondaryFixed: pick('onSecondaryFixed') ?? fallback.onSecondaryFixed,
      onSecondaryFixedVariant: pick('onSecondaryFixedVariant') ?? fallback.onSecondaryFixedVariant,

      tertiary: pick('tertiary') ?? fallback.tertiary,
      onTertiary: pick('onTertiary') ?? fallback.onTertiary,
      tertiaryContainer: pick('tertiaryContainer') ?? fallback.tertiaryContainer,
      onTertiaryContainer: pick('onTertiaryContainer') ?? fallback.onTertiaryContainer,
      tertiaryFixed: pick('tertiaryFixed') ?? fallback.tertiaryFixed,
      tertiaryFixedDim: pick('tertiaryFixedDim') ?? fallback.tertiaryFixedDim,
      onTertiaryFixed: pick('onTertiaryFixed') ?? fallback.onTertiaryFixed,
      onTertiaryFixedVariant: pick('onTertiaryFixedVariant') ?? fallback.onTertiaryFixedVariant,

      error: pick('error') ?? fallback.error,
      onError: pick('onError') ?? fallback.onError,
      errorContainer: pick('errorContainer') ?? fallback.errorContainer,
      onErrorContainer: pick('onErrorContainer') ?? fallback.onErrorContainer,

      surface: pick('surface') ?? fallback.surface,
      onSurface: pick('onSurface') ?? fallback.onSurface,
      surfaceDim: pick('surfaceDim') ?? fallback.surfaceDim,
      surfaceBright: pick('surfaceBright') ?? fallback.surfaceBright,
      surfaceContainerLowest: pick('surfaceContainerLowest') ?? fallback.surfaceContainerLowest,
      surfaceContainerLow: pick('surfaceContainerLow') ?? fallback.surfaceContainerLow,
      surfaceContainer: pick('surfaceContainer') ?? fallback.surfaceContainer,
      surfaceContainerHigh: pick('surfaceContainerHigh') ?? fallback.surfaceContainerHigh,
      surfaceContainerHighest: pick('surfaceContainerHighest') ?? fallback.surfaceContainerHighest,
      onSurfaceVariant: pick('onSurfaceVariant') ?? fallback.onSurfaceVariant,

      outline: pick('outline') ?? fallback.outline,
      outlineVariant: pick('outlineVariant') ?? fallback.outlineVariant,
      background: pick('background') ?? fallback.background,
      onBackground: pick('onBackground') ?? fallback.onBackground,

      inverseSurface: pick('inverseSurface') ?? fallback.inverseSurface,
      inverseOnSurface: pick('inverseOnSurface') ?? fallback.inverseOnSurface,
      inversePrimary: pick('inversePrimary') ?? fallback.inversePrimary,
      shadow: pick('shadow') ?? fallback.shadow,
      scrim: pick('scrim') ?? fallback.scrim,

      success: pick('success') ?? fallback.success,
      onSuccess: pick('onSuccess') ?? fallback.onSuccess,
      successContainer: pick('successContainer') ?? fallback.successContainer,
      onSuccessContainer: pick('onSuccessContainer') ?? fallback.onSuccessContainer,
      warning: pick('warning') ?? fallback.warning,
      onWarning: pick('onWarning') ?? fallback.onWarning,
      warningContainer: pick('warningContainer') ?? fallback.warningContainer,
      onWarningContainer: pick('onWarningContainer') ?? fallback.onWarningContainer,
      info: pick('info') ?? fallback.info,
      onInfo: pick('onInfo') ?? fallback.onInfo,
      infoContainer: pick('infoContainer') ?? fallback.infoContainer,
      onInfoContainer: pick('onInfoContainer') ?? fallback.onInfoContainer,

      divider: pick('divider') ?? fallback.divider,
      splash: pick('splash') ?? fallback.splash,
      disabled: pick('disabled') ?? fallback.disabled,
      onDisabled: pick('onDisabled') ?? fallback.onDisabled,
      disabledContainer: pick('disabledContainer') ?? fallback.disabledContainer,

      heroStart: pick('heroStart') ?? fallback.heroStart,
      heroMid: pick('heroMid') ?? fallback.heroMid,
      heroEnd: pick('heroEnd') ?? fallback.heroEnd,
      cardBackground: pick('cardBackground') ?? fallback.cardBackground,
      cardBorder: pick('cardBorder') ?? fallback.cardBorder,
      badge: pick('badge') ?? fallback.badge,
      onBadge: pick('onBadge') ?? fallback.onBadge,
      snackbarBackground: pick('snackbarBackground') ?? fallback.snackbarBackground,
      snackbarText: pick('snackbarText') ?? fallback.snackbarText,
      shimmerBase: pick('shimmerBase') ?? fallback.shimmerBase,
      shimmerHighlight: pick('shimmerHighlight') ?? fallback.shimmerHighlight,
      accentPink: pick('accentPink') ?? fallback.accentPink,
      onAccentPink: pick('onAccentPink') ?? fallback.onAccentPink,
      menuBackground: pick('menuBackground') ?? fallback.menuBackground,
      textPrimary: pick('textPrimary') ?? fallback.textPrimary,
      textSecondary: pick('textSecondary') ?? fallback.textSecondary,
      textTertiary: pick('textTertiary') ?? fallback.textTertiary,
      border: pick('border') ?? fallback.border,
      borderLight: pick('borderLight') ?? fallback.borderLight,
      surfaceLight: pick('surfaceLight') ?? fallback.surfaceLight,
    );
  }
}

class EnterpriseTheme {
  final String version;
  final bool isDark;
  final String mode;
  final EnterpriseThemeColors colors;
  final EnterpriseThemeStateLayers stateLayers;
  final EnterpriseThemeShadows shadows;
  final RemoteThemeEffects effects;
  final ({ TonalPalette primary, TonalPalette secondary, TonalPalette tertiary, TonalPalette neutral, TonalPalette neutralVariant }) palettes;

  const EnterpriseTheme({
    required this.version,
    required this.isDark,
    required this.mode,
    required this.colors,
    required this.stateLayers,
    required this.shadows,
    required this.effects,
    required this.palettes,
  });

  List<Color> get heroGradient => [colors.heroStart, colors.heroMid, colors.heroEnd];
  List<Color> get primaryGradient => [colors.primary, colors.primaryContainer];

  static EnterpriseTheme parse(dynamic raw) {
    if (raw is! Map) return _DefaultEnterpriseTheme.theme;
    final colors = EnterpriseThemeColors.parse(raw);
    final effects = parseRemoteEffects(raw['effects']);
    final stateLayers = EnterpriseThemeStateLayers.parse(raw['stateLayers']);
    final shadows = EnterpriseThemeShadows.parse(raw['shadows']);
    final palettesRaw = raw['palettes'];
    final palettes = (
      primary: TonalPalette.parse(palettesRaw is Map ? palettesRaw['primary'] : null),
      secondary: TonalPalette.parse(palettesRaw is Map ? palettesRaw['secondary'] : null),
      tertiary: TonalPalette.parse(palettesRaw is Map ? palettesRaw['tertiary'] : null),
      neutral: TonalPalette.parse(palettesRaw is Map ? palettesRaw['neutral'] : null),
      neutralVariant: TonalPalette.parse(palettesRaw is Map ? palettesRaw['neutralVariant'] : null),
    );
    final version = raw['version'] is String ? raw['version'] as String : _DefaultEnterpriseTheme.theme.version;
    final mode = raw['mode'] is String ? (raw['mode'] as String) : 'dark';
    final isDark = raw['isDark'] is bool ? (raw['isDark'] as bool) : mode == 'dark';
    return EnterpriseTheme(
      version: version,
      isDark: isDark,
      mode: mode,
      colors: colors,
      stateLayers: stateLayers,
      shadows: shadows,
      effects: effects,
      palettes: palettes,
    );
  }
}

/* ------------------------------------------------------------------ */
/* 4. LEGACY klasser (bakåtkompatibilitet — gamla widgets)           */
/* ------------------------------------------------------------------ */
class RemoteThemeColors {
  final Color primary;
  final Color primaryLight;
  final Color primaryDark;
  final Color accentPink;
  final Color background;
  final Color surface;
  final Color surfaceLight;
  final Color menuBackground;
  final Color textPrimary;
  final Color textSecondary;
  final Color textTertiary;
  final Color success;
  final Color warning;
  final Color error;
  final Color info;
  final Color border;
  final Color borderLight;

  const RemoteThemeColors({
    required this.primary,
    required this.primaryLight,
    required this.primaryDark,
    required this.accentPink,
    required this.background,
    required this.surface,
    required this.surfaceLight,
    required this.menuBackground,
    required this.textPrimary,
    required this.textSecondary,
    required this.textTertiary,
    required this.success,
    required this.warning,
    required this.error,
    required this.info,
    required this.border,
    required this.borderLight,
  });

  factory RemoteThemeColors.fromEnterprise(EnterpriseThemeColors e) {
    return RemoteThemeColors(
      primary: e.primary,
      primaryLight: e.primaryFixed,
      primaryDark: e.primaryContainer,
      accentPink: e.accentPink,
      background: e.background,
      surface: e.surface,
      surfaceLight: e.surfaceLight,
      menuBackground: e.menuBackground,
      textPrimary: e.textPrimary,
      textSecondary: e.textSecondary,
      textTertiary: e.textTertiary,
      success: e.success,
      warning: e.warning,
      error: e.error,
      info: e.info,
      border: e.border,
      borderLight: e.borderLight,
    );
  }

  List<Color> get primaryGradient => [primary, primaryDark];
  List<Color> get accentGradient => [accentPink, primaryDark];
  List<Color> get darkGradient => [background, primaryDark];

  Color get successBg => Color.lerp(background, success, 0.12) ?? background;
  Color get warningBg => Color.lerp(background, warning, 0.12) ?? background;
  Color get errorBg => Color.lerp(background, error, 0.12) ?? background;
  Color get infoBg => Color.lerp(background, info, 0.12) ?? background;
}

class RemoteNavIcons {
  final String? home;
  final String? search;
  final String? categories;
  final String? orders;
  final String? profile;
  final String? homeActive;
  final String? searchActive;
  final String? categoriesActive;
  final String? ordersActive;
  final String? profileActive;
  final String? homeId;
  final String? searchId;
  final String? categoriesId;
  final String? ordersId;
  final String? profileId;
  final String? homeActiveId;
  final String? searchActiveId;
  final String? categoriesActiveId;
  final String? ordersActiveId;
  final String? profileActiveId;

  const RemoteNavIcons({
    this.home, this.search, this.categories, this.orders, this.profile,
    this.homeActive, this.searchActive, this.categoriesActive, this.ordersActive, this.profileActive,
    this.homeId, this.searchId, this.categoriesId, this.ordersId, this.profileId,
    this.homeActiveId, this.searchActiveId, this.categoriesActiveId, this.ordersActiveId, this.profileActiveId,
  });
}

class RemoteThemeEffects {
  final double primaryGradientAngle;
  final double cardRadius;
  final double chipRadius;
  final double buttonRadius;
  final double navShadowOpacity;
  final double cardShadowOpacity;
  final double activeGlowOpacity;
  final double glassBlur;
  final double surfaceOpacity;
  final double borderOpacity;

  const RemoteThemeEffects({
    required this.primaryGradientAngle,
    required this.cardRadius,
    required this.chipRadius,
    required this.buttonRadius,
    required this.navShadowOpacity,
    required this.cardShadowOpacity,
    required this.activeGlowOpacity,
    required this.glassBlur,
    required this.surfaceOpacity,
    required this.borderOpacity,
  });

  AlignmentGeometry get gradientBegin => _angleToAlignment(primaryGradientAngle).$1;
  AlignmentGeometry get gradientEnd => _angleToAlignment(primaryGradientAngle).$2;

  static (AlignmentGeometry, AlignmentGeometry) _angleToAlignment(double degrees) {
    final rad = degrees * math.pi / 180;
    final dx = math.sin(rad);
    final dy = -math.cos(rad);
    return (
      Alignment(-dx.clamp(-1.0, 1.0), -dy.clamp(-1.0, 1.0)),
      Alignment(dx.clamp(-1.0, 1.0), dy.clamp(-1.0, 1.0)),
    );
  }

  LinearGradient primaryGradient(Color primary, Color primaryDark) {
    return LinearGradient(begin: gradientBegin, end: gradientEnd, colors: [primary, primaryDark]);
  }
}

class AppThemeConfig {
  final RemoteThemeColors colors;
  final RemoteNavIcons navIcons;
  final RemoteThemeEffects effects;
  final EnterpriseTheme? enterprise;

  const AppThemeConfig({
    required this.colors,
    required this.navIcons,
    required this.effects,
    this.enterprise,
  });
}

/* ------------------------------------------------------------------ */
/* 5. HJÄLPAR: parse hex, double                                     */
/* ------------------------------------------------------------------ */
Color? _parseHexColor(dynamic raw) {
  if (raw is! String) return null;
  String v = raw.trim();
  if (v.isEmpty) return null;
  if (!v.startsWith('#')) return null;
  final String body = v.substring(1);
  final int? value = int.tryParse(
    body.length == 3
        ? body.split('').map((c) => '$c$c').join()
        : body.length == 6
            ? 'FF$body'
            : body.length == 8
                ? body
                : '',
    radix: 16,
  );
  if (value == null) return null;
  return Color(value);
}

double _parseDouble(dynamic raw, double fallback, {double? min, double? max}) {
  double? parsed;
  if (raw is num) parsed = raw.toDouble();
  else if (raw is String) parsed = double.tryParse(raw.trim());
  if (parsed == null || !parsed.isFinite) return fallback;
  if (min != null && parsed < min) return fallback;
  if (max != null && parsed > max) return fallback;
  return parsed;
}

/* ------------------------------------------------------------------ */
/* 6. PARSA: remote colors / nav / effects + enterprise              */
/* ------------------------------------------------------------------ */
RemoteThemeColors parseRemoteColors(dynamic raw, { EnterpriseThemeColors? enterpriseColors }) {
  const defaults = _DefaultAppTheme.colors;
  Map<String, dynamic>? map;
  if (raw is Map<String, dynamic>) map = raw;
  else if (raw is Map) map = Map<String, dynamic>.from(raw);

  if (enterpriseColors != null) {
    final fromEnt = RemoteThemeColors.fromEnterprise(enterpriseColors);
    if (map == null) return fromEnt;
    Color? maybe(String key) => _parseHexColor(map[key]);
    return RemoteThemeColors(
      primary: maybe('primary') ?? fromEnt.primary,
      primaryLight: maybe('primaryLight') ?? fromEnt.primaryLight,
      primaryDark: maybe('primaryDark') ?? fromEnt.primaryDark,
      accentPink: maybe('accentPink') ?? fromEnt.accentPink,
      background: maybe('background') ?? fromEnt.background,
      surface: maybe('surface') ?? fromEnt.surface,
      surfaceLight: maybe('surfaceLight') ?? fromEnt.surfaceLight,
      menuBackground: maybe('menuBackground') ?? fromEnt.menuBackground,
      textPrimary: maybe('textPrimary') ?? fromEnt.textPrimary,
      textSecondary: maybe('textSecondary') ?? fromEnt.textSecondary,
      textTertiary: maybe('textTertiary') ?? fromEnt.textTertiary,
      success: maybe('success') ?? fromEnt.success,
      warning: maybe('warning') ?? fromEnt.warning,
      error: maybe('error') ?? fromEnt.error,
      info: maybe('info') ?? fromEnt.info,
      border: maybe('border') ?? fromEnt.border,
      borderLight: maybe('borderLight') ?? fromEnt.borderLight,
    );
  }

  if (map == null) return defaults;
  Color? maybe(String key) => _parseHexColor(map[key]);

  final primary = maybe('primary');
  final primaryLight = maybe('primaryLight');
  final primaryDark = maybe('primaryDark');
  final hasCustomPrimary = primary != null || primaryLight != null || primaryDark != null;
  final effectivePrimary = primary ?? defaults.primary;
  final effectivePrimaryLight = primaryLight ?? _lighten(effectivePrimary, 0.18);
  final effectivePrimaryDark = primaryDark ?? _darken(effectivePrimary, 0.18);
  final effectiveAccentPink = maybe('accentPink') ?? Color.lerp(effectivePrimary, const Color(0xFFFF4DA6), 0.5) ?? const Color(0xFFFF4DA6);

  final Color effectiveBackground;
  if (maybe('background') case final bg?) effectiveBackground = bg;
  else if (hasCustomPrimary) effectiveBackground = _darken(_desaturate(effectivePrimary, 0.35), 0.45);
  else effectiveBackground = defaults.background;

  final Color effectiveSurface;
  if (maybe('surface') case final s?) effectiveSurface = s;
  else if (hasCustomPrimary) effectiveSurface = _lighten(effectiveBackground, 0.12);
  else effectiveSurface = defaults.surface;

  final Color effectiveSurfaceLight;
  if (maybe('surfaceLight') case final sl?) effectiveSurfaceLight = sl;
  else if (hasCustomPrimary) effectiveSurfaceLight = _lighten(effectiveSurface, 0.12);
  else effectiveSurfaceLight = defaults.surfaceLight;

  final Color effectiveMenuBackground;
  if (maybe('menuBackground') case final mb?) effectiveMenuBackground = mb;
  else if (hasCustomPrimary) effectiveMenuBackground = _darken(effectiveBackground, 0.06);
  else effectiveMenuBackground = defaults.menuBackground;

  final effectiveTextPrimary = maybe('textPrimary') ?? defaults.textPrimary;
  final effectiveTextSecondary = maybe('textSecondary') ?? (hasCustomPrimary ? effectiveTextPrimary.withValues(alpha: 0.72) : defaults.textSecondary);
  final effectiveTextTertiary = maybe('textTertiary') ?? (hasCustomPrimary ? effectiveTextPrimary.withValues(alpha: 0.48) : defaults.textTertiary);
  final effectiveSuccess = maybe('success') ?? defaults.success;
  final effectiveWarning = maybe('warning') ?? defaults.warning;
  final effectiveError = maybe('error') ?? defaults.error;
  final effectiveInfo = maybe('info') ?? defaults.info;

  final Color effectiveBorder;
  if (maybe('border') case final b?) effectiveBorder = b;
  else if (hasCustomPrimary) effectiveBorder = _lighten(_desaturate(effectivePrimaryDark, 0.2), 0.08);
  else effectiveBorder = defaults.border;

  final Color effectiveBorderLight;
  if (maybe('borderLight') case final bl?) effectiveBorderLight = bl;
  else if (hasCustomPrimary) effectiveBorderLight = _lighten(effectiveBorder, 0.18);
  else effectiveBorderLight = defaults.borderLight;

  return RemoteThemeColors(
    primary: effectivePrimary, primaryLight: effectivePrimaryLight, primaryDark: effectivePrimaryDark,
    accentPink: effectiveAccentPink, background: effectiveBackground, surface: effectiveSurface,
    surfaceLight: effectiveSurfaceLight, menuBackground: effectiveMenuBackground,
    textPrimary: effectiveTextPrimary, textSecondary: effectiveTextSecondary, textTertiary: effectiveTextTertiary,
    success: effectiveSuccess, warning: effectiveWarning, error: effectiveError, info: effectiveInfo,
    border: effectiveBorder, borderLight: effectiveBorderLight,
  );
}

Color _darken(Color c, double amount) {
  final hsl = HSLColor.fromColor(c);
  final l = (hsl.lightness - amount).clamp(0.0, 1.0);
  return hsl.withLightness(l).toColor();
}
Color _lighten(Color c, double amount) {
  final hsl = HSLColor.fromColor(c);
  final l = (hsl.lightness + amount).clamp(0.0, 1.0);
  return hsl.withLightness(l).toColor();
}
Color _desaturate(Color c, double amount) {
  final hsl = HSLColor.fromColor(c);
  final s = (hsl.saturation - amount).clamp(0.0, 1.0);
  return hsl.withSaturation(s).toColor();
}

RemoteNavIcons parseRemoteNavIcons(dynamic raw) {
  Map<Object?, Object?>? map;
  if (raw is Map) map = raw as Map<Object?, Object?>;
  if (raw is Map<String, dynamic>) map = raw;
  String? s(Object? v) => v is String && v.trim().isNotEmpty ? v.trim() : null;
  String? id(Object? v) {
    final sv = s(v);
    if (sv == null) return null;
    final lower = sv.toLowerCase();
    final valid = RegExp(r'^[a-z0-9_.-]{1,80}$').hasMatch(lower);
    return valid ? lower : null;
  }
  if (map == null) return const RemoteNavIcons();
  return RemoteNavIcons(
    home: s(map['home']), search: s(map['search']), categories: s(map['categories']),
    orders: s(map['orders']), profile: s(map['profile']),
    homeActive: s(map['homeActive']), searchActive: s(map['searchActive']), categoriesActive: s(map['categoriesActive']),
    ordersActive: s(map['ordersActive']), profileActive: s(map['profileActive']),
    homeId: id(map['homeId']), searchId: id(map['searchId']), categoriesId: id(map['categoriesId']),
    ordersId: id(map['ordersId']), profileId: id(map['profileId']),
    homeActiveId: id(map['homeActiveId']), searchActiveId: id(map['searchActiveId']),
    categoriesActiveId: id(map['categoriesActiveId']), ordersActiveId: id(map['ordersActiveId']),
    profileActiveId: id(map['profileActiveId']),
  );
}

({String name, String weight})? parsePhosphorIconId(String? raw) {
  if (raw == null) return null;
  final trimmed = raw.trim();
  if (trimmed.isEmpty) return null;
  final lower = trimmed.toLowerCase();
  final parts = lower.split(RegExp(r'[.]+')).where((s) => s.isNotEmpty).toList();
  if (parts.isEmpty) return null;
  String name; String weight;
  if (parts[0] == 'phosphor') {
    name = parts.elementAtOrNull(1) ?? 'circle';
    weight = parts.elementAtOrNull(2) ?? 'regular';
  } else {
    name = parts[0];
    weight = parts.elementAtOrNull(1) ?? 'regular';
  }
  const validWeights = {'thin', 'light', 'regular', 'bold', 'fill'};
  if (!validWeights.contains(weight)) weight = 'regular';
  if (!RegExp(r'^[a-z0-9-]{1,40}$').hasMatch(name)) return null;
  return (name: name, weight: weight);
}

Map<String, IconData> _buildPhosphorIconMap(String weight) {
  Map<String, IconData> Function(Map<String, IconData>)? getter;
  switch (weight) {
    case 'thin':
      getter = (Map<String, IconData> out) {
        out['house'] = PhosphorIconsThin.house;
        out['magnifying-glass'] = PhosphorIconsThin.magnifyingGlass;
        out['squares-four'] = PhosphorIconsThin.squaresFour;
        out['shopping-bag'] = PhosphorIconsThin.shoppingBag;
        out['user'] = PhosphorIconsThin.user;
        out['heart'] = PhosphorIconsThin.heart;
        out['star'] = PhosphorIconsThin.star;
        out['gem'] = PhosphorIconsThin.diamond;
        out['compass'] = PhosphorIconsThin.compass;
        out['bell'] = PhosphorIconsThin.bell;
        out['bookmark'] = PhosphorIconsThin.bookmark;
        out['bolt'] = PhosphorIconsThin.lightning;
        out['gift'] = PhosphorIconsThin.gift;
        out['chat-circle'] = PhosphorIconsThin.chatCircle;
        out['calendar'] = PhosphorIconsThin.calendar;
        out['map-pin'] = PhosphorIconsThin.mapPin;
        out['shopping-cart'] = PhosphorIconsThin.shoppingCart;
        out['crown'] = PhosphorIconsThin.crown;
        out['flame'] = PhosphorIconsThin.flame;
        out['camera'] = PhosphorIconsThin.camera;
        out['music-note'] = PhosphorIconsThin.musicNote;
        out['film-strip'] = PhosphorIconsThin.filmStrip;
        out['headphones'] = PhosphorIconsThin.headphones;
        out['game-controller'] = PhosphorIconsThin.gameController;
        out['wallet'] = PhosphorIconsThin.wallet;
        out['credit-card'] = PhosphorIconsThin.creditCard;
        out['ticket'] = PhosphorIconsThin.ticket;
        out['couch'] = PhosphorIconsThin.couch;
        out['car'] = PhosphorIconsThin.car;
        out['airplane'] = PhosphorIconsThin.airplane;
        out['briefcase'] = PhosphorIconsThin.briefcase;
        out['paw-print'] = PhosphorIconsThin.pawPrint;
        out['leaf'] = PhosphorIconsThin.leaf;
        out['sun'] = PhosphorIconsThin.sun;
        out['moon'] = PhosphorIconsThin.moon;
        out['sparkle'] = PhosphorIconsThin.sparkle;
        out['fire'] = PhosphorIconsThin.fire;
        out['lightbulb'] = PhosphorIconsThin.lightbulb;
        out['rocket'] = PhosphorIconsThin.rocket;
        out['trophy'] = PhosphorIconsThin.trophy;
        out['award'] = PhosphorIconsThin.medal;
        out['scissors'] = PhosphorIconsThin.scissors;
        out['scooter'] = PhosphorIconsThin.scooter;
        out['truck'] = PhosphorIconsThin.truck;
        out['flower-lotus'] = PhosphorIconsThin.flowerLotus;
        out['coffee'] = PhosphorIconsThin.coffee;
        out['cake'] = PhosphorIconsThin.cake;
        out['hand-heart'] = PhosphorIconsThin.handHeart;
        out['user-circle'] = PhosphorIconsThin.userCircle;
        out['users'] = PhosphorIconsThin.users;
        out['image'] = PhosphorIconsThin.image;
        out['video'] = PhosphorIconsThin.video;
        out['notebook'] = PhosphorIconsThin.notebook;
        out['archive'] = PhosphorIconsThin.archive;
        out['folder'] = PhosphorIconsThin.folder;
        out['tag'] = PhosphorIconsThin.tag;
        out['hash'] = PhosphorIconsThin.hash;
        out['rss'] = PhosphorIconsThin.rss;
        out['chat-teardrop'] = PhosphorIconsThin.chatTeardrop;
        out['envelope-simple'] = PhosphorIconsThin.envelopeSimple;
        out['phone'] = PhosphorIconsThin.phone;
        out['fingerprint'] = PhosphorIconsThin.fingerprint;
        out['lock-key'] = PhosphorIconsThin.lockKey;
        out['gear-six'] = PhosphorIconsThin.gearSix;
        out['sliders-horizontal'] = PhosphorIconsThin.slidersHorizontal;
        out['funnel'] = PhosphorIconsThin.funnel;
        out['arrows-left-right'] = PhosphorIconsThin.arrowsLeftRight;
        out['trash'] = PhosphorIconsThin.trash;
        out['pencil-simple'] = PhosphorIconsThin.pencilSimple;
        out['eye'] = PhosphorIconsThin.eye;
        out['heartbeat'] = PhosphorIconsThin.heartbeat;
        out['diamonds-four'] = PhosphorIconsThin.diamondsFour;
        out['pentagram'] = PhosphorIconsThin.pentagram;
        out['list-dashes'] = PhosphorIconsThin.listDashes;
        out['grid-four'] = PhosphorIconsThin.gridFour;
        out['dot-nine'] = PhosphorIconsThin.dotsNine;
        out['baseball'] = PhosphorIconsThin.baseball;
        out['basketball'] = PhosphorIconsThin.basketball;
        out['soccer-ball'] = PhosphorIconsThin.soccerBall;
        out['tennis-ball'] = PhosphorIconsThin.tennisBall;
        out['volleyball'] = PhosphorIconsThin.volleyball;
        return out;
      }; break;
    case 'light':
      getter = (Map<String, IconData> out) {
        out['house'] = PhosphorIconsLight.house;
        out['magnifying-glass'] = PhosphorIconsLight.magnifyingGlass;
        out['squares-four'] = PhosphorIconsLight.squaresFour;
        out['shopping-bag'] = PhosphorIconsLight.shoppingBag;
        out['user'] = PhosphorIconsLight.user;
        out['heart'] = PhosphorIconsLight.heart;
        out['star'] = PhosphorIconsLight.star;
        out['gem'] = PhosphorIconsLight.diamond;
        out['compass'] = PhosphorIconsLight.compass;
        out['bell'] = PhosphorIconsLight.bell;
        out['bookmark'] = PhosphorIconsLight.bookmark;
        out['bolt'] = PhosphorIconsLight.lightning;
        out['gift'] = PhosphorIconsLight.gift;
        out['chat-circle'] = PhosphorIconsLight.chatCircle;
        out['calendar'] = PhosphorIconsLight.calendar;
        out['map-pin'] = PhosphorIconsLight.mapPin;
        out['shopping-cart'] = PhosphorIconsLight.shoppingCart;
        out['crown'] = PhosphorIconsLight.crown;
        out['flame'] = PhosphorIconsLight.flame;
        out['camera'] = PhosphorIconsLight.camera;
        out['music-note'] = PhosphorIconsLight.musicNote;
        out['film-strip'] = PhosphorIconsLight.filmStrip;
        out['headphones'] = PhosphorIconsLight.headphones;
        out['game-controller'] = PhosphorIconsLight.gameController;
        out['wallet'] = PhosphorIconsLight.wallet;
        out['credit-card'] = PhosphorIconsLight.creditCard;
        out['ticket'] = PhosphorIconsLight.ticket;
        out['couch'] = PhosphorIconsLight.couch;
        out['car'] = PhosphorIconsLight.car;
        out['airplane'] = PhosphorIconsLight.airplane;
        out['briefcase'] = PhosphorIconsLight.briefcase;
        out['paw-print'] = PhosphorIconsLight.pawPrint;
        out['leaf'] = PhosphorIconsLight.leaf;
        out['sun'] = PhosphorIconsLight.sun;
        out['moon'] = PhosphorIconsLight.moon;
        out['sparkle'] = PhosphorIconsLight.sparkle;
        out['fire'] = PhosphorIconsLight.fire;
        out['lightbulb'] = PhosphorIconsLight.lightbulb;
        out['rocket'] = PhosphorIconsLight.rocket;
        out['trophy'] = PhosphorIconsLight.trophy;
        out['award'] = PhosphorIconsLight.medal;
        out['scissors'] = PhosphorIconsLight.scissors;
        out['scooter'] = PhosphorIconsLight.scooter;
        out['truck'] = PhosphorIconsLight.truck;
        out['flower-lotus'] = PhosphorIconsLight.flowerLotus;
        out['coffee'] = PhosphorIconsLight.coffee;
        out['cake'] = PhosphorIconsLight.cake;
        out['hand-heart'] = PhosphorIconsLight.handHeart;
        out['user-circle'] = PhosphorIconsLight.userCircle;
        out['users'] = PhosphorIconsLight.users;
        out['image'] = PhosphorIconsLight.image;
        out['video'] = PhosphorIconsLight.video;
        out['notebook'] = PhosphorIconsLight.notebook;
        out['archive'] = PhosphorIconsLight.archive;
        out['folder'] = PhosphorIconsLight.folder;
        out['tag'] = PhosphorIconsLight.tag;
        out['hash'] = PhosphorIconsLight.hash;
        out['rss'] = PhosphorIconsLight.rss;
        out['chat-teardrop'] = PhosphorIconsLight.chatTeardrop;
        out['envelope-simple'] = PhosphorIconsLight.envelopeSimple;
        out['phone'] = PhosphorIconsLight.phone;
        out['fingerprint'] = PhosphorIconsLight.fingerprint;
        out['lock-key'] = PhosphorIconsLight.lockKey;
        out['gear-six'] = PhosphorIconsLight.gearSix;
        out['sliders-horizontal'] = PhosphorIconsLight.slidersHorizontal;
        out['funnel'] = PhosphorIconsLight.funnel;
        out['arrows-left-right'] = PhosphorIconsLight.arrowsLeftRight;
        out['trash'] = PhosphorIconsLight.trash;
        out['pencil-simple'] = PhosphorIconsLight.pencilSimple;
        out['eye'] = PhosphorIconsLight.eye;
        out['heartbeat'] = PhosphorIconsLight.heartbeat;
        out['diamonds-four'] = PhosphorIconsLight.diamondsFour;
        out['pentagram'] = PhosphorIconsLight.pentagram;
        out['list-dashes'] = PhosphorIconsLight.listDashes;
        out['grid-four'] = PhosphorIconsLight.gridFour;
        out['dot-nine'] = PhosphorIconsLight.dotsNine;
        out['baseball'] = PhosphorIconsLight.baseball;
        out['basketball'] = PhosphorIconsLight.basketball;
        out['soccer-ball'] = PhosphorIconsLight.soccerBall;
        out['tennis-ball'] = PhosphorIconsLight.tennisBall;
        out['volleyball'] = PhosphorIconsLight.volleyball;
        return out;
      }; break;
    case 'bold':
      getter = (Map<String, IconData> out) {
        out['house'] = PhosphorIconsBold.house;
        out['magnifying-glass'] = PhosphorIconsBold.magnifyingGlass;
        out['squares-four'] = PhosphorIconsBold.squaresFour;
        out['shopping-bag'] = PhosphorIconsBold.shoppingBag;
        out['user'] = PhosphorIconsBold.user;
        out['heart'] = PhosphorIconsBold.heart;
        out['star'] = PhosphorIconsBold.star;
        out['gem'] = PhosphorIconsBold.diamond;
        out['compass'] = PhosphorIconsBold.compass;
        out['bell'] = PhosphorIconsBold.bell;
        out['bookmark'] = PhosphorIconsBold.bookmark;
        out['bolt'] = PhosphorIconsBold.lightning;
        out['gift'] = PhosphorIconsBold.gift;
        out['chat-circle'] = PhosphorIconsBold.chatCircle;
        out['calendar'] = PhosphorIconsBold.calendar;
        out['map-pin'] = PhosphorIconsBold.mapPin;
        out['shopping-cart'] = PhosphorIconsBold.shoppingCart;
        out['crown'] = PhosphorIconsBold.crown;
        out['flame'] = PhosphorIconsBold.flame;
        out['camera'] = PhosphorIconsBold.camera;
        out['music-note'] = PhosphorIconsBold.musicNote;
        out['film-strip'] = PhosphorIconsBold.filmStrip;
        out['headphones'] = PhosphorIconsBold.headphones;
        out['game-controller'] = PhosphorIconsBold.gameController;
        out['wallet'] = PhosphorIconsBold.wallet;
        out['credit-card'] = PhosphorIconsBold.creditCard;
        out['ticket'] = PhosphorIconsBold.ticket;
        out['couch'] = PhosphorIconsBold.couch;
        out['car'] = PhosphorIconsBold.car;
        out['airplane'] = PhosphorIconsBold.airplane;
        out['briefcase'] = PhosphorIconsBold.briefcase;
        out['paw-print'] = PhosphorIconsBold.pawPrint;
        out['leaf'] = PhosphorIconsBold.leaf;
        out['sun'] = PhosphorIconsBold.sun;
        out['moon'] = PhosphorIconsBold.moon;
        out['sparkle'] = PhosphorIconsBold.sparkle;
        out['fire'] = PhosphorIconsBold.fire;
        out['lightbulb'] = PhosphorIconsBold.lightbulb;
        out['rocket'] = PhosphorIconsBold.rocket;
        out['trophy'] = PhosphorIconsBold.trophy;
        out['award'] = PhosphorIconsBold.medal;
        out['scissors'] = PhosphorIconsBold.scissors;
        out['scooter'] = PhosphorIconsBold.scooter;
        out['truck'] = PhosphorIconsBold.truck;
        out['flower-lotus'] = PhosphorIconsBold.flowerLotus;
        out['coffee'] = PhosphorIconsBold.coffee;
        out['cake'] = PhosphorIconsBold.cake;
        out['hand-heart'] = PhosphorIconsBold.handHeart;
        out['user-circle'] = PhosphorIconsBold.userCircle;
        out['users'] = PhosphorIconsBold.users;
        out['image'] = PhosphorIconsBold.image;
        out['video'] = PhosphorIconsBold.video;
        out['notebook'] = PhosphorIconsBold.notebook;
        out['archive'] = PhosphorIconsBold.archive;
        out['folder'] = PhosphorIconsBold.folder;
        out['tag'] = PhosphorIconsBold.tag;
        out['hash'] = PhosphorIconsBold.hash;
        out['rss'] = PhosphorIconsBold.rss;
        out['chat-teardrop'] = PhosphorIconsBold.chatTeardrop;
        out['envelope-simple'] = PhosphorIconsBold.envelopeSimple;
        out['phone'] = PhosphorIconsBold.phone;
        out['fingerprint'] = PhosphorIconsBold.fingerprint;
        out['lock-key'] = PhosphorIconsBold.lockKey;
        out['gear-six'] = PhosphorIconsBold.gearSix;
        out['sliders-horizontal'] = PhosphorIconsBold.slidersHorizontal;
        out['funnel'] = PhosphorIconsBold.funnel;
        out['arrows-left-right'] = PhosphorIconsBold.arrowsLeftRight;
        out['trash'] = PhosphorIconsBold.trash;
        out['pencil-simple'] = PhosphorIconsBold.pencilSimple;
        out['eye'] = PhosphorIconsBold.eye;
        out['heartbeat'] = PhosphorIconsBold.heartbeat;
        out['diamonds-four'] = PhosphorIconsBold.diamondsFour;
        out['pentagram'] = PhosphorIconsBold.pentagram;
        out['list-dashes'] = PhosphorIconsBold.listDashes;
        out['grid-four'] = PhosphorIconsBold.gridFour;
        out['dot-nine'] = PhosphorIconsBold.dotsNine;
        out['baseball'] = PhosphorIconsBold.baseball;
        out['basketball'] = PhosphorIconsBold.basketball;
        out['soccer-ball'] = PhosphorIconsBold.soccerBall;
        out['tennis-ball'] = PhosphorIconsBold.tennisBall;
        out['volleyball'] = PhosphorIconsBold.volleyball;
        return out;
      }; break;
    case 'fill':
      getter = (Map<String, IconData> out) {
        out['house'] = PhosphorIconsFill.house;
        out['magnifying-glass'] = PhosphorIconsFill.magnifyingGlass;
        out['squares-four'] = PhosphorIconsFill.squaresFour;
        out['shopping-bag'] = PhosphorIconsFill.shoppingBag;
        out['user'] = PhosphorIconsFill.user;
        out['heart'] = PhosphorIconsFill.heart;
        out['star'] = PhosphorIconsFill.star;
        out['gem'] = PhosphorIconsFill.diamond;
        out['compass'] = PhosphorIconsFill.compass;
        out['bell'] = PhosphorIconsFill.bell;
        out['bookmark'] = PhosphorIconsFill.bookmark;
        out['bolt'] = PhosphorIconsFill.lightning;
        out['gift'] = PhosphorIconsFill.gift;
        out['chat-circle'] = PhosphorIconsFill.chatCircle;
        out['calendar'] = PhosphorIconsFill.calendar;
        out['map-pin'] = PhosphorIconsFill.mapPin;
        out['shopping-cart'] = PhosphorIconsFill.shoppingCart;
        out['crown'] = PhosphorIconsFill.crown;
        out['flame'] = PhosphorIconsFill.flame;
        out['camera'] = PhosphorIconsFill.camera;
        out['music-note'] = PhosphorIconsFill.musicNote;
        out['film-strip'] = PhosphorIconsFill.filmStrip;
        out['headphones'] = PhosphorIconsFill.headphones;
        out['game-controller'] = PhosphorIconsFill.gameController;
        out['wallet'] = PhosphorIconsFill.wallet;
        out['credit-card'] = PhosphorIconsFill.creditCard;
        out['ticket'] = PhosphorIconsFill.ticket;
        out['couch'] = PhosphorIconsFill.couch;
        out['car'] = PhosphorIconsFill.car;
        out['airplane'] = PhosphorIconsFill.airplane;
        out['briefcase'] = PhosphorIconsFill.briefcase;
        out['paw-print'] = PhosphorIconsFill.pawPrint;
        out['leaf'] = PhosphorIconsFill.leaf;
        out['sun'] = PhosphorIconsFill.sun;
        out['moon'] = PhosphorIconsFill.moon;
        out['sparkle'] = PhosphorIconsFill.sparkle;
        out['fire'] = PhosphorIconsFill.fire;
        out['lightbulb'] = PhosphorIconsFill.lightbulb;
        out['rocket'] = PhosphorIconsFill.rocket;
        out['trophy'] = PhosphorIconsFill.trophy;
        out['award'] = PhosphorIconsFill.medal;
        out['scissors'] = PhosphorIconsFill.scissors;
        out['scooter'] = PhosphorIconsFill.scooter;
        out['truck'] = PhosphorIconsFill.truck;
        out['flower-lotus'] = PhosphorIconsFill.flowerLotus;
        out['coffee'] = PhosphorIconsFill.coffee;
        out['cake'] = PhosphorIconsFill.cake;
        out['hand-heart'] = PhosphorIconsFill.handHeart;
        out['user-circle'] = PhosphorIconsFill.userCircle;
        out['users'] = PhosphorIconsFill.users;
        out['image'] = PhosphorIconsFill.image;
        out['video'] = PhosphorIconsFill.video;
        out['notebook'] = PhosphorIconsFill.notebook;
        out['archive'] = PhosphorIconsFill.archive;
        out['folder'] = PhosphorIconsFill.folder;
        out['tag'] = PhosphorIconsFill.tag;
        out['hash'] = PhosphorIconsFill.hash;
        out['rss'] = PhosphorIconsFill.rss;
        out['chat-teardrop'] = PhosphorIconsFill.chatTeardrop;
        out['envelope-simple'] = PhosphorIconsFill.envelopeSimple;
        out['phone'] = PhosphorIconsFill.phone;
        out['fingerprint'] = PhosphorIconsFill.fingerprint;
        out['lock-key'] = PhosphorIconsFill.lockKey;
        out['gear-six'] = PhosphorIconsFill.gearSix;
        out['sliders-horizontal'] = PhosphorIconsFill.slidersHorizontal;
        out['funnel'] = PhosphorIconsFill.funnel;
        out['arrows-left-right'] = PhosphorIconsFill.arrowsLeftRight;
        out['trash'] = PhosphorIconsFill.trash;
        out['pencil-simple'] = PhosphorIconsFill.pencilSimple;
        out['eye'] = PhosphorIconsFill.eye;
        out['heartbeat'] = PhosphorIconsFill.heartbeat;
        out['diamonds-four'] = PhosphorIconsFill.diamondsFour;
        out['pentagram'] = PhosphorIconsFill.pentagram;
        out['list-dashes'] = PhosphorIconsFill.listDashes;
        out['grid-four'] = PhosphorIconsFill.gridFour;
        out['dot-nine'] = PhosphorIconsFill.dotsNine;
        out['baseball'] = PhosphorIconsFill.baseball;
        out['basketball'] = PhosphorIconsFill.basketball;
        out['soccer-ball'] = PhosphorIconsFill.soccerBall;
        out['tennis-ball'] = PhosphorIconsFill.tennisBall;
        out['volleyball'] = PhosphorIconsFill.volleyball;
        return out;
      }; break;
    case 'regular':
    default:
      getter = (Map<String, IconData> out) {
        out['house'] = PhosphorIconsRegular.house;
        out['magnifying-glass'] = PhosphorIconsRegular.magnifyingGlass;
        out['squares-four'] = PhosphorIconsRegular.squaresFour;
        out['shopping-bag'] = PhosphorIconsRegular.shoppingBag;
        out['user'] = PhosphorIconsRegular.user;
        out['heart'] = PhosphorIconsRegular.heart;
        out['star'] = PhosphorIconsRegular.star;
        out['gem'] = PhosphorIconsRegular.diamond;
        out['compass'] = PhosphorIconsRegular.compass;
        out['bell'] = PhosphorIconsRegular.bell;
        out['bookmark'] = PhosphorIconsRegular.bookmark;
        out['bolt'] = PhosphorIconsRegular.lightning;
        out['gift'] = PhosphorIconsRegular.gift;
        out['chat-circle'] = PhosphorIconsRegular.chatCircle;
        out['calendar'] = PhosphorIconsRegular.calendar;
        out['map-pin'] = PhosphorIconsRegular.mapPin;
        out['shopping-cart'] = PhosphorIconsRegular.shoppingCart;
        out['crown'] = PhosphorIconsRegular.crown;
        out['flame'] = PhosphorIconsRegular.flame;
        out['camera'] = PhosphorIconsRegular.camera;
        out['music-note'] = PhosphorIconsRegular.musicNote;
        out['film-strip'] = PhosphorIconsRegular.filmStrip;
        out['headphones'] = PhosphorIconsRegular.headphones;
        out['game-controller'] = PhosphorIconsRegular.gameController;
        out['wallet'] = PhosphorIconsRegular.wallet;
        out['credit-card'] = PhosphorIconsRegular.creditCard;
        out['ticket'] = PhosphorIconsRegular.ticket;
        out['couch'] = PhosphorIconsRegular.couch;
        out['car'] = PhosphorIconsRegular.car;
        out['airplane'] = PhosphorIconsRegular.airplane;
        out['briefcase'] = PhosphorIconsRegular.briefcase;
        out['paw-print'] = PhosphorIconsRegular.pawPrint;
        out['leaf'] = PhosphorIconsRegular.leaf;
        out['sun'] = PhosphorIconsRegular.sun;
        out['moon'] = PhosphorIconsRegular.moon;
        out['sparkle'] = PhosphorIconsRegular.sparkle;
        out['fire'] = PhosphorIconsRegular.fire;
        out['lightbulb'] = PhosphorIconsRegular.lightbulb;
        out['rocket'] = PhosphorIconsRegular.rocket;
        out['trophy'] = PhosphorIconsRegular.trophy;
        out['award'] = PhosphorIconsRegular.medal;
        out['scissors'] = PhosphorIconsRegular.scissors;
        out['scooter'] = PhosphorIconsRegular.scooter;
        out['truck'] = PhosphorIconsRegular.truck;
        out['flower-lotus'] = PhosphorIconsRegular.flowerLotus;
        out['coffee'] = PhosphorIconsRegular.coffee;
        out['cake'] = PhosphorIconsRegular.cake;
        out['hand-heart'] = PhosphorIconsRegular.handHeart;
        out['user-circle'] = PhosphorIconsRegular.userCircle;
        out['users'] = PhosphorIconsRegular.users;
        out['image'] = PhosphorIconsRegular.image;
        out['video'] = PhosphorIconsRegular.video;
        out['notebook'] = PhosphorIconsRegular.notebook;
        out['archive'] = PhosphorIconsRegular.archive;
        out['folder'] = PhosphorIconsRegular.folder;
        out['tag'] = PhosphorIconsRegular.tag;
        out['hash'] = PhosphorIconsRegular.hash;
        out['rss'] = PhosphorIconsRegular.rss;
        out['chat-teardrop'] = PhosphorIconsRegular.chatTeardrop;
        out['envelope-simple'] = PhosphorIconsRegular.envelopeSimple;
        out['phone'] = PhosphorIconsRegular.phone;
        out['fingerprint'] = PhosphorIconsRegular.fingerprint;
        out['lock-key'] = PhosphorIconsRegular.lockKey;
        out['gear-six'] = PhosphorIconsRegular.gearSix;
        out['sliders-horizontal'] = PhosphorIconsRegular.slidersHorizontal;
        out['funnel'] = PhosphorIconsRegular.funnel;
        out['arrows-left-right'] = PhosphorIconsRegular.arrowsLeftRight;
        out['trash'] = PhosphorIconsRegular.trash;
        out['pencil-simple'] = PhosphorIconsRegular.pencilSimple;
        out['eye'] = PhosphorIconsRegular.eye;
        out['heartbeat'] = PhosphorIconsRegular.heartbeat;
        out['diamonds-four'] = PhosphorIconsRegular.diamondsFour;
        out['pentagram'] = PhosphorIconsRegular.pentagram;
        out['list-dashes'] = PhosphorIconsRegular.listDashes;
        out['grid-four'] = PhosphorIconsRegular.gridFour;
        out['dot-nine'] = PhosphorIconsRegular.dotsNine;
        out['baseball'] = PhosphorIconsRegular.baseball;
        out['basketball'] = PhosphorIconsRegular.basketball;
        out['soccer-ball'] = PhosphorIconsRegular.soccerBall;
        out['tennis-ball'] = PhosphorIconsRegular.tennisBall;
        out['volleyball'] = PhosphorIconsRegular.volleyball;
        return out;
      };
  }
  final out = <String, IconData>{};
  return getter(out);
}

final Map<String, Map<String, IconData>> _phosphorCache = {};

IconData? resolvePhosphorIcon(String name, String weight) {
  final key = '${weight}_$name';
  final map = _phosphorCache.putIfAbsent(key, () => _buildPhosphorIconMap(weight));
  return map[name];
}

RemoteThemeEffects parseRemoteEffects(dynamic raw) {
  const defaults = _DefaultAppTheme.effects;
  Map<String, dynamic>? map;
  if (raw is Map<String, dynamic>) map = raw;
  else if (raw is Map) map = Map<String, dynamic>.from(raw);
  if (map == null) return defaults;
  double pick(String key, double fb, {double? min, double? max}) {
    return _parseDouble(map![key], fb, min: min, max: max);
  }
  return RemoteThemeEffects(
    primaryGradientAngle: pick('primaryGradientAngle', defaults.primaryGradientAngle, min: 0, max: 360),
    cardRadius: pick('cardRadius', defaults.cardRadius, min: 0, max: 60),
    chipRadius: pick('chipRadius', defaults.chipRadius, min: 0, max: 9999),
    buttonRadius: pick('buttonRadius', defaults.buttonRadius, min: 0, max: 60),
    navShadowOpacity: pick('navShadowOpacity', defaults.navShadowOpacity, min: 0, max: 1),
    cardShadowOpacity: pick('cardShadowOpacity', defaults.cardShadowOpacity, min: 0, max: 1),
    activeGlowOpacity: pick('activeGlowOpacity', defaults.activeGlowOpacity, min: 0, max: 1),
    glassBlur: pick('glassBlur', defaults.glassBlur, min: 0, max: 60),
    surfaceOpacity: pick('surfaceOpacity', defaults.surfaceOpacity, min: 0.2, max: 1),
    borderOpacity: pick('borderOpacity', defaults.borderOpacity, min: 0, max: 1),
  );
}

/* ------------------------------------------------------------------ */
/* 7. DEFAULTS                                                        */
/* ------------------------------------------------------------------ */
class _DefaultEnterpriseTheme {
  static const EnterpriseThemeColors colors = EnterpriseThemeColors(
    primary: Color(0xFF9B4DFF), onPrimary: Color(0xFFFFFFFF),
    primaryContainer: Color(0xFF7230CC), onPrimaryContainer: Color(0xFFEADDFF),
    primaryFixed: Color(0xFFC48CFF), primaryFixedDim: Color(0xFF9B4DFF),
    onPrimaryFixed: Color(0xFF46205A), onPrimaryFixedVariant: Color(0xFF7230CC),

    secondary: Color(0xFFB69DF8), onSecondary: Color(0xFF1E1B2E),
    secondaryContainer: Color(0xFF4A4458), onSecondaryContainer: Color(0xFFE8DEF8),
    secondaryFixed: Color(0xFFE8DEF8), secondaryFixedDim: Color(0xFFCCC2DC),
    onSecondaryFixed: Color(0xFF1E1B2E), onSecondaryFixedVariant: Color(0xFF4A4458),

    tertiary: Color(0xFFFFB4C2), onTertiary: Color(0xFF3B1523),
    tertiaryContainer: Color(0xFF633B48), onTertiaryContainer: Color(0xFFFFD8E4),
    tertiaryFixed: Color(0xFFFFD8E4), tertiaryFixedDim: Color(0xFFFFB1C8),
    onTertiaryFixed: Color(0xFF3B1523), onTertiaryFixedVariant: Color(0xFF633B48),

    error: Color(0xFFBA1A1A), onError: Color(0xFFFFFFFF),
    errorContainer: Color(0xFF93000A), onErrorContainer: Color(0xFFFFDAD6),

    surface: Color(0xFF0B0A0D), onSurface: Color(0xFFE6E1E5),
    surfaceDim: Color(0xFF0B0A0D), surfaceBright: Color(0xFF34323A),
    surfaceContainerLowest: Color(0xFF060508), surfaceContainerLow: Color(0xFF151218),
    surfaceContainer: Color(0xFF1C1A1F), surfaceContainerHigh: Color(0xFF262328),
    surfaceContainerHighest: Color(0xFF322F35), onSurfaceVariant: Color(0xFFCAC4D0),

    outline: Color(0xFF938F99), outlineVariant: Color(0xFF49454F),
    background: Color(0xFF0B0A0D), onBackground: Color(0xFFE6E1E5),

    inverseSurface: Color(0xFFE6E1E5), inverseOnSurface: Color(0xFF1C1A1F),
    inversePrimary: Color(0xFF7F67BE), shadow: Color(0xFF000000), scrim: Color(0xFF000000),

    success: Color(0xFF2E7D32), onSuccess: Color(0xFFFFFFFF),
    successContainer: Color(0xFF004D00), onSuccessContainer: Color(0xFFC8E6C9),
    warning: Color(0xFFED6C02), onWarning: Color(0xFFFFFFFF),
    warningContainer: Color(0xFF4A1C00), onWarningContainer: Color(0xFFFFDBC2),
    info: Color(0xFF1565C0), onInfo: Color(0xFFFFFFFF),
    infoContainer: Color(0xFF003063), onInfoContainer: Color(0xFFBBDEFB),

    divider: Color(0x1FCAC4D0), splash: Color(0x149B4DFF),
    disabled: Color(0x61E6E1E5), onDisabled: Color(0x1FFFFFFF),
    disabledContainer: Color(0x1FE6E1E5),

    heroStart: Color(0xFF46205A), heroMid: Color(0xFF633B48), heroEnd: Color(0xFFFF4DA6),
    cardBackground: Color(0xFF1C1A1F), cardBorder: Color(0x3349454F),
    badge: Color(0xFFFFB4C2), onBadge: Color(0xFF3B1523),
    snackbarBackground: Color(0xFF322F35), snackbarText: Color(0xFFE6E1E5),
    shimmerBase: Color(0xFF1C1A1F), shimmerHighlight: Color(0xFF262328),
    accentPink: Color(0xFFFF4DA6), onAccentPink: Color(0xFFFFFFFF),
    menuBackground: Color(0xFF0E0C10),
    textPrimary: Color(0xFFE6E1E5), textSecondary: Color(0xFFB6B0BC), textTertiary: Color(0xFF7F7A84),
    border: Color(0xFF49454F), borderLight: Color(0x2649454F), surfaceLight: Color(0xFF262328),
  );

  static final EnterpriseTheme theme = EnterpriseTheme(
    version: 't-default000000001',
    isDark: true,
    mode: 'dark',
    colors: colors,
    stateLayers: EnterpriseThemeStateLayers.defaults,
    shadows: EnterpriseThemeShadows.defaults,
    effects: _DefaultAppTheme.effects,
    palettes: (
      primary: TonalPalette({for (final t in kToneSteps) t: const Color(0xFF9B4DFF)}),
      secondary: TonalPalette({for (final t in kToneSteps) t: const Color(0xFFB69DF8)}),
      tertiary: TonalPalette({for (final t in kToneSteps) t: const Color(0xFFFFB4C2)}),
      neutral: TonalPalette({for (final t in kToneSteps) t: const Color(0xFF1C1A1F)}),
      neutralVariant: TonalPalette({for (final t in kToneSteps) t: const Color(0xFF49454F)}),
    ),
  );
}

class _DefaultAppTheme {
  static const RemoteThemeColors colors = RemoteThemeColors(
    primary: Color(0xFF9B4DFF), primaryLight: Color(0xFFC48CFF), primaryDark: Color(0xFF7230CC),
    accentPink: Color(0xFFFF4DA6), background: Color(0xFF46205A), surface: Color(0xFF57246F),
    surfaceLight: Color(0xFF6F2E8E), menuBackground: Color(0xFF421B54),
    textPrimary: Color(0xFFFFFFFF), textSecondary: Color(0xFFB0B0B0), textTertiary: Color(0xFF707070),
    success: Color(0xFF22C55E), warning: Color(0xFFF59E0B), error: Color(0xFFEF4444), info: Color(0xFF3B82F6),
    border: Color(0xFF7B469C), borderLight: Color(0xFF5E2B79),
  );
  static const RemoteThemeEffects effects = RemoteThemeEffects(
    primaryGradientAngle: 135, cardRadius: 16, chipRadius: 999, buttonRadius: 12,
    navShadowOpacity: 0.18, cardShadowOpacity: 0.12, activeGlowOpacity: 0.22,
    glassBlur: 14, surfaceOpacity: 0.85, borderOpacity: 0.45,
  );
}
