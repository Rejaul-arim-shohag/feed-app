# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

    ```bash
    npm install
    ```

2. Start the app

    ```bash
    npx expo start
    ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Push Notifications Setup And Testing

This app includes end-to-end client push wiring:

- Notification foreground handler is configured globally.
- Android notification channel is created automatically.
- Device permission request and Expo push token fetch are implemented.
- Token registration with your backend runs after login and session restore.
- Notification tap handling supports deep links from notification data.url.

### 1) Required app config

Update app config before testing:

- In app.json set expo.extra.eas.projectId to your real EAS project id.
- Keep expo-notifications plugin enabled with defaultChannel.

If projectId is missing or left as YOUR_EAS_PROJECT_ID, token registration is skipped and a warning is logged.

### 2) Required backend endpoints

Your backend must expose this authenticated endpoint:

- Method: POST
- Path: /api/v1/notifications/register-token
- Header: Authorization: Bearer <token>
- Body:
    - token: string
    - platform: ios | android | web

The app can override this path by EXPO_PUBLIC_PUSH_TOKEN_PATH.

Base URL comes from:

- EXPO_PUBLIC_API_BASE_URL, or
- Expo host detection fallback for local development.

### 3) Build requirements

Remote push notifications require a development build or release build.

- Android: do not rely on Expo Go for remote push tests.
- iOS: use a dev/release build with correct push credentials.

### 4) Create and run a development build

Android example:

1. Ensure google-services.json exists in project root.
2. Build and install:
    - eas build --profile development --platform android
3. Start Metro:
    - pnpm expo start --dev-client
4. Open installed build on real device and log in.

iOS example:

1. Configure Apple push credentials in Expo/EAS.
2. Build and install:
    - eas build --profile development --platform ios
3. Start Metro:
    - pnpm expo start --dev-client
4. Open installed build on real device and log in.

### 5) Verify token registration

After login (or app restart with active session):

1. App asks for notification permission.
2. App fetches Expo push token.
3. App calls backend register-token endpoint.

Backend verification checklist:

1. Confirm request reaches register-token endpoint.
2. Confirm token is stored in DB for the authenticated user.
3. Confirm token updates when app token changes.

### 6) Send a manual test push

Use Expo Push API with a stored Expo push token:

curl -X POST https://exp.host/--/api/v2/push/send \
 -H "Content-Type: application/json" \
 -d '{
"to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
"title": "Test notification",
"body": "Push is working",
"data": {
"url": "/(main)/home"
}
}'

Expected behavior:

1. Foreground: banner/list appears.
2. Background/closed: system notification appears.
3. On tap: app opens and routes to data.url.

### 7) End-to-end product test flow

1. Log in as User A on a real device.
2. Confirm token saved to backend for User A.
3. From backend/admin tool, send push to User A token.
4. Confirm receipt in foreground and background.
5. Kill app, send again, tap notification, verify deep link navigation.
6. Restart app and confirm session persists and no crash during auto push sync.

### 8) Common issues and fixes

- No prompt on Android 13+: ensure notification channel creation happens before token fetch.
- Token fetch fails: verify expo.extra.eas.projectId is real and build is dev/release.
- No delivery: verify backend stores valid Expo token and push payload is valid.
- Tap does nothing: include data.url in notification payload.
- Localhost backend from real device fails: use LAN host or EXPO_PUBLIC_API_BASE_URL.
