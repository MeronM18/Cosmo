import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';
import '../../../theme/app_theme.dart';

class PersonalizedGreetingWidget extends StatefulWidget {
  const PersonalizedGreetingWidget({Key? key}) : super(key: key);

  @override
  State<PersonalizedGreetingWidget> createState() =>
      _PersonalizedGreetingWidgetState();
}

class _PersonalizedGreetingWidgetState extends State<PersonalizedGreetingWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;
  String userName = '';

  @override
  void initState() {
    super.initState();

    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeInOut,
    ));

    _loadUserName();
  }

  Future<void> _loadUserName() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final name = prefs.getString('user_name') ?? 'Cosmic Traveler';
      setState(() {
        userName = name;
      });

      // Start fade-in animation after loading name
      Future.delayed(const Duration(milliseconds: 300), () {
        _fadeController.forward();
      });
    } catch (e) {
      setState(() {
        userName = 'Cosmic Traveler';
      });
      _fadeController.forward();
    }
  }

  @override
  void dispose() {
    _fadeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _fadeAnimation,
      builder: (context, child) {
        return Opacity(
          opacity: _fadeAnimation.value,
          child: Transform.translate(
            offset: Offset(0, 20 * (1 - _fadeAnimation.value)),
            child: Column(
              children: [
                // Main greeting with glow effect
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.secondaryLight.withValues(alpha: 0.3),
                        blurRadius: 20,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: Text(
                    'Welcome to your cosmic journey, $userName!',
                    textAlign: TextAlign.center,
                    style:
                        AppTheme.lightTheme.textTheme.headlineMedium?.copyWith(
                      color: AppTheme.onPrimaryLight,
                      fontWeight: FontWeight.w600,
                      height: 1.3,
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

                SizedBox(height: 3.h),

                // Subtitle with mystical styling
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 6.w),
                  child: Text(
                    'Your celestial profile has been created and the stars are aligned for your personalized journey.',
                    textAlign: TextAlign.center,
                    style: AppTheme.lightTheme.textTheme.bodyLarge?.copyWith(
                      color: AppTheme.textSecondary,
                      height: 1.5,
                      fontWeight: FontWeight.w300,
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
