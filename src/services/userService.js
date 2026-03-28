import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

/**
 * Get user profile from Firestore
 */
export const getProfile = async (userId) => {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

/**
 * Update user profile
 */
export const updateProfile = async (userId, data) => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
  return await getProfile(userId);
};

/**
 * Calculate BMI (Body Mass Index)
 * Formula: BMI = weight (kg) / (height (m))^2
 */
export const calculateBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const rounded = Math.round(bmi * 10) / 10;

  let category, color;
  if (bmi < 18.5) {
    category = 'Underweight';
    color = '#60a5fa';
  } else if (bmi < 25) {
    category = 'Normal';
    color = '#4ade80';
  } else if (bmi < 30) {
    category = 'Overweight';
    color = '#fbbf24';
  } else {
    category = 'Obese';
    color = '#f87171';
  }

  return { value: rounded, category, color };
};

/**
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
 * Male: BMR = 10 × weight(kg) + 6.25 × height(cm) – 5 × age(y) + 5
 * Female: BMR = 10 × weight(kg) + 6.25 × height(cm) – 5 × age(y) – 161
 */
export const calculateBMR = (weightKg, heightCm, age, gender) => {
  if (!weightKg || !heightCm || !age) return null;

  let bmr;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else if (gender === 'female') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  } else {
    // Average of male and female formulas
    const maleBMR = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    const femaleBMR = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    bmr = (maleBMR + femaleBMR) / 2;
  }

  return Math.round(bmr);
};

/**
 * Calculate daily calorie needs based on activity level
 */
export const calculateDailyCalorieNeeds = (bmr, activityLevel = 'moderate') => {
  const multipliers = {
    sedentary: 1.2,        // little or no exercise
    light: 1.375,          // light exercise 1-3 days/week
    moderate: 1.55,        // moderate exercise 3-5 days/week
    active: 1.725,         // hard exercise 6-7 days/week
    veryActive: 1.9,       // very hard exercise + physical job
  };

  const multiplier = multipliers[activityLevel] || multipliers.moderate;
  return Math.round(bmr * multiplier);
};
