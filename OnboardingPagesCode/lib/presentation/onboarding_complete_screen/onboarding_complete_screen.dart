import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';
import './widgets/action_buttons_widget.dart';
import './widgets/cosmic_celebration_widget.dart';
import './widgets/information_summary_widget.dart';
import './widgets/personalized_greeting_widget.dart';

class OnboardingCompleteScreen extends StatefulWidget {
  const OnboardingCompleteScreen({Key? key}) : super(key: key);

  @override
  State<OnboardingCompleteScreen> createState() =>
      _OnboardingCompleteScreenState();
}

class _OnboardingCompleteScreenState extends State<OnboardingCompleteScreen>
    with TickerProviderStateMixin {
  late AnimationController _backgroundController;
  late Animation<double> _backgroundAnimation;

  @override
  void initState() {
    super.initState();

    _backgroundController = AnimationController(
      duration: const Duration(seconds: 4),
      vsync: this,
    );

    _backgroundAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _backgroundController,
      curve: Curves.easeInOut,
    ));

    _backgroundController.forward();

    // Trigger celebration haptic feedback
    Future.delayed(const Duration(milliseconds: 500), () {
      HapticFeedback.heavyImpact();
    });
  }

  @override
  void dispose() {
    _backgroundController.dispose();
    super.dispose();
  }

  void _handleExploreChart() {
    // Navigate to main dashboard (placeholder for now)
    Navigator.pushNamedAndRemoveUntil(
      context,
      '/dashboard',
      (route) => false,
    );
  }

  void _handleCustomizePreferences() {
    // Navigate to preferences screen (placeholder for now)
    Navigator.pushNamed(context, '/preferences');
  }

  void _handleBackNavigation() {
    Navigator.pushReplacementNamed(context, '/birth-location-input-screen');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      body: AnimatedBuilder(
        animation: _backgroundAnimation,
        builder: (context, child) {
          return Container(
            decoration: BoxDecoration(
              gradient: RadialGradient(
                center: Alignment.topCenter,
                radius: 1.5,
                colors: [
                  AppTheme.primaryVariantLight
                      .withValues(alpha: 0.8 * _backgroundAnimation.value),
                  AppTheme.backgroundLight,
                  AppTheme.backgroundOverlay,
                ],
                stops: const [0.0, 0.6, 1.0],
              ),
            ),
            child: SafeArea(
              child: Column(
                children: [
                  // App Bar with back navigation
                  Container(
                    padding:
                        EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.h),
                    child: Row(
                      children: [
                        IconButton(
                          onPressed: _handleBackNavigation,
                          icon: CustomIconWidget(
                            iconName: 'arrow_back',
                            color: AppTheme.onBackgroundLight,
                            size: 6.w,
                          ),
                        ),
                        Expanded(
                          child: Text(
                            'Journey Complete',
                            textAlign: TextAlign.center,
                            style: AppTheme.lightTheme.textTheme.titleLarge
                                ?.copyWith(
                              color: AppTheme.onBackgroundLight,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                        SizedBox(width: 12.w), // Balance the back button
                      ],
                    ),
                  ),

                  // Scrollable content
                  Expanded(
                    child: SingleChildScrollView(
                      physics: const BouncingScrollPhysics(),
                      child: Column(
                        children: [
                          SizedBox(height: 2.h),

                          // Cosmic celebration animation
                          const CosmicCelebrationWidget(),

                          SizedBox(height: 3.h),

                          // Personalized greeting
                          const PersonalizedGreetingWidget(),

                          SizedBox(height: 4.h),

                          // Information summary
                          const InformationSummaryWidget(),

                          SizedBox(height: 4.h),

                          // Action buttons
                          ActionButtonsWidget(
                            onExploreChart: _handleExploreChart,
                            onCustomizePreferences: _handleCustomizePreferences,
                          ),

                          SizedBox(height: 2.h),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
