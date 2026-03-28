/**
 * Exercise Recommendation Engine
 * Uses MET (Metabolic Equivalent of Task) formula to calculate
 * exercise duration needed to burn given calories.
 *
 * Formula: Calories/min = (MET × body weight in kg × 3.5) / 200
 * Duration (min) = targetCalories / (Calories/min)
 */

const EXERCISE_DATABASE = [
  {
    id: 'walking',
    name: 'Walking',
    met: 3.5,
    icon: '🚶',
    description: 'Moderate pace walking (3.5 mph)',
    intensity: 'Low',
    color: '#4ade80',
  },
  {
    id: 'running',
    name: 'Running',
    met: 9.8,
    icon: '🏃',
    description: 'Running at 6 mph pace',
    intensity: 'High',
    color: '#f87171',
  },
  {
    id: 'cycling',
    name: 'Cycling',
    met: 7.5,
    icon: '🚴',
    description: 'Moderate effort cycling',
    intensity: 'Medium',
    color: '#60a5fa',
  },
  {
    id: 'swimming',
    name: 'Swimming',
    met: 8.0,
    icon: '🏊',
    description: 'Freestyle swimming, moderate effort',
    intensity: 'High',
    color: '#38bdf8',
  },
  {
    id: 'yoga',
    name: 'Yoga',
    met: 3.0,
    icon: '🧘',
    description: 'Hatha yoga session',
    intensity: 'Low',
    color: '#c084fc',
  },
  {
    id: 'jump_rope',
    name: 'Jump Rope',
    met: 12.3,
    icon: '⏭️',
    description: 'Moderate pace jump rope',
    intensity: 'Very High',
    color: '#fb923c',
  },
  {
    id: 'dancing',
    name: 'Dancing',
    met: 5.5,
    icon: '💃',
    description: 'General aerobic dancing',
    intensity: 'Medium',
    color: '#f472b6',
  },
  {
    id: 'hiit',
    name: 'HIIT Workout',
    met: 10.0,
    icon: '🔥',
    description: 'High intensity interval training',
    intensity: 'Very High',
    color: '#ef4444',
  },
  {
    id: 'weight_training',
    name: 'Weight Training',
    met: 6.0,
    icon: '🏋️',
    description: 'Moderate effort weight lifting',
    intensity: 'Medium',
    color: '#a78bfa',
  },
  {
    id: 'stair_climbing',
    name: 'Stair Climbing',
    met: 8.8,
    icon: '🪜',
    description: 'Climbing stairs at moderate pace',
    intensity: 'High',
    color: '#fbbf24',
  },
];

/**
 * Calculate calories burned per minute for a given exercise and user weight
 */
const caloriesPerMinute = (met, weightKg) => {
  return (met * weightKg * 3.5) / 200;
};

/**
 * Calculate exercise duration to burn target calories
 * @param {number} met - MET value of the exercise
 * @param {number} weightKg - User weight in kg
 * @param {number} targetCalories - Calories to burn
 * @returns {number} Duration in minutes
 */
const calculateDuration = (met, weightKg, targetCalories) => {
  const calPerMin = caloriesPerMinute(met, weightKg);
  return Math.ceil(targetCalories / calPerMin);
};

/**
 * Get exercise recommendations based on calorie intake
 * @param {number} calories - Calories consumed
 * @param {number} userWeightKg - User weight in kilograms
 * @param {number} alreadyBurned - Calories already burned today
 * @returns {Array} Exercise recommendations with duration
 */
export const getExerciseRecommendations = (calories, userWeightKg = 70, alreadyBurned = 0) => {
  const caloriesToBurn = Math.max(0, calories - alreadyBurned);

  if (caloriesToBurn <= 0) {
    return {
      caloriesToBurn: 0,
      message: 'Great job! You\'ve already burned enough calories today! 🎉',
      exercises: [],
    };
  }

  const exercises = EXERCISE_DATABASE.map((exercise) => {
    const duration = calculateDuration(exercise.met, userWeightKg, caloriesToBurn);
    const calPerMin = caloriesPerMinute(exercise.met, userWeightKg);

    return {
      ...exercise,
      duration,
      caloriesPerMinute: Math.round(calPerMin * 10) / 10,
      totalCaloriesBurned: caloriesToBurn,
      formattedDuration: formatDuration(duration),
    };
  });

  // Sort by duration (quickest first)
  exercises.sort((a, b) => a.duration - b.duration);

  return {
    caloriesToBurn,
    message: `You need to burn ${caloriesToBurn} calories. Here are your options:`,
    exercises,
  };
};

/**
 * Format duration in a human-readable way
 */
const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

/**
 * Calculate calories burned for a specific exercise and duration
 */
export const calculateCaloriesBurned = (exerciseId, durationMinutes, userWeightKg = 70) => {
  const exercise = EXERCISE_DATABASE.find((e) => e.id === exerciseId);
  if (!exercise) throw new Error(`Exercise not found: ${exerciseId}`);

  const calPerMin = caloriesPerMinute(exercise.met, userWeightKg);
  return Math.round(calPerMin * durationMinutes);
};

/**
 * Get all available exercises
 */
export const getAvailableExercises = () => EXERCISE_DATABASE;

/**
 * Get a specific exercise by ID
 */
export const getExerciseById = (id) => EXERCISE_DATABASE.find((e) => e.id === id);
