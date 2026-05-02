# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Local `expo-veepoo-sdk` (this monorepo)

The example depends on the parent folder via `"expo-veepoo-sdk": "file:.."`. The **package name** in the parent `package.json` is `@gaozh1024/expo-veepoo-sdk`; Bun may show that scoped name during install even though imports use `expo-veepoo-sdk`.

### Bun: `ENOENT: failed copying files from cache` (scoped / `file:` package)

1. From **`example/`**: `rm -rf node_modules`
2. Clear Bun’s package cache: `bun pm cache rm`
3. Install again: `bun install`
4. If it still fails, regenerate the lockfile: `rm -f bun.lock` then `bun install`
5. Fallback: `npm install` (uses the same `file:..` link without Bun’s cache copy path)

Work from a **local disk** path (avoid network volumes) so symlinks and large `android/libs/*.aar` trees resolve reliably.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

   Or with Bun: `bun install`

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
