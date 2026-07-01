@AGENTS.md

# Project Context & Session Learnings

### 1. Local Environment Constraints
- This machine does not have `node`, `npm`, `brew`, `gh` (GitHub CLI), or the Android SDK installed. 
- **Actionable Rule**: Do not attempt to run local `npm install`, `npx expo`, or local Gradle builds. All operations must rely on external CI/CD or assume dependencies are missing locally.

### 2. Android APK Build Pipeline
- Because local compilation is impossible, the project relies on **GitHub Actions** (`.github/workflows/build-android.yml`) to compile the Android APK automatically.
- Pushing to the `main` branch triggers an Ubuntu container to install Node/Java, run `npx expo prebuild`, and compile the `app-debug.apk` which is uploaded as a downloadable artifact.

### 3. GitHub Authentication Quirks
- Pushing `.github/workflows/` files strictly requires a token with the **`workflow`** scope. 
- Fine-grained tokens often fail if they aren't explicitly given `Administration` or `Contents: Read and Write` access at the time the token is generated, especially for newly created repositories. **Classic Tokens** with `repo` and `workflow` scopes are the most reliable workaround.

### 4. Voice Coach Architecture
- **Goal**: Guide user to run 3.2km in < 19 minutes (5:56 min/km pace).
- **Location**: Uses `expo-location` (Foreground tracking via `watchPositionAsync`).
- **Feedback**: Uses `expo-speech` to provide TTS updates every 0.5km, and dynamically warns the user if their rolling average pace drops below the target pace for more than 20 seconds.
