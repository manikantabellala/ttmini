import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

/**
 * Log a food entry to Firestore
 */
export const logFood = async (userId, foodData) => {
  const logEntry = {
    userId,
    foodName: foodData.foodName,
    calories: foodData.calories || 0,
    protein: foodData.protein || 0,
    totalCarbs: foodData.totalCarbs || 0,
    totalFat: foodData.totalFat || 0,
    servingQty: foodData.servingQty || 1,
    servingUnit: foodData.servingUnit || 'serving',
    imageUrl: foodData.imageUrl || null,
    mealType: foodData.mealType || 'snack',
    timestamp: Timestamp.now(),
    date: getTodayDateString(),
  };

  const docRef = await addDoc(collection(db, 'foodLogs'), logEntry);
  return { id: docRef.id, ...logEntry };
};

/**
 * Log an exercise entry to Firestore
 */
export const logExercise = async (userId, exerciseData) => {
  const logEntry = {
    userId,
    exerciseType: exerciseData.exerciseType,
    exerciseName: exerciseData.exerciseName,
    duration: exerciseData.duration,
    caloriesBurned: exerciseData.caloriesBurned,
    metValue: exerciseData.metValue || 0,
    icon: exerciseData.icon || '🏃',
    timestamp: Timestamp.now(),
    date: getTodayDateString(),
  };

  const docRef = await addDoc(collection(db, 'exerciseLogs'), logEntry);
  return { id: docRef.id, ...logEntry };
};

/**
 * Get food logs for a specific date
 */
export const getFoodLogs = async (userId, date = null) => {
  const targetDate = date || getTodayDateString();

  const q = query(
    collection(db, 'foodLogs'),
    where('userId', '==', userId),
    where('date', '==', targetDate),
    orderBy('timestamp', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate?.() || new Date(),
  }));
};

/**
 * Get exercise logs for a specific date
 */
export const getExerciseLogs = async (userId, date = null) => {
  const targetDate = date || getTodayDateString();

  const q = query(
    collection(db, 'exerciseLogs'),
    where('userId', '==', userId),
    where('date', '==', targetDate),
    orderBy('timestamp', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate?.() || new Date(),
  }));
};

/**
 * Get daily stats (total calories consumed and burned)
 */
export const getDailyStats = async (userId, date = null) => {
  const foodLogs = await getFoodLogs(userId, date);
  const exerciseLogs = await getExerciseLogs(userId, date);

  const totalCaloriesConsumed = foodLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
  const totalCaloriesBurned = exerciseLogs.reduce((sum, log) => sum + (log.caloriesBurned || 0), 0);
  const totalProtein = foodLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
  const totalCarbs = foodLogs.reduce((sum, log) => sum + (log.totalCarbs || 0), 0);
  const totalFat = foodLogs.reduce((sum, log) => sum + (log.totalFat || 0), 0);

  return {
    date: date || getTodayDateString(),
    totalCaloriesConsumed: Math.round(totalCaloriesConsumed),
    totalCaloriesBurned: Math.round(totalCaloriesBurned),
    netCalories: Math.round(totalCaloriesConsumed - totalCaloriesBurned),
    totalProtein: Math.round(totalProtein * 10) / 10,
    totalCarbs: Math.round(totalCarbs * 10) / 10,
    totalFat: Math.round(totalFat * 10) / 10,
    foodLogCount: foodLogs.length,
    exerciseLogCount: exerciseLogs.length,
    foodLogs,
    exerciseLogs,
  };
};

/**
 * Get weekly stats for the last 7 days
 */
export const getWeeklyStats = async (userId) => {
  const stats = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = formatDateString(date);

    try {
      const dayStats = await getDailyStats(userId, dateStr);
      stats.push({
        ...dayStats,
        dayLabel: date.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: dateStr,
      });
    } catch {
      stats.push({
        date: dateStr,
        dayLabel: date.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: dateStr,
        totalCaloriesConsumed: 0,
        totalCaloriesBurned: 0,
        netCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        foodLogCount: 0,
        exerciseLogCount: 0,
      });
    }
  }

  return stats;
};

/**
 * Delete a food log entry
 */
export const deleteFoodLog = async (logId) => {
  await deleteDoc(doc(db, 'foodLogs', logId));
};

/**
 * Delete an exercise log entry
 */
export const deleteExerciseLog = async (logId) => {
  await deleteDoc(doc(db, 'exerciseLogs', logId));
};

/**
 * Helpers
 */
const getTodayDateString = () => {
  return formatDateString(new Date());
};

const formatDateString = (date) => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};
