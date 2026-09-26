# Achilles Student Profile

## Project Description

This Apache Cordova application continues the Activity 6 student profile with its five pages, editable profile, and native camera integration. Activity 7 adds a Node.js/Express API and SQLite database so student accounts can authenticate and retrieve, update, and delete their own profile records.

## Application Pages

- **Login:** Authenticates with a student ID and password, and provides account registration.
- **Profile:** Displays database-backed student information and the profile photo, with controls to edit or delete the signed-in account.
- **About:** Presents background, interests, education, and goals.
- **Skills:** Presents the student's skills and strengths.
- **Projects:** Presents academic and personal project examples.
- **Contact:** Provides contact and location information.

## Authentication and Student Profile Management

The flow is **Login → API authentication → profile retrieval → Student Profile**. The API verifies passwords using bcrypt and issues a random, expiring bearer token. The Cordova client stores the token for the active app session, sends it with protected requests, and clears it on logout. Tokens are invalidated on logout and expire after 30 minutes; restarting the API also clears its in-memory sessions.

After signing in, a student can view their profile, edit required details, save changes, and use **Change Picture** to capture a replacement profile photo. The profile form validates required fields before saving and displays success or failure feedback. **Delete Account** removes the signed-in student's record after confirmation; use a demonstration account for this operation.

## Database and API

SQLite stores each student record under a unique student ID. Profile fields include name, course, year level, About Me content, skills, interests, education, goals, and a profile-picture data URL. Passwords are stored as bcrypt hashes, not plaintext.

The architecture is **Cordova application → Express REST API → SQLite database**. Database access and credentials stay on the backend; the Cordova app communicates only with the API.

The application demonstrates CRUD operations:

- **Create:** Register a student account through the login screen.
- **Read:** Retrieve the signed-in student's profile from SQLite after authentication.
- **Update:** Save profile edits and the captured profile photo to the student's record.
- **Delete:** Delete the signed-in test account after confirmation.

The camera uses `cordova-plugin-camera` with the device camera and stores the captured JPEG data URL in the profile record. Profile data persists in the server-side SQLite database across app closes, restarts, logout, and subsequent login, provided the same backend database remains available. The bearer token is separate from profile persistence and must be renewed by logging in after it expires or the server restarts.

## Responsive Design

The shared `www/style.css` uses responsive layouts for desktop, tablet, and mobile viewports.

## Security and Configuration

- Passwords are bcrypt-hashed by the backend.
- Protected profile endpoints require a valid bearer token and only permit access to the account associated with that token.
- The API never returns password hashes; registration hashes passwords before storing them.
- `.env` is ignored by Git. Do not commit real credentials or private configuration.
- The included demonstration account is for grading only. Never reuse its password elsewhere.
- The supplied HTTP URL is for local development on a trusted network only. Use HTTPS before exposing the API beyond local testing.

## How to Run

1. Install backend dependencies:

   ```powershell
   cd server
   npm install
   if (-not (Test-Path .env)) { Copy-Item .env.example .env }
   ```

2. If starting with an empty database, set `DEMO_STUDENT_PASSWORD` in the local `server/.env` to `password123` for the demonstration account seed. The supplied demonstration database already contains the seeded account. Never put personal credentials in this file.
3. Start the API from the `server` directory:

   ```powershell
   npm start
   ```

4. Set the API URL in `www/api-config.js`:
   - Android emulator: `http://10.0.2.2:3000/api`
   - Physical Android device: `http://<computer-LAN-IP>:3000/api` (same Wi-Fi; allow port 3000 through the computer firewall)
   - Browser on the same computer: `http://127.0.0.1:3000/api`

5. From the project root, install/build/run Cordova as needed:

   ```powershell
   npm install
   npx cordova run android --device
   ```

   Grant camera permission on the Android device when prompted. Browser preview does not provide the native camera workflow.

6. Run backend integration tests from the `server` directory with `npm test`.

### Demonstration Account

- **Student ID:** `2023-0001`
- **Password:** `password123`

This is a demonstration-only account. Create additional accounts using **Create an account** on the login screen.

## Screenshots

Activity 7 screenshots currently included in `activity7_SS/`:

- `ACT7One.jpg`
- `ACT7Two.jpg`
- `ACT7Three.jpg`
- `ACT7Three2.jpg`

Capture and add separate screenshots of the camera interaction and logout flow if those states are not visible in the existing images.

## Git Workflow

Activity 7 work belongs on `activity-7-database`, created from the updated Activity 6 `main`. Commit and push the feature branch, merge it into `main`, push `main`, and keep the Activity 7 branch after merging. Do not develop these features directly on `main`.

## Previous Activities

- Activity 6 captures: `activity6_SS/`
- Activity 5 captures: `activity5_SS/`
- Activity 4 captures: `activity4_SS/`
- Activity 3 references: `activity3_SS/`