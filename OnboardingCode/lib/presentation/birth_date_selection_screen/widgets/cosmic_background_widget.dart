import 'package:flutter/material.dart';

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
  late Animation<double> _starAnimation;

  @override
  void initState() {
    super.initState();
    _starAnimationController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    );
    _starAnimation = Tween<double>(
      begin: 0.3,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _starAnimationController,
      curve: Curves.easeInOut,
    ));
    _starAnimationController.repeat(reverse: true);
  }

  @override
  void dispose() {
    _starAnimationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: double.infinity,
      decoration: BoxDecoration(
        gradient: RadialGradient(
          center: const Alignment(0.3, -0.7),
          radius: 1.2,
          colors: [
            AppTheme.primaryVariantLight,
            AppTheme.backgroundLight,
            const Color(0xFF1A0626),
          ],
          stops: const [0.0, 0.6, 1.0],
        ),
      ),
      child: AnimatedBuilder(
        animation: _starAnimation,
        builder: (context, child) {
          return CustomPaint(
            painter: StarFieldPainter(_starAnimation.value),
            size: Size.infinite,
          );
        },
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
      ..color = Colors.white.withValues(alpha: animationValue * 0.8)
      ..style = PaintingStyle.fill;

    // Draw twinkling stars
    final stars = [
      Offset(size.width * 0.1, size.height * 0.15),
      Offset(size.width * 0.8, size.height * 0.1),
      Offset(size.width * 0.3, size.height * 0.25),
      Offset(size.width * 0.9, size.height * 0.3),
      Offset(size.width * 0.15, size.height * 0.4),
      Offset(size.width * 0.7, size.height * 0.35),
      Offset(size.width * 0.2, size.height * 0.6),
      Offset(size.width * 0.85, size.height * 0.65),
      Offset(size.width * 0.4, size.height * 0.8),
      Offset(size.width * 0.6, size.height * 0.75),
    ];

    for (final star in stars) {
      canvas.drawCircle(star, 1.5 * animationValue, paint);
    }

    // Draw subtle nebula effect
    final nebulaPaint = Paint()
      ..color = AppTheme.secondaryLight.withValues(alpha: 0.1 * animationValue)
      ..style = PaintingStyle.fill;

    canvas.drawCircle(
      Offset(size.width * 0.2, size.height * 0.3),
      50 * animationValue,
      nebulaPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
