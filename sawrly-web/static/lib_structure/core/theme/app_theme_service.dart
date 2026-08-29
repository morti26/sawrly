import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'app_theme_config.dart';

class AppThemeService extends ChangeNotifier with WidgetsBindingObserver {
  AppThemeService._();
  static final AppThemeService instance = AppThemeService._();

  static const String kConfigUrl = 'https://sawrly.com/api/config/public';
  static const Duration kPollInterval = Duration(seconds: 30);
  static const kDefaultVersion = 't-default00000000';

  final _dio = Dio(
    BaseOptions(
      baseUrl: 'https://sawrly.com/api',
      connectTimeout: const Duration(seconds: 12),
      receiveTimeout: const Duration(seconds: 10),
      headers: const {'Accept': 'application/json'},
    ),
  );

  RemoteThemeColors _legacy = kDefaultLegacy;
  RemoteThemeEffects _effects = kDefaultEffects;
  EnterpriseThemeColors _enterprise = EnterpriseThemeColors.fallbackPinkSeed();
  String _version = kDefaultVersion;

  bool _isLoading = false;
  DateTime? _lastFetchAt;
  Timer? _timer;
  bool _initialized = false;

  RemoteThemeColors get colors => _legacy;
  RemoteThemeEffects get effects => _effects;
  EnterpriseThemeColors get enterpriseColors => _enterprise;
  bool get isLoading => _isLoading;
  String get version => _version;
  String get versionShort => _version.length > 16 ? _version.substring(0, 16) : _version;
  DateTime? get lastFetchAt => _lastFetchAt;
  bool get initialized => _initialized;

  static const kDefaultLegacy = RemoteThemeColors(
    primary: Color(0xFFFF4A97),
    primaryLight: Color(0xFFFF8AD4),
    primaryDark: Color(0xFFC91F70),
    accentPink: Color(0xFFFF4A97),
    background: Color(0xFF12141B),
    surface: Color(0xFF1A1D28),
    surfaceLight: Color(0xFF242938),
    menuBackground: Color(0xFF1F2230),
    textPrimary: Color(0xFFFFFFFF),
    textSecondary: Color(0xFFB7BAC4),
    textTertiary: Color(0xFF7A7F90),
    success: Color(0xFF22C55E),
    warning: Color(0xFFF59E0B),
    error: Color(0xFFEF4444),
    info: Color(0xFF3B82F6),
    border: Color(0xFF3A3F54),
    borderLight: Color(0xFF2B3045),
  );

  void _attach() {
    try {
      WidgetsBinding.instance.addObserver(this);
    } catch (_) {}
  }

  void _detach() {
    try {
      WidgetsBinding.instance.removeObserver(this);
    } catch (_) {}
  }

  Future<void> initialize() async {
    if (_initialized) return;
    _initialized = true;
    _attach();
    await loadFromServer(forceRefresh: true);
    _timer?.cancel();
    _timer = Timer.periodic(kPollInterval, (_) => loadFromServer());
    debugPrint('[ThemeService] Init OK, polling ${kPollInterval.inSeconds}s → $kConfigUrl');
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) unawaited(loadFromServer(forceRefresh: true));
  }

  @override
  void dispose() {
    _timer?.cancel();
    _detach();
    super.dispose();
  }

  Future<void> loadFromServer({bool forceRefresh = false}) async {
    if (_isLoading) return;
    _isLoading = true;
    try {
      final resp = await _dio.getUri(Uri.parse(kConfigUrl));
      final dynamic raw = resp.data is String ? jsonDecode(resp.data as String) : resp.data;
      if (raw is! Map<String, dynamic>) {
        debugPrint('[ThemeService] ❌ Ogiltigt svar från server');
        return;
      }
      final ent = raw['enterprise'];
      if (ent is Map<String, dynamic>) {
        final newVersion = (ent['version']?.toString().isNotEmpty ?? false) == true
            ? ent['version'].toString()
            : kDefaultVersion;
        if (forceRefresh || newVersion != _version) {
          final effMap = raw['theme']?['effects'] ?? ent['effects'];
          _effects = RemoteThemeEffects.fromJson(effMap);
          _enterprise = EnterpriseThemeColors.fromJson(
            (ent['colors'] is Map) ? ent['colors'] as Map<String, dynamic> : const <String, dynamic>{},
          );
          _legacy = RemoteThemeColors.fromJson(
            (raw['theme']?['colors'] is Map)
                ? raw['theme']['colors'] as Map<String, dynamic>
                : const <String, dynamic>{},
          );
          _version = newVersion;
          _lastFetchAt = DateTime.now();
          notifyListeners();
          debugPrint('[ThemeService] ✅ NY uppdatering version=$newVersion (effekter & färger uppdaterade)');
          return;
        } else {
          debugPrint('[ThemeService] ↩️ cached version=$newVersion (ingen ändring)');
          _lastFetchAt = DateTime.now();
          return;
        }
      }
      // Fallback 1: legacy-theme fält
      final theme = raw['theme'];
      if (theme is Map<String, dynamic>) {
        final col = theme['colors'];
        final eff = theme['effects'];
        if (col is Map) _legacy = RemoteThemeColors.fromJson(col as Map<String, dynamic>);
        if (eff != null) _effects = RemoteThemeEffects.fromJson(eff);
        _lastFetchAt = DateTime.now();
        notifyListeners();
        debugPrint('[ThemeService] ✅ Uppdaterad legacy-tema');
      }
    } on DioException catch (e) {
      debugPrint('[ThemeService] ⚠️ HTTP (${e.response?.statusCode}): ${e.message ?? e.error}');
    } catch (e) {
      debugPrint('[ThemeService] ⚠️ Allmänt fel: ${e.runtimeType} $e');
    } finally {
      _isLoading = false;
    }
  }
}
