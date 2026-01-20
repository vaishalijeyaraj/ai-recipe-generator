# 🍽️ AI Recipe Generator

AI Recipe Generator is a web application that generates personalized cooking recipes based on user-provided ingredients and preferences.  
The project focuses on combining modern frontend development with generative AI to make home cooking easier, faster, and more creative.

---

## 🚀 Features

- 🥕 Generate recipes using available ingredients  
- 🧠 AI-powered recipe generation with clear, step-by-step instructions  
- ⚙️ Preference-based customization (dietary choices, cooking style, etc.)
- 🎨 Clean, modern, and responsive user interface
- ⏳ Smooth user experience with loading states and error handling

---

## 🛠️ Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

### AI & Backend Integration
- Google Gemini API (Generative AI)
- Serverless functions for AI requests

### Other Tools
- Supabase (API integration & backend services)

---

## 📂 Project Structure
src/
├── components/ # Reusable UI components
├── pages/ # Application pages
├── hooks/ # Custom React hooks
├── integrations/ # External service integrations
├── types/ # TypeScript type definitions
└── App.tsx # Main application entry point


---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18 or above)
- npm

### Steps to Run Locally

```bash
# Clone the repository
git clone https://github.com/vaishalijeyaraj/ai-recipe-generator.git

# Navigate into the project directory
cd <your-repo-name>

# Install dependencies
npm install

# Start the development server
npm run dev


The application will be available at:
👉 http://localhost:5173


🔐 Environment Variables

Create a .env file in the root directory and add the following:

VITE_GEMINI_API_KEY=your_api_key_here


⭐ Acknowledgements

Google Gemini API
React ecosystem
Tailwind CSS community


---




