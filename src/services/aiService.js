import axios from 'axios';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebaseConfig';

const CLARIFAI_PAT = import.meta.env.VITE_CLARIFAI_PAT;
const CLARIFAI_USER_ID = import.meta.env.VITE_CLARIFAI_USER_ID || 'clarifai';
const CLARIFAI_APP_ID = import.meta.env.VITE_CLARIFAI_APP_ID || 'main';
const CLARIFAI_MODEL_ID = import.meta.env.VITE_CLARIFAI_MODEL_ID || 'food-item-recognition';

/**
 * Upload image to Firebase Storage and return download URL
 */
export const uploadFoodImage = async (file, userId) => {
  const timestamp = Date.now();
  const storageRef = ref(storage, `food-images/${userId}/${timestamp}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};

/**
 * Recognize food in an image using Clarifai food-item-recognition model
 */
export const recognizeFood = async (imageFile, userId) => {
  // Upload image to Firebase Storage first
  const imageUrl = await uploadFoodImage(imageFile, userId);

  // Call Clarifai API
  const response = await axios.post(
    `https://api.clarifai.com/v2/models/${CLARIFAI_MODEL_ID}/outputs`,
    {
      user_app_id: {
        user_id: CLARIFAI_USER_ID,
        app_id: CLARIFAI_APP_ID,
      },
      inputs: [
        {
          data: {
            image: {
              url: imageUrl,
            },
          },
        },
      ],
    },
    {
      headers: {
        Authorization: `Key ${CLARIFAI_PAT}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const concepts = response.data.outputs[0]?.data?.concepts || [];

  // Return top food items with confidence > 0.1
  const foodItems = concepts
    .filter((c) => c.value > 0.1)
    .slice(0, 10)
    .map((c) => ({
      name: c.name,
      confidence: Math.round(c.value * 100),
    }));

  return {
    imageUrl,
    foodItems,
    topFood: foodItems.length > 0 ? foodItems[0].name : null,
  };
};

/**
 * Recognize food from base64 encoded image data
 */
export const recognizeFoodFromBase64 = async (base64Data) => {
  const response = await axios.post(
    `https://api.clarifai.com/v2/models/${CLARIFAI_MODEL_ID}/outputs`,
    {
      user_app_id: {
        user_id: CLARIFAI_USER_ID,
        app_id: CLARIFAI_APP_ID,
      },
      inputs: [
        {
          data: {
            image: {
              base64: base64Data,
            },
          },
        },
      ],
    },
    {
      headers: {
        Authorization: `Key ${CLARIFAI_PAT}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const concepts = response.data.outputs[0]?.data?.concepts || [];

  return concepts
    .filter((c) => c.value > 0.1)
    .slice(0, 10)
    .map((c) => ({
      name: c.name,
      confidence: Math.round(c.value * 100),
    }));
};
