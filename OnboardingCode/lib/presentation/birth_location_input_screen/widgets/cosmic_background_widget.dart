import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class CosmicBackgroundWidget extends StatefulWidget {
  final Widget child;

  const CosmicBackgroundWidget({
    Key? key,
    required this.child,
  }) : super(key: key);

  @override
  State<CosmicBackgroundWidget> createState() => _CosmicBackgroundWidgetState();
}

class _CosmicBackgroundWidgetState extends State<CosmicBackgroundWidget>
    with TickerProviderStateMixin {
  late AnimationController _starAnimationController;
  late AnimationController _nebulaAnimationController;
  late Animation<double> _starAnimation;
  late Animation<double> _nebulaAnimation;

  @override
  void initState() {
    super.initState();

    _starAnimationController = AnimationController(
      duration: const Duration(seconds: 8),
      vsync: this,
    );

    _nebulaAnimationController = AnimationController(
      duration: const Duration(seconds: 12),
      vsync: this,
    );

    _starAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _starAnimationController,
      curve: Curves.easeInOut,
    ));

    _nebulaAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _nebulaAnimationController,
      curve: Curves.easeInOut,
    ));

    _starAnimationController.repeat(reverse: true);
    _nebulaAnimationController.repeat(reverse: true);
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
      decoration: BoxDecoration(
        gradient: RadialGradient(
          center: const Alignment(0.3, -0.5),
          radius: 1.2,
          colors: [
            AppTheme.lightTheme.colorScheme.primaryContainer
                .withValues(alpha: 0.8),
            AppTheme.lightTheme.colorScheme.primary,
            AppTheme.backgroundOverlay,
          ],
          stops: const [0.0, 0.6, 1.0],
        ),
      ),
      child: Stack(
        children: [
          // Nebula effect
          AnimatedBuilder(
            animation: _nebulaAnimation,
            builder: (context, child) {
              return Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    gradient: RadialGradient(
                      center: Alignment(
                        0.5 + (_nebulaAnimation.value * 0.3 - 0.15),
                        -0.3 + (_nebulaAnimation.value * 0.2 - 0.1),
                      ),
                      radius: 0.8 + (_nebulaAnimation.value * 0.4),
                      colors: [
                        AppTheme.lightTheme.colorScheme.secondary
                            .withValues(alpha: 0.1),
                        AppTheme.lightTheme.colorScheme.secondary
                            .withValues(alpha: 0.05),
                        Colors.transparent,
                      ],
                      stops: const [0.0, 0.5, 1.0],
                    ),
                  ),
                ),
              );
            },
          ),

          // Twinkling stars
          AnimatedBuilder(
            animation: _starAnimation,
            builder: (context, child) {
              return CustomPaint(
                painter: StarFieldPainter(
                  animationValue: _starAnimation.value,
                  primaryColor: AppTheme.lightTheme.colorScheme.secondary,
                  secondaryColor: AppTheme.textSecondary,
                ),
                size: Size(100.w, 100.h),
              );
            },
          ),

          // Zodiac symbols watermark
          Positioned(
            top: 15.h,
            right: 10.w,
            child: Opacity(
              opacity: 0.05,
              child: CustomIconWidget(
                iconName: 'star',
                color: AppTheme.lightTheme.colorScheme.secondary,
                size: 20.w,
              ),
            ),
          ),

          Positioned(
            bottom: 20.h,
            left: 5.w,
            child: Opacity(
              opacity: 0.03,
              child: CustomIconWidget(
                iconName: 'brightness_2',
                color: AppTheme.textSecondary,
                size: 15.w,
              ),
            ),
          ),

          // Main content
          widget.child,
        ],
      ),
    );
  }
}

class StarFieldPainter extends CustomPainter {
  final double animationValue;
  final Color primaryColor;
  final Color secondaryColor;

  StarFieldPainter({
    required this.animationValue,
    required this.primaryColor,
    required this.secondaryColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..style = PaintingStyle.fill;

    // Generate consistent star positions
    final stars = _generateStars(size);

    for (final star in stars) {
      final opacity = (0.3 +
          (0.7 *
              (0.5 +
                      0.5 *
                          (animationValue + star['phase'])
                              .remainder(2.0) -
                      1)
                  .abs()));

      paint.color = (star['isPrimary'] as bool ? primaryColor : secondaryColor)
          .withValues(alpha: opacity * 0.8);

      canvas.drawCircle(
        Offset(star['x'] as double, star['y'] as double),
        star['size'] as double,
        paint,
      );
    }
  }

  List<Map<String, dynamic>> _generateStars(Size size) {
    final stars = <Map<String, dynamic>>[];

    // Create a deterministic set of stars
    for (int i = 0; i < 50; i++) {
      final x = (i * 37.0) % size.width;
      final y = (i * 73.0) % size.height;
      final size_val = 0.5 + (i % 3) * 0.5;
      final phase = (i * 0.1) % 1.0;
      final isPrimary = i % 3 == 0;

      stars.add({
        'x': x,
        'y': y,
        'size': size_val,
        'phase': phase,
        'isPrimary': isPrimary,
      });
    }

    return stars;
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
