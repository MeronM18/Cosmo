import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// A class that contains all theme configurations for the astrology application.
class AppTheme {
  AppTheme._();

  // Deep Cosmic Elegance Color Palette
  static const Color primaryLight =
      Color(0xFF2B0B3F); // Deep cosmic purple background
  static const Color primaryVariantLight =
      Color(0xFF4A1A5C); // Supporting purple for UI differentiation
  static const Color secondaryLight =
      Color(0xFF8A4FFF); // Vibrant purple for primary CTAs
  static const Color secondaryVariantLight =
      Color(0xFF7C4DFF); // Mystical purple-tinted success state
  static const Color backgroundLight =
      Color(0xFF2B0B3F); // Deep cosmic purple background
  static const Color surfaceLight =
      Color(0xFF3D1A4F); // Subtle input field background
  static const Color errorLight = Color(0xFFFF6B9D); // Soft pink error color
  static const Color onPrimaryLight =
      Color(0xFFFFFFFF); // Pure white for optimal contrast
  static const Color onSecondaryLight =
      Color(0xFFFFFFFF); // Pure white on secondary
  static const Color onBackgroundLight =
      Color(0xFFFFFFFF); // Pure white text on background
  static const Color onSurfaceLight =
      Color(0xFFFFFFFF); // Pure white text on surface
  static const Color onErrorLight = Color(0xFFFFFFFF); // White text on error

  // Dark theme uses same cosmic palette for consistency
  static const Color primaryDark = Color(0xFF2B0B3F);
  static const Color primaryVariantDark = Color(0xFF4A1A5C);
  static const Color secondaryDark = Color(0xFF8A4FFF);
  static const Color secondaryVariantDark = Color(0xFF7C4DFF);
  static const Color backgroundDark = Color(0xFF2B0B3F);
  static const Color surfaceDark = Color(0xFF3D1A4F);
  static const Color errorDark = Color(0xFFFF6B9D);
  static const Color onPrimaryDark = Color(0xFFFFFFFF);
  static const Color onSecondaryDark = Color(0xFFFFFFFF);
  static const Color onBackgroundDark = Color(0xFFFFFFFF);
  static const Color onSurfaceDark = Color(0xFFFFFFFF);
  static const Color onErrorDark = Color(0xFFFFFFFF);

  // Additional cosmic colors
  static const Color backgroundOverlay =
      Color(0xFF1A0626); // Darker purple for modal overlays
  static const Color inactive =
      Color(0xFF6B4C7A); // Muted purple for disabled states
  static const Color textSecondary =
      Color(0xFFE6D7FF); // Soft lavender for secondary text

  // Card and dialog colors with cosmic theme
  static const Color cardLight = Color(0xFF3D1A4F);
  static const Color cardDark = Color(0xFF3D1A4F);
  static const Color dialogLight = Color(0xFF4A1A5C);
  static const Color dialogDark = Color(0xFF4A1A5C);

  // Cosmic glow shadow colors
  static const Color shadowLight = Color(0x4D8A4FFF); // Purple-tinted shadow
  static const Color shadowDark = Color(0x4D8A4FFF);

  // Divider colors
  static const Color dividerLight = Color(0xFF6B4C7A);
  static const Color dividerDark = Color(0xFF6B4C7A);

  // Text colors with cosmic theme
  static const Color textHighEmphasisLight = Color(0xFFFFFFFF); // Pure white
  static const Color textMediumEmphasisLight =
      Color(0xFFE6D7FF); // Soft lavender
  static const Color textDisabledLight = Color(0xFF6B4C7A); // Muted purple

  static const Color textHighEmphasisDark = Color(0xFFFFFFFF);
  static const Color textMediumEmphasisDark = Color(0xFFE6D7FF);
  static const Color textDisabledDark = Color(0xFF6B4C7A);

  /// Light theme with cosmic elegance
  static ThemeData lightTheme = ThemeData(
    brightness: Brightness.light,
    colorScheme: ColorScheme(
      brightness: Brightness.light,
      primary: primaryLight,
      onPrimary: onPrimaryLight,
      primaryContainer: primaryVariantLight,
      onPrimaryContainer: onPrimaryLight,
      secondary: secondaryLight,
      onSecondary: onSecondaryLight,
      secondaryContainer: secondaryVariantLight,
      onSecondaryContainer: onSecondaryLight,
      tertiary: secondaryLight,
      onTertiary: onSecondaryLight,
      tertiaryContainer: secondaryVariantLight,
      onTertiaryContainer: onSecondaryLight,
      error: errorLight,
      onError: onErrorLight,
      surface: surfaceLight,
      onSurface: onSurfaceLight,
      onSurfaceVariant: textSecondary,
      outline: dividerLight,
      outlineVariant: inactive,
      shadow: shadowLight,
      scrim: backgroundOverlay,
      inverseSurface: surfaceDark,
      onInverseSurface: onSurfaceDark,
      inversePrimary: secondaryLight,
    ),
    scaffoldBackgroundColor: backgroundLight,
    cardColor: cardLight,
    dividerColor: dividerLight,
    appBarTheme: AppBarTheme(
      backgroundColor: backgroundLight,
      foregroundColor: onPrimaryLight,
      elevation: 0,
      shadowColor: shadowLight,
      surfaceTintColor: Colors.transparent,
      titleTextStyle: GoogleFonts.cinzel(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: onPrimaryLight,
      ),
    ),
    cardTheme: CardTheme(
      color: cardLight,
      elevation: 4.0,
      shadowColor: shadowLight,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16.0),
      ),
    ),
    bottomNavigationBarTheme: BottomNavigationBarThemeData(
      backgroundColor: backgroundLight,
      selectedItemColor: secondaryLight,
      unselectedItemColor: inactive,
      elevation: 8.0,
      type: BottomNavigationBarType.fixed,
      selectedLabelStyle: GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.w500,
      ),
      unselectedLabelStyle: GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.w400,
      ),
    ),
    floatingActionButtonTheme: FloatingActionButtonThemeData(
      backgroundColor: secondaryLight,
      foregroundColor: onSecondaryLight,
      elevation: 8.0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16.0),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        foregroundColor: onSecondaryLight,
        backgroundColor: secondaryLight,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        elevation: 4.0,
        shadowColor: shadowLight,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12.0),
        ),
        textStyle: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w500,
        ),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: secondaryLight,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        side: BorderSide(color: secondaryLight, width: 1.5),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12.0),
        ),
        textStyle: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w500,
        ),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: secondaryLight,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8.0),
        ),
        textStyle: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
      ),
    ),
    textTheme: _buildTextTheme(isLight: true),
    inputDecorationTheme: InputDecorationTheme(
      fillColor: surfaceLight,
      filled: true,
      border: UnderlineInputBorder(
        borderSide: BorderSide(color: inactive),
        borderRadius: BorderRadius.circular(8.0),
      ),
      enabledBorder: UnderlineInputBorder(
        borderSide: BorderSide(color: inactive),
        borderRadius: BorderRadius.circular(8.0),
      ),
      focusedBorder: UnderlineInputBorder(
        borderSide: BorderSide(color: secondaryLight, width: 2.0),
        borderRadius: BorderRadius.circular(8.0),
      ),
      errorBorder: UnderlineInputBorder(
        borderSide: BorderSide(color: errorLight),
        borderRadius: BorderRadius.circular(8.0),
      ),
      focusedErrorBorder: UnderlineInputBorder(
        borderSide: BorderSide(color: errorLight, width: 2.0),
        borderRadius: BorderRadius.circular(8.0),
      ),
      labelStyle: GoogleFonts.inter(
        color: textSecondary,
        fontSize: 16,
        fontWeight: FontWeight.w400,
      ),
      hintStyle: GoogleFonts.inter(
        color: inactive,
        fontSize: 16,
        fontWeight: FontWeight.w300,
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    ),
    switchTheme: SwitchThemeData(
      thumbColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return secondaryLight;
        }
        return inactive;
      }),
      trackColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return secondaryLight.withValues(alpha: 0.3);
        }
        return inactive.withValues(alpha: 0.3);
      }),
    ),
    checkboxTheme: CheckboxThemeData(
      fillColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return secondaryLight;
        }
        return Colors.transparent;
      }),
      checkColor: WidgetStateProperty.all(onSecondaryLight),
      side: BorderSide(color: inactive, width: 2.0),
    ),
    radioTheme: RadioThemeData(
      fillColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return secondaryLight;
        }
        return inactive;
      }),
    ),
    progressIndicatorTheme: ProgressIndicatorThemeData(
      color: secondaryLight,
      linearTrackColor: inactive.withValues(alpha: 0.3),
      circularTrackColor: inactive.withValues(alpha: 0.3),
    ),
    sliderTheme: SliderThemeData(
      activeTrackColor: secondaryLight,
      thumbColor: secondaryLight,
      overlayColor: secondaryLight.withValues(alpha: 0.2),
      inactiveTrackColor: inactive.withValues(alpha: 0.3),
    ),
    tabBarTheme: TabBarTheme(
      labelColor: secondaryLight,
      unselectedLabelColor: inactive,
      indicatorColor: secondaryLight,
      indicatorSize: TabBarIndicatorSize.tab,
      labelStyle: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w500,
      ),
      unselectedLabelStyle: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w400,
      ),
    ),
    tooltipTheme: TooltipThemeData(
      decoration: BoxDecoration(
        color: backgroundOverlay,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: shadowLight,
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      textStyle: GoogleFonts.inter(
        color: onPrimaryLight,
        fontSize: 12,
        fontWeight: FontWeight.w400,
      ),
    ),
    snackBarTheme: SnackBarThemeData(
      backgroundColor: backgroundOverlay,
      contentTextStyle: GoogleFonts.inter(
        color: onPrimaryLight,
        fontSize: 14,
        fontWeight: FontWeight.w400,
      ),
      actionTextColor: secondaryLight,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12.0),
      ),
      elevation: 8.0,
    ), dialogTheme: DialogThemeData(backgroundColor: dialogLight),
  );

  /// Dark theme with cosmic elegance (same as light for consistency)
  static ThemeData darkTheme = ThemeData(
    brightness: Brightness.dark,
    colorScheme: ColorScheme(
      brightness: Brightness.dark,
      primary: primaryDark,
      onPrimary: onPrimaryDark,
      primaryContainer: primaryVariantDark,
      onPrimaryContainer: onPrimaryDark,
      secondary: secondaryDark,
      onSecondary: onSecondaryDark,
      secondaryContainer: secondaryVariantDark,
      onSecondaryContainer: onSecondaryDark,
      tertiary: secondaryDark,
      onTertiary: onSecondaryDark,
      tertiaryContainer: secondaryVariantDark,
      onTertiaryContainer: onSecondaryDark,
      error: errorDark,
      onError: onErrorDark,
      surface: surfaceDark,
      onSurface: onSurfaceDark,
      onSurfaceVariant: textSecondary,
      outline: dividerDark,
      outlineVariant: inactive,
      shadow: shadowDark,
      scrim: backgroundOverlay,
      inverseSurface: surfaceLight,
      onInverseSurface: onSurfaceLight,
      inversePrimary: secondaryDark,
    ),
    scaffoldBackgroundColor: backgroundDark,
    cardColor: cardDark,
    dividerColor: dividerDark,
    appBarTheme: AppBarTheme(
      backgroundColor: backgroundDark,
      foregroundColor: onPrimaryDark,
      elevation: 0,
      shadowColor: shadowDark,
      surfaceTintColor: Colors.transparent,
      titleTextStyle: GoogleFonts.cinzel(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: onPrimaryDark,
      ),
    ),
    cardTheme: CardTheme(
      color: cardDark,
      elevation: 4.0,
      shadowColor: shadowDark,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16.0),
      ),
    ),
    bottomNavigationBarTheme: BottomNavigationBarThemeData(
      backgroundColor: backgroundDark,
      selectedItemColor: secondaryDark,
      unselectedItemColor: inactive,
      elevation: 8.0,
      type: BottomNavigationBarType.fixed,
      selectedLabelStyle: GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.w500,
      ),
      unselectedLabelStyle: GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.w400,
      ),
    ),
    floatingActionButtonTheme: FloatingActionButtonThemeData(
      backgroundColor: secondaryDark,
      foregroundColor: onSecondaryDark,
      elevation: 8.0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16.0),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        foregroundColor: onSecondaryDark,
        backgroundColor: secondaryDark,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        elevation: 4.0,
        shadowColor: shadowDark,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12.0),
        ),
        textStyle: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w500,
        ),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: secondaryDark,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        side: BorderSide(color: secondaryDark, width: 1.5),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12.0),
        ),
        textStyle: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w500,
        ),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: secondaryDark,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8.0),
        ),
        textStyle: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
      ),
    ),
    textTheme: _buildTextTheme(isLight: false),
    inputDecorationTheme: InputDecorationTheme(
      fillColor: surfaceDark,
      filled: true,
      border: UnderlineInputBorder(
        borderSide: BorderSide(color: inactive),
        borderRadius: BorderRadius.circular(8.0),
      ),
      enabledBorder: UnderlineInputBorder(
        borderSide: BorderSide(color: inactive),
        borderRadius: BorderRadius.circular(8.0),
      ),
      focusedBorder: UnderlineInputBorder(
        borderSide: BorderSide(color: secondaryDark, width: 2.0),
        borderRadius: BorderRadius.circular(8.0),
      ),
      errorBorder: UnderlineInputBorder(
        borderSide: BorderSide(color: errorDark),
        borderRadius: BorderRadius.circular(8.0),
      ),
      focusedErrorBorder: UnderlineInputBorder(
        borderSide: BorderSide(color: errorDark, width: 2.0),
        borderRadius: BorderRadius.circular(8.0),
      ),
      labelStyle: GoogleFonts.inter(
        color: textSecondary,
        fontSize: 16,
        fontWeight: FontWeight.w400,
      ),
      hintStyle: GoogleFonts.inter(
        color: inactive,
        fontSize: 16,
        fontWeight: FontWeight.w300,
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    ),
    switchTheme: SwitchThemeData(
      thumbColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return secondaryDark;
        }
        return inactive;
      }),
      trackColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return secondaryDark.withValues(alpha: 0.3);
        }
        return inactive.withValues(alpha: 0.3);
      }),
    ),
    checkboxTheme: CheckboxThemeData(
      fillColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return secondaryDark;
        }
        return Colors.transparent;
      }),
      checkColor: WidgetStateProperty.all(onSecondaryDark),
      side: BorderSide(color: inactive, width: 2.0),
    ),
    radioTheme: RadioThemeData(
      fillColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return secondaryDark;
        }
        return inactive;
      }),
    ),
    progressIndicatorTheme: ProgressIndicatorThemeData(
      color: secondaryDark,
      linearTrackColor: inactive.withValues(alpha: 0.3),
      circularTrackColor: inactive.withValues(alpha: 0.3),
    ),
    sliderTheme: SliderThemeData(
      activeTrackColor: secondaryDark,
      thumbColor: secondaryDark,
      overlayColor: secondaryDark.withValues(alpha: 0.2),
      inactiveTrackColor: inactive.withValues(alpha: 0.3),
    ),
    tabBarTheme: TabBarTheme(
      labelColor: secondaryDark,
      unselectedLabelColor: inactive,
      indicatorColor: secondaryDark,
      indicatorSize: TabBarIndicatorSize.tab,
      labelStyle: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w500,
      ),
      unselectedLabelStyle: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w400,
      ),
    ),
    tooltipTheme: TooltipThemeData(
      decoration: BoxDecoration(
        color: backgroundOverlay,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: shadowDark,
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      textStyle: GoogleFonts.inter(
        color: onPrimaryDark,
        fontSize: 12,
        fontWeight: FontWeight.w400,
      ),
    ),
    snackBarTheme: SnackBarThemeData(
      backgroundColor: backgroundOverlay,
      contentTextStyle: GoogleFonts.inter(
        color: onPrimaryDark,
        fontSize: 14,
        fontWeight: FontWeight.w400,
      ),
      actionTextColor: secondaryDark,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12.0),
      ),
      elevation: 8.0,
    ), dialogTheme: DialogThemeData(backgroundColor: dialogDark),
  );

  /// Helper method to build text theme with cosmic typography
  static TextTheme _buildTextTheme({required bool isLight}) {
    final Color textHighEmphasis =
        isLight ? textHighEmphasisLight : textHighEmphasisDark;
    final Color textMediumEmphasis =
        isLight ? textMediumEmphasisLight : textMediumEmphasisDark;
    final Color textDisabled = isLight ? textDisabledLight : textDisabledDark;

    return TextTheme(
      // Display styles with Cinzel for mystical elegance
      displayLarge: GoogleFonts.cinzel(
        fontSize: 57,
        fontWeight: FontWeight.w400,
        color: textHighEmphasis,
        letterSpacing: -0.25,
      ),
      displayMedium: GoogleFonts.cinzel(
        fontSize: 45,
        fontWeight: FontWeight.w400,
        color: textHighEmphasis,
      ),
      displaySmall: GoogleFonts.cinzel(
        fontSize: 36,
        fontWeight: FontWeight.w400,
        color: textHighEmphasis,
      ),

      // Headline styles with Cinzel for premium mystical perception
      headlineLarge: GoogleFonts.cinzel(
        fontSize: 32,
        fontWeight: FontWeight.w600,
        color: textHighEmphasis,
      ),
      headlineMedium: GoogleFonts.cinzel(
        fontSize: 28,
        fontWeight: FontWeight.w600,
        color: textHighEmphasis,
      ),
      headlineSmall: GoogleFonts.cinzel(
        fontSize: 24,
        fontWeight: FontWeight.w600,
        color: textHighEmphasis,
      ),

      // Title styles with Inter for contemporary readability
      titleLarge: GoogleFonts.inter(
        fontSize: 22,
        fontWeight: FontWeight.w500,
        color: textHighEmphasis,
        letterSpacing: 0,
      ),
      titleMedium: GoogleFonts.inter(
        fontSize: 16,
        fontWeight: FontWeight.w500,
        color: textHighEmphasis,
        letterSpacing: 0.15,
      ),
      titleSmall: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: textHighEmphasis,
        letterSpacing: 0.1,
      ),

      // Body styles with Inter for extended mobile reading
      bodyLarge: GoogleFonts.inter(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        color: textHighEmphasis,
        letterSpacing: 0.5,
      ),
      bodyMedium: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        color: textHighEmphasis,
        letterSpacing: 0.25,
      ),
      bodySmall: GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.w300,
        color: textMediumEmphasis,
        letterSpacing: 0.4,
      ),

      // Label styles with Inter for UI elements
      labelLarge: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: textHighEmphasis,
        letterSpacing: 0.1,
      ),
      labelMedium: GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        color: textMediumEmphasis,
        letterSpacing: 0.5,
      ),
      labelSmall: GoogleFonts.inter(
        fontSize: 11,
        fontWeight: FontWeight.w300,
        color: textDisabled,
        letterSpacing: 0.5,
      ),
    );
  }
}
