import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class InformationSummaryWidget extends StatefulWidget {
  const InformationSummaryWidget({Key? key}) : super(key: key);

  @override
  State<InformationSummaryWidget> createState() =>
      _InformationSummaryWidgetState();
}

class _InformationSummaryWidgetState extends State<InformationSummaryWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _glowController;
  late Animation<double> _glowAnimation;

  Map<String, String> userInfo = {
    'birthDate': '',
    'birthTime': '',
    'birthLocation': '',
  };

  @override
  void initState() {
    super.initState();

    _glowController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );

    _glowAnimation = Tween<double>(
      begin: 0.3,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _glowController,
      curve: Curves.easeInOut,
    ));

    _loadUserInformation();
    _glowController.repeat(reverse: true);
  }

  Future<void> _loadUserInformation() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      setState(() {
        userInfo = {
          'birthDate': prefs.getString('birth_date') ?? 'Not specified',
          'birthTime': prefs.getString('birth_time') ?? 'Not specified',
          'birthLocation': prefs.getString('birth_location') ?? 'Not specified',
        };
      });
    } catch (e) {
      setState(() {
        userInfo = {
          'birthDate': 'Not specified',
          'birthTime': 'Not specified',
          'birthLocation': 'Not specified',
        };
      });
    }
  }

  @override
  void dispose() {
    _glowController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _glowAnimation,
      builder: (context, child) {
        return Container(
          margin: EdgeInsets.symmetric(horizontal: 4.w),
          padding: EdgeInsets.all(4.w),
          decoration: BoxDecoration(
            color: AppTheme.surfaceLight,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: AppTheme.secondaryLight
                  .withValues(alpha: _glowAnimation.value * 0.5),
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: AppTheme.secondaryLight
                    .withValues(alpha: _glowAnimation.value * 0.2),
                blurRadius: 15,
                spreadRadius: 2,
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  CustomIconWidget(
                    iconName: 'star',
                    color: AppTheme.secondaryLight,
                    size: 6.w,
                  ),
                  SizedBox(width: 3.w),
                  Text(
                    'Your Cosmic Profile',
                    style: AppTheme.lightTheme.textTheme.titleLarge?.copyWith(
                      color: AppTheme.onSurfaceLight,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),

              SizedBox(height: 3.h),

              // Birth Date
              _buildInfoRow(
                icon: 'calendar_today',
                label: 'Birth Date',
                value: userInfo['birthDate']!,
              ),

              SizedBox(height: 2.h),

              // Birth Time
              _buildInfoRow(
                icon: 'access_time',
                label: 'Birth Time',
                value: userInfo['birthTime']!,
              ),

              SizedBox(height: 2.h),

              // Birth Location
              _buildInfoRow(
                icon: 'location_on',
                label: 'Birth Location',
                value: userInfo['birthLocation']!,
              ),

              SizedBox(height: 3.h),

              // Mystical divider
              Container(
                height: 1,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Colors.transparent,
                      AppTheme.secondaryLight.withValues(alpha: 0.5),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),

              SizedBox(height: 2.h),

              // Preview text
              Text(
                'Your personalized astrological insights are ready to be discovered. The cosmic energies have been calculated based on your unique birth information.',
                textAlign: TextAlign.center,
                style: AppTheme.lightTheme.textTheme.bodyMedium?.copyWith(
                  color: AppTheme.textSecondary,
                  height: 1.5,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildInfoRow({
    required String icon,
    required String label,
    required String value,
  }) {
    return Row(
      children: [
        Container(
          padding: EdgeInsets.all(2.w),
          decoration: BoxDecoration(
            color: AppTheme.secondaryLight.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: CustomIconWidget(
            iconName: icon,
            color: AppTheme.secondaryLight,
            size: 5.w,
          ),
        ),
        SizedBox(width: 4.w),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: AppTheme.lightTheme.textTheme.labelMedium?.copyWith(
                  color: AppTheme.textSecondary,
                  fontWeight: FontWeight.w400,
                ),
              ),
              SizedBox(height: 0.5.h),
              Text(
                value,
                style: AppTheme.lightTheme.textTheme.bodyMedium?.copyWith(
                  color: AppTheme.onSurfaceLight,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
