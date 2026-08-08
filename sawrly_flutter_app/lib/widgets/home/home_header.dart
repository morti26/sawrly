import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme_service.dart';
import '../../theme/app_theme_config.dart';

// ============================================================================
// Camera Logo Widget — no PNG, no white background, pure Flutter gradient
// ============================================================================
class CameraLogoWidget extends StatelessWidget {
  final double size;
  const CameraLogoWidget({super.key, this.size = 42});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(size * 0.22),
      child: SizedBox(
        width: size,
        height: size,
        child: Stack(
          children: [
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF42A5F5), Color(0xFF1565C0)],
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                ),
              ),
            ),
            Positioned(
              right: 0,
              top: 0,
              child: Container(
                width: size * 0.60,
                height: size * 0.60,
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFFFFCA28), Color(0xFFEF5350)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.only(bottomLeft: Radius.elliptical(200, 200)),
                ),
              ),
            ),
            Positioned(
              right: 0,
              bottom: 0,
              child: Container(
                width: size * 0.62,
                height: size * 0.62,
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFFAB47BC), Color(0xFF4527A0)],
                    begin: Alignment.topRight,
                    end: Alignment.bottomLeft,
                  ),
                  borderRadius: BorderRadius.only(topLeft: Radius.elliptical(200, 200)),
                ),
              ),
            ),
            Center(
              child: Container(
                width: size * 0.58,
                height: size * 0.58,
                decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.white),
              ),
            ),
            Center(
              child: Container(
                width: size * 0.50,
                height: size * 0.50,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [Color(0xFF1A237E), Color(0xFF000000)],
                    center: Alignment(-0.3, -0.3),
                    stops: [0.2, 1.0],
                  ),
                ),
              ),
            ),
            Positioned(
              left: size * 0.25,
              top: size * 0.20,
              child: Container(
                width: size * 0.12,
                height: size * 0.12,
                decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white.withValues(alpha: 0.55)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ============================================================================
// HomeHeader — BACKWARDS COMPATIBLE
// Kräver INTE AuthService/MediaService/NotificationScreen etc.
// Om dessa saknas → Visar ändå en snygg header! 👍
// ============================================================================
class HomeHeader extends StatelessWidget {
  const HomeHeader({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = context.watch<AppThemeService>();
    final RemoteThemeColors colors = theme.colors;
    final RemoteThemeEffects effects = theme.effects;
    final ent = theme.enterpriseColors;

    // Try to fetch optional services (may not exist yet)
    bool isSuperAdmin = false;
    try {
      final auth = context.read<dynamic>();
      // ignore: avoid_dynamic_calls
      final u = auth?.currentUser;
      if (u != null && u.isSuperadmin == true) isSuperAdmin = true;
    } catch (_) {}

    final iconColor = ent.onSurface.withValues(alpha: 0.9);

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
      child: Container(
        height: 58,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [ent.primary, ent.primaryContainer],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            transform: GradientRotation((effects.primaryGradientAngle * 3.14159) / 180),
          ),
          borderRadius: BorderRadius.circular(effects.cardRadius > 0 ? effects.cardRadius : 16),
          border: Border.all(color: ent.cardBorder, width: 1),
          boxShadow: [
            BoxShadow(
              color: ent.primary.withValues(alpha: effects.activeGlowOpacity),
              blurRadius: 18,
              spreadRadius: -6,
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                const CameraLogoWidget(size: 36),
                const SizedBox(width: 10),
                Text(
                  'صورلي',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: ent.onPrimary),
                ),
              ],
            ),
            Row(
              children: [
                if (isSuperAdmin) ...[
                  IconButton(
                    onPressed: () => _notImplSnackBar(context, 'Testsida'),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints.tightFor(width: 30, height: 30),
                    icon: Icon(Icons.fact_check_outlined, size: 20, color: iconColor),
                    tooltip: 'Testsida',
                  ),
                  const SizedBox(width: 10),
                ],
                IconButton(
                  onPressed: () => _notImplSnackBar(context, 'الإشعارات'),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints.tightFor(width: 30, height: 30),
                  icon: Icon(Icons.notifications_none, size: 22, color: iconColor),
                ),
                const SizedBox(width: 10),
                IconButton(
                  onPressed: () => _notImplSnackBar(context, 'الدعم'),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints.tightFor(width: 30, height: 30),
                  icon: Icon(Icons.headset_mic_outlined, size: 20, color: iconColor),
                  tooltip: 'تحدث مع الدعم',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _notImplSnackBar(BuildContext ctx, String label) {
    try {
      final theme = ctx.read<AppThemeService>();
      final ent = theme.enterpriseColors;
      ScaffoldMessenger.of(ctx).showSnackBar(
        SnackBar(
          content: Text('جاري التفعيل قريباً: $label', style: TextStyle(color: ent.onInverseSurface)),
          backgroundColor: ent.inverseSurface,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(theme.effects.cardRadius)),
          duration: const Duration(seconds: 2),
        ),
      );
    } catch (_) {
      ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(content: Text('Coming soon: $label')));
    }
  }
}
