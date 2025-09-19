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
      width: 80.w,
      height: 6.h,
      padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.h),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(totalSteps, (index) {
              final isCompleted = index < currentStep;
              final isCurrent = index == currentStep - 1;

              return Container(
                width: 12.w,
                height: 0.8.h,
                decoration: BoxDecoration(
                  color: isCompleted || isCurrent
                      ? AppTheme.secondaryLight
                      : AppTheme.inactive.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(4),
                  boxShadow: isCompleted || isCurrent
                      ? [
                          BoxShadow(
                            color:
                                AppTheme.secondaryLight.withValues(alpha: 0.3),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ]
                      : null,
                ),
              );
            }),
          ),
          SizedBox(height: 1.h),
          Text(
            'Step $currentStep of $totalSteps',
            style: AppTheme.lightTheme.textTheme.bodySmall?.copyWith(
              color: AppTheme.textSecondary,
              fontSize: 11.sp,
            ),
          ),
        ],
      ),
    );
  }
}
