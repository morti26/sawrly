import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import '../../core/theme/app_theme_service.dart';
import '../../core/theme/app_theme_config.dart';

// ============================================================================
// Backwards-compatible GlobalSearchScreen
// Kräver INTE ApiClient/User/CreatorProfileScreen — använder Dio direkt & mock data
// ============================================================================
class GlobalSearchScreen extends StatefulWidget {
  final String initialQuery;
  final int initialTabIndex;

  const GlobalSearchScreen({
    super.key,
    this.initialQuery = '',
    this.initialTabIndex = 0,
  });

  @override
  State<GlobalSearchScreen> createState() => _GlobalSearchScreenState();
}

class _GlobalSearchScreenState extends State<GlobalSearchScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _searchController = TextEditingController();
  String _query = '';

  final List<Map<String, dynamic>> _creators = [];
  final List<Map<String, dynamic>> _offers = [];
  bool _isLoadingCreators = false;
  bool _isLoadingOffers = false;

  final Dio _dio = Dio(BaseOptions(
    baseUrl: 'https://sawrly.com/api',
    connectTimeout: const Duration(seconds: 12),
    receiveTimeout: const Duration(seconds: 10),
    headers: const {'Accept': 'application/json'},
  ));

  @override
  void initState() {
    super.initState();
    final clamped = widget.initialTabIndex.clamp(0, 1);
    _tabController = TabController(length: 2, vsync: this, initialIndex: clamped);
    _query = widget.initialQuery.trim();
    if (_query.isNotEmpty) _searchController.text = _query;
    WidgetsBinding.instance.addPostFrameCallback((_) => _search(_query));
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _search(String q) async {
    setState(() {
      _isLoadingCreators = true;
      _isLoadingOffers = true;
    });

    Future<void> fetchCreators() async {
      try {
        final r = await _dio.get('/search/creators', queryParameters: {'q': q});
        if (mounted) {
          setState(() {
            _creators
              ..clear()
              ..addAll(r.data is List ? List<Map<String, dynamic>>.from(r.data) : []);
            _isLoadingCreators = false;
          });
        }
      } catch (_) {
        if (mounted) setState(() => _isLoadingCreators = false);
      }
    }

    Future<void> fetchOffers() async {
      try {
        final r = await _dio.get('/search/offers', queryParameters: {'q': q});
        if (mounted) {
          setState(() {
            _offers
              ..clear()
              ..addAll(r.data is List ? List<Map<String, dynamic>>.from(r.data) : []);
            _isLoadingOffers = false;
          });
        }
      } catch (_) {
        if (mounted) setState(() => _isLoadingOffers = false);
      }
    }

    await Future.wait([fetchCreators(), fetchOffers()]);
  }

  void _onSearchChanged(String value) {
    setState(() => _query = value);
    Future.delayed(const Duration(milliseconds: 400), () {
      if (_query == value) _search(value);
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = context.watch<AppThemeService>();
    final RemoteThemeColors colors = theme.colors;
    final ent = theme.enterpriseColors;

    return Scaffold(
      backgroundColor: ent.background,
      appBar: AppBar(
        backgroundColor: ent.surfaceContainerHighest,
        foregroundColor: ent.onSurface,
        elevation: 0,
        scrolledUnderElevation: 2,
        titleSpacing: 12,
        title: Container(
          height: 42,
          decoration: BoxDecoration(
            color: ent.surfaceContainerHigh,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: ent.outlineVariant),
          ),
          child: TextField(
            controller: _searchController,
            onChanged: _onSearchChanged,
            autofocus: false,
            style: TextStyle(color: ent.onSurface, fontSize: 14),
            decoration: InputDecoration(
              hintText: 'ابحث عن منشئين أو عروض...',
              hintStyle: TextStyle(color: ent.onSurfaceVariant, fontSize: 14),
              prefixIcon: Icon(Icons.search, color: ent.onSurfaceVariant, size: 20),
              suffixIcon: _query.isNotEmpty
                  ? IconButton(
                      icon: Icon(Icons.clear, size: 18, color: ent.onSurfaceVariant),
                      onPressed: () {
                        _searchController.clear();
                        _onSearchChanged('');
                      },
                    )
                  : null,
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(vertical: 11),
            ),
          ),
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: ent.primary,
          unselectedLabelColor: ent.onSurfaceVariant,
          indicatorColor: ent.primary,
          indicatorWeight: 2,
          dividerColor: ent.outlineVariant,
          tabs: [
            Tab(text: 'المنشئون${_creators.isEmpty ? '' : ' (${_creators.length})'}'),
            Tab(text: 'العروض${_offers.isEmpty ? '' : ' (${_offers.length})'}'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildCreatorsList(),
          _buildOffersList(),
        ],
      ),
    );
  }

  Widget _buildCreatorsList() {
    final RemoteThemeColors colors = context.watch<AppThemeService>().colors;
    final ent = context.watch<AppThemeService>().enterpriseColors;
    if (_isLoadingCreators) {
      return Center(child: CircularProgressIndicator(color: ent.primary));
    }
    if (_creators.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.person_search, size: 60, color: colors.textTertiary),
            const SizedBox(height: 12),
            Text('لم يتم العثور على منشئين', style: TextStyle(color: colors.textTertiary)),
          ],
        ),
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.symmetric(vertical: 8),
      itemCount: _creators.length,
      separatorBuilder: (_, __) => Divider(height: 1, indent: 72, color: ent.outlineVariant),
      itemBuilder: (context, index) {
        final creator = _creators[index];
        final name = creator['name']?.toString() ?? 'Unknown';
        final avatarUrl = creator['avatar_url'];
        final initials = name.isNotEmpty ? name[0].toUpperCase() : '?';
        return ListTile(
          leading: CircleAvatar(
            radius: 24,
            backgroundColor: ent.primaryContainer,
            backgroundImage: (avatarUrl != null && avatarUrl.toString().isNotEmpty)
                ? NetworkImage(
                    avatarUrl.toString().startsWith('/')
                        ? 'https://sawrly.com${avatarUrl.toString()}'
                        : avatarUrl.toString(),
                  )
                : null,
            child: avatarUrl == null
                ? Text(initials, style: TextStyle(color: ent.onPrimaryContainer, fontWeight: FontWeight.w800))
                : null,
          ),
          title: Text(name, style: TextStyle(fontWeight: FontWeight.w600, color: ent.onSurface)),
          subtitle: Text('منشئ محتوى', style: TextStyle(color: ent.onSurfaceVariant, fontSize: 12)),
          trailing: Icon(Icons.arrow_forward_ios, size: 14, color: ent.onSurfaceVariant),
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('فتح ملف $name...', style: TextStyle(color: ent.onInverseSurface)),
                backgroundColor: ent.inverseSurface,
                behavior: SnackBarBehavior.floating,
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildOffersList() {
    final RemoteThemeColors colors = context.watch<AppThemeService>().colors;
    final ent = context.watch<AppThemeService>().enterpriseColors;
    final eff = context.watch<AppThemeService>().effects;
    if (_isLoadingOffers) {
      return Center(child: CircularProgressIndicator(color: ent.primary));
    }
    if (_offers.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.local_offer_outlined, size: 60, color: colors.textTertiary),
            const SizedBox(height: 12),
            Text('لم يتم العثور على عروض', style: TextStyle(color: colors.textTertiary)),
          ],
        ),
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.all(12),
      itemCount: _offers.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final offer = _offers[index];
        final title = offer['title']?.toString() ?? 'Untitled';
        final price = offer['price_iqd'];
        final imageUrl = offer['image_url'];

        String? imgSrc;
        if (imageUrl != null && imageUrl.toString().isNotEmpty) {
          imgSrc = imageUrl.toString().startsWith('/')
              ? 'https://sawrly.com${imageUrl.toString()}'
              : imageUrl.toString();
        }

        return Card(
          elevation: 0,
          color: ent.surfaceContainer,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(eff.cardRadius),
            side: BorderSide(color: ent.outlineVariant),
          ),
          clipBehavior: Clip.antiAlias,
          child: Row(
            children: [
              SizedBox(
                width: 90,
                height: 90,
                child: imgSrc != null
                    ? Image.network(
                        imgSrc,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Center(
                          child: Icon(Icons.image_not_supported, color: ent.onSurfaceVariant),
                        ),
                      )
                    : ColoredBox(
                        color: ent.surfaceContainerHigh,
                        child: Center(child: Icon(Icons.local_offer, color: ent.onSurfaceVariant)),
                      ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 4),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: ent.onSurface),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      if (price != null)
                        Text(
                          '${price.toString()} IQD',
                          style: TextStyle(color: ent.success, fontWeight: FontWeight.w600),
                        ),
                    ],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(right: 12),
                child: Icon(Icons.arrow_forward_ios, size: 14, color: ent.onSurfaceVariant),
              )
            ],
          ),
        );
      },
    );
  }
}
