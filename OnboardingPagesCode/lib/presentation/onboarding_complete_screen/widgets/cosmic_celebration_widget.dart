import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';
import '../../../theme/app_theme.dart';

class CosmicCelebrationWidget extends StatefulWidget {
  const CosmicCelebrationWidget({Key? key}) : super(key: key);

  @override
  State<CosmicCelebrationWidget> createState() =>
      _CosmicCelebrationWidgetState();
}

class _CosmicCelebrationWidgetState extends State<CosmicCelebrationWidget>
    with TickerProviderStateMixin {
  late AnimationController _starAnimationController;
  late AnimationController _particleAnimationController;
  late Animation<double> _starAnimation;
  late Animation<double> _particleAnimation;

  @override
  void initState() {
    super.initState();

    _starAnimationController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    );

    _particleAnimationController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );

    _starAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _starAnimationController,
      curve: Curves.easeInOut,
    ));

    _particleAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _particleAnimationController,
      curve: Curves.elasticOut,
    ));

    _startAnimations();
  }

  void _startAnimations() {
    _starAnimationController.forward();
    Future.delayed(const Duration(milliseconds: 500), () {
      _particleAnimationController.forward();
    });
  }

  @override
  void dispose() {
    _starAnimationController.dispose();
    _particleAnimationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: 40.h,
      child: Stack(
        children: [
          // Enhanced star field background
          AnimatedBuilder(
            animation: _starAnimation,
            builder: (context, child) {
              return CustomPaint(
                size: Size(double.infinity, 40.h),
                painter: StarFieldPainter(
                  animationValue: _starAnimation.value,
                ),
              );
            },
          ),

          // Particle burst effects
          AnimatedBuilder(
            animation: _particleAnimation,
            builder: (context, child) {
              return CustomPaint(
                size: Size(double.infinity, 40.h),
                painter: ParticleBurstPainter(
                  animationValue: _particleAnimation.value,
                ),
              );
            },
          ),

          // Constellation drawing animation
          AnimatedBuilder(
            animation: _starAnimation,
            builder: (context, child) {
              return CustomPaint(
                size: Size(double.infinity, 40.h),
                painter: ConstellationPainter(
                  animationValue: _starAnimation.value,
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

class StarFieldPainter extends CustomPainter {
  final double animationValue;

  StarFieldPainter({required this.animationValue});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.8 * animationValue)
      ..style = PaintingStyle.fill;

    // Draw twinkling stars
    for (int i = 0; i < 50; i++) {
      final x = (i * 37.5) % size.width;
      final y = (i * 23.7) % size.height;
      final starSize = (1 + (i % 3)) * animationValue;

      // Twinkling effect
      final twinkle = (animationValue * 2 + i * 0.1) % 1.0;
      final alpha = (0.3 + 0.7 * twinkle) * animationValue;

      paint.color = Colors.white.withValues(alpha: alpha);
      canvas.drawCircle(Offset(x, y), starSize, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

class ParticleBurstPainter extends CustomPainter {
  final double animationValue;

  ParticleBurstPainter({required this.animationValue});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..style = PaintingStyle.fill;

    final centerX = size.width / 2;
    final centerY = size.height / 2;

    // Draw particle bursts
    for (int i = 0; i < 20; i++) {
      final angle = (i / 20) * 2 * 3.14159;
      final distance = 50 * animationValue;
      final x = centerX + distance * cos(angle);
      final y = centerY + distance * sin(angle);

      final particleSize = (3 - 2 * animationValue).clamp(0.5, 3.0);
      final alpha = (1 - animationValue).clamp(0.0, 1.0);

      paint.color = AppTheme.secondaryLight.withValues(alpha: alpha);
      canvas.drawCircle(Offset(x, y), particleSize, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

class ConstellationPainter extends CustomPainter {
  final double animationValue;

  ConstellationPainter({required this.animationValue});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppTheme.secondaryLight.withValues(alpha: 0.6 * animationValue)
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke;

    // Draw constellation lines
    final points = [
      Offset(size.width * 0.2, size.height * 0.3),
      Offset(size.width * 0.4, size.height * 0.2),
      Offset(size.width * 0.6, size.height * 0.4),
      Offset(size.width * 0.8, size.height * 0.3),
    ];

    for (int i = 0; i < points.length - 1; i++) {
      final progress = ((animationValue * points.length) - i).clamp(0.0, 1.0);
      if (progress > 0) {
        final start = points[i];
        final end = points[i + 1];
        final currentEnd = Offset(
          start.dx + (end.dx - start.dx) * progress,
          start.dy + (end.dy - start.dy) * progress,
        );
        canvas.drawLine(start, currentEnd, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

double cos(double radians) => radians.cos();
double sin(double radians) => radians.sin();

extension on double {
  double cos() {
    return (this -
            (this * this * this) / 6 +
            (this * this * this * this * this) / 120)
        .clamp(-1.0, 1.0);
  }

  double sin() {
    return (this -
            (this * this * this) / 6 +
            (this * this * this * this * this) / 120)
        .clamp(-1.0, 1.0);
  }
}
