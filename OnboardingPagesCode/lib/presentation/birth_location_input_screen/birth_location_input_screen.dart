import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';
import './widgets/cosmic_background_widget.dart';
import './widgets/location_map_widget.dart';
import './widgets/location_search_field_widget.dart';
import './widgets/progress_indicator_widget.dart';

class BirthLocationInputScreen extends StatefulWidget {
  const BirthLocationInputScreen({Key? key}) : super(key: key);

  @override
  State<BirthLocationInputScreen> createState() =>
      _BirthLocationInputScreenState();
}

class _BirthLocationInputScreenState extends State<BirthLocationInputScreen>
    with TickerProviderStateMixin {
  late AnimationController _fadeAnimationController;
  late AnimationController _slideAnimationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  String? _selectedLocation;
  bool _isSearching = false;
  bool _showMap = false;
  List<Map<String, dynamic>> _locationSuggestions = [];

  // Mock location data for demonstration
  final List<Map<String, dynamic>> _mockLocations = [
    {
      'name': 'New York, NY, USA',
      'country': 'United States',
      'population': 8419000,
      'coordinates': {'lat': 40.7128, 'lng': -74.0060},
    },
    {
      'name': 'London, England, UK',
      'country': 'United Kingdom',
      'population': 8982000,
      'coordinates': {'lat': 51.5074, 'lng': -0.1278},
    },
    {
      'name': 'Paris, France',
      'country': 'France',
      'population': 2161000,
      'coordinates': {'lat': 48.8566, 'lng': 2.3522},
    },
    {
      'name': 'Tokyo, Japan',
      'country': 'Japan',
      'population': 13960000,
      'coordinates': {'lat': 35.6762, 'lng': 139.6503},
    },
    {
      'name': 'Sydney, Australia',
      'country': 'Australia',
      'population': 5312000,
      'coordinates': {'lat': -33.8688, 'lng': 151.2093},
    },
    {
      'name': 'Los Angeles, CA, USA',
      'country': 'United States',
      'population': 3971000,
      'coordinates': {'lat': 34.0522, 'lng': -118.2437},
    },
    {
      'name': 'Chicago, IL, USA',
      'country': 'United States',
      'population': 2716000,
      'coordinates': {'lat': 41.8781, 'lng': -87.6298},
    },
    {
      'name': 'Miami, FL, USA',
      'country': 'United States',
      'population': 467963,
      'coordinates': {'lat': 25.7617, 'lng': -80.1918},
    },
    {
      'name': 'San Francisco, CA, USA',
      'country': 'United States',
      'population': 884363,
      'coordinates': {'lat': 37.7749, 'lng': -122.4194},
    },
    {
      'name': 'Boston, MA, USA',
      'country': 'United States',
      'population': 695506,
      'coordinates': {'lat': 42.3601, 'lng': -71.0589},
    },
  ];

  @override
  void initState() {
    super.initState();
    _initializeAnimations();
    _requestLocationPermission();
  }

  void _initializeAnimations() {
    _fadeAnimationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _slideAnimationController = AnimationController(
      duration: const Duration(milliseconds: 600),
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
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _slideAnimationController,
      curve: Curves.easeOutCubic,
    ));

    _fadeAnimationController.forward();
    _slideAnimationController.forward();
  }

  Future<void> _requestLocationPermission() async {
    try {
      final status = await Permission.location.request();
      if (status.isGranted) {
        // Location permission granted
      }
    } catch (e) {
      // Handle permission error silently
    }
  }

  void _handleSearchChanged(String query) {
    if (query.isEmpty) {
      setState(() {
        _locationSuggestions = [];
        _isSearching = false;
      });
      return;
    }

    setState(() {
      _isSearching = true;
    });

    // Simulate API delay
    Future.delayed(const Duration(milliseconds: 500), () {
      if (mounted) {
        final suggestions = _mockLocations
            .where((location) =>
                (location['name'] as String)
                    .toLowerCase()
                    .contains(query.toLowerCase()) ||
                (location['country'] as String)
                    .toLowerCase()
                    .contains(query.toLowerCase()))
            .take(5)
            .toList();

        setState(() {
          _locationSuggestions = suggestions;
          _isSearching = false;
        });
      }
    });
  }

  void _handleLocationSelected(String location) {
    setState(() {
      _selectedLocation = location;
      _locationSuggestions = [];
    });

    // Haptic feedback
    HapticFeedback.lightImpact();
  }

  void _toggleMapView() {
    setState(() {
      _showMap = !_showMap;
    });
    HapticFeedback.selectionClick();
  }

  void _handleMapLocationTapped(LatLng location) {
    // In a real app, you would reverse geocode this location
    final locationName =
        'Custom Location (${location.latitude.toStringAsFixed(4)}, ${location.longitude.toStringAsFixed(4)})';
    _handleLocationSelected(locationName);
  }

  void _handleBackPressed() {
    HapticFeedback.lightImpact();
    Navigator.pushReplacementNamed(context, '/birth-time-selection-screen');
  }

  void _handleCompleteSetup() {
    if (_selectedLocation == null || _selectedLocation!.isEmpty) {
      _showLocationRequiredDialog();
      return;
    }

    HapticFeedback.mediumImpact();
    Navigator.pushReplacementNamed(context, '/onboarding-complete-screen');
  }

  void _showLocationRequiredDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: AppTheme.lightTheme.colorScheme.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16.0),
          ),
          title: Text(
            'Location Required',
            style: AppTheme.lightTheme.textTheme.titleLarge?.copyWith(
              color: AppTheme.lightTheme.colorScheme.onSurface,
            ),
          ),
          content: Text(
            'Please select your birth location to continue with your astrological profile setup.',
            style: AppTheme.lightTheme.textTheme.bodyMedium?.copyWith(
              color: AppTheme.textSecondary,
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(
                'OK',
                style: TextStyle(
                  color: AppTheme.lightTheme.colorScheme.secondary,
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  @override
  void dispose() {
    _fadeAnimationController.dispose();
    _slideAnimationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.lightTheme.colorScheme.primary,
      body: CosmicBackgroundWidget(
        child: SafeArea(
          child: FadeTransition(
            opacity: _fadeAnimation,
            child: SlideTransition(
              position: _slideAnimation,
              child: Column(
                children: [
                  // Progress indicator
                  const ProgressIndicatorWidget(
                    currentStep: 5,
                    totalSteps: 5,
                  ),

                  // Main content
                  Expanded(
                    child: SingleChildScrollView(
                      padding: EdgeInsets.symmetric(horizontal: 6.w),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SizedBox(height: 4.h),

                          // Title and subtitle
                          Text(
                            'Where were you born?',
                            style: AppTheme.lightTheme.textTheme.headlineMedium
                                ?.copyWith(
                              color: AppTheme.lightTheme.colorScheme.onPrimary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          SizedBox(height: 2.h),
                          Text(
                            'Your birth location is essential for accurate astrological calculations. The cosmic energies vary by geographic location.',
                            style: AppTheme.lightTheme.textTheme.bodyLarge
                                ?.copyWith(
                              color: AppTheme.textSecondary,
                              height: 1.5,
                            ),
                          ),
                          SizedBox(height: 4.h),

                          // Location search field
                          LocationSearchFieldWidget(
                            onLocationSelected: _handleLocationSelected,
                            onSearchChanged: _handleSearchChanged,
                            selectedLocation: _selectedLocation,
                            isLoading: _isSearching,
                            suggestions: _locationSuggestions,
                          ),

                          SizedBox(height: 3.h),

                          // Map toggle button
                          Center(
                            child: TextButton.icon(
                              onPressed: _toggleMapView,
                              icon: CustomIconWidget(
                                iconName: _showMap ? 'map' : 'map_outlined',
                                color:
                                    AppTheme.lightTheme.colorScheme.secondary,
                                size: 5.w,
                              ),
                              label: Text(
                                _showMap ? 'Hide Map' : 'Show Map',
                                style: AppTheme.lightTheme.textTheme.bodyMedium
                                    ?.copyWith(
                                  color:
                                      AppTheme.lightTheme.colorScheme.secondary,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              style: TextButton.styleFrom(
                                padding: EdgeInsets.symmetric(
                                  horizontal: 4.w,
                                  vertical: 1.5.h,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12.0),
                                  side: BorderSide(
                                    color: AppTheme
                                        .lightTheme.colorScheme.secondary
                                        .withValues(alpha: 0.3),
                                  ),
                                ),
                              ),
                            ),
                          ),

                          SizedBox(height: 2.h),

                          // Map widget
                          LocationMapWidget(
                            selectedLocation: _selectedLocation,
                            onLocationTapped: _handleMapLocationTapped,
                            isVisible: _showMap,
                          ),

                          SizedBox(height: 4.h),

                          // Selected location display
                          if (_selectedLocation != null &&
                              _selectedLocation!.isNotEmpty) ...[
                            Container(
                              width: double.infinity,
                              padding: EdgeInsets.all(4.w),
                              decoration: BoxDecoration(
                                color: AppTheme.lightTheme.colorScheme.secondary
                                    .withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(12.0),
                                border: Border.all(
                                  color: AppTheme
                                      .lightTheme.colorScheme.secondary
                                      .withValues(alpha: 0.3),
                                ),
                              ),
                              child: Row(
                                children: [
                                  CustomIconWidget(
                                    iconName: 'location_on',
                                    color: AppTheme
                                        .lightTheme.colorScheme.secondary,
                                    size: 6.w,
                                  ),
                                  SizedBox(width: 3.w),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Selected Birth Location',
                                          style: AppTheme
                                              .lightTheme.textTheme.labelMedium
                                              ?.copyWith(
                                            color: AppTheme.textSecondary,
                                          ),
                                        ),
                                        SizedBox(height: 0.5.h),
                                        Text(
                                          _selectedLocation!,
                                          style: AppTheme
                                              .lightTheme.textTheme.bodyLarge
                                              ?.copyWith(
                                            color: AppTheme.lightTheme
                                                .colorScheme.onSurface,
                                            fontWeight: FontWeight.w500,
                                          ),
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ],
                                    ),
                                  ),
                                  CustomIconWidget(
                                    iconName: 'check_circle',
                                    color: AppTheme
                                        .lightTheme.colorScheme.secondary,
                                    size: 6.w,
                                  ),
                                ],
                              ),
                            ),
                            SizedBox(height: 4.h),
                          ],
                        ],
                      ),
                    ),
                  ),

                  // Navigation buttons
                  Container(
                    padding: EdgeInsets.all(6.w),
                    child: Row(
                      children: [
                        // Back button
                        Expanded(
                          flex: 1,
                          child: OutlinedButton(
                            onPressed: _handleBackPressed,
                            style: OutlinedButton.styleFrom(
                              padding: EdgeInsets.symmetric(vertical: 2.h),
                              side: BorderSide(
                                color:
                                    AppTheme.lightTheme.colorScheme.secondary,
                                width: 1.5,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12.0),
                              ),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                CustomIconWidget(
                                  iconName: 'arrow_back',
                                  color:
                                      AppTheme.lightTheme.colorScheme.secondary,
                                  size: 5.w,
                                ),
                                SizedBox(width: 2.w),
                                Text(
                                  'Back',
                                  style: AppTheme.lightTheme.textTheme.bodyLarge
                                      ?.copyWith(
                                    color: AppTheme
                                        .lightTheme.colorScheme.secondary,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        SizedBox(width: 4.w),

                        // Complete setup button
                        Expanded(
                          flex: 2,
                          child: ElevatedButton(
                            onPressed: _handleCompleteSetup,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: _selectedLocation != null &&
                                      _selectedLocation!.isNotEmpty
                                  ? AppTheme.lightTheme.colorScheme.secondary
                                  : AppTheme.inactive,
                              foregroundColor:
                                  AppTheme.lightTheme.colorScheme.onSecondary,
                              padding: EdgeInsets.symmetric(vertical: 2.h),
                              elevation: _selectedLocation != null &&
                                      _selectedLocation!.isNotEmpty
                                  ? 4.0
                                  : 0.0,
                              shadowColor: AppTheme.shadowLight,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12.0),
                              ),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  'Complete Setup',
                                  style: AppTheme.lightTheme.textTheme.bodyLarge
                                      ?.copyWith(
                                    color: AppTheme
                                        .lightTheme.colorScheme.onSecondary,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                SizedBox(width: 2.w),
                                CustomIconWidget(
                                  iconName: 'check',
                                  color: AppTheme
                                      .lightTheme.colorScheme.onSecondary,
                                  size: 5.w,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
