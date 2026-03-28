/**
 * Demo Mode Detection
 * When Firebase API keys are not configured (still placeholder values),
 * the app runs in demo mode using localStorage for all data.
 */

const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY || '';
const forced = localStorage.getItem('force_demo') === 'true';

export const IS_DEMO_MODE =
  forced ||
  !firebaseApiKey ||
  firebaseApiKey === 'your_firebase_api_key' ||
  firebaseApiKey.length < 10;

if (IS_DEMO_MODE) {
  console.log(
    '%c🎮 NutriAI is running in DEMO MODE %c\nUsing localStorage for data. To use real Firebase, update your .env file.',
    'background: #6366f1; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
    'color: #94a3b8;'
  );
}
