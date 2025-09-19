import 'package:flutter/material.dart';
import '../presentation/onboarding_complete_screen/onboarding_complete_screen.dart';
import '../presentation/birth_location_input_screen/birth_location_input_screen.dart';
import '../presentation/name_input_screen/name_input_screen.dart';
import '../presentation/birth_date_selection_screen/birth_date_selection_screen.dart';
import '../presentation/birth_time_selection_screen/birth_time_selection_screen.dart';
import '../presentation/welcome_screen/welcome_screen.dart';

class AppRoutes {
  // TODO: Add your routes here
  static const String initial = '/';
  static const String onboardingComplete = '/onboarding-complete-screen';
  static const String birthLocationInput = '/birth-location-input-screen';
  static const String nameInput = '/name-input-screen';
  static const String birthDateSelection = '/birth-date-selection-screen';
  static const String birthTimeSelection = '/birth-time-selection-screen';
  static const String welcome = '/welcome-screen';

  static Map<String, WidgetBuilder> routes = {
    initial: (context) => const OnboardingCompleteScreen(),
    onboardingComplete: (context) => const OnboardingCompleteScreen(),
    birthLocationInput: (context) => const BirthLocationInputScreen(),
    nameInput: (context) => const NameInputScreen(),
    birthDateSelection: (context) => const BirthDateSelectionScreen(),
    birthTimeSelection: (context) => const BirthTimeSelectionScreen(),
    welcome: (context) => const WelcomeScreen(),
    // TODO: Add your other routes here
  };
}
