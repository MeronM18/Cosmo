import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';
import './widgets/progress_indicator_widget.dart';
import './widgets/time_importance_info_widget.dart';
import './widgets/time_picker_widget.dart';
import './widgets/unknown_time_toggle_widget.dart';

class BirthTimeSelectionScreen extends StatefulWidget {
  const BirthTimeSelectionScreen({Key? key}) : super(key: key);

  @override
  State<BirthTimeSelectionScreen> createState() =>
      _BirthTimeSelectionScreenState();
}

class _BirthTimeSelectionScreenState extends State<BirthTimeSelectionScreen>
    with TickerProviderStateMixin {
  TimeOfDay? _selectedTime;
  bool _isUnknownTime = false;
  late AnimationController _fadeAnimationController;
  late AnimationController _slideAnimationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _initializeAnimations();
    _startEntryAnimation();
  }

  void _initializeAnimations() {
    _fadeAnimationController = AnimationController(
      duration: Duration(milliseconds: 800),
      vsync: this,
    );

    _slideAnimationController = AnimationController(
      duration: Duration(milliseconds: 600),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _fadeAnimationController,
      curve: Curves.easeOut,
    ));

    _slideAnimation = Tween<Offset>(
      begin: Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _slideAnimationController,
      curve: Curves.easeOutCubic,
    ));
  }

  void _startEntryAnimation() {
    Future.delayed(Duration(milliseconds: 100), () {
      _fadeAnimationController.forward();
      _slideAnimationController.forward();
    });
  }

  @override
  void dispose() {
    _fadeAnimationController.dispose();
    _slideAnimationController.dispose();
    super.dispose();
  }

  void _onTimeSelected(TimeOfDay time) {
    setState(() {
      _selectedTime = time;
      _isUnknownTime = false;
    });
    HapticFeedback.lightImpact();
  }

  void _onUnknownTimeToggle(bool isUnknown) {
    setState(() {
      _isUnknownTime = isUnknown;
      if (isUnknown) {
        _selectedTime = null;
      }
    });
    HapticFeedback.selectionClick();
  }

  void _navigateBack() {
    HapticFeedback.lightImpact();
    Navigator.pop(context);
  }

  void _navigateNext() {
    if (_selectedTime != null || _isUnknownTime) {
      HapticFeedback.mediumImpact();
      Navigator.pushNamed(context, '/birth-location-input-screen');
    }
  }

  bool get _canContinue => _selectedTime != null || _isUnknownTime;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.lightTheme.scaffoldBackgroundColor,
      body: Container(
        decoration: BoxDecoration(
          gradient: RadialGradient(
            center: Alignment.topCenter,
            radius: 1.5,
            colors: [
              AppTheme.lightTheme.colorScheme.primary.withValues(alpha: 0.8),
              AppTheme.lightTheme.scaffoldBackgroundColor,
              AppTheme.backgroundOverlay,
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              _buildAppBar(),
              Expanded(
                child: SingleChildScrollView(
                  physics: BouncingScrollPhysics(),
                  padding: EdgeInsets.symmetric(horizontal: 6.w),
                  child: FadeTransition(
                    opacity: _fadeAnimation,
                    child: SlideTransition(
                      position: _slideAnimation,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          SizedBox(height: 4.h),
                          ProgressIndicatorWidget(
                            currentStep: 4,
                            totalSteps: 5,
                          ),
                          SizedBox(height: 6.h),
                          _buildMainQuestion(),
                          SizedBox(height: 2.h),
                          _buildSubtext(),
                          SizedBox(height: 6.h),
                          _buildTimeSelectionSection(),
                          SizedBox(height: 4.h),
                          UnknownTimeToggleWidget(
                            isUnknownTime: _isUnknownTime,
                            onToggle: _onUnknownTimeToggle,
                          ),
                          SizedBox(height: 4.h),
                          TimeImportanceInfoWidget(),
                          SizedBox(height: 8.h),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              _buildBottomNavigation(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAppBar() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
      child: Row(
        children: [
          GestureDetector(
            onTap: _navigateBack,
            child: Container(
              padding: EdgeInsets.all(2.w),
              decoration: BoxDecoration(
                color: AppTheme.lightTheme.colorScheme.surface
                    .withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(12),
              ),
              child: CustomIconWidget(
                iconName: 'arrow_back_ios',
                color: AppTheme.lightTheme.colorScheme.onSurface,
                size: 5.w,
              ),
            ),
          ),
          Expanded(
            child: Center(
              child: Text(
                'Birth Time',
                style: AppTheme.lightTheme.textTheme.titleLarge?.copyWith(
                  color: AppTheme.lightTheme.colorScheme.onSurface,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
          SizedBox(width: 9.w), // Balance the back button
        ],
      ),
    );
  }

  Widget _buildMainQuestion() {
    return Text(
      'What time were you born?',
      textAlign: TextAlign.center,
      style: AppTheme.lightTheme.textTheme.headlineMedium?.copyWith(
        color: AppTheme.lightTheme.colorScheme.onSurface,
        fontWeight: FontWeight.w600,
        height: 1.2,
      ),
    );
  }

  Widget _buildSubtext() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 4.w),
      child: Text(
        'Your exact birth time helps us create the most accurate astrological reading for you.',
        textAlign: TextAlign.center,
        style: AppTheme.lightTheme.textTheme.bodyLarge?.copyWith(
          color: AppTheme.textSecondary,
          height: 1.4,
        ),
      ),
    );
  }

  Widget _buildTimeSelectionSection() {
    return AnimatedOpacity(
      opacity: _isUnknownTime ? 0.4 : 1.0,
      duration: Duration(milliseconds: 300),
      child: AnimatedContainer(
        duration: Duration(milliseconds: 300),
        child: _isUnknownTime
            ? _buildDisabledTimeDisplay()
            : TimePickerWidget(
                selectedTime: _selectedTime,
                onTimeSelected: _onTimeSelected,
              ),
      ),
    );
  }

  Widget _buildDisabledTimeDisplay() {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 4.h),
      decoration: BoxDecoration(
        color: AppTheme.inactive.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppTheme.inactive.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Time Selection',
                style: AppTheme.lightTheme.textTheme.bodySmall?.copyWith(
                  color: AppTheme.inactive,
                ),
              ),
              SizedBox(height: 1.h),
              Text(
                'Unknown',
                style: AppTheme.lightTheme.textTheme.headlineSmall?.copyWith(
                  color: AppTheme.inactive,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          CustomIconWidget(
            iconName: 'access_time',
            color: AppTheme.inactive,
            size: 6.w,
          ),
        ],
      ),
    );
  }

  Widget _buildBottomNavigation() {
    return Container(
      padding: EdgeInsets.all(6.w),
      decoration: BoxDecoration(
        color: AppTheme.lightTheme.scaffoldBackgroundColor,
        boxShadow: [
          BoxShadow(
            color: AppTheme.shadowLight,
            blurRadius: 10,
            offset: Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            flex: 1,
            child: OutlinedButton(
              onPressed: _navigateBack,
              style: OutlinedButton.styleFrom(
                padding: EdgeInsets.symmetric(vertical: 3.h),
                side: BorderSide(
                  color: AppTheme.lightTheme.colorScheme.secondary,
                  width: 1.5,
                ),
              ),
              child: Text(
                'Back',
                style: AppTheme.lightTheme.textTheme.titleMedium?.copyWith(
                  color: AppTheme.lightTheme.colorScheme.secondary,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),
          SizedBox(width: 4.w),
          Expanded(
            flex: 2,
            child: AnimatedContainer(
              duration: Duration(milliseconds: 300),
              child: ElevatedButton(
                onPressed: _canContinue ? _navigateNext : null,
                style: ElevatedButton.styleFrom(
                  padding: EdgeInsets.symmetric(vertical: 3.h),
                  backgroundColor: _canContinue
                      ? AppTheme.lightTheme.colorScheme.secondary
                      : AppTheme.inactive,
                  foregroundColor: _canContinue
                      ? AppTheme.lightTheme.colorScheme.onSecondary
                      : AppTheme.lightTheme.colorScheme.onSurface
                          .withValues(alpha: 0.5),
                  elevation: _canContinue ? 4 : 0,
                  shadowColor: _canContinue
                      ? AppTheme.lightTheme.colorScheme.secondary
                          .withValues(alpha: 0.3)
                      : Colors.transparent,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Continue',
                      style:
                          AppTheme.lightTheme.textTheme.titleMedium?.copyWith(
                        color: _canContinue
                            ? AppTheme.lightTheme.colorScheme.onSecondary
                            : AppTheme.lightTheme.colorScheme.onSurface
                                .withValues(alpha: 0.5),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    SizedBox(width: 2.w),
                    CustomIconWidget(
                      iconName: 'arrow_forward_ios',
                      color: _canContinue
                          ? AppTheme.lightTheme.colorScheme.onSecondary
                          : AppTheme.lightTheme.colorScheme.onSurface
                              .withValues(alpha: 0.5),
                      size: 4.w,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
