import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../theme/app_theme_service.dart';
import '../theme/app_theme_config.dart';

class RootScreen extends StatelessWidget {
  const RootScreen({super.key});

  Future<void> _openUrl(String u) async {
    final uri = Uri.parse(u);
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      debugPrint('kunde inte öppna: $u');
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = context.watch<AppThemeService>();
    final ent = theme.enterpriseColors;
    final eff = theme.effects;

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: ent.background,
        appBar: AppBar(
          backgroundColor: ent.surfaceContainerHighest,
          foregroundColor: ent.onSurface,
          elevation: 0,
          title: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'صورلي',
                style: TextStyle(color: ent.accentPink, fontWeight: FontWeight.w900, fontSize: 24),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: ent.primary.withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(eff.chipRadius),
                  border: Border.all(color: ent.outlineVariant),
                ),
                child: Text(
                  'نسخة ${theme.versionShort.substring(0, 12)}',
                  style: TextStyle(color: ent.primary, fontSize: 12, fontWeight: FontWeight.w700),
                ),
              ),
            ],
          ),
        ),
        body: RefreshIndicator(
          color: ent.accentPink,
          backgroundColor: ent.surfaceContainer,
          onRefresh: () => theme.loadFromServer(forceRefresh: true),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'أهلاً بك في صورلي 👋',
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: ent.onBackground),
                ),
                const SizedBox(height: 6),
                Text(
                  'هذا التطبيق يستخدم نظام ألوان Enterprise Material 3 (85 لون + تزامن مباشر مع لوحة التحكم).',
                  style: TextStyle(fontSize: 15, color: ent.onSurfaceVariant, height: 1.6),
                ),
                const SizedBox(height: 24),
                _SwatchRow(
                  title: 'الألوان الأساسية (Primary/Accent)',
                  entries: [
                    ('Primary', ent.primary, ent.onPrimary),
                    ('Accent Pink', ent.accentPink, ent.onAccentPink),
                    ('Primary Container', ent.primaryContainer, ent.onPrimaryContainer),
                    ('Tertiary', ent.tertiary, ent.onTertiary),
                  ],
                  eff: eff,
                ),
                const SizedBox(height: 18),
                _SwatchRow(
                  title: 'السطوح (Surfaces — M3)',
                  entries: [
                    ('Background', ent.background, ent.onBackground),
                    ('Surface', ent.surface, ent.onSurface),
                    ('Container', ent.surfaceContainer, ent.onSurface),
                    ('High', ent.surfaceContainerHigh, ent.onSurface),
                    ('Highest', ent.surfaceContainerHighest, ent.onSurface),
                  ],
                  eff: eff,
                ),
                const SizedBox(height: 18),
                _SwatchRow(
                  title: 'حالات (Semantic)',
                  entries: [
                    ('نجاح / Success', ent.success, ent.onSuccess),
                    ('تحذير / Warning', ent.warning, ent.onWarning),
                    ('خطأ / Error', ent.error, ent.onError),
                    ('معلومات / Info', ent.info, ent.onInfo),
                  ],
                  eff: eff,
                ),
                const SizedBox(height: 28),
                FilledButton.icon(
                  style: FilledButton.styleFrom(
                    backgroundColor: ent.accentPink,
                    foregroundColor: ent.onAccentPink,
                    minimumSize: const Size.fromHeight(54),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(eff.buttonRadius)),
                  ),
                  icon: const Icon(Icons.palette_outlined),
                  label: const Text('تغيير الألوان في لوحة التحكم (Smart Palette)'),
                  onPressed: () => _openUrl('https://sawrly.com/admin/theme-settings'),
                ),
                const SizedBox(height: 10),
                OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: ent.primary,
                    side: BorderSide(color: ent.outline),
                    minimumSize: const Size.fromHeight(50),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(eff.buttonRadius)),
                  ),
                  icon: const Icon(Icons.open_in_new),
                  label: const Text('فتح الموقع الرسمي sawrly.com'),
                  onPressed: () => _openUrl('https://sawrly.com'),
                ),
                const SizedBox(height: 10),
                OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: ent.tertiary,
                    side: BorderSide(color: ent.outlineVariant),
                    minimumSize: const Size.fromHeight(50),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(eff.buttonRadius)),
                  ),
                  icon: const Icon(Icons.refresh, size: 20),
                  label: Text('تحديث الآن (آخر: ${_fmt(theme.lastFetchAt)})'),
                  onPressed: () async {
                    await theme.loadFromServer(forceRefresh: true);
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          backgroundColor: ent.surfaceContainerHigh,
                          content: Text(
                            'تم التحديث. الإصدار: ${theme.versionShort}',
                            style: TextStyle(color: ent.onSurface),
                          ),
                          duration: const Duration(seconds: 2),
                        ),
                      );
                    }
                  },
                ),
                const SizedBox(height: 30),
                Text(
                  'كيف يعني؟ 💡',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: ent.onBackground),
                ),
                const SizedBox(height: 10),
                _InfoTile(
                  eff: eff,
                  ent: ent,
                  n: '1',
                  title: 'تغيير الألوان في لوحة التحكم',
                  body: 'اذهب إلى إعدادات مظهر التطبيق → Smart Palette → اختر لون أساسي (Seed) → احفظ.',
                ),
                const SizedBox(height: 8),
                _InfoTile(
                  eff: eff,
                  ent: ent,
                  n: '2',
                  title: 'التطبيق يحدث تلقائياً',
                  body:
                      'بعد ٢٥-٣٠ ثانية يتحقق التطبيق من النسخة الجديدة (Version Hash) ويغير جميع الألوان فوراً بدون إعادة تشغيل!',
                ),
                const SizedBox(height: 8),
                _InfoTile(
                  eff: eff,
                  ent: ent,
                  n: '3',
                  title: 'اسحب للأسفل للتحديث اليدوي',
                  body: 'في أي وقت اسحب الشاشة للأسفل لتجلب الألوان الجديدة من الخادم فوراً.',
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ),
    );
  }

  static String _fmt(DateTime? d) => d == null
      ? '—'
      : '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}:${d.second.toString().padLeft(2, '0')}';
}

class _SwatchRow extends StatelessWidget {
  final String title;
  final List<(String, Color, Color)> entries;
  final RemoteThemeEffects eff;
  const _SwatchRow({required this.title, required this.entries, required this.eff});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            color: entries.first.$2.computeLuminance() < 0.5 ? Colors.white : Colors.black87,
          ),
        ),
        const SizedBox(height: 10),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: entries.map((e) {
            final (t, bg, fg) = e;
            return Container(
              width: 96,
              padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
              decoration: BoxDecoration(
                color: bg,
                borderRadius: BorderRadius.circular(eff.cardRadius),
                border: Border.all(color: fg.withValues(alpha: 0.25), width: 1),
                boxShadow: [
                  BoxShadow(color: bg.withValues(alpha: eff.activeGlowOpacity), blurRadius: 16, spreadRadius: -4),
                ],
              ),
              child: Column(
                children: [
                  Text(
                    t,
                    textAlign: TextAlign.center,
                    style: TextStyle(color: fg, fontSize: 12, fontWeight: FontWeight.w800, height: 1.2),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _hex(bg),
                    style: TextStyle(color: fg.withValues(alpha: 0.8), fontSize: 10, fontFamily: 'monospace'),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  static String _hex(Color c) => '#${c.value.toRadixString(16).padLeft(8, '0').substring(2).toUpperCase()}';
}

class _InfoTile extends StatelessWidget {
  final String n, title, body;
  final EnterpriseThemeColors ent;
  final RemoteThemeEffects eff;
  const _InfoTile({required this.n, required this.title, required this.body, required this.ent, required this.eff});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: ent.surfaceContainer,
        borderRadius: BorderRadius.circular(eff.cardRadius),
        border: Border.all(color: ent.outlineVariant),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(color: ent.primaryContainer, shape: BoxShape.circle),
            alignment: Alignment.center,
            child: Text(
              n,
              style: TextStyle(color: ent.onPrimaryContainer, fontWeight: FontWeight.w900),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(color: ent.onSurface, fontSize: 15, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 4),
                Text(body, style: TextStyle(color: ent.onSurfaceVariant, fontSize: 13.5, height: 1.55)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
