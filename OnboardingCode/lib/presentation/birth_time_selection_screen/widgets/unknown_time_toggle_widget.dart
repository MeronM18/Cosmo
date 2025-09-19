import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';
import '../../../theme/app_theme.dart';

class UnknownTimeToggleWidget extends StatelessWidget {
  final bool isUnknownTime;
  final Function(bool) onToggle;

  const UnknownTimeToggleWidget({
    Key? key,
    required this.isUnknownTime,
    required this.onToggle,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => onToggle(!isUnknownTime),
      child: Container(
        width: double.infinity,
        padding: EdgeInsets.all(4.w),
        decoration: BoxDecoration(
          color: isUnknownTime
              ? AppTheme.lightTheme.colorScheme.secondary.withValues(alpha: 0.1)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isUnknownTime
                ? AppTheme.lightTheme.colorScheme.secondary
                : AppTheme.inactive.withValues(alpha: 0.3),
            width: 1.5,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 6.w,
              height: 6.w,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isUnknownTime
                      ? AppTheme.lightTheme.colorScheme.secondary
                      : AppTheme.inactive,
                  width: 2,
                ),
                color: isUnknownTime
                    ? AppTheme.lightTheme.colorScheme.secondary
                    : Colors.transparent,
              ),
              child: isUnknownTime
                  ? Icon(
                      Icons.check,
                      color: AppTheme.lightTheme.colorScheme.onSecondary,
                      size: 3.w,
                    )
                  : null,
            ),
            SizedBox(width: 4.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "I don't know my birth time",
                    style: AppTheme.lightTheme.textTheme.titleMedium?.copyWith(
                      color: isUnknownTime
                          ? AppTheme.lightTheme.colorScheme.secondary
                          : AppTheme.lightTheme.colorScheme.onSurface,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  SizedBox(height: 0.5.h),
                  Text(
                    "We'll use approximate calculations for your reading",
                    style: AppTheme.lightTheme.textTheme.bodySmall?.copyWith(
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
