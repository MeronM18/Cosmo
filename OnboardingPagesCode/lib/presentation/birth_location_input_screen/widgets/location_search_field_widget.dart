import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class LocationSearchFieldWidget extends StatefulWidget {
  final Function(String) onLocationSelected;
  final Function(String) onSearchChanged;
  final String? selectedLocation;
  final bool isLoading;
  final List<Map<String, dynamic>> suggestions;

  const LocationSearchFieldWidget({
    Key? key,
    required this.onLocationSelected,
    required this.onSearchChanged,
    this.selectedLocation,
    this.isLoading = false,
    this.suggestions = const [],
  }) : super(key: key);

  @override
  State<LocationSearchFieldWidget> createState() =>
      _LocationSearchFieldWidgetState();
}

class _LocationSearchFieldWidgetState extends State<LocationSearchFieldWidget> {
  final TextEditingController _controller = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  bool _showSuggestions = false;

  @override
  void initState() {
    super.initState();
    if (widget.selectedLocation != null) {
      _controller.text = widget.selectedLocation!;
    }
    _focusNode.addListener(() {
      setState(() {
        _showSuggestions = _focusNode.hasFocus && widget.suggestions.isNotEmpty;
      });
    });
  }

  @override
  void didUpdateWidget(LocationSearchFieldWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.selectedLocation != oldWidget.selectedLocation &&
        widget.selectedLocation != null) {
      _controller.text = widget.selectedLocation!;
    }
    if (widget.suggestions != oldWidget.suggestions) {
      setState(() {
        _showSuggestions = _focusNode.hasFocus && widget.suggestions.isNotEmpty;
      });
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          decoration: BoxDecoration(
            color: AppTheme.lightTheme.colorScheme.surface,
            borderRadius: BorderRadius.circular(12.0),
            border: Border.all(
              color: _focusNode.hasFocus
                  ? AppTheme.lightTheme.colorScheme.secondary
                  : AppTheme.inactive.withValues(alpha: 0.3),
              width: _focusNode.hasFocus ? 2.0 : 1.0,
            ),
          ),
          child: TextField(
            controller: _controller,
            focusNode: _focusNode,
            style: AppTheme.lightTheme.textTheme.bodyLarge?.copyWith(
              color: AppTheme.lightTheme.colorScheme.onSurface,
            ),
            decoration: InputDecoration(
              hintText: 'Search for your birth city...',
              hintStyle: AppTheme.lightTheme.textTheme.bodyLarge?.copyWith(
                color: AppTheme.inactive,
              ),
              prefixIcon: Padding(
                padding: EdgeInsets.all(3.w),
                child: CustomIconWidget(
                  iconName: 'search',
                  color: _focusNode.hasFocus
                      ? AppTheme.lightTheme.colorScheme.secondary
                      : AppTheme.inactive,
                  size: 5.w,
                ),
              ),
              suffixIcon: widget.isLoading
                  ? Padding(
                      padding: EdgeInsets.all(3.w),
                      child: SizedBox(
                        width: 5.w,
                        height: 5.w,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.0,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            AppTheme.lightTheme.colorScheme.secondary,
                          ),
                        ),
                      ),
                    )
                  : _controller.text.isNotEmpty
                      ? IconButton(
                          onPressed: () {
                            _controller.clear();
                            widget.onSearchChanged('');
                            setState(() {
                              _showSuggestions = false;
                            });
                          },
                          icon: CustomIconWidget(
                            iconName: 'clear',
                            color: AppTheme.inactive,
                            size: 5.w,
                          ),
                        )
                      : null,
              border: InputBorder.none,
              contentPadding: EdgeInsets.symmetric(
                horizontal: 4.w,
                vertical: 2.h,
              ),
            ),
            onChanged: (value) {
              widget.onSearchChanged(value);
              setState(() {
                _showSuggestions =
                    value.isNotEmpty && widget.suggestions.isNotEmpty;
              });
            },
            onTap: () {
              setState(() {
                _showSuggestions = widget.suggestions.isNotEmpty;
              });
            },
          ),
        ),
        if (_showSuggestions && widget.suggestions.isNotEmpty) ...[
          SizedBox(height: 1.h),
          Container(
            constraints: BoxConstraints(
              maxHeight: 30.h,
            ),
            decoration: BoxDecoration(
              color: AppTheme.lightTheme.colorScheme.surface,
              borderRadius: BorderRadius.circular(12.0),
              border: Border.all(
                color: AppTheme.inactive.withValues(alpha: 0.3),
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
            child: ListView.separated(
              shrinkWrap: true,
              padding: EdgeInsets.zero,
              itemCount: widget.suggestions.length,
              separatorBuilder: (context, index) => Divider(
                height: 1,
                color: AppTheme.dividerLight,
              ),
              itemBuilder: (context, index) {
                final suggestion = widget.suggestions[index];
                return ListTile(
                  contentPadding: EdgeInsets.symmetric(
                    horizontal: 4.w,
                    vertical: 1.h,
                  ),
                  leading: CustomIconWidget(
                    iconName: 'location_on',
                    color: AppTheme.lightTheme.colorScheme.secondary,
                    size: 5.w,
                  ),
                  title: Text(
                    suggestion['name'] as String,
                    style: AppTheme.lightTheme.textTheme.bodyLarge?.copyWith(
                      color: AppTheme.lightTheme.colorScheme.onSurface,
                      fontWeight: FontWeight.w500,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  subtitle: suggestion['country'] != null
                      ? Text(
                          suggestion['country'] as String,
                          style:
                              AppTheme.lightTheme.textTheme.bodySmall?.copyWith(
                            color: AppTheme.textSecondary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        )
                      : null,
                  trailing: suggestion['population'] != null
                      ? Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: 2.w,
                            vertical: 0.5.h,
                          ),
                          decoration: BoxDecoration(
                            color: AppTheme.lightTheme.colorScheme.secondary
                                .withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(8.0),
                          ),
                          child: Text(
                            _formatPopulation(suggestion['population'] as int),
                            style: AppTheme.lightTheme.textTheme.labelSmall
                                ?.copyWith(
                              color: AppTheme.lightTheme.colorScheme.secondary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        )
                      : null,
                  onTap: () {
                    final locationName = suggestion['name'] as String;
                    _controller.text = locationName;
                    widget.onLocationSelected(locationName);
                    setState(() {
                      _showSuggestions = false;
                    });
                    _focusNode.unfocus();
                  },
                );
              },
            ),
          ),
        ],
      ],
    );
  }

  String _formatPopulation(int population) {
    if (population >= 1000000) {
      return '${(population / 1000000).toStringAsFixed(1)}M';
    } else if (population >= 1000) {
      return '${(population / 1000).toStringAsFixed(0)}K';
    }
    return population.toString();
  }
}
