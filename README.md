# Cosmo-App

Cosmo is an iOS-first astrology app built with Expo + React Native, Supabase for auth/data, RevenueCat for subscriptions, and OpenAI-powered readings. This repository contains the mobile client.

## Tech Stack
- React Native (Expo)
- TypeScript
- Supabase (Auth, Database, Functions)
- RevenueCat (Subscriptions)
- OpenAI (content generation)

## Getting Started
1. Install dependencies:
```
npm install
```
2. Start the app:
```
npx expo start
```
3. Configure environment secrets in Supabase Dashboard and `src/utils/constants.ts` for dev.

## Project Structure
- `src/screens` – App screens (TestScreen, Onboarding, MainApp)
- `src/services` – `auth`, `supabase`, `revenueCat`
- `src/types` – shared TypeScript types
- `assets` – icons and images

## Development Notes
- OAuth redirect uses `Linking.createURL('/auth/callback')` during development.
- Test Google/Apple sign-in from `TestScreen`.

## License
Private. All rights reserved.
