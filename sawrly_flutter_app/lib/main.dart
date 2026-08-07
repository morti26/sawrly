import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'theme/app_theme_service.dart';
import 'screens/root_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AppThemeService.instance.initialize();
  runApp(ChangeNotifierProvider<AppThemeService>.value(value: AppThemeService.instance, child: const SawrlyApp()));
}

class SawrlyApp extends StatelessWidget {
  const SawrlyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AppThemeService>(
      builder: (ctx, svc, _) {
        final ent = svc.enterpriseColors;
        final eff = svc.effects;
        final fallback = const Color(0xFFFF4A97);
        final scheme = ColorScheme(
          brightness: Brightness.dark,
          primary: ent.primary,
          onPrimary: ent.onPrimary,
          primaryContainer: ent.primaryContainer,
          onPrimaryContainer: ent.onPrimaryContainer,
          secondary: ent.secondary,
          onSecondary: ent.onSecondary,
          secondaryContainer: ent.secondaryContainer,
          onSecondaryContainer: ent.onSecondaryContainer,
          tertiary: ent.tertiary,
          onTertiary: ent.onTertiary,
          tertiaryContainer: ent.tertiaryContainer,
          onTertiaryContainer: ent.onTertiaryContainer,
          error: ent.error,
          onError: ent.onError,
          errorContainer: ent.errorContainer,
          onErrorContainer: ent.onErrorContainer,
          surface: ent.surface,
          onSurface: ent.onSurface,
          surfaceContainerHighest: ent.surfaceContainerHighest,
          onSurfaceVariant: ent.onSurfaceVariant,
          outline: ent.outline,
          outlineVariant: ent.outlineVariant,
          shadow: ent.shadow,
          scrim: ent.scrim,
          inverseSurface: ent.inverseSurface,
          onInverseSurface: ent.onInverseSurface,
          inversePrimary: ent.inversePrimary,
          surfaceTint: ent.primary,
        );

        final base = ThemeData(
          useMaterial3: true,
          brightness: Brightness.dark,
          colorScheme: scheme,
          visualDensity: VisualDensity.adaptivePlatformDensity,
          scaffoldBackgroundColor: ent.background,
          canvasColor: ent.surfaceContainer,
          cardColor: ent.surfaceContainerHighest,
          dividerColor: ent.outlineVariant,
          shadowColor: ent.shadow,
          primaryColor: ent.primary,
          indicatorColor: ent.accentPink,
          splashColor: ent.primary.withValues(alpha: 0.20),
          highlightColor: ent.primary.withValues(alpha: 0.10),
          fontFamily: 'Tajawal',
          pageTransitionsTheme: const PageTransitionsTheme(
            builders: {
              TargetPlatform.android: ZoomPageTransitionsBuilder(),
              TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
              TargetPlatform.linux: ZoomPageTransitionsBuilder(),
              TargetPlatform.macOS: CupertinoPageTransitionsBuilder(),
              TargetPlatform.windows: ZoomPageTransitionsBuilder(),
              TargetPlatform.fuchsia: ZoomPageTransitionsBuilder(),
            },
          ),
          appBarTheme: AppBarTheme(
            backgroundColor: ent.surfaceContainerHighest,
            foregroundColor: ent.onSurface,
            elevation: 0,
            scrolledUnderElevation: 2,
            surfaceTintColor: ent.primary,
            centerTitle: false,
            titleTextStyle: TextStyle(
              color: ent.onBackground,
              fontSize: 20,
              fontWeight: FontWeight.w800,
              fontFamily: 'Tajawal',
            ),
          ),
          cardTheme: CardThemeData(
            color: ent.surfaceContainer,
            elevation: 0,
            margin: EdgeInsets.zero,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(eff.cardRadius),
              side: BorderSide(color: ent.outlineVariant),
            ),
          ),
          inputDecorationTheme: InputDecorationTheme(
            filled: true,
            fillColor: ent.surfaceContainerHighest,
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(eff.buttonRadius),
              borderSide: BorderSide(color: ent.outlineVariant),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(eff.buttonRadius),
              borderSide: BorderSide(color: ent.outlineVariant),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(eff.buttonRadius),
              borderSide: BorderSide(color: ent.primary, width: 2),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(eff.buttonRadius),
              borderSide: BorderSide(color: ent.error, width: 1.5),
            ),
            hintStyle: TextStyle(color: ent.onSurfaceVariant),
            labelStyle: TextStyle(color: ent.onSurface),
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              backgroundColor: ent.primary,
              foregroundColor: ent.onPrimary,
              elevation: 0,
              minimumSize: const Size.fromHeight(48),
              padding: const EdgeInsets.symmetric(horizontal: 18),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(eff.buttonRadius)),
              textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, fontFamily: 'Tajawal'),
            ),
          ),
          outlinedButtonTheme: OutlinedButtonThemeData(
            style: OutlinedButton.styleFrom(
              foregroundColor: ent.primary,
              side: BorderSide(color: ent.outline),
              minimumSize: const Size.fromHeight(48),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(eff.buttonRadius)),
              textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, fontFamily: 'Tajawal'),
            ),
          ),
          textButtonTheme: TextButtonThemeData(
            style: TextButton.styleFrom(
              foregroundColor: ent.primary,
              textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, fontFamily: 'Tajawal'),
            ),
          ),
          chipTheme: ChipThemeData(
            backgroundColor: ent.surfaceContainerHigh,
            labelStyle: TextStyle(color: ent.onSurface, fontWeight: FontWeight.w600, fontSize: 13),
            side: BorderSide(color: ent.outlineVariant),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(eff.chipRadius)),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
          ),
          badgeTheme: BadgeThemeData(backgroundColor: ent.error, textColor: ent.onError, smallSize: 8),
          snackBarTheme: SnackBarThemeData(
            backgroundColor: ent.inverseSurface,
            contentTextStyle: TextStyle(color: ent.onInverseSurface, fontFamily: 'Tajawal'),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(eff.cardRadius)),
          ),
          dialogTheme: DialogThemeData(
            backgroundColor: ent.surfaceContainerHighest,
            elevation: 6,
            shadowColor: ent.shadow,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(eff.cardRadius)),
            titleTextStyle: TextStyle(
              color: ent.onSurface,
              fontFamily: 'Tajawal',
              fontWeight: FontWeight.w900,
              fontSize: 20,
            ),
            contentTextStyle: TextStyle(color: ent.onSurfaceVariant, fontFamily: 'Tajawal', fontSize: 15),
          ),
          navigationBarTheme: NavigationBarThemeData(
            backgroundColor: ent.surfaceContainerHighest,
            indicatorColor: ent.primaryContainer,
            labelTextStyle: WidgetStatePropertyAll(
              TextStyle(fontFamily: 'Tajawal', fontWeight: FontWeight.w700, fontSize: 12, color: ent.onSurface),
            ),
            iconTheme: WidgetStatePropertyAll(IconThemeData(color: ent.onSurfaceVariant, size: 24)),
            height: 68,
          ),
          bottomNavigationBarTheme: BottomNavigationBarThemeData(
            backgroundColor: ent.surfaceContainerHighest,
            selectedItemColor: ent.accentPink,
            unselectedItemColor: ent.onSurfaceVariant,
            type: BottomNavigationBarType.fixed,
            selectedLabelStyle: const TextStyle(fontFamily: 'Tajawal', fontWeight: FontWeight.w700),
            unselectedLabelStyle: const TextStyle(fontFamily: 'Tajawal', fontWeight: FontWeight.w600),
            elevation: 4,
          ),
          textTheme: TextTheme(
            displayLarge: TextStyle(
              fontFamily: 'Tajawal',
              color: ent.onBackground,
              fontWeight: FontWeight.w900,
              fontSize: 34,
            ),
            displayMedium: TextStyle(
              fontFamily: 'Tajawal',
              color: ent.onBackground,
              fontWeight: FontWeight.w900,
              fontSize: 28,
            ),
            headlineLarge: TextStyle(
              fontFamily: 'Tajawal',
              color: ent.onBackground,
              fontWeight: FontWeight.w900,
              fontSize: 26,
            ),
            headlineMedium: TextStyle(
              fontFamily: 'Tajawal',
              color: ent.onBackground,
              fontWeight: FontWeight.w800,
              fontSize: 22,
            ),
            titleLarge: TextStyle(
              fontFamily: 'Tajawal',
              color: ent.onSurface,
              fontWeight: FontWeight.w800,
              fontSize: 18,
            ),
            titleMedium: TextStyle(
              fontFamily: 'Tajawal',
              color: ent.onSurface,
              fontWeight: FontWeight.w700,
              fontSize: 16,
            ),
            bodyLarge: TextStyle(fontFamily: 'Tajawal', color: ent.onSurface, fontSize: 15.5, height: 1.6),
            bodyMedium: TextStyle(fontFamily: 'Tajawal', color: ent.onSurfaceVariant, fontSize: 14.5, height: 1.55),
            labelLarge: TextStyle(fontFamily: 'Tajawal', color: ent.primary, fontWeight: FontWeight.w800, fontSize: 14),
          ).apply(bodyColor: ent.onSurface, displayColor: ent.onBackground, decorationColor: ent.outline),
        );

        // Fallback om seed ej laddats än (ColorScheme.fromSeed ger bra default):
        final fallBackScheme = ColorScheme.fromSeed(seedColor: fallback, brightness: Brightness.dark);
        final merged = base.copyWith(
          colorScheme: ent.primary == fallback ? fallBackScheme : scheme,
          useMaterial3: true,
        );

        return MaterialApp(
          title: 'صورلي - Sawrly',
          debugShowCheckedModeBanner: false,
          builder: (c, w) {
            // Global textDirection RTL (arabisk)
            return Directionality(
              textDirection: TextDirection.rtl,
              child: MediaQuery(
                data: MediaQuery.of(
                  c,
                ).copyWith(textScaler: MediaQuery.of(c).textScaler.clamp(minScaleFactor: 0.9, maxScaleFactor: 1.4)),
                child: w ?? const SizedBox.shrink(),
              ),
            );
          },
          theme: merged,
          darkTheme: merged,
          highContrastTheme: merged,
          themeMode: ThemeMode.dark,
          locale: const Locale('ar', 'IQ'),
          supportedLocales: const [
            Locale('ar', 'IQ'),
            Locale('ar', 'SA'),
            Locale('ar', 'AE'),
            Locale('sv', 'SE'),
            Locale('en', 'US'),
            Locale('en', 'GB'),
          ],
          localizationsDelegates: const [
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          home: const RootScreen(),
        );
      },
    );
  }
}
