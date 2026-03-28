/**
 * Demo AI Service — returns mock food recognition results
 * instead of calling Clarifai API
 */

const MOCK_FOOD_RESULTS = [
  [
    { name: 'pizza', confidence: 96 },
    { name: 'cheese pizza', confidence: 88 },
    { name: 'pepperoni', confidence: 72 },
    { name: 'flatbread', confidence: 45 },
    { name: 'tomato sauce', confidence: 38 },
  ],
  [
    { name: 'hamburger', confidence: 94 },
    { name: 'cheeseburger', confidence: 87 },
    { name: 'beef patty', confidence: 65 },
    { name: 'french fries', confidence: 52 },
    { name: 'bun', confidence: 41 },
  ],
  [
    { name: 'salad', confidence: 92 },
    { name: 'caesar salad', confidence: 78 },
    { name: 'lettuce', confidence: 71 },
    { name: 'croutons', confidence: 48 },
    { name: 'parmesan', confidence: 35 },
  ],
  [
    { name: 'spaghetti', confidence: 95 },
    { name: 'pasta', confidence: 89 },
    { name: 'bolognese', confidence: 74 },
    { name: 'meatball', confidence: 56 },
    { name: 'parsley', confidence: 32 },
  ],
  [
    { name: 'fried rice', confidence: 93 },
    { name: 'rice', confidence: 86 },
    { name: 'chicken', confidence: 68 },
    { name: 'vegetables', confidence: 55 },
    { name: 'egg', confidence: 42 },
  ],
  [
    { name: 'sushi', confidence: 97 },
    { name: 'salmon', confidence: 82 },
    { name: 'rice', confidence: 73 },
    { name: 'nori', confidence: 61 },
    { name: 'wasabi', confidence: 39 },
  ],
  [
    { name: 'chicken curry', confidence: 91 },
    { name: 'curry', confidence: 85 },
    { name: 'rice', confidence: 69 },
    { name: 'naan', confidence: 54 },
    { name: 'turmeric', confidence: 33 },
  ],
  [
    { name: 'pancakes', confidence: 94 },
    { name: 'syrup', confidence: 76 },
    { name: 'butter', confidence: 62 },
    { name: 'blueberry', confidence: 48 },
    { name: 'breakfast', confidence: 39 },
  ],
];

export const uploadFoodImage = async (file, userId) => {
  await delay(300);
  return URL.createObjectURL(file);
};

export const recognizeFood = async (imageFile, userId) => {
  await delay(1500); // simulate AI processing time

  const imageUrl = URL.createObjectURL(imageFile);
  const randomIndex = Math.floor(Math.random() * MOCK_FOOD_RESULTS.length);
  const foodItems = MOCK_FOOD_RESULTS[randomIndex];

  return {
    imageUrl,
    foodItems,
    topFood: foodItems[0].name,
  };
};
