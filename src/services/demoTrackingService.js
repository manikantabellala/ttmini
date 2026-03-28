/**
 * Demo Tracking Service — uses localStorage instead of Firestore
 */

const FOOD_LOGS_KEY = 'nutriai_demo_food_logs';
const EXERCISE_LOGS_KEY = 'nutriai_demo_exercise_logs';

const getFoodLogs = () => JSON.parse(localStorage.getItem(FOOD_LOGS_KEY) || '[]');
const saveFoodLogs = (logs) => localStorage.setItem(FOOD_LOGS_KEY, JSON.stringify(logs));
const getExerciseLogsStore = () => JSON.parse(localStorage.getItem(EXERCISE_LOGS_KEY) || '[]');
const saveExerciseLogs = (logs) => localStorage.setItem(EXERCISE_LOGS_KEY, JSON.stringify(logs));

const getTodayDateString = () => new Date().toISOString().split('T')[0];
const formatDateString = (date) => date.toISOString().split('T')[0];

export const logFood = async (userId, foodData) => {
  const logs = getFoodLogs();
  const entry = {
    id: 'food_' + Date.now(),
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
    timestamp: new Date().toISOString(),
    date: getTodayDateString(),
  };
  logs.push(entry);
  saveFoodLogs(logs);
  return entry;
};

export const logExercise = async (userId, exerciseData) => {
  const logs = getExerciseLogsStore();
  const entry = {
    id: 'exercise_' + Date.now(),
    userId,
    exerciseType: exerciseData.exerciseType,
    exerciseName: exerciseData.exerciseName,
    duration: exerciseData.duration,
    caloriesBurned: exerciseData.caloriesBurned,
    metValue: exerciseData.metValue || 0,
    icon: exerciseData.icon || '🏃',
    timestamp: new Date().toISOString(),
    date: getTodayDateString(),
  };
  logs.push(entry);
  saveExerciseLogs(logs);
  return entry;
};

export const getFoodLogsForDate = async (userId, date = null) => {
  const targetDate = date || getTodayDateString();
  const logs = getFoodLogs();
  return logs
    .filter((l) => l.userId === userId && l.date === targetDate)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .map((l) => ({ ...l, timestamp: new Date(l.timestamp) }));
};

export const getExerciseLogs = async (userId, date = null) => {
  const targetDate = date || getTodayDateString();
  const logs = getExerciseLogsStore();
  return logs
    .filter((l) => l.userId === userId && l.date === targetDate)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .map((l) => ({ ...l, timestamp: new Date(l.timestamp) }));
};

export const getDailyStats = async (userId, date = null) => {
  const foodLogs = await getFoodLogsForDate(userId, date);
  const exerciseLogs = await getExerciseLogs(userId, date);

  const totalCaloriesConsumed = foodLogs.reduce((s, l) => s + (l.calories || 0), 0);
  const totalCaloriesBurned = exerciseLogs.reduce((s, l) => s + (l.caloriesBurned || 0), 0);
  const totalProtein = foodLogs.reduce((s, l) => s + (l.protein || 0), 0);
  const totalCarbs = foodLogs.reduce((s, l) => s + (l.totalCarbs || 0), 0);
  const totalFat = foodLogs.reduce((s, l) => s + (l.totalFat || 0), 0);

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

export const deleteFoodLog = async (logId) => {
  const logs = getFoodLogs().filter((l) => l.id !== logId);
  saveFoodLogs(logs);
};

export const deleteExerciseLog = async (logId) => {
  const logs = getExerciseLogsStore().filter((l) => l.id !== logId);
  saveExerciseLogs(logs);
};
