/**
 * Demo Auth Service — uses localStorage instead of Firebase Auth
 */

const STORAGE_KEY = 'nutriai_demo_user';
const USERS_KEY = 'nutriai_demo_users';
const PROFILES_KEY = 'nutriai_demo_profiles';

let authChangeCallback = null;

const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));
const getProfiles = () => JSON.parse(localStorage.getItem(PROFILES_KEY) || '{}');
const saveProfiles = (profiles) => localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));

const getCurrentUser = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const signup = async (email, password, profileData) => {
  await delay(500); // simulate network
  const users = getUsers();

  if (users[email]) {
    const err = new Error('Email already in use');
    err.code = 'auth/email-already-in-use';
    throw err;
  }

  if (password.length < 6) {
    const err = new Error('Password too weak');
    err.code = 'auth/weak-password';
    throw err;
  }

  const uid = 'demo_' + Date.now();
  const user = { uid, email, displayName: profileData.displayName || '' };

  users[email] = { password, uid };
  saveUsers(users);

  const profiles = getProfiles();
  profiles[uid] = {
    id: uid,
    email,
    displayName: profileData.displayName || '',
    weight: profileData.weight || 70,
    height: profileData.height || 170,
    age: profileData.age || 25,
    gender: profileData.gender || 'other',
    dailyCalorieGoal: profileData.dailyCalorieGoal || 2000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveProfiles(profiles);

  setCurrentUser(user);
  if (authChangeCallback) authChangeCallback(user);

  return user;
};

export const login = async (email, password) => {
  await delay(500);
  const users = getUsers();
  const record = users[email];

  if (!record || record.password !== password) {
    const err = new Error('Invalid credentials');
    err.code = 'auth/invalid-credential';
    throw err;
  }

  const user = { uid: record.uid, email };
  setCurrentUser(user);
  if (authChangeCallback) authChangeCallback(user);

  return user;
};

export const logout = async () => {
  setCurrentUser(null);
  if (authChangeCallback) authChangeCallback(null);
};

export const onAuthChange = (callback) => {
  authChangeCallback = callback;
  // Fire immediately with current state
  setTimeout(() => callback(getCurrentUser()), 0);
  return () => { authChangeCallback = null; };
};

export const getUserProfile = async (userId) => {
  const profiles = getProfiles();
  return profiles[userId] || null;
};

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
