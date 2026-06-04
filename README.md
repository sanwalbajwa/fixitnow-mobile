# FixItNow Mobile

FixItNow is an Expo and React Native mobile app for booking local repair and maintenance services. It supports separate customer and service-provider experiences, Supabase authentication, service listings, bookings, ratings, notifications, and booking-based chat.

## Features

- Customer and provider sign up/sign in
- Role-based navigation with Expo Router
- Customer home flow for browsing service listings and provider details
- Booking creation with service date, time, location, and details
- Customer booking history with rating support for completed bookings
- Provider dashboard for viewing and updating booking status
- Provider service management for creating and deleting listings
- Booking chat between the customer and assigned provider
- Notification list for authenticated users
- Secure Supabase session persistence with `expo-secure-store`

## Tech Stack

- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript
- Expo Router
- Supabase
- NativeWind and Tailwind CSS
- Lucide React Native icons

## Getting Started

### Prerequisites

- Node.js
- npm
- Expo CLI through `npx expo`
- Android Studio, Xcode, or Expo Go for running the app
- A Supabase project with the required database tables

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Do not commit real Supabase keys to GitHub.

### Run the App

```bash
npm start
```

Then choose a target from the Expo terminal UI.

Platform shortcuts:

```bash
npm run android
npm run ios
npm run web
```

## Project Structure

```text
app/
  (auth)/             Login and registration screens
  (customer)/         Customer tabs and screens
  (provider)/         Provider tabs and screens
  book/               Booking creation route
  chat/               Booking chat route
  provider/           Provider detail route
components/
  brand/              Shared branded UI components
constants/            Theme and color constants
hooks/                Shared React hooks
lib/
  supabase.ts         Supabase client configuration
  actions/            Auth, service, booking, chat, and notification actions
```

## Supabase Data Model

The app expects Supabase tables similar to:

- `users`
- `customers`
- `service_providers`
- `service_categories`
- `service_listings`
- `bookings`
- `payments`
- `ratings`
- `chat_messages`
- `notifications`

Authentication profiles are created during sign up. Customers are inserted into `customers`; providers are inserted into `service_providers`.

## Available Scripts

```bash
npm start
npm run android
npm run ios
npm run web
```

## Notes

- The app uses `EXPO_PUBLIC_` environment variables so Supabase configuration is available to the Expo client.
- Expo Router typed routes are enabled in `app.json`.
- Supabase auth sessions are persisted with SecureStore on native platforms.

## License

This project is licensed under the terms in the `LICENSE` file.
