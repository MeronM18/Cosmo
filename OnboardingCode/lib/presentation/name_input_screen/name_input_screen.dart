import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class NameInputScreen extends StatefulWidget {
  const NameInputScreen({Key? key}) : super(key: key);

  @override
  State<NameInputScreen> createState() => _NameInputScreenState();
}

class _NameInputScreenState extends State<NameInputScreen>
    with TickerProviderStateMixin {
  final TextEditingController _nameController = TextEditingController();
  final FocusNode _nameFocusNode = FocusNode();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  bool _isLoading = false;
  bool _hasError = false;
  String _errorMessage = '';
  late AnimationController _starAnimationController;
  late AnimationController _shakeAnimationController;
  late Animation<double> _shakeAnimation;
  late Animation<double> _starAnimation;

  @override
  void initState() {
    super.initState();
    _initializeAnimations();
    _loadSavedName();

    // Auto-focus the input field
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _nameFocusNode.requestFocus();
    });
  }

  void _initializeAnimations() {
    _starAnimationController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    )..repeat();

    _shakeAnimationController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );

    _starAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _starAnimationController,
      curve: Curves.linear,
    ));

    _shakeAnimation = Tween<double>(
      begin: 0.0,
      end: 10.0,
    ).animate(CurvedAnimation(
      parent: _shakeAnimationController,
      curve: Curves.elasticIn,
    ));
  }

  Future<void> _loadSavedName() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedName = prefs.getString('user_name');
      if (savedName != null && savedName.isNotEmpty) {
        setState(() {
          _nameController.text = savedName;
        });
      }
    } catch (e) {
      // Silent fail - continue without saved data
    }
  }

  Future<void> _saveName() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_name', _nameController.text.trim());
    } catch (e) {
      // Silent fail - continue without saving
    }
  }

  void _validateAndContinue() async {
    if (_formKey.currentState?.validate() ?? false) {
      setState(() {
        _isLoading = true;
        _hasError = false;
      });

      // Haptic feedback
      HapticFeedback.lightImpact();

      // Save the name
      await _saveName();

      // Simulate processing time for better UX
      await Future.delayed(const Duration(milliseconds: 800));

      if (mounted) {
        setState(() {
          _isLoading = false;
        });

        // Navigate to next screen
        Navigator.pushNamed(context, '/birth-date-selection-screen');
      }
    } else {
      _triggerShakeAnimation();
      HapticFeedback.heavyImpact();
    }
  }

  void _triggerShakeAnimation() {
    _shakeAnimationController.forward().then((_) {
      _shakeAnimationController.reverse();
    });
  }

  String? _validateName(String? value) {
    if (value == null || value.trim().isEmpty) {
      setState(() {
        _hasError = true;
        _errorMessage = 'Please enter your name';
      });
      return _errorMessage;
    }

    if (value.trim().length < 2) {
      setState(() {
        _hasError = true;
        _errorMessage = 'Name must be at least 2 characters';
      });
      return _errorMessage;
    }

    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    final nameRegex = RegExp(r"^[a-zA-ZÀ-ÿ\s\-']+$");
    if (!nameRegex.hasMatch(value.trim())) {
      setState(() {
        _hasError = true;
        _errorMessage = 'Please enter a valid name';
      });
      return _errorMessage;
    }

    setState(() {
      _hasError = false;
      _errorMessage = '';
    });
    return null;
  }

  void _goBack() {
    HapticFeedback.lightImpact();
    Navigator.pop(context);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _nameFocusNode.dispose();
    _starAnimationController.dispose();
    _shakeAnimationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      body: SafeArea(
        child: Stack(
          children: [
            // Cosmic background with animated stars
            _buildCosmicBackground(),

            // Main content
            Column(
              children: [
                // Progress indicator and back button
                _buildTopSection(),

                // Main content area
                Expanded(
                  child: _buildMainContent(),
                ),

                // Continue button
                _buildBottomSection(),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCosmicBackground() {
    return Container(
      width: double.infinity,
      height: double.infinity,
      decoration: BoxDecoration(
        gradient: RadialGradient(
          center: const Alignment(0.3, -0.5),
          radius: 1.2,
          colors: [
            AppTheme.primaryVariantLight.withValues(alpha: 0.8),
            AppTheme.backgroundLight,
            AppTheme.backgroundOverlay,
          ],
          stops: const [0.0, 0.6, 1.0],
        ),
      ),
      child: AnimatedBuilder(
        animation: _starAnimation,
        builder: (context, child) {
          return CustomPaint(
            painter: StarFieldPainter(_starAnimation.value),
            size: Size.infinite,
          );
        },
      ),
    );
  }

  Widget _buildTopSection() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
      child: Row(
        children: [
          // Back button
          GestureDetector(
            onTap: _goBack,
            child: Container(
              width: 10.w,
              height: 10.w,
              decoration: BoxDecoration(
                color: AppTheme.surfaceLight.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: AppTheme.inactive.withValues(alpha: 0.3),
                  width: 1,
                ),
              ),
              child: Center(
                child: CustomIconWidget(
                  iconName: 'arrow_back_ios',
                  color: AppTheme.onSurfaceLight,
                  size: 5.w,
                ),
              ),
            ),
          ),

          SizedBox(width: 4.w),

          // Progress indicator
          Expanded(
            child: _buildProgressIndicator(),
          ),
        ],
      ),
    );
  }

  Widget _buildProgressIndicator() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Step 2 of 5',
          style: AppTheme.lightTheme.textTheme.bodySmall?.copyWith(
            color: AppTheme.textSecondary,
            fontSize: 11.sp,
          ),
        ),
        SizedBox(height: 1.h),
        Container(
          height: 0.5.h,
          decoration: BoxDecoration(
            color: AppTheme.inactive.withValues(alpha: 0.3),
            borderRadius: BorderRadius.circular(4),
          ),
          child: FractionallySizedBox(
            alignment: Alignment.centerLeft,
            widthFactor: 0.4, // 2/5 = 0.4
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppTheme.secondaryLight,
                    AppTheme.secondaryVariantLight,
                  ],
                ),
                borderRadius: BorderRadius.circular(4),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.secondaryLight.withValues(alpha: 0.3),
                    blurRadius: 4,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildMainContent() {
    return SingleChildScrollView(
      padding: EdgeInsets.symmetric(horizontal: 6.w),
      child: Column(
        children: [
          SizedBox(height: 8.h),

          // Welcome prompt
          Text(
            'What should we call you?',
            style: AppTheme.lightTheme.textTheme.headlineMedium?.copyWith(
              color: AppTheme.onBackgroundLight,
              fontSize: 24.sp,
              fontWeight: FontWeight.w600,
            ),
            textAlign: TextAlign.center,
          ),

          SizedBox(height: 2.h),

          Text(
            'Your name helps us personalize your cosmic journey',
            style: AppTheme.lightTheme.textTheme.bodyMedium?.copyWith(
              color: AppTheme.textSecondary,
              fontSize: 14.sp,
            ),
            textAlign: TextAlign.center,
          ),

          SizedBox(height: 6.h),

          // Name input field
          AnimatedBuilder(
            animation: _shakeAnimation,
            builder: (context, child) {
              return Transform.translate(
                offset: Offset(_shakeAnimation.value, 0),
                child: _buildNameInputField(),
              );
            },
          ),

          SizedBox(height: 2.h),

          // Error message
          if (_hasError)
            Container(
              width: double.infinity,
              padding: EdgeInsets.symmetric(horizontal: 2.w),
              child: Text(
                _errorMessage,
                style: AppTheme.lightTheme.textTheme.bodySmall?.copyWith(
                  color: AppTheme.errorLight,
                  fontSize: 12.sp,
                ),
                textAlign: TextAlign.left,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildNameInputField() {
    return Form(
      key: _formKey,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          boxShadow: _nameFocusNode.hasFocus
              ? [
                  BoxShadow(
                    color: AppTheme.secondaryLight.withValues(alpha: 0.2),
                    blurRadius: 20,
                    spreadRadius: 2,
                    offset: const Offset(0, 4),
                  ),
                ]
              : [],
        ),
        child: TextFormField(
          controller: _nameController,
          focusNode: _nameFocusNode,
          validator: _validateName,
          textCapitalization: TextCapitalization.words,
          keyboardType: TextInputType.name,
          textInputAction: TextInputAction.next,
          style: AppTheme.lightTheme.textTheme.bodyLarge?.copyWith(
            color: AppTheme.onSurfaceLight,
            fontSize: 16.sp,
            fontWeight: FontWeight.w500,
          ),
          decoration: InputDecoration(
            labelText: 'Your Name',
            labelStyle: AppTheme.lightTheme.textTheme.bodyMedium?.copyWith(
              color: _nameFocusNode.hasFocus
                  ? AppTheme.secondaryLight
                  : AppTheme.textSecondary,
              fontSize: 14.sp,
            ),
            hintText: 'Enter your full name',
            hintStyle: AppTheme.lightTheme.textTheme.bodyMedium?.copyWith(
              color: AppTheme.inactive,
              fontSize: 16.sp,
            ),
            fillColor: AppTheme.surfaceLight.withValues(alpha: 0.6),
            filled: true,
            border: UnderlineInputBorder(
              borderSide: BorderSide(
                color: AppTheme.inactive.withValues(alpha: 0.5),
                width: 1,
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            enabledBorder: UnderlineInputBorder(
              borderSide: BorderSide(
                color: AppTheme.inactive.withValues(alpha: 0.5),
                width: 1,
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            focusedBorder: UnderlineInputBorder(
              borderSide: BorderSide(
                color: AppTheme.secondaryLight,
                width: 2,
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            errorBorder: UnderlineInputBorder(
              borderSide: BorderSide(
                color: AppTheme.errorLight,
                width: 1,
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            focusedErrorBorder: UnderlineInputBorder(
              borderSide: BorderSide(
                color: AppTheme.errorLight,
                width: 2,
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            contentPadding: EdgeInsets.symmetric(
              horizontal: 4.w,
              vertical: 2.h,
            ),
            prefixIcon: Container(
              margin: EdgeInsets.only(left: 3.w, right: 2.w),
              child: CustomIconWidget(
                iconName: 'person_outline',
                color: _nameFocusNode.hasFocus
                    ? AppTheme.secondaryLight
                    : AppTheme.inactive,
                size: 5.w,
              ),
            ),
            suffixIcon: _nameController.text.isNotEmpty
                ? GestureDetector(
                    onTap: () {
                      _nameController.clear();
                      setState(() {});
                    },
                    child: Container(
                      margin: EdgeInsets.only(right: 3.w),
                      child: CustomIconWidget(
                        iconName: 'clear',
                        color: AppTheme.inactive,
                        size: 5.w,
                      ),
                    ),
                  )
                : null,
          ),
          onChanged: (value) {
            setState(() {});
          },
          onFieldSubmitted: (_) {
            if (_nameController.text.trim().isNotEmpty) {
              _validateAndContinue();
            }
          },
        ),
      ),
    );
  }

  Widget _buildBottomSection() {
    return Container(
      padding: EdgeInsets.all(6.w),
      child: Column(
        children: [
          // Continue button
          SizedBox(
            width: double.infinity,
            height: 6.h,
            child: ElevatedButton(
              onPressed: _nameController.text.trim().isEmpty || _isLoading
                  ? null
                  : _validateAndContinue,
              style: ElevatedButton.styleFrom(
                backgroundColor: _nameController.text.trim().isEmpty
                    ? AppTheme.inactive
                    : AppTheme.secondaryLight,
                foregroundColor: AppTheme.onSecondaryLight,
                elevation: _nameController.text.trim().isEmpty ? 0 : 8,
                shadowColor: AppTheme.secondaryLight.withValues(alpha: 0.3),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                padding: EdgeInsets.symmetric(vertical: 1.5.h),
              ),
              child: _isLoading
                  ? SizedBox(
                      width: 5.w,
                      height: 5.w,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          AppTheme.onSecondaryLight,
                        ),
                      ),
                    )
                  : Text(
                      'Continue',
                      style:
                          AppTheme.lightTheme.textTheme.titleMedium?.copyWith(
                        color: AppTheme.onSecondaryLight,
                        fontSize: 16.sp,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
            ),
          ),

          SizedBox(height: 2.h),

          // Skip option
          TextButton(
            onPressed: _isLoading
                ? null
                : () {
                    HapticFeedback.lightImpact();
                    Navigator.pushNamed(
                        context, '/birth-date-selection-screen');
                  },
            child: Text(
              'Skip for now',
              style: AppTheme.lightTheme.textTheme.bodyMedium?.copyWith(
                color: AppTheme.textSecondary,
                fontSize: 14.sp,
                decoration: TextDecoration.underline,
                decorationColor: AppTheme.textSecondary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class StarFieldPainter extends CustomPainter {
  final double animationValue;

  StarFieldPainter(this.animationValue);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.6)
      ..strokeWidth = 1;

    // Generate consistent star positions
    final random = DateTime.now().millisecondsSinceEpoch;
    for (int i = 0; i < 50; i++) {
      final x = (random * i * 7) % size.width;
      final y = (random * i * 11) % size.height;

      // Animate opacity based on animation value
      final opacity =
          (0.3 + 0.7 * ((animationValue + i * 0.1) % 1.0)).clamp(0.0, 1.0);
      paint.color = Colors.white.withValues(alpha: opacity * 0.6);

      canvas.drawCircle(Offset(x, y), 1, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
