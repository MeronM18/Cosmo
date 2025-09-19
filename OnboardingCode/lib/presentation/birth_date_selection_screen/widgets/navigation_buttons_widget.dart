import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class NavigationButtonsWidget extends StatelessWidget {
  final VoidCallback onBackPressed;
  final VoidCallback? onContinuePressed;
  final bool isContinueEnabled;

  const NavigationButtonsWidget({
    super.key,
    required this.onBackPressed,
    this.onContinuePressed,
    this.isContinueEnabled = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
      child: Row(
        children: [
          // Back button
          Expanded(
            flex: 1,
            child: OutlinedButton.icon(
              onPressed: onBackPressed,
              icon: CustomIconWidget(
                iconName: 'arrow_back',
                color: AppTheme.secondaryLight,
                size: 20,
              ),
              label: Text(
                'Back',
                style: TextStyle(
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w500,
                ),
              ),
              style: OutlinedButton.styleFrom(
                padding: EdgeInsets.symmetric(vertical: 1.8.h),
                side: BorderSide(
                  color: AppTheme.secondaryLight.withValues(alpha: 0.7),
                  width: 1.5,
                ),
              ),
            ),
          ),
          SizedBox(width: 4.w),

          // Continue button
          Expanded(
            flex: 2,
            child: ElevatedButton.icon(
              onPressed: isContinueEnabled ? onContinuePressed : null,
              icon: CustomIconWidget(
                iconName: 'arrow_forward',
                color: isContinueEnabled
                    ? AppTheme.onSecondaryLight
                    : AppTheme.inactive,
                size: 20,
              ),
              label: Text(
                'Continue',
                style: TextStyle(
                  fontSize: 16.sp,
                  fontWeight: FontWeight.w600,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: isContinueEnabled
                    ? AppTheme.secondaryLight
                    : AppTheme.inactive.withValues(alpha: 0.3),
                foregroundColor: isContinueEnabled
                    ? AppTheme.onSecondaryLight
                    : AppTheme.inactive,
                padding: EdgeInsets.symmetric(vertical: 1.8.h),
                elevation: isContinueEnabled ? 4.0 : 0,
                shadowColor: isContinueEnabled
                    ? AppTheme.secondaryLight.withValues(alpha: 0.3)
                    : Colors.transparent,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
