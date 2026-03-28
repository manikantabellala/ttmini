import axios from 'axios';

const NUTRITIONIX_APP_ID = import.meta.env.VITE_NUTRITIONIX_APP_ID;
const NUTRITIONIX_API_KEY = import.meta.env.VITE_NUTRITIONIX_API_KEY;

const nutritionixApi = axios.create({
  baseURL: 'https://trackapi.nutritionix.com/v2',
  headers: {
    'x-app-id': NUTRITIONIX_APP_ID,
    'x-app-key': NUTRITIONIX_API_KEY,
    'Content-Type': 'application/json',
  },
});

/**
 * Get nutrition data for a food item using Nutritionix natural language API
 * @param {string} query - Natural language food query, e.g., "1 cup of rice"
 * @returns {Object} Nutrition data including calories, protein, carbs, fat
 */
export const getNutritionData = async (query) => {
  try {
    const response = await nutritionixApi.post('/natural/nutrients', {
      query: query,
    });

    const foods = response.data.foods || [];

    return foods.map((food) => ({
      foodName: food.food_name,
      brandName: food.brand_name || null,
      servingQty: food.serving_qty,
      servingUnit: food.serving_unit,
      servingWeightGrams: food.serving_weight_grams,
      calories: Math.round(food.nf_calories || 0),
      totalFat: Math.round((food.nf_total_fat || 0) * 10) / 10,
      saturatedFat: Math.round((food.nf_saturated_fat || 0) * 10) / 10,
      cholesterol: Math.round(food.nf_cholesterol || 0),
      sodium: Math.round(food.nf_sodium || 0),
      totalCarbs: Math.round((food.nf_total_carbohydrate || 0) * 10) / 10,
      dietaryFiber: Math.round((food.nf_dietary_fiber || 0) * 10) / 10,
      sugars: Math.round((food.nf_sugars || 0) * 10) / 10,
      protein: Math.round((food.nf_protein || 0) * 10) / 10,
      potassium: Math.round(food.nf_potassium || 0),
      photo: food.photo?.thumb || null,
    }));
  } catch (error) {
    console.error('Nutritionix API error:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch nutrition data. Please try again.'
    );
  }
};

/**
 * Search for food items by name
 * @param {string} query - Food search query
 * @returns {Array} List of matching food items
 */
export const searchFood = async (query) => {
  try {
    const response = await nutritionixApi.get('/search/instant', {
      params: { query },
    });

    const common = (response.data.common || []).slice(0, 10).map((food) => ({
      foodName: food.food_name,
      photo: food.photo?.thumb || null,
      type: 'common',
    }));

    const branded = (response.data.branded || []).slice(0, 5).map((food) => ({
      foodName: food.food_name,
      brandName: food.brand_name,
      calories: food.nf_calories,
      photo: food.photo?.thumb || null,
      type: 'branded',
    }));

    return [...common, ...branded];
  } catch (error) {
    console.error('Nutritionix search error:', error.response?.data || error.message);
    throw new Error('Failed to search food items.');
  }
};
