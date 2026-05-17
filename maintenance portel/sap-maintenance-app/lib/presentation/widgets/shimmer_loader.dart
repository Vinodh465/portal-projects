import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

/// Skeleton shimmer card for loading states
class ShimmerLoader extends StatelessWidget {
  final int count;
  final double height;
  const ShimmerLoader({super.key, this.count = 4, this.height = 80});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: count,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (_, __) => Shimmer.fromColors(
        baseColor: isDark ? const Color(0xFF2A2F3A) : const Color(0xFFE8EDF2),
        highlightColor: isDark ? const Color(0xFF3A4150) : const Color(0xFFF5F7FA),
        child: Container(
          height: height,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
    );
  }
}

/// Single shimmer box
class ShimmerBox extends StatelessWidget {
  final double width;
  final double height;
  final double radius;
  const ShimmerBox({super.key, required this.width, required this.height, this.radius = 8});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Shimmer.fromColors(
      baseColor: isDark ? const Color(0xFF2A2F3A) : const Color(0xFFE8EDF2),
      highlightColor: isDark ? const Color(0xFF3A4150) : const Color(0xFFF5F7FA),
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(radius),
        ),
      ),
    );
  }
}
