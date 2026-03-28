/**
 * Demo User Service — uses localStorage instead of Firestore
 */

export { calculateBMI, calculateBMR, calculateDailyCalorieNeeds } from './userService';

const PROFILES_KEY = 'nutriai_demo_profiles';
const getProfiles = () => JSON.parse(localStorage.getItem(PROFILES_KEY) || '{}');
const saveProfiles = (profiles) => localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));

export const getProfile = async (userId) => {
  const profiles = getProfiles();
  return profiles[userId] || null;
};

export const updateProfile = async (userId, data) => {
  const profiles = getProfiles();
  profiles[userId] = {
    ...profiles[userId],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  saveProfiles(profiles);
  return profiles[userId];
};
