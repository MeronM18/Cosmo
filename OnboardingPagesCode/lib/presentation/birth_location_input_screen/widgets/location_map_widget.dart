import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class LocationMapWidget extends StatefulWidget {
  final String? selectedLocation;
  final Function(LatLng) onLocationTapped;
  final bool isVisible;

  const LocationMapWidget({
    Key? key,
    this.selectedLocation,
    required this.onLocationTapped,
    this.isVisible = false,
  }) : super(key: key);

  @override
  State<LocationMapWidget> createState() => _LocationMapWidgetState();
}

class _LocationMapWidgetState extends State<LocationMapWidget> {
  GoogleMapController? _mapController;
  Set<Marker> _markers = {};
  LatLng _currentLocation = const LatLng(40.7128, -74.0060); // Default to NYC

  @override
  void initState() {
    super.initState();
    _updateLocationFromName();
  }

  @override
  void didUpdateWidget(LocationMapWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.selectedLocation != oldWidget.selectedLocation) {
      _updateLocationFromName();
    }
  }

  void _updateLocationFromName() {
    if (widget.selectedLocation != null &&
        widget.selectedLocation!.isNotEmpty) {
      // In a real app, you would use geocoding to convert location name to coordinates
      // For now, we'll use some sample coordinates for demonstration
      final coordinates = _getCoordinatesForLocation(widget.selectedLocation!);
      setState(() {
        _currentLocation = coordinates;
        _markers = {
          Marker(
            markerId: const MarkerId('selected_location'),
            position: coordinates,
            icon: BitmapDescriptor.defaultMarkerWithHue(
                BitmapDescriptor.hueViolet),
            infoWindow: InfoWindow(
              title: 'Birth Location',
              snippet: widget.selectedLocation,
            ),
          ),
        };
      });

      _mapController?.animateCamera(
        CameraUpdate.newLatLngZoom(coordinates, 10.0),
      );
    }
  }

  LatLng _getCoordinatesForLocation(String location) {
    // Sample coordinates for common cities - in a real app, use geocoding service
    final locationMap = {
      'New York': const LatLng(40.7128, -74.0060),
      'London': const LatLng(51.5074, -0.1278),
      'Paris': const LatLng(48.8566, 2.3522),
      'Tokyo': const LatLng(35.6762, 139.6503),
      'Sydney': const LatLng(-33.8688, 151.2093),
      'Los Angeles': const LatLng(34.0522, -118.2437),
      'Chicago': const LatLng(41.8781, -87.6298),
      'Miami': const LatLng(25.7617, -80.1918),
      'San Francisco': const LatLng(37.7749, -122.4194),
      'Boston': const LatLng(42.3601, -71.0589),
    };

    // Try to find exact match first
    for (final entry in locationMap.entries) {
      if (location.toLowerCase().contains(entry.key.toLowerCase())) {
        return entry.value;
      }
    }

    // Default to a central location if not found
    return const LatLng(40.7128, -74.0060);
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.isVisible) {
      return const SizedBox.shrink();
    }

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
      height: widget.isVisible ? 35.h : 0,
      margin: EdgeInsets.symmetric(horizontal: 6.w),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16.0),
        border: Border.all(
          color:
              AppTheme.lightTheme.colorScheme.secondary.withValues(alpha: 0.3),
          width: 1.0,
        ),
        boxShadow: [
          BoxShadow(
            color: AppTheme.shadowLight,
            blurRadius: 8.0,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16.0),
        child: Stack(
          children: [
            GoogleMap(
              onMapCreated: (GoogleMapController controller) {
                _mapController = controller;

                // Apply custom map styling for cosmic theme
                controller.setMapStyle('''
                [
                  {
                    "elementType": "geometry",
                    "stylers": [
                      {
                        "color": "#2B0B3F"
                      }
                    ]
                  },
                  {
                    "elementType": "labels.text.fill",
                    "stylers": [
                      {
                        "color": "#E6D7FF"
                      }
                    ]
                  },
                  {
                    "elementType": "labels.text.stroke",
                    "stylers": [
                      {
                        "color": "#2B0B3F"
                      }
                    ]
                  },
                  {
                    "featureType": "water",
                    "elementType": "geometry",
                    "stylers": [
                      {
                        "color": "#4A1A5C"
                      }
                    ]
                  }
                ]
                ''');
              },
              initialCameraPosition: CameraPosition(
                target: _currentLocation,
                zoom: 10.0,
              ),
              markers: _markers,
              onTap: (LatLng location) {
                widget.onLocationTapped(location);
                setState(() {
                  _markers = {
                    Marker(
                      markerId: const MarkerId('tapped_location'),
                      position: location,
                      icon: BitmapDescriptor.defaultMarkerWithHue(
                          BitmapDescriptor.hueViolet),
                      infoWindow: const InfoWindow(
                        title: 'Selected Location',
                        snippet: 'Tap to confirm',
                      ),
                    ),
                  };
                });
              },
              myLocationEnabled: false,
              myLocationButtonEnabled: false,
              zoomControlsEnabled: false,
              mapToolbarEnabled: false,
            ),

            // Cosmic overlay for mystical effect
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16.0),
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      AppTheme.lightTheme.colorScheme.secondary
                          .withValues(alpha: 0.1),
                      Colors.transparent,
                      AppTheme.lightTheme.colorScheme.primary
                          .withValues(alpha: 0.1),
                    ],
                    stops: const [0.0, 0.5, 1.0],
                  ),
                ),
              ),
            ),

            // Map controls
            Positioned(
              top: 2.h,
              right: 4.w,
              child: Column(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      color: AppTheme.lightTheme.colorScheme.surface
                          .withValues(alpha: 0.9),
                      borderRadius: BorderRadius.circular(8.0),
                      border: Border.all(
                        color: AppTheme.lightTheme.colorScheme.secondary
                            .withValues(alpha: 0.3),
                      ),
                    ),
                    child: IconButton(
                      onPressed: () {
                        _mapController?.animateCamera(
                          CameraUpdate.zoomIn(),
                        );
                      },
                      icon: CustomIconWidget(
                        iconName: 'add',
                        color: AppTheme.lightTheme.colorScheme.secondary,
                        size: 5.w,
                      ),
                    ),
                  ),
                  SizedBox(height: 1.h),
                  Container(
                    decoration: BoxDecoration(
                      color: AppTheme.lightTheme.colorScheme.surface
                          .withValues(alpha: 0.9),
                      borderRadius: BorderRadius.circular(8.0),
                      border: Border.all(
                        color: AppTheme.lightTheme.colorScheme.secondary
                            .withValues(alpha: 0.3),
                      ),
                    ),
                    child: IconButton(
                      onPressed: () {
                        _mapController?.animateCamera(
                          CameraUpdate.zoomOut(),
                        );
                      },
                      icon: CustomIconWidget(
                        iconName: 'remove',
                        color: AppTheme.lightTheme.colorScheme.secondary,
                        size: 5.w,
                      ),
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

  @override
  void dispose() {
    _mapController?.dispose();
    super.dispose();
  }
}
