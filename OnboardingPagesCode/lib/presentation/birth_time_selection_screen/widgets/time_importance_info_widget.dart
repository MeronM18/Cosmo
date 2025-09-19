import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class TimeImportanceInfoWidget extends StatefulWidget {
  const TimeImportanceInfoWidget({Key? key}) : super(key: key);

  @override
  State<TimeImportanceInfoWidget> createState() =>
      _TimeImportanceInfoWidgetState();
}

class _TimeImportanceInfoWidgetState extends State<TimeImportanceInfoWidget>
    with SingleTickerProviderStateMixin {
  bool _isExpanded = false;
  late AnimationController _animationController;
  late Animation<double> _expandAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: Duration(milliseconds: 300),
      vsync: this,
    );
    _expandAnimation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _toggleExpansion() {
    setState(() {
      _isExpanded = !_isExpanded;
      if (_isExpanded) {
        _animationController.forward();
      } else {
        _animationController.reverse();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppTheme.lightTheme.colorScheme.surface.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppTheme.inactive.withValues(alpha: 0.2),
          width: 1,
        ),
      ),
      child: Column(
        children: [
          GestureDetector(
            onTap: _toggleExpansion,
            child: Padding(
              padding: EdgeInsets.all(4.w),
              child: Row(
                children: [
                  CustomIconWidget(
                    iconName: 'info_outline',
                    color: AppTheme.lightTheme.colorScheme.secondary,
                    size: 5.w,
                  ),
                  SizedBox(width: 3.w),
                  Expanded(
                    child: Text(
                      'Why is birth time important?',
                      style: AppTheme.lightTheme.textTheme.titleSmall?.copyWith(
                        color: AppTheme.lightTheme.colorScheme.secondary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  AnimatedRotation(
                    turns: _isExpanded ? 0.5 : 0,
                    duration: Duration(milliseconds: 300),
                    child: CustomIconWidget(
                      iconName: 'keyboard_arrow_down',
                      color: AppTheme.lightTheme.colorScheme.secondary,
                      size: 5.w,
                    ),
                  ),
                ],
              ),
            ),
          ),
          SizeTransition(
            sizeFactor: _expandAnimation,
            child: Container(
              width: double.infinity,
              padding: EdgeInsets.fromLTRB(4.w, 0, 4.w, 4.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    height: 1,
                    color: AppTheme.inactive.withValues(alpha: 0.2),
                    margin: EdgeInsets.only(bottom: 3.h),
                  ),
                  _buildInfoPoint(
                    'Rising Sign Accuracy',
                    'Your exact birth time determines your rising sign, which changes every 2 hours and affects your entire chart.',
                  ),
                  SizedBox(height: 2.h),
                  _buildInfoPoint(
                    'House Placements',
                    'Precise timing ensures accurate placement of planets in astrological houses, crucial for detailed readings.',
                  ),
                  SizedBox(height: 2.h),
                  _buildInfoPoint(
                    'Moon Phase',
                    'The exact lunar phase at your birth influences your emotional patterns and intuitive abilities.',
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoPoint(String title, String description) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 1.5.w,
          height: 1.5.w,
          margin: EdgeInsets.only(top: 1.h),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppTheme.lightTheme.colorScheme.secondary,
          ),
        ),
        SizedBox(width: 3.w),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: AppTheme.lightTheme.textTheme.titleSmall?.copyWith(
                  color: AppTheme.lightTheme.colorScheme.onSurface,
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(height: 0.5.h),
              Text(
                description,
                style: AppTheme.lightTheme.textTheme.bodySmall?.copyWith(
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
}
