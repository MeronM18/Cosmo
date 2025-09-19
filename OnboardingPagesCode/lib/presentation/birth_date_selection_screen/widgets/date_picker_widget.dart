import 'dart:io';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class DatePickerWidget extends StatefulWidget {
  final DateTime? selectedDate;
  final Function(DateTime) onDateSelected;

  const DatePickerWidget({
    super.key,
    this.selectedDate,
    required this.onDateSelected,
  });

  @override
  State<DatePickerWidget> createState() => _DatePickerWidgetState();
}

class _DatePickerWidgetState extends State<DatePickerWidget> {
  late DateTime _currentDate;
  final DateTime _minDate = DateTime(1900, 1, 1);
  final DateTime _maxDate = DateTime.now();

  @override
  void initState() {
    super.initState();
    _currentDate = widget.selectedDate ?? DateTime(1990, 1, 1);
  }

  void _showMaterialDatePicker() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _currentDate,
      firstDate: _minDate,
      lastDate: _maxDate,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.dark(
              primary: AppTheme.secondaryLight,
              onPrimary: AppTheme.onSecondaryLight,
              surface: AppTheme.surfaceLight,
              onSurface: AppTheme.onSurfaceLight,
            ), dialogTheme: DialogThemeData(backgroundColor: AppTheme.surfaceLight),
          ),
          child: child!,
        );
      },
    );

    if (picked != null && picked != _currentDate) {
      setState(() {
        _currentDate = picked;
      });
      widget.onDateSelected(picked);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 85.w,
      constraints: BoxConstraints(
        minHeight: 25.h,
        maxHeight: 35.h,
      ),
      child: Column(
        children: [
          // Selected date display
          Container(
            width: double.infinity,
            padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
            decoration: BoxDecoration(
              color: AppTheme.surfaceLight.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: AppTheme.secondaryLight.withValues(alpha: 0.3),
                width: 1,
              ),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.secondaryLight.withValues(alpha: 0.1),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Text(
              _formatDate(_currentDate),
              textAlign: TextAlign.center,
              style: AppTheme.lightTheme.textTheme.titleLarge?.copyWith(
                color: AppTheme.onSurfaceLight,
                fontSize: 18.sp,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          SizedBox(height: 2.h),

          // Date picker
          Expanded(
            child: Platform.isIOS
                ? _buildIOSDatePicker()
                : _buildAndroidDatePicker(),
          ),
        ],
      ),
    );
  }

  Widget _buildIOSDatePicker() {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surfaceLight.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Theme(
        data: Theme.of(context).copyWith(
          cupertinoOverrideTheme: CupertinoThemeData(
            textTheme: CupertinoTextThemeData(
              dateTimePickerTextStyle: TextStyle(
                color: AppTheme.onSurfaceLight,
                fontSize: 16.sp,
              ),
            ),
          ),
        ),
        child: CupertinoDatePicker(
          mode: CupertinoDatePickerMode.date,
          initialDateTime: _currentDate,
          minimumDate: _minDate,
          maximumDate: _maxDate,
          onDateTimeChanged: (DateTime date) {
            setState(() {
              _currentDate = date;
            });
            widget.onDateSelected(date);
          },
        ),
      ),
    );
  }

  Widget _buildAndroidDatePicker() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppTheme.surfaceLight.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CustomIconWidget(
            iconName: 'calendar_today',
            color: AppTheme.secondaryLight,
            size: 48,
          ),
          SizedBox(height: 2.h),
          Text(
            'Tap to select your birth date',
            style: AppTheme.lightTheme.textTheme.bodyMedium?.copyWith(
              color: AppTheme.textSecondary,
              fontSize: 14.sp,
            ),
          ),
          SizedBox(height: 2.h),
          ElevatedButton.icon(
            onPressed: _showMaterialDatePicker,
            icon: CustomIconWidget(
              iconName: 'edit_calendar',
              color: AppTheme.onSecondaryLight,
              size: 20,
            ),
            label: Text(
              'Choose Date',
              style: TextStyle(
                fontSize: 14.sp,
                fontWeight: FontWeight.w500,
              ),
            ),
            style: ElevatedButton.styleFrom(
              padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 1.5.h),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];

    return '${months[date.month - 1]} ${date.day}, ${date.year}';
  }
}
