import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';
import './widgets/cosmic_background_widget.dart';
import './widgets/date_picker_widget.dart';
import './widgets/navigation_buttons_widget.dart';
import './widgets/progress_indicator_widget.dart';

class BirthDateSelectionScreen extends StatefulWidget {
  const BirthDateSelectionScreen({super.key});

  @override
  State<BirthDateSelectionScreen> createState() =>
      _BirthDateSelectionScreenState();
}

class _BirthDateSelectionScreenState extends State<BirthDateSelectionScreen> {
  DateTime? _selectedDate;
  String? _validationError;

  @override
  void initState() {
    super.initState();
    // Set status bar style for cosmic theme
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
        systemNavigationBarColor: AppTheme.backgroundLight,
        systemNavigationBarIconBrightness: Brightness.light,
      ),
    );
  }

  void _onDateSelected(DateTime date) {
    setState(() {
      _selectedDate = date;
      _validationError = _validateDate(date);
    });

    // Provide haptic feedback on successful selection
    if (_validationError == null) {
      HapticFeedback.selectionClick();
    }
  }

  String? _validateDate(DateTime date) {
    final now = DateTime.now();
    final minDate = DateTime(1900, 1, 1);

    if (date.isAfter(now)) {
      return 'Birth date cannot be in the future';
    }

    if (date.isBefore(minDate)) {
      return 'Please enter a valid birth date';
    }

    // Check if date is too recent (less than 13 years old)
    final thirteenYearsAgo = DateTime(now.year - 13, now.month, now.day);
    if (date.isAfter(thirteenYearsAgo)) {
      return 'You must be at least 13 years old';
    }

    return null;
  }

  void _onBackPressed() {
    HapticFeedback.lightImpact();
    Navigator.pushNamed(context, '/name-input-screen');
  }

  void _onContinuePressed() {
    if (_selectedDate != null && _validationError == null) {
      HapticFeedback.mediumImpact();
      // Store the selected date (in a real app, you'd use state management)
      Navigator.pushNamed(context, '/birth-time-selection-screen');
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isContinueEnabled =
        _selectedDate != null && _validationError == null;

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      body: Stack(
        children: [
          // Cosmic background with star animations
          const CosmicBackgroundWidget(),

          // Main content
          SafeArea(
            child: Column(
              children: [
                SizedBox(height: 2.h),

                // Progress indicator
                const ProgressIndicatorWidget(
                  currentStep: 3,
                  totalSteps: 5,
                ),

                SizedBox(height: 4.h),

                // Main content area
                Expanded(
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    child: Padding(
                      padding: EdgeInsets.symmetric(horizontal: 4.w),
                      child: Column(
                        children: [
                          // Title section
                          Container(
                            width: double.infinity,
                            padding: EdgeInsets.symmetric(horizontal: 2.w),
                            child: Column(
                              children: [
                                Text(
                                  'When were you born?',
                                  textAlign: TextAlign.center,
                                  style: AppTheme
                                      .lightTheme.textTheme.headlineMedium
                                      ?.copyWith(
                                    color: AppTheme.onBackgroundLight,
                                    fontSize: 24.sp,
                                    fontWeight: FontWeight.w600,
                                    shadows: [
                                      Shadow(
                                        color: AppTheme.secondaryLight
                                            .withValues(alpha: 0.3),
                                        blurRadius: 8,
                                        offset: const Offset(0, 2),
                                      ),
                                    ],
                                  ),
                                ),
                                SizedBox(height: 2.h),
                                Text(
                                  'Your birth date is essential for accurate astrological calculations and personalized insights.',
                                  textAlign: TextAlign.center,
                                  style: AppTheme
                                      .lightTheme.textTheme.bodyMedium
                                      ?.copyWith(
                                    color: AppTheme.textSecondary,
                                    fontSize: 14.sp,
                                    height: 1.5,
                                  ),
                                ),
                              ],
                            ),
                          ),

                          SizedBox(height: 4.h),

                          // Date picker section
                          DatePickerWidget(
                            selectedDate: _selectedDate,
                            onDateSelected: _onDateSelected,
                          ),

                          SizedBox(height: 2.h),

                          // Validation error display
                          if (_validationError != null)
                            Container(
                              width: 85.w,
                              padding: EdgeInsets.symmetric(
                                horizontal: 4.w,
                                vertical: 1.h,
                              ),
                              decoration: BoxDecoration(
                                color:
                                    AppTheme.errorLight.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: AppTheme.errorLight
                                      .withValues(alpha: 0.3),
                                  width: 1,
                                ),
                              ),
                              child: Row(
                                children: [
                                  CustomIconWidget(
                                    iconName: 'error_outline',
                                    color: AppTheme.errorLight,
                                    size: 20,
                                  ),
                                  SizedBox(width: 2.w),
                                  Expanded(
                                    child: Text(
                                      _validationError!,
                                      style: AppTheme
                                          .lightTheme.textTheme.bodySmall
                                          ?.copyWith(
                                        color: AppTheme.errorLight,
                                        fontSize: 12.sp,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),

                          SizedBox(height: 4.h),

                          // Mystical quote or tip
                          Container(
                            width: 85.w,
                            padding: EdgeInsets.all(3.w),
                            decoration: BoxDecoration(
                              color:
                                  AppTheme.surfaceLight.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: AppTheme.secondaryLight
                                    .withValues(alpha: 0.2),
                                width: 1,
                              ),
                            ),
                            child: Row(
                              children: [
                                CustomIconWidget(
                                  iconName: 'auto_awesome',
                                  color: AppTheme.secondaryLight,
                                  size: 24,
                                ),
                                SizedBox(width: 3.w),
                                Expanded(
                                  child: Text(
                                    'The stars were aligned in a unique way on your birth date, creating your cosmic blueprint.',
                                    style: AppTheme
                                        .lightTheme.textTheme.bodySmall
                                        ?.copyWith(
                                      color: AppTheme.textSecondary,
                                      fontSize: 12.sp,
                                      fontStyle: FontStyle.italic,
                                      height: 1.4,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),

                          SizedBox(height: 6.h),
                        ],
                      ),
                    ),
                  ),
                ),

                // Navigation buttons
                NavigationButtonsWidget(
                  onBackPressed: _onBackPressed,
                  onContinuePressed: _onContinuePressed,
                  isContinueEnabled: isContinueEnabled,
                ),

                SizedBox(height: 2.h),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
