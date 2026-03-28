# 🍎 NutriAI - AI Food Tracker & Health Dashboard

**NutriAI** is a production-ready, full-stack web application designed to help you track your nutrition journey using AI. It features a complete **Eat → Burn → Track → Suggest** cycle.

## 🚀 Key Features

- **🤖 AI Food Recognition**: Upload or take a photo of your food, and our AI (Clarifai) will identify it instantly.
- **📊 Real-time Nutrition**: Fetch accurate calorie and macro-nutrient data via the Nutritionix API.
- **💪 Exercise Recommendations**: Personalized workout suggestions based on your net calorie intake using the MET formula.
- **🔥 Interactive Dashboard**: Visualize your progress with daily/weekly charts, calorie rings, and BMI/BMR metrics.
- **📱 PWA Ready**: Install NutriAI on your mobile home screen for a native app-like experience.
- **🎮 Demo Mode**: Try the app immediately without any configuration using built-in mock services.

## 🛠️ Technology Stack

- **Frontend**: React.js (Vite), React Router, Chart.js
- **Backend/Services**: Firebase (Auth, Firestore, Storage)
- **APIs**: Clarifai (Recognition), Nutritionix (Nutrition Data)
- **Styling**: Vanilla CSS with modern Glassmorphism design

## 📦 Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone [your-repo-url]
   cd ttmini
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory based on `.env.example`.

4. **Run development server**:
   ```bash
   npm run dev
   ```

## 📄 License

MIT License - feel free to use this for your own projects!
