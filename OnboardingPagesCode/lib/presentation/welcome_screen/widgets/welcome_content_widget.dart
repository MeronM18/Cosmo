import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';
import '../../../theme/app_theme.dart';

class WelcomeContentWidget extends StatefulWidget {
  const WelcomeContentWidget({super.key});

  @override
  State<WelcomeContentWidget> createState() => _WelcomeContentWidgetState();
}

class _WelcomeContentWidgetState extends State<WelcomeContentWidget>
    with TickerProviderStateMixin {
  late AnimationController _fadeController;
  late AnimationController _glowController;
  late Animation<double> _fadeAnimation;
  late Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );

    _glowController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeInOut,
    ));

    _glowAnimation = Tween<double>(
      begin: 0.3,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _glowController,
      curve: Curves.easeInOut,
    ));

    // Start animations
    _fadeController.forward();
    _glowController.repeat(reverse: true);
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _glowController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: Listenable.merge([_fadeAnimation, _glowAnimation]),
      builder: (context, child) {
        return Opacity(
          opacity: _fadeAnimation.value,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Welcome title with breathing glow effect
              Container(
                padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
                decoration: BoxDecoration(
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.secondaryLight.withValues(
                        alpha: _glowAnimation.value * 0.3,
                      ),
                      blurRadius: 20 * _glowAnimation.value,
                      spreadRadius: 5 * _glowAnimation.value,
                    ),
                  ],
                ),
                child: Text(
                  'Welcome to Your\nCosmic Journey',
                  textAlign: TextAlign.center,
                  style: AppTheme.lightTheme.textTheme.headlineLarge?.copyWith(
                    fontSize: 18.sp,
                    color: AppTheme.onBackgroundLight,
                    height: 1.2,
                    shadows: [
                      Shadow(
                        color: AppTheme.secondaryLight.withValues(alpha: 0.5),
                        blurRadius: 10,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                ),
              ),

              SizedBox(height: 4.h),

              // Description text
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 8.w),
                child: Text(
                  'Discover the mysteries of the cosmos through personalized astrology readings tailored just for you. Your celestial journey begins with understanding your unique cosmic blueprint.',
                  textAlign: TextAlign.center,
                  style: AppTheme.lightTheme.textTheme.bodyLarge?.copyWith(
                    fontSize: 14.sp,
                    color: AppTheme.textSecondary,
                    height: 1.5,
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
