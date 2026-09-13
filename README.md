# 🍽️ AI Recipe Generator

A recipe generator that turns whatever ingredients you have into a real, cookable recipe — but instead of a single AI call that trusts whatever comes back, this project runs a small multi-step pipeline: it checks whether your ingredients actually fit your dietary preference *before* generating anything, critiques its own output for realism after generating, and grounds nutrition numbers in real USDA data instead of letting the AI guess.

Originally scaffolded with Lovable; since rebuilt with a self-hosted backend, an original Gemini integration, and three additional AI-engineering features documented below.

---

## How it works

1. **Feasibility check** — before generating a recipe, a lightweight AI call checks whether the given ingredients realistically fit the requested diet (e.g. rice + quinoa don't fit "keto"). If there's a real conflict, the user sees a plain-language explanation with real comparative numbers (e.g. "rice: ~45g carbs/cup vs cauliflower rice: ~3g carbs/cup") and chooses whether to accept a substitution or change their diet — instead of the app silently deciding for them.
2. **Recipe generation, grounded in real nutrition data** — ingredient nutrition facts are looked up live from the USDA FoodData Central database and handed to the model as real numbers, so `nutritionInfo` is calculated from facts rather than estimated from training data.
3. **Critic / refine loop** — after generation, a second AI call reviews the recipe against the original requirements (serving-size math, realistic total time, whether the given ingredients are actually central to the dish). If it finds a real problem, the recipe is regenerated with the specific issue called out, up to one retry.

## Why it's built this way

This started as a single LLM call wrapped in a UI. Before adding anything else, I built a 15-case adversarial test set to find out what actually breaks in single-shot recipe generation, rather than guessing. The tests showed the model rarely violates dietary rules outright — but it does sometimes silently substitute ingredients the user explicitly asked for, without saying so. That's the specific problem the feasibility-check step exists to solve. Full write-up, including two data-quality bugs found while integrating the USDA API (a bad ingredient match, and a kcal/kJ unit mix-up), is in [`server/test-results/FINDINGS.md`](server/test-results/FINDINGS.md).

---

## Tech stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui

**Backend:** Node.js, Express — self-hosted, no third-party AI gateway

**AI:** Google Gemini API (`gemini-3.6-flash`), called directly with an original API key

**External data:** USDA FoodData Central API (nutrition grounding)

---

## Project structure

```text
src/                        # Frontend
├── components/              # Reusable UI components (incl. ConflictCard)
├── pages/                   # Application pages
├── hooks/                   # Custom hooks (useRecipeGenerator)
├── types/                   # TypeScript type definitions
└── App.tsx

server/                     # Backend
├── index.js                 # Express server: feasibility check, generation, critic loop, USDA lookup
├── test-cases.js             # 15 adversarial test cases
├── run-tests.js               # Runs all test cases against the live server
├── rerun-single.js            # Re-runs a single test case by id
├── test-critic.js             # Isolated sanity check for the critic function
├── test-usda.js                # Isolated sanity check for the USDA lookup
└── test-results/                # Saved AI responses + FINDINGS.md write-up
```

---

## Running it locally

This project has two parts that both need to run at the same time: the backend and the frontend.

### Prerequisites
- Node.js (v18 or above)
- A free [Gemini API key](https://aistudio.google.com/apikey)
- A free [USDA FoodData Central API key](https://fdc.nal.usda.gov/api-key-signup.html)

### 1. Clone and install

```bash
git clone https://github.com/vaishalijeyaraj/ai-recipe-generator.git
cd ai-recipe-generator
npm install
```

### 2. Set up and start the backend

```bash
cd server
npm install
```

Create a `.env` file inside `server/`:
```env
GEMINI_API_KEY=your_gemini_key_here
USDA_API_KEY=your_usda_key_here
```

Start it:
```bash
npm start
```
Server runs at `http://localhost:3001`.

### 3. Set up and start the frontend

In a separate terminal, from the project root:

Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:3001
```

```bash
npm run dev
```
App runs at `http://localhost:8080` (or whatever port Vite reports).

### 4. Running the test harness (optional)

```bash
cd server
node run-tests.js
```
Runs all 15 adversarial test cases against the live server and saves results to `test-results/`.

---

## Acknowledgements

- Google Gemini API
- USDA FoodData Central
- React ecosystem
- Tailwind CSS community