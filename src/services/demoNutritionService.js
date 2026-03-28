/**
 * Demo Nutrition Service — returns mock nutrition data
 * instead of calling Nutritionix API
 */

const NUTRITION_DB = {
  'pizza': { foodName: 'pizza', calories: 266, protein: 11, totalCarbs: 33, totalFat: 10, saturatedFat: 4.5, cholesterol: 17, sodium: 598, dietaryFiber: 2.3, sugars: 3.6, potassium: 184, servingQty: 1, servingUnit: 'slice', servingWeightGrams: 107, photo: null },
  'cheese pizza': { foodName: 'cheese pizza', calories: 237, protein: 10.6, totalCarbs: 28.3, totalFat: 9.2, saturatedFat: 4.2, cholesterol: 22, sodium: 572, dietaryFiber: 1.8, sugars: 3.1, potassium: 143, servingQty: 1, servingUnit: 'slice', servingWeightGrams: 100, photo: null },
  'hamburger': { foodName: 'hamburger', calories: 354, protein: 20, totalCarbs: 29, totalFat: 17, saturatedFat: 6.7, cholesterol: 52, sodium: 497, dietaryFiber: 1.3, sugars: 5, potassium: 230, servingQty: 1, servingUnit: 'burger', servingWeightGrams: 150, photo: null },
  'cheeseburger': { foodName: 'cheeseburger', calories: 398, protein: 22, totalCarbs: 30, totalFat: 21, saturatedFat: 9.2, cholesterol: 68, sodium: 640, dietaryFiber: 1.3, sugars: 5.5, potassium: 215, servingQty: 1, servingUnit: 'burger', servingWeightGrams: 170, photo: null },
  'salad': { foodName: 'salad', calories: 20, protein: 1.5, totalCarbs: 3.3, totalFat: 0.3, saturatedFat: 0, cholesterol: 0, sodium: 13, dietaryFiber: 1.8, sugars: 1.4, potassium: 194, servingQty: 1, servingUnit: 'cup', servingWeightGrams: 72, photo: null },
  'caesar salad': { foodName: 'caesar salad', calories: 181, protein: 8, totalCarbs: 10, totalFat: 12, saturatedFat: 3.2, cholesterol: 20, sodium: 450, dietaryFiber: 2.1, sugars: 2.3, potassium: 220, servingQty: 1, servingUnit: 'serving', servingWeightGrams: 150, photo: null },
  'spaghetti': { foodName: 'spaghetti', calories: 220, protein: 8.1, totalCarbs: 43, totalFat: 1.3, saturatedFat: 0.2, cholesterol: 0, sodium: 1, dietaryFiber: 2.5, sugars: 0.6, potassium: 44, servingQty: 1, servingUnit: 'cup', servingWeightGrams: 140, photo: null },
  'pasta': { foodName: 'pasta', calories: 220, protein: 8.1, totalCarbs: 43, totalFat: 1.3, saturatedFat: 0.2, cholesterol: 0, sodium: 1, dietaryFiber: 2.5, sugars: 0.6, potassium: 44, servingQty: 1, servingUnit: 'cup', servingWeightGrams: 140, photo: null },
  'bolognese': { foodName: 'bolognese sauce', calories: 128, protein: 9, totalCarbs: 7.6, totalFat: 7, saturatedFat: 2.5, cholesterol: 30, sodium: 420, dietaryFiber: 1.5, sugars: 4.2, potassium: 350, servingQty: 0.5, servingUnit: 'cup', servingWeightGrams: 125, photo: null },
  'fried rice': { foodName: 'fried rice', calories: 238, protein: 5.3, totalCarbs: 32, totalFat: 9.9, saturatedFat: 1.9, cholesterol: 58, sodium: 530, dietaryFiber: 1.1, sugars: 0.4, potassium: 120, servingQty: 1, servingUnit: 'cup', servingWeightGrams: 166, photo: null },
  'rice': { foodName: 'rice', calories: 206, protein: 4.3, totalCarbs: 45, totalFat: 0.4, saturatedFat: 0.1, cholesterol: 0, sodium: 1.6, dietaryFiber: 0.6, sugars: 0, potassium: 55, servingQty: 1, servingUnit: 'cup', servingWeightGrams: 158, photo: null },
  'chicken': { foodName: 'chicken breast', calories: 165, protein: 31, totalCarbs: 0, totalFat: 3.6, saturatedFat: 1, cholesterol: 85, sodium: 74, dietaryFiber: 0, sugars: 0, potassium: 256, servingQty: 3, servingUnit: 'oz', servingWeightGrams: 85, photo: null },
  'sushi': { foodName: 'sushi', calories: 200, protein: 8, totalCarbs: 38, totalFat: 1.2, saturatedFat: 0.2, cholesterol: 10, sodium: 480, dietaryFiber: 2, sugars: 8, potassium: 90, servingQty: 6, servingUnit: 'pieces', servingWeightGrams: 180, photo: null },
  'salmon': { foodName: 'salmon', calories: 208, protein: 20, totalCarbs: 0, totalFat: 13, saturatedFat: 3.1, cholesterol: 55, sodium: 59, dietaryFiber: 0, sugars: 0, potassium: 363, servingQty: 3, servingUnit: 'oz', servingWeightGrams: 85, photo: null },
  'chicken curry': { foodName: 'chicken curry', calories: 243, protein: 15, totalCarbs: 12, totalFat: 15, saturatedFat: 4.2, cholesterol: 45, sodium: 620, dietaryFiber: 2.5, sugars: 3.8, potassium: 310, servingQty: 1, servingUnit: 'cup', servingWeightGrams: 236, photo: null },
  'curry': { foodName: 'curry', calories: 243, protein: 15, totalCarbs: 12, totalFat: 15, saturatedFat: 4.2, cholesterol: 45, sodium: 620, dietaryFiber: 2.5, sugars: 3.8, potassium: 310, servingQty: 1, servingUnit: 'cup', servingWeightGrams: 236, photo: null },
  'pancakes': { foodName: 'pancakes', calories: 227, protein: 6.4, totalCarbs: 28, totalFat: 10, saturatedFat: 2.4, cholesterol: 40, sodium: 438, dietaryFiber: 0.9, sugars: 5.3, potassium: 112, servingQty: 2, servingUnit: 'pancakes', servingWeightGrams: 154, photo: null },
  'egg': { foodName: 'egg', calories: 78, protein: 6, totalCarbs: 0.6, totalFat: 5.3, saturatedFat: 1.6, cholesterol: 186, sodium: 62, dietaryFiber: 0, sugars: 0.6, potassium: 63, servingQty: 1, servingUnit: 'large', servingWeightGrams: 50, photo: null },
  'meatball': { foodName: 'meatball', calories: 87, protein: 6, totalCarbs: 3.7, totalFat: 5.4, saturatedFat: 2.1, cholesterol: 27, sodium: 180, dietaryFiber: 0.2, sugars: 0.5, potassium: 95, servingQty: 1, servingUnit: 'meatball', servingWeightGrams: 40, photo: null },
  'french fries': { foodName: 'french fries', calories: 312, protein: 3.4, totalCarbs: 41, totalFat: 15, saturatedFat: 2.3, cholesterol: 0, sodium: 210, dietaryFiber: 3.8, sugars: 0.3, potassium: 579, servingQty: 1, servingUnit: 'medium serving', servingWeightGrams: 117, photo: null },
  'naan': { foodName: 'naan bread', calories: 262, protein: 8.7, totalCarbs: 45, totalFat: 5.1, saturatedFat: 1.2, cholesterol: 8, sodium: 418, dietaryFiber: 1.8, sugars: 3.2, potassium: 110, servingQty: 1, servingUnit: 'piece', servingWeightGrams: 90, photo: null },
};

// Default fallback for unknown foods
const DEFAULT_NUTRITION = {
  calories: 150, protein: 5, totalCarbs: 20, totalFat: 6,
  saturatedFat: 1.5, cholesterol: 10, sodium: 200, dietaryFiber: 1.5,
  sugars: 3, potassium: 100, servingQty: 1, servingUnit: 'serving',
  servingWeightGrams: 100, photo: null,
};

export const getNutritionData = async (query) => {
  await delay(800); // simulate API call

  const key = query.toLowerCase().trim();
  const match = NUTRITION_DB[key];

  if (match) {
    return [{ ...match }];
  }

  // Try partial match
  const partialKey = Object.keys(NUTRITION_DB).find((k) => key.includes(k) || k.includes(key));
  if (partialKey) {
    return [{ ...NUTRITION_DB[partialKey], foodName: query }];
  }

  // Return default with food name
  return [{ ...DEFAULT_NUTRITION, foodName: query }];
};

export const searchFood = async (query) => {
  await delay(300);
  const results = Object.keys(NUTRITION_DB)
    .filter((k) => k.includes(query.toLowerCase()))
    .slice(0, 10)
    .map((k) => ({
      foodName: NUTRITION_DB[k].foodName,
      photo: null,
      type: 'common',
    }));
  return results;
};

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
