import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';
import './widgets/action_buttons_widget.dart';
import './widgets/cosmic_background_widget.dart';
import './widgets/progress_indicator_widget.dart';
import './widgets/welcome_content_widget.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  void _handleBeginReading() {
    Navigator.pushNamed(context, '/name-input-screen');
  }

  void _handleLearnMore() {
    _showLearnMoreDialog();
  }

  void _showLearnMoreDialog() {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (BuildContext context) {
        return Dialog(
          backgroundColor: AppTheme.dialogLight,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          child: Container(
            constraints: BoxConstraints(
              maxWidth: 85.w,
              maxHeight: 70.h,
            ),
            padding: EdgeInsets.all(6.w),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Dialog title
                Text(
                  'About Cosmo Astrology',
                  style: AppTheme.lightTheme.textTheme.headlineSmall?.copyWith(
                    fontSize: 16.sp,
                    color: AppTheme.onSurfaceLight,
                  ),
                  textAlign: TextAlign.center,
                ),

                SizedBox(height: 3.h),

                // Dialog content
                Flexible(
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildFeatureItem(
                          'Personalized Readings',
                          'Get detailed astrology insights based on your unique birth chart and cosmic alignment.',
                        ),
                        SizedBox(height: 2.h),
                        _buildFeatureItem(
                          'Daily Guidance',
                          'Receive daily horoscopes and cosmic guidance tailored to your astrological profile.',
                        ),
                        SizedBox(height: 2.h),
                        _buildFeatureItem(
                          'Compatibility Analysis',
                          'Discover relationship compatibility through detailed astrological matching.',
                        ),
                        SizedBox(height: 2.h),
                        _buildFeatureItem(
                          'Secure & Private',
                          'Your personal information is encrypted and never shared with third parties.',
                        ),
                      ],
                    ),
                  ),
                ),

                SizedBox(height: 4.h),

                // Close button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Navigator.of(context).pop(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.secondaryLight,
                      foregroundColor: AppTheme.onSecondaryLight,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      padding: EdgeInsets.symmetric(vertical: 1.5.h),
                    ),
                    child: Text(
                      'Got it',
                      style: AppTheme.lightTheme.textTheme.labelLarge?.copyWith(
                        fontSize: 14.sp,
                        fontWeight: FontWeight.w500,
                      ),
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

  Widget _buildFeatureItem(String title, String description) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          margin: EdgeInsets.only(top: 0.5.h, right: 3.w),
          child: CustomIconWidget(
            iconName: 'star',
            color: AppTheme.secondaryLight,
            size: 16,
          ),
        ),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: AppTheme.lightTheme.textTheme.titleSmall?.copyWith(
                  fontSize: 13.sp,
                  color: AppTheme.onSurfaceLight,
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(height: 0.5.h),
              Text(
                description,
                style: AppTheme.lightTheme.textTheme.bodySmall?.copyWith(
                  fontSize: 12.sp,
                  color: AppTheme.textSecondary,
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      body: SafeArea(
        child: Stack(
          children: [
            // Cosmic background with animations
            const CosmicBackgroundWidget(),

            // Main content
            Column(
              children: [
                // Progress indicator at top
                const ProgressIndicatorWidget(
                  currentStep: 1,
                  totalSteps: 5,
                ),

                // Main content area
                Expanded(
                  child: Container(
                    width: double.infinity,
                    padding: EdgeInsets.symmetric(horizontal: 4.w),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Welcome content with fade-in animation
                        const WelcomeContentWidget(),

                        SizedBox(height: 8.h),

                        // Action buttons
                        ActionButtonsWidget(
                          onBeginReading: _handleBeginReading,
                          onLearnMore: _handleLearnMore,
                        ),
                      ],
                    ),
                  ),
                ),

                SizedBox(height: 4.h),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
