import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../context/AuthContext';
import { recognizeFood, getNutritionData, logFood } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const FoodUploadPage = () => {
  const { user } = useAuth();
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [recognizing, setRecognizing] = useState(false);
  const [fetchingNutrition, setFetchingNutrition] = useState(false);
  const [foodItems, setFoodItems] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [nutritionData, setNutritionData] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [mealType, setMealType] = useState('lunch');
  const [servings, setServings] = useState(1);
  const [logging, setLogging] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const f = acceptedFiles[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setFoodItems([]);
      setNutritionData(null);
      setSelectedFood(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleRecognize = async () => {
    if (!file) return;
    setRecognizing(true);
    try {
      const result = await recognizeFood(file, user.uid);
      setFoodItems(result.foodItems);
      setImageUrl(result.imageUrl);
      if (result.topFood) {
        handleSelectFood(result.topFood);
      }
      toast.success(`Found ${result.foodItems.length} food items!`);
    } catch (err) {
      console.error('Recognition error:', err);
      toast.error('Failed to recognize food. Check your Clarifai API key.');
    } finally {
      setRecognizing(false);
    }
  };

  const handleSelectFood = async (foodName) => {
    setSelectedFood(foodName);
    setFetchingNutrition(true);
    setNutritionData(null);
    try {
      const data = await getNutritionData(foodName);
      if (data.length > 0) {
        setNutritionData(data[0]);
      }
    } catch (err) {
      console.error('Nutrition error:', err);
      toast.error('Failed to fetch nutrition data. Check your Nutritionix API key.');
    } finally {
      setFetchingNutrition(false);
    }
  };

  const handleLog = async () => {
    if (!nutritionData) return;
    setLogging(true);
    try {
      const entry = {
        foodName: nutritionData.foodName,
        calories: Math.round(nutritionData.calories * servings),
        protein: Math.round(nutritionData.protein * servings * 10) / 10,
        totalCarbs: Math.round(nutritionData.totalCarbs * servings * 10) / 10,
        totalFat: Math.round(nutritionData.totalFat * servings * 10) / 10,
        servingQty: servings,
        servingUnit: nutritionData.servingUnit,
        imageUrl: imageUrl,
        mealType: mealType,
      };
      await logFood(user.uid, entry);
      toast.success('Food logged successfully! 🎉');

      // Reset
      setFile(null);
      setPreview(null);
      setFoodItems([]);
      setNutritionData(null);
      setSelectedFood(null);
      setServings(1);
    } catch (err) {
      console.error('Log error:', err);
      toast.error('Failed to log food.');
    } finally {
      setLogging(false);
    }
  };

  const removeImage = () => {
    setFile(null);
    setPreview(null);
    setFoodItems([]);
    setNutritionData(null);
    setSelectedFood(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Food Scanner</h1>
        <p>Upload a food image and let AI identify it, then get instant nutrition data.</p>
      </div>

      <div className="grid-2">
        {/* Left Column: Upload & Results */}
        <div>
          {/* Upload Zone */}
          {!preview ? (
            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`} id="food-dropzone">
              <input {...getInputProps()} />
              <div className="dropzone-icon">📸</div>
              <p className="dropzone-text">
                <strong>Click to upload</strong> or drag & drop a food image
              </p>
              <p className="dropzone-hint">JPG, PNG, WEBP (max 10MB)</p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="image-preview">
                <img src={preview} alt="Food preview" />
                <button className="remove-btn" onClick={removeImage}>✕</button>
              </div>
              <div style={{ padding: '16px 20px' }}>
                <button
                  className="btn btn-primary w-full"
                  onClick={handleRecognize}
                  disabled={recognizing}
                  id="recognize-btn"
                >
                  {recognizing ? '🔍 Analyzing...' : '🤖 Recognize Food'}
                </button>
              </div>
            </div>
          )}

          {/* Recognition Results */}
          {recognizing && <LoadingSpinner text="AI is analyzing your food..." />}

          {foodItems.length > 0 && (
            <div className="card mt-2 animate-slide-up">
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>
                🎯 Detected Food Items
              </h3>
              {foodItems.map((item, i) => (
                <div
                  key={i}
                  className="food-result-item"
                  style={{
                    cursor: 'pointer',
                    border: selectedFood === item.name ? '1px solid var(--accent-primary)' : '1px solid transparent',
                  }}
                  onClick={() => handleSelectFood(item.name)}
                >
                  <span className="food-name">{item.name}</span>
                  <span className="food-confidence">{item.confidence}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Nutrition & Log */}
        <div>
          {fetchingNutrition && <LoadingSpinner text="Fetching nutrition data..." />}

          {nutritionData && (
            <div className="nutrition-card animate-slide-up">
              <div className="nutrition-header">
                {nutritionData.photo && (
                  <img src={nutritionData.photo} alt={nutritionData.foodName} />
                )}
                <div>
                  <div className="food-title">{nutritionData.foodName}</div>
                  <div className="food-serving">
                    {nutritionData.servingQty} {nutritionData.servingUnit}
                    {nutritionData.servingWeightGrams &&
                      ` (${nutritionData.servingWeightGrams}g)`}
                  </div>
                </div>
              </div>

              {/* Macros */}
              <div className="nutrition-macros">
                <div className="macro-item macro-calories">
                  <div className="macro-value">{Math.round(nutritionData.calories * servings)}</div>
                  <div className="macro-label">Calories</div>
                </div>
                <div className="macro-item macro-protein">
                  <div className="macro-value">{Math.round(nutritionData.protein * servings)}g</div>
                  <div className="macro-label">Protein</div>
                </div>
                <div className="macro-item macro-carbs">
                  <div className="macro-value">{Math.round(nutritionData.totalCarbs * servings)}g</div>
                  <div className="macro-label">Carbs</div>
                </div>
                <div className="macro-item macro-fat">
                  <div className="macro-value">{Math.round(nutritionData.totalFat * servings)}g</div>
                  <div className="macro-label">Fat</div>
                </div>
              </div>

              {/* Detailed Nutrition */}
              <div style={{ marginBottom: 18 }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: 10, color: 'var(--text-secondary)' }}>
                  Detailed Nutrition
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {[
                    ['Saturated Fat', `${nutritionData.saturatedFat}g`],
                    ['Cholesterol', `${nutritionData.cholesterol}mg`],
                    ['Sodium', `${nutritionData.sodium}mg`],
                    ['Fiber', `${nutritionData.dietaryFiber}g`],
                    ['Sugars', `${nutritionData.sugars}g`],
                    ['Potassium', `${nutritionData.potassium}mg`],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                      <span style={{ fontWeight: 600 }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Servings */}
              <div className="form-group">
                <label className="form-label">Number of Servings</label>
                <input
                  type="number"
                  className="form-input"
                  value={servings}
                  onChange={(e) => setServings(Math.max(0.5, Number(e.target.value)))}
                  min="0.5"
                  step="0.5"
                  id="servings-input"
                />
              </div>

              {/* Meal Type */}
              <div className="form-group">
                <label className="form-label">Meal Type</label>
                <div className="meal-selector">
                  {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                    <button
                      key={type}
                      className={`meal-btn ${mealType === type ? 'active' : ''}`}
                      onClick={() => setMealType(type)}
                    >
                      {type === 'breakfast' ? '🌅' : type === 'lunch' ? '☀️' : type === 'dinner' ? '🌙' : '🍿'}
                      {' '}{type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Log Button */}
              <button
                className="btn btn-success btn-lg w-full mt-2"
                onClick={handleLog}
                disabled={logging}
                id="log-food-btn"
              >
                {logging ? 'Logging...' : `✅ Log ${Math.round(nutritionData.calories * servings)} kcal`}
              </button>
            </div>
          )}

          {!nutritionData && !fetchingNutrition && foodItems.length === 0 && (
            <div className="card">
              <div className="empty-state">
                <div className="empty-icon">🍽️</div>
                <h3>Upload a food photo</h3>
                <p>Our AI will identify the food and show you detailed nutrition information.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodUploadPage;
