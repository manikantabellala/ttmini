/**
 * Service Router — automatically selects demo or real services
 * based on whether Firebase is configured.
 */
import { IS_DEMO_MODE } from '../config/demoMode';

// Auth
import * as realAuth from './authService';
import * as demoAuth from './demoAuthService';

// Tracking
import * as realTracking from './trackingService';
import * as demoTracking from './demoTrackingService';

// User
import * as realUser from './userService';
import * as demoUser from './demoUserService';

// AI
import * as realAi from './aiService';
import * as demoAi from './demoAiService';

// Nutrition
import * as realNutrition from './nutritionService';
import * as demoNutrition from './demoNutritionService';

// Exercise (same in both modes — pure calculation, no external deps)
export * from './exerciseService';

// ---- Auth ----
export const signup = IS_DEMO_MODE ? demoAuth.signup : realAuth.signup;
export const login = IS_DEMO_MODE ? demoAuth.login : realAuth.login;
export const logout = IS_DEMO_MODE ? demoAuth.logout : realAuth.logout;
export const onAuthChange = IS_DEMO_MODE ? demoAuth.onAuthChange : realAuth.onAuthChange;
export const getUserProfile = IS_DEMO_MODE ? demoAuth.getUserProfile : realAuth.getUserProfile;

// ---- Tracking ----
export const logFood = IS_DEMO_MODE ? demoTracking.logFood : realTracking.logFood;
export const logExercise = IS_DEMO_MODE ? demoTracking.logExercise : realTracking.logExercise;
export const getDailyStats = IS_DEMO_MODE ? demoTracking.getDailyStats : realTracking.getDailyStats;
export const getWeeklyStats = IS_DEMO_MODE ? demoTracking.getWeeklyStats : realTracking.getWeeklyStats;
export const deleteFoodLog = IS_DEMO_MODE ? demoTracking.deleteFoodLog : realTracking.deleteFoodLog;
export const deleteExerciseLog = IS_DEMO_MODE ? demoTracking.deleteExerciseLog : realTracking.deleteExerciseLog;
export const getFoodLogs = IS_DEMO_MODE ? demoTracking.getFoodLogsForDate : realTracking.getFoodLogs;
export const getExerciseLogs = IS_DEMO_MODE ? demoTracking.getExerciseLogs : realTracking.getExerciseLogs;

// ---- User ----
export const getProfile = IS_DEMO_MODE ? demoUser.getProfile : realUser.getProfile;
export const updateProfile = IS_DEMO_MODE ? demoUser.updateProfile : realUser.updateProfile;
export const calculateBMI = realUser.calculateBMI;
export const calculateBMR = realUser.calculateBMR;
export const calculateDailyCalorieNeeds = realUser.calculateDailyCalorieNeeds;

// ---- AI ----
export const recognizeFood = IS_DEMO_MODE ? demoAi.recognizeFood : realAi.recognizeFood;
export const uploadFoodImage = IS_DEMO_MODE ? demoAi.uploadFoodImage : realAi.uploadFoodImage;

// ---- Nutrition ----
export const getNutritionData = IS_DEMO_MODE ? demoNutrition.getNutritionData : realNutrition.getNutritionData;
export const searchFood = IS_DEMO_MODE ? demoNutrition.searchFood : realNutrition.searchFood;
