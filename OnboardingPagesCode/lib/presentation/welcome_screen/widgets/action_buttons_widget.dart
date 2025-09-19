import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class ActionButtonsWidget extends StatefulWidget {
  final VoidCallback onBeginReading;
  final VoidCallback onLearnMore;

  const ActionButtonsWidget({
    super.key,
    required this.onBeginReading,
    required this.onLearnMore,
  });

  @override
  State<ActionButtonsWidget> createState() => _ActionButtonsWidgetState();
}

class _ActionButtonsWidgetState extends State<ActionButtonsWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _glowController;
  late Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();
    _glowController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );

    _glowAnimation = Tween<double>(
      begin: 0.5,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _glowController,
      curve: Curves.easeInOut,
    ));

    _glowController.repeat(reverse: true);
  }

  @override
  void dispose() {
    _glowController.dispose();
    super.dispose();
  }

  void _handleBeginReading() {
    // Gentle haptic feedback
    HapticFeedback.lightImpact();
    widget.onBeginReading();
  }

  void _handleLearnMore() {
    HapticFeedback.selectionClick();
    widget.onLearnMore();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 6.w),
      child: Column(
        children: [
          // Primary CTA Button with glow effect
          AnimatedBuilder(
            animation: _glowAnimation,
            builder: (context, child) {
              return Container(
                width: double.infinity,
                height: 6.h,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.secondaryLight.withValues(
                        alpha: _glowAnimation.value * 0.4,
                      ),
                      blurRadius: 15 * _glowAnimation.value,
                      spreadRadius: 2 * _glowAnimation.value,
                    ),
                  ],
                ),
                child: ElevatedButton(
                  onPressed: _handleBeginReading,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: AppTheme.backgroundLight,
                    elevation: 0,
                    shadowColor: Colors.transparent,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: EdgeInsets.symmetric(vertical: 2.h),
                  ),
                  child: Text(
                    'Begin Your Reading',
                    style: AppTheme.lightTheme.textTheme.titleMedium?.copyWith(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.backgroundLight,
                    ),
                  ),
                ),
              );
            },
          ),

          SizedBox(height: 3.h),

          // Secondary Learn More button
          TextButton(
            onPressed: _handleLearnMore,
            style: TextButton.styleFrom(
              foregroundColor: AppTheme.textSecondary,
              padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.5.h),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Learn More',
                  style: AppTheme.lightTheme.textTheme.labelLarge?.copyWith(
                    fontSize: 14.sp,
                    color: AppTheme.textSecondary,
                    decoration: TextDecoration.underline,
                    decorationColor:
                        AppTheme.textSecondary.withValues(alpha: 0.6),
                  ),
                ),
                SizedBox(width: 1.w),
                CustomIconWidget(
                  iconName: 'arrow_forward_ios',
                  color: AppTheme.textSecondary,
                  size: 12,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
