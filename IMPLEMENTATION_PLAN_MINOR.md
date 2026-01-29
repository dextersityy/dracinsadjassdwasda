# Implementation Plan - Add Firebase UID to Profile

## Goal
Display the internal Firebase User ID (UID) on the user profile page (`app/profile/page.tsx`) alongside the existing Telegram ID. This assists admins in tracking and managing users in the Firebase Console.

## Proposed Changes

### 1. `app/profile/page.tsx`
- **Logic:** Destructure `userId` from `useCredits()` hook.
- **UI:** Add a new line below "ID: [TelegramID]" to show "UID: [FirebaseUID]".
- **Interaction:** Add a copy icon similar to the Telegram ID for easy copying.
- **Visuals:** Use a slightly smaller or different color text to distinguish it from the main ID, but ensure readability.

## Verification
- **Build:** Run `npm run build` to ensure no type errors.
- **Manual:** User checks the profile page to see if the UID appears and matches the expected format (alphanumeric string).
