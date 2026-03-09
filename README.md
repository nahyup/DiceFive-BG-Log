# Dice Five: Board Game Log

Dice Five is a comprehensive, local-first web application designed for board game enthusiasts to track their collections, log their gaming sessions, and generate insightful statistics about their family and friends' tabletop adventures.

![Statistics Dashboard Preview](https://via.placeholder.com/800x400?text=Dice+Five+Statistics+Dashboard)

## ✨ Features

- **Game Collection Manager**: Maintain a detailed catalog of your board games, including cover images, playtime, player counts, and a BGG (BoardGameGeek) style complexity rating.
- **Player Management**: Add and manage profiles for everyone in your gaming circle. Classify them by groups (e.g., Family, Friend) and attach custom avatars/profile pictures.
- **Session Logging**: A streamlined interface to record who played what, when, and what they scored. Supports identical tie-breakers (Joint 1st Place) natively. 
- **Deep Statistics Dashboard**:
  - Automatically calculates player win rates, total plays, and high scores.
  - Highlights the **Top Player** (most wins) for each of your "Most Played" games.
  - Generates comprehensive overall collection analytics.
- **Data Persistence**: Uses a custom Vite plugin proxy to persist your collection, players, and logs directly to a `data.json` file in your local environment, completely circumventing typical browser `localStorage` limits.

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 + `clsx` / `tailwind-merge`
- **State Management**: Zustand (with custom JSON persistence middleware)
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (version 18+ recommended) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd boardgame-log
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the address shown in your terminal (typically `http://localhost:5173`).

---

## 💾 How Data is Saved
This application uses a unique local persistence layer. When actions are taken in the app (like adding a game), Zustand triggers an asynchronous request to `/api/data`, which is intercepted by a custom Vite plugin (`vite.config.ts`). 

This plugin writes your state directly to `data.json` at the root of the project. This means your data is perfectly safe even if you clear your browser history or switch browsers, as long as you restart the dev server in the same directory!

## 🤝 Contributing
Feel free to open issues or submit pull requests. If you're adding new features that modify the global state, ensure you update the interfaces within `src/store/useBoardGameStore.ts`.
