# Session 4 — 2026-08-07 (Fortsättning: Skapa komplett Flutter-app + pusha till GitHub)

## Användarens order (KRITISK OMTOLKNING)
> "du har appen och flutter i server och du jobbar i server när du är klar skicka allt till github sedan jag kan ladda allting darifrån till min dator"
→ Mål: Skapa ett KÖRBART Flutter-projekt HÄR PÅ SERVERN, lägg i repo-rot under `sawrly_flutter_app/`, committa + pusha HELA till origin/master.
→ Användaren ska ENBART behöva köra `git clone` på sin dator, sedan öppna mappen i Android Studio. INGEN manuell filkopiering!

## Tekniska åtgärder
1. ✅ Identifiera Flutter SDK på servern: `/home/morti/flutter/bin/flutter` (version 3.41.6 stable, Dart 3.11.4)
2. ✅ `flutter create sawrly_flutter_app --org com.sawrly --project-name fotograf_mobile --platforms android,ios,web`
3. ✅ OMSKRIV theme engine från grunden:
   - `lib/theme/app_theme_config.dart` (485 rader): RemoteThemeColors(17), RemoteThemeEffects(10), EnterpriseThemeColors(85 M3 nycklar), EnterpriseNavSet(16 kategorier Material Icons)
   - `lib/theme/app_theme_service.dart` (143 rader): ChangeNotifier + Dio + Timer.periodic(30s) → pollar `https://sawrly.com/api/config/public` (INGEN localhost!)
     - Singleton `AppThemeService.instance`
     - Version hash jämförelse → endast notifyListeners() om ny version
   - OBS! Tidigare static/-version använde privat paket `phosphoricons_flutter` → 451 errors. FIX: ALLA ikoner är nu Material Icons (finns inbyggda).
4. ✅ `lib/main.dart` 277 rader: MaterialApp wrapper, Consumer<AppThemeService> → byter hela ColorScheme live! RTL ar_IQ, 6 locales, Tajawal typsnitt, M3 tema (AppBar/Card/Buttons/Chips/Dialog/NavBar/SnackBar)
5. ✅ `lib/screens/root_screen.dart` (270 rader): Home → M3 swatches (Primary/Accent/Surfaces/Semantic), RefreshIndicator, 3 knappar (admin theme-settings, öppna sawrly.com, force refresh), Info tiles
6. ✅ Fix 17 analyze issues → 0 ERRORS (3 info deprecated warnings OK, exit 0)
   - 3 stavfel i app_theme_config.dart (C/D/I → Color/double/int)
   - 2 saknade getter (enterpriseVersionOrFallback → versionShort) + 1 saknad import i root_screen.dart
   - 1 null-safety service L102 + 1 dödkod type check + 1 parameter-namn (L79 s → state)
   - 2 unused imports (main L5, test L3)
   - `dart format lib test -l 120`
7. ✅ GIT: Commit a44938b (79 nya filer), pushad till origin/master
   - Före detta commits i S1–S3: 0982f4a → 726aee1 (theme engine + admin 1290 byten)
   - Flutter-mappens egna .gitignore säkrar: .dart_tool/, .idea/, build/, .flutter-plugins* pushas EJ

## Kvarvarande nästa steg (för nästa session)
- Firebase FCM integration (push notiser)
- APK release-byggnad (flutter build apk --release) + App Store Connect
- Auth (inloggning kunder/fotografer) + API klient (Dio + interceptors)
- Orderhantering, Bokningsflöde, Väskan (Wallet)
- Bilder/videor uppladdning + Galleri visning
- Phosphor Flutter (offentlig paket url: `phosphor_flutter: ^2.1.0`) kan byta ut Material Icons senare

## Slutlig instruktion till användaren (Session #4 output)
Se längst ner i denna fil.
