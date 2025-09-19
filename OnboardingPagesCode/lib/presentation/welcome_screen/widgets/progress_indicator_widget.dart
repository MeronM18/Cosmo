import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';
import '../../../theme/app_theme.dart';

class ProgressIndicatorWidget extends StatelessWidget {
  final int currentStep;
  final int totalSteps;

  const ProgressIndicatorWidget({
    super.key,
    required this.currentStep,
    required this.totalSteps,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
      child: Column(
        children: [
          // Progress dots
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(totalSteps, (index) {
              final isActive = index < currentStep;
              final isCurrent = index == currentStep - 1;

              return Container(
                margin: EdgeInsets.symmetric(horizontal: 1.w),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  width: isCurrent ? 8.w : 4.w,
                  height: 1.h,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10),
                    color: isActive || isCurrent
                        ? AppTheme.secondaryLight
                        : AppTheme.inactive.withValues(alpha: 0.3),
                    boxShadow: isCurrent
                        ? [
                            BoxShadow(
                              color: AppTheme.secondaryLight
                                  .withValues(alpha: 0.4),
                              blurRadius: 8,
                              spreadRadius: 2,
                            ),
                          ]
                        : null,
                  ),
                ),
              );
            }),
          ),

          SizedBox(height: 1.h),

          // Step indicator text
          Text(
            'Step $currentStep of $totalSteps',
            style: AppTheme.lightTheme.textTheme.labelMedium?.copyWith(
              fontSize: 11.sp,
              color: AppTheme.textSecondary,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }
}
