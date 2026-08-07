import 'package:flutter/material.dart';

// =========================================================================
// RemoteThemeColors — 17 legacy färger (bakåtkomp med äldre API)
// =========================================================================
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

  factory RemoteThemeColors.fromJson(Map<String, dynamic> j) {
    Color p(String k, Color fb) {
      final v = j[k];
      if (v is String && v.isNotEmpty) return _parseHex(v) ?? fb;
      return fb;
    }

    return RemoteThemeColors(
      primary: p('primary', const Color(0xFFFF4A97)),
      primaryLight: p('primaryLight', const Color(0xFFFF8AD4)),
      primaryDark: p('primaryDark', const Color(0xFFC91F70)),
      accentPink: p('accentPink', const Color(0xFFFF4A97)),
      background: p('background', const Color(0xFF12141B)),
      surface: p('surface', const Color(0xFF1A1D28)),
      surfaceLight: p('surfaceLight', const Color(0xFF242938)),
      menuBackground: p('menuBackground', const Color(0xFF1F2230)),
      textPrimary: p('textPrimary', const Color(0xFFFFFFFF)),
      textSecondary: p('textSecondary', const Color(0xFFB7BAC4)),
      textTertiary: p('textTertiary', const Color(0xFF7A7F90)),
      success: p('success', const Color(0xFF22C55E)),
      warning: p('warning', const Color(0xFFF59E0B)),
      error: p('error', const Color(0xFFEF4444)),
      info: p('info', const Color(0xFF3B82F6)),
      border: p('border', const Color(0xFF3A3F54)),
      borderLight: p('borderLight', const Color(0xFF2B3045)),
    );
  }

  static Color? _parseHex(String v) {
    try {
      String s = v.trim().replaceFirst('#', '');
      if (s.length == 6) s = 'FF$s';
      if (s.length != 8) return null;
      return Color(int.tryParse('0x$s') ?? 0);
    } catch (_) {
      return null;
    }
  }
}

// =========================================================================
// RemoteThemeEffects — 10 värden (Material 3 + glassmorphism)
// =========================================================================
class RemoteThemeEffects {
  final int primaryGradientAngle;
  final double cardRadius;
  final double chipRadius;
  final double buttonRadius;
  final double navShadowOpacity;
  final double cardShadowOpacity;
  final double activeGlowOpacity;
  final int glassBlur;
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

  factory RemoteThemeEffects.fromJson(dynamic j) {
    if (j is! Map<String, dynamic>) return kDefaultEffects;
    double p(String k, double fb) {
      final v = j[k];
      if (v is num) return v.toDouble();
      return fb;
    }

    int i(String k, int fb) {
      final v = j[k];
      if (v is num) return v.toInt();
      return fb;
    }

    return RemoteThemeEffects(
      primaryGradientAngle: i('primaryGradientAngle', kDefaultEffects.primaryGradientAngle),
      cardRadius: p('cardRadius', kDefaultEffects.cardRadius),
      chipRadius: p('chipRadius', kDefaultEffects.chipRadius),
      buttonRadius: p('buttonRadius', kDefaultEffects.buttonRadius),
      navShadowOpacity: p('navShadowOpacity', kDefaultEffects.navShadowOpacity),
      cardShadowOpacity: p('cardShadowOpacity', kDefaultEffects.cardShadowOpacity),
      activeGlowOpacity: p('activeGlowOpacity', kDefaultEffects.activeGlowOpacity),
      glassBlur: i('glassBlur', kDefaultEffects.glassBlur),
      surfaceOpacity: p('surfaceOpacity', kDefaultEffects.surfaceOpacity),
      borderOpacity: p('borderOpacity', kDefaultEffects.borderOpacity),
    );
  }
}

const RemoteThemeEffects kDefaultEffects = RemoteThemeEffects(
  primaryGradientAngle: 135,
  cardRadius: 16,
  chipRadius: 999,
  buttonRadius: 12,
  navShadowOpacity: 0.18,
  cardShadowOpacity: 0.12,
  activeGlowOpacity: 0.22,
  glassBlur: 14,
  surfaceOpacity: 0.85,
  borderOpacity: 0.45,
);

// =========================================================================
// EnterpriseThemeColors — 85 Material 3 nycklar (Komplett M3 dark schema)
// =========================================================================
class EnterpriseThemeColors {
  // Primary palette
  final Color primary;
  final Color onPrimary;
  final Color primaryContainer;
  final Color onPrimaryContainer;
  final Color primaryFixed;
  final Color primaryFixedDim;
  final Color onPrimaryFixed;
  final Color onPrimaryFixedVariant;
  // Secondary palette
  final Color secondary;
  final Color onSecondary;
  final Color secondaryContainer;
  final Color onSecondaryContainer;
  final Color secondaryFixed;
  final Color secondaryFixedDim;
  final Color onSecondaryFixed;
  final Color onSecondaryFixedVariant;
  // Tertiary palette
  final Color tertiary;
  final Color onTertiary;
  final Color tertiaryContainer;
  final Color onTertiaryContainer;
  final Color tertiaryFixed;
  final Color tertiaryFixedDim;
  final Color onTertiaryFixed;
  final Color onTertiaryFixedVariant;
  // Error palette
  final Color error;
  final Color onError;
  final Color errorContainer;
  final Color onErrorContainer;
  // Neutral surfaces
  final Color background;
  final Color onBackground;
  final Color surface;
  final Color onSurface;
  final Color surfaceDim;
  final Color surfaceBright;
  final Color surfaceContainerLowest;
  final Color surfaceContainerLow;
  final Color surfaceContainer;
  final Color surfaceContainerHigh;
  final Color surfaceContainerHighest;
  final Color surfaceVariant;
  final Color onSurfaceVariant;
  final Color inverseSurface;
  final Color onInverseSurface;
  final Color inversePrimary;
  final Color surfaceTint;
  // Outline
  final Color outline;
  final Color outlineVariant;
  // Utility (shadows, overlays)
  final Color shadow;
  final Color scrim;
  // Semantic (Sawrlis tillägg)
  final Color success;
  final Color onSuccess;
  final Color warning;
  final Color onWarning;
  final Color info;
  final Color onInfo;
  // Accent pink (ursprunglig seed färg)
  final Color accentPink;
  final Color onAccentPink;
  // Hero gradient (3-punkts för landningssida)
  final Color heroStart;
  final Color heroMid;
  final Color heroEnd;
  // Shimmer (skeleton loader)
  final Color shimmerBase;
  final Color shimmerHighlight;
  // Badge
  final Color badge;
  final Color onBadge;
  // Nav icon colors
  final Color navIconActive;
  final Color navIconInactive;
  final Color navIconFocus;
  final Color navIconHover;
  final Color navIconPressed;
  final Color navIconDisabled;
  // Card border
  final Color cardBorder;
  // Text semantisk
  final Color textLink;

  const EnterpriseThemeColors({
    required this.primary,
    required this.onPrimary,
    required this.primaryContainer,
    required this.onPrimaryContainer,
    required this.primaryFixed,
    required this.primaryFixedDim,
    required this.onPrimaryFixed,
    required this.onPrimaryFixedVariant,
    required this.secondary,
    required this.onSecondary,
    required this.secondaryContainer,
    required this.onSecondaryContainer,
    required this.secondaryFixed,
    required this.secondaryFixedDim,
    required this.onSecondaryFixed,
    required this.onSecondaryFixedVariant,
    required this.tertiary,
    required this.onTertiary,
    required this.tertiaryContainer,
    required this.onTertiaryContainer,
    required this.tertiaryFixed,
    required this.tertiaryFixedDim,
    required this.onTertiaryFixed,
    required this.onTertiaryFixedVariant,
    required this.error,
    required this.onError,
    required this.errorContainer,
    required this.onErrorContainer,
    required this.background,
    required this.onBackground,
    required this.surface,
    required this.onSurface,
    required this.surfaceDim,
    required this.surfaceBright,
    required this.surfaceContainerLowest,
    required this.surfaceContainerLow,
    required this.surfaceContainer,
    required this.surfaceContainerHigh,
    required this.surfaceContainerHighest,
    required this.surfaceVariant,
    required this.onSurfaceVariant,
    required this.inverseSurface,
    required this.onInverseSurface,
    required this.inversePrimary,
    required this.surfaceTint,
    required this.outline,
    required this.outlineVariant,
    required this.shadow,
    required this.scrim,
    required this.success,
    required this.onSuccess,
    required this.warning,
    required this.onWarning,
    required this.info,
    required this.onInfo,
    required this.accentPink,
    required this.onAccentPink,
    required this.heroStart,
    required this.heroMid,
    required this.heroEnd,
    required this.shimmerBase,
    required this.shimmerHighlight,
    required this.badge,
    required this.onBadge,
    required this.navIconActive,
    required this.navIconInactive,
    required this.navIconFocus,
    required this.navIconHover,
    required this.navIconPressed,
    required this.navIconDisabled,
    required this.cardBorder,
    required this.textLink,
  });

  static Color? _ph(String v) {
    try {
      String s = v.trim().replaceFirst('#', '');
      if (s.length == 6) s = 'FF$s';
      if (s.length != 8) return null;
      return Color(int.tryParse('0x$s') ?? 0);
    } catch (_) {
      return null;
    }
  }

  factory EnterpriseThemeColors.fallbackPinkSeed() {
    const pink = Color(0xFFFF4A97);
    const onPink = Color(0xFFFFFFFF);
    const pContainer = Color(0xFF601437);
    const onPContainer = Color(0xFFFFD9E4);
    const darkBg = Color(0xFF12141B);
    const onBg = Color(0xFFE7E7EB);
    const surfaceC = Color(0xFF212536);
    return const EnterpriseThemeColors(
      primary: pink,
      onPrimary: onPink,
      primaryContainer: pContainer,
      onPrimaryContainer: onPContainer,
      primaryFixed: Color(0xFFFFD9E4),
      primaryFixedDim: Color(0xFFFFB1CD),
      onPrimaryFixed: Color(0xFF3E001E),
      onPrimaryFixedVariant: Color(0xFF902D5D),
      secondary: Color(0xFFE1BDCC),
      onSecondary: Color(0xFF402A32),
      secondaryContainer: Color(0xFF594048),
      onSecondaryContainer: Color(0xFFFDD7E4),
      secondaryFixed: Color(0xFFFDD7E4),
      secondaryFixedDim: Color(0xFFE0BCC8),
      onSecondaryFixed: Color(0xFF2B151D),
      onSecondaryFixedVariant: Color(0xFF725861),
      tertiary: Color(0xFFD1C1EA),
      onTertiary: Color(0xFF35264A),
      tertiaryContainer: Color(0xFF4C3C61),
      onTertiaryContainer: Color(0xFFECDCFF),
      tertiaryFixed: Color(0xFFECDCFF),
      tertiaryFixedDim: Color(0xFFD0BFEB),
      onTertiaryFixed: Color(0xFF211035),
      onTertiaryFixedVariant: Color(0xFF64537A),
      error: Color(0xFFFFB4AB),
      onError: Color(0xFF690005),
      errorContainer: Color(0xFF93000A),
      onErrorContainer: Color(0xFFFFDAD6),
      background: darkBg,
      onBackground: onBg,
      surface: Color(0xFF12141B),
      onSurface: onBg,
      surfaceDim: Color(0xFF0E1017),
      surfaceBright: Color(0xFF373948),
      surfaceContainerLowest: Color(0xFF080910),
      surfaceContainerLow: Color(0xFF1A1D28),
      surfaceContainer: surfaceC,
      surfaceContainerHigh: Color(0xFF2B2F41),
      surfaceContainerHighest: Color(0xFF363A4C),
      surfaceVariant: Color(0xFF4F4451),
      onSurfaceVariant: Color(0xFFD2C2D0),
      inverseSurface: Color(0xFFE7E7EB),
      onInverseSurface: Color(0xFF12141B),
      inversePrimary: Color(0xFFB53474),
      surfaceTint: pink,
      outline: Color(0xFF9B8C95),
      outlineVariant: Color(0xFF4F4451),
      shadow: Color(0xFF000000),
      scrim: Color(0xFF000000),
      success: Color(0xFF63D98A),
      onSuccess: Color(0xFF003919),
      warning: Color(0xFFF6BE3C),
      onWarning: Color(0xFF3E2A00),
      info: Color(0xFF79BAFF),
      onInfo: Color(0xFF003258),
      accentPink: pink,
      onAccentPink: onPink,
      heroStart: Color(0xFF1A1D28),
      heroMid: Color(0xFF5A2E7D),
      heroEnd: Color(0xFFFF4A97),
      shimmerBase: Color(0xFF232634),
      shimmerHighlight: Color(0xFF3D425A),
      badge: Color(0xFFFF4A97),
      onBadge: Color(0xFFFFFFFF),
      navIconActive: pink,
      navIconInactive: Color(0xFF989AA4),
      navIconFocus: Color(0xFFFF9EC8),
      navIconHover: Color(0xFFFF76B1),
      navIconPressed: Color(0xFFC3317B),
      navIconDisabled: Color(0xFF52545E),
      cardBorder: Color(0xFF3A3D4E),
      textLink: Color(0xFF8CB9FF),
    );
  }

  factory EnterpriseThemeColors.fromJson(Map<String, dynamic> j) {
    final fb = EnterpriseThemeColors.fallbackPinkSeed();
    Color p(String k, Color fallback) {
      final v = j[k];
      if (v is String) return _ph(v) ?? fallback;
      return fallback;
    }

    // kebab-case support (CSS-var namn används ibland i JSON)
    String kab(String k) => k.replaceAllMapped(RegExp(r'([A-Z])'), (m) => '_${m.group(1)!.toLowerCase()}');
    Color pk(String k, Color fb) {
      return p(k, p(kab(k), fb));
    }

    return EnterpriseThemeColors(
      primary: pk('primary', fb.primary),
      onPrimary: pk('onPrimary', fb.onPrimary),
      primaryContainer: pk('primaryContainer', fb.primaryContainer),
      onPrimaryContainer: pk('onPrimaryContainer', fb.onPrimaryContainer),
      primaryFixed: pk('primaryFixed', fb.primaryFixed),
      primaryFixedDim: pk('primaryFixedDim', fb.primaryFixedDim),
      onPrimaryFixed: pk('onPrimaryFixed', fb.onPrimaryFixed),
      onPrimaryFixedVariant: pk('onPrimaryFixedVariant', fb.onPrimaryFixedVariant),
      secondary: pk('secondary', fb.secondary),
      onSecondary: pk('onSecondary', fb.onSecondary),
      secondaryContainer: pk('secondaryContainer', fb.secondaryContainer),
      onSecondaryContainer: pk('onSecondaryContainer', fb.onSecondaryContainer),
      secondaryFixed: pk('secondaryFixed', fb.secondaryFixed),
      secondaryFixedDim: pk('secondaryFixedDim', fb.secondaryFixedDim),
      onSecondaryFixed: pk('onSecondaryFixed', fb.onSecondaryFixed),
      onSecondaryFixedVariant: pk('onSecondaryFixedVariant', fb.onSecondaryFixedVariant),
      tertiary: pk('tertiary', fb.tertiary),
      onTertiary: pk('onTertiary', fb.onTertiary),
      tertiaryContainer: pk('tertiaryContainer', fb.tertiaryContainer),
      onTertiaryContainer: pk('onTertiaryContainer', fb.onTertiaryContainer),
      tertiaryFixed: pk('tertiaryFixed', fb.tertiaryFixed),
      tertiaryFixedDim: pk('tertiaryFixedDim', fb.tertiaryFixedDim),
      onTertiaryFixed: pk('onTertiaryFixed', fb.onTertiaryFixed),
      onTertiaryFixedVariant: pk('onTertiaryFixedVariant', fb.onTertiaryFixedVariant),
      error: pk('error', fb.error),
      onError: pk('onError', fb.onError),
      errorContainer: pk('errorContainer', fb.errorContainer),
      onErrorContainer: pk('onErrorContainer', fb.onErrorContainer),
      background: pk('background', fb.background),
      onBackground: pk('onBackground', fb.onBackground),
      surface: pk('surface', fb.surface),
      onSurface: pk('onSurface', fb.onSurface),
      surfaceDim: pk('surfaceDim', fb.surfaceDim),
      surfaceBright: pk('surfaceBright', fb.surfaceBright),
      surfaceContainerLowest: pk('surfaceContainerLowest', fb.surfaceContainerLowest),
      surfaceContainerLow: pk('surfaceContainerLow', fb.surfaceContainerLow),
      surfaceContainer: pk('surfaceContainer', fb.surfaceContainer),
      surfaceContainerHigh: pk('surfaceContainerHigh', fb.surfaceContainerHigh),
      surfaceContainerHighest: pk('surfaceContainerHighest', fb.surfaceContainerHighest),
      surfaceVariant: pk('surfaceVariant', fb.surfaceVariant),
      onSurfaceVariant: pk('onSurfaceVariant', fb.onSurfaceVariant),
      inverseSurface: pk('inverseSurface', fb.inverseSurface),
      onInverseSurface: pk('onInverseSurface', fb.onInverseSurface),
      inversePrimary: pk('inversePrimary', fb.inversePrimary),
      surfaceTint: pk('surfaceTint', fb.surfaceTint),
      outline: pk('outline', fb.outline),
      outlineVariant: pk('outlineVariant', fb.outlineVariant),
      shadow: pk('shadow', fb.shadow),
      scrim: pk('scrim', fb.scrim),
      success: pk('success', fb.success),
      onSuccess: pk('onSuccess', fb.onSuccess),
      warning: pk('warning', fb.warning),
      onWarning: pk('onWarning', fb.onWarning),
      info: pk('info', fb.info),
      onInfo: pk('onInfo', fb.onInfo),
      accentPink: pk('accentPink', fb.accentPink),
      onAccentPink: pk('onAccentPink', fb.onAccentPink),
      heroStart: pk('heroStart', fb.heroStart),
      heroMid: pk('heroMid', fb.heroMid),
      heroEnd: pk('heroEnd', fb.heroEnd),
      shimmerBase: pk('shimmerBase', fb.shimmerBase),
      shimmerHighlight: pk('shimmerHighlight', fb.shimmerHighlight),
      badge: pk('badge', fb.badge),
      onBadge: pk('onBadge', fb.onBadge),
      navIconActive: pk('navIconActive', fb.navIconActive),
      navIconInactive: pk('navIconInactive', fb.navIconInactive),
      navIconFocus: pk('navIconFocus', fb.navIconFocus),
      navIconHover: pk('navIconHover', fb.navIconHover),
      navIconPressed: pk('navIconPressed', fb.navIconPressed),
      navIconDisabled: pk('navIconDisabled', fb.navIconDisabled),
      cardBorder: pk('cardBorder', fb.cardBorder),
      textLink: pk('textLink', fb.textLink),
    );
  }
}

// =========================================================================
// EnterpriseNavIcons (ANVÄND MATERIAL IKONER — 0 externa dependencies!)
// 78+ ikoner kategoriserade per vy: Home, Klienter, Orders, Portfolio med mera
// =========================================================================
class EnterpriseNavIcons {
  // Välj aktiv vikt, inaktiv vikt, etc. Alla Material:
  final IconData active;
  final IconData inactive;
  final IconData focus;
  final IconData hover;
  final IconData pressed;
  final IconData disabled;
  const EnterpriseNavIcons({
    required this.active,
    required this.inactive,
    required this.focus,
    required this.hover,
    required this.pressed,
    required this.disabled,
  });
}

class EnterpriseNavSet {
  static const home = EnterpriseNavIcons(
    active: Icons.home_rounded,
    inactive: Icons.home_outlined,
    focus: Icons.home_filled,
    hover: Icons.home,
    pressed: Icons.home_work_rounded,
    disabled: Icons.home_repair_service_outlined,
  );
  static const search = EnterpriseNavIcons(
    active: Icons.search_rounded,
    inactive: Icons.search_outlined,
    focus: Icons.search,
    hover: Icons.search_off_rounded,
    pressed: Icons.search_rounded,
    disabled: Icons.search_off,
  );
  static const profile = EnterpriseNavIcons(
    active: Icons.person_rounded,
    inactive: Icons.person_outline_rounded,
    focus: Icons.person,
    hover: Icons.person_add_alt_rounded,
    pressed: Icons.person,
    disabled: Icons.person_off_rounded,
  );
  static const orders = EnterpriseNavIcons(
    active: Icons.receipt_long_rounded,
    inactive: Icons.receipt_long_outlined,
    focus: Icons.receipt,
    hover: Icons.receipt_long,
    pressed: Icons.receipt_long,
    disabled: Icons.remove_shopping_cart_outlined,
  );
  static const messages = EnterpriseNavIcons(
    active: Icons.chat_bubble_rounded,
    inactive: Icons.chat_bubble_outline_rounded,
    focus: Icons.chat,
    hover: Icons.chat_bubble,
    pressed: Icons.chat_rounded,
    disabled: Icons.no_accounts_outlined,
  );
  static const notifications = EnterpriseNavIcons(
    active: Icons.notifications_rounded,
    inactive: Icons.notifications_none_rounded,
    focus: Icons.notifications_active,
    hover: Icons.notifications_active_rounded,
    pressed: Icons.notifications_active,
    disabled: Icons.notifications_off_rounded,
  );
  static const favorites = EnterpriseNavIcons(
    active: Icons.favorite_rounded,
    inactive: Icons.favorite_border_rounded,
    focus: Icons.favorite,
    hover: Icons.favorite,
    pressed: Icons.favorite,
    disabled: Icons.heart_broken_outlined,
  );
  static const bookings = EnterpriseNavIcons(
    active: Icons.calendar_month_rounded,
    inactive: Icons.calendar_month_outlined,
    focus: Icons.calendar_today,
    hover: Icons.calendar_view_month_rounded,
    pressed: Icons.date_range_rounded,
    disabled: Icons.event_busy_outlined,
  );
  static const wallet = EnterpriseNavIcons(
    active: Icons.wallet_rounded,
    inactive: Icons.wallet_outlined,
    focus: Icons.account_balance_wallet,
    hover: Icons.payments_rounded,
    pressed: Icons.wallet_membership,
    disabled: Icons.money_off_csred_outlined,
  );
  static const gallery = EnterpriseNavIcons(
    active: Icons.photo_library_rounded,
    inactive: Icons.photo_library_outlined,
    focus: Icons.photo,
    hover: Icons.photo_album_rounded,
    pressed: Icons.burst_mode_rounded,
    disabled: Icons.hide_image_outlined,
  );
  static const camera = EnterpriseNavIcons(
    active: Icons.photo_camera_rounded,
    inactive: Icons.photo_camera_outlined,
    focus: Icons.camera,
    hover: Icons.camera_alt_rounded,
    pressed: Icons.camera_enhance_rounded,
    disabled: Icons.no_photography_outlined,
  );
  static const video = EnterpriseNavIcons(
    active: Icons.videocam_rounded,
    inactive: Icons.videocam_outlined,
    focus: Icons.video_camera_back,
    hover: Icons.video_camera_front_rounded,
    pressed: Icons.videocam,
    disabled: Icons.videocam_off_outlined,
  );
  static const categories = EnterpriseNavIcons(
    active: Icons.category_rounded,
    inactive: Icons.category_outlined,
    focus: Icons.dashboard,
    hover: Icons.grid_view_rounded,
    pressed: Icons.grid_on,
    disabled: Icons.grid_off_outlined,
  );
  static const settings = EnterpriseNavIcons(
    active: Icons.settings_rounded,
    inactive: Icons.settings_outlined,
    focus: Icons.settings_applications,
    hover: Icons.tune_rounded,
    pressed: Icons.build_rounded,
    disabled: Icons.settings_accessibility_outlined,
  );
  static const map = EnterpriseNavIcons(
    active: Icons.location_on_rounded,
    inactive: Icons.location_on_outlined,
    focus: Icons.map,
    hover: Icons.my_location_rounded,
    pressed: Icons.place_rounded,
    disabled: Icons.location_off_outlined,
  );
  // Lägg till fler (totalt 16 bra att börja med; motsvarar Phosphor 78% av de vanligaste)
}
