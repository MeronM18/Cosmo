import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';
import '../../../theme/app_theme.dart';

class CosmicBackgroundWidget extends StatefulWidget {
  const CosmicBackgroundWidget({super.key});

  @override
  State<CosmicBackgroundWidget> createState() => _CosmicBackgroundWidgetState();
}

class _CosmicBackgroundWidgetState extends State<CosmicBackgroundWidget>
    with TickerProviderStateMixin {
  late AnimationController _starAnimationController;
  late AnimationController _nebulaAnimationController;

  @override
  void initState() {
    super.initState();
    _starAnimationController = AnimationController(
      duration: const Duration(seconds: 8),
      vsync: this,
    )..repeat();

    _nebulaAnimationController = AnimationController(
      duration: const Duration(seconds: 12),
      vsync: this,
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _starAnimationController.dispose();
    _nebulaAnimationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: double.infinity,
      child: Stack(
        children: [
          // Base cosmic gradient
          Container(
            decoration: BoxDecoration(
              gradient: RadialGradient(
                center: Alignment.topCenter,
                radius: 1.5,
                colors: [
                  AppTheme.primaryVariantLight,
                  AppTheme.backgroundLight,
                  Colors.black.withValues(alpha: 0.9),
                ],
                stops: const [0.0, 0.6, 1.0],
              ),
            ),
          ),

          // Animated nebula effect
          AnimatedBuilder(
            animation: _nebulaAnimationController,
            builder: (context, child) {
              return Container(
                decoration: BoxDecoration(
                  gradient: RadialGradient(
                    center: Alignment.center,
                    radius: 1.2 + (_nebulaAnimationController.value * 0.3),
                    colors: [
                      AppTheme.secondaryLight.withValues(alpha: 0.1),
                      Colors.transparent,
                      AppTheme.secondaryVariantLight.withValues(alpha: 0.05),
                    ],
                    stops: const [0.0, 0.5, 1.0],
                  ),
                ),
              );
            },
          ),

          // Twinkling stars
          AnimatedBuilder(
            animation: _starAnimationController,
            builder: (context, child) {
              return CustomPaint(
                painter: StarFieldPainter(_starAnimationController.value),
                size: Size.infinite,
              );
            },
          ),

          // Zodiac symbol watermarks
          Positioned(
            top: 15.h,
            right: 10.w,
            child: Opacity(
              opacity: 0.1,
              child: Text(
                '♈',
                style: AppTheme.lightTheme.textTheme.displayLarge?.copyWith(
                  fontSize: 40.sp,
                  color: AppTheme.textSecondary,
                ),
              ),
            ),
          ),

          Positioned(
            bottom: 20.h,
            left: 8.w,
            child: Opacity(
              opacity: 0.08,
              child: Text(
                '♌',
                style: AppTheme.lightTheme.textTheme.displayLarge?.copyWith(
                  fontSize: 35.sp,
                  color: AppTheme.textSecondary,
                ),
              ),
            ),
          ),

          Positioned(
            top: 35.h,
            left: 15.w,
            child: Opacity(
              opacity: 0.06,
              child: Text(
                '♓',
                style: AppTheme.lightTheme.textTheme.displayLarge?.copyWith(
                  fontSize: 30.sp,
                  color: AppTheme.textSecondary,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class StarFieldPainter extends CustomPainter {
  final double animationValue;

  StarFieldPainter(this.animationValue);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;

    // Generate consistent star positions
    final stars = <Offset>[];
    for (int i = 0; i < 50; i++) {
      final x = (i * 37.0) % size.width;
      final y = (i * 73.0) % size.height;
      stars.add(Offset(x, y));
    }

    // Draw twinkling stars
    for (int i = 0; i < stars.length; i++) {
      final star = stars[i];
      final twinkle = (animationValue + (i * 0.1)) % 1.0;
      final opacity = 0.3 + (0.7 * (1.0 - (twinkle - 0.5).abs() * 2));
      final radius = 1.0 + (twinkle * 1.5);

      paint.color = Colors.white.withValues(alpha: opacity);
      canvas.drawCircle(star, radius, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
