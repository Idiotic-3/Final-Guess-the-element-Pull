import { Achievement } from "@/types/achievements";

export const achievements: Achievement[] = [
  {
    id: "first_win",
    name: "First Victory",
    description: "Get your first correct answer",
    icon: "🎯",
    requirement: 1,
    type: "score",
    unlocked: false,
    progress: 0
  },
  {
    id: "perfect_game",
    name: "Perfect Game",
    description: "Get all answers correct in a game",
    icon: "🌟",
    requirement: 1,
    type: "score",
    unlocked: false,
    progress: 0
  },
  {
    id: "streak_3",
    name: "On Fire",
    description: "Get a streak of 3 correct answers",
    icon: "🔥",
    requirement: 3,
    type: "streak",
    unlocked: false,
    progress: 0
  },
  {
    id: "streak_5",
    name: "Unstoppable",
    description: "Get a streak of 5 correct answers",
    icon: "⚡",
    requirement: 5,
    type: "streak",
    unlocked: false,
    progress: 0
  },
  {
    id: "games_10",
    name: "Dedicated Chemist",
    description: "Play 10 games",
    icon: "🧪",
    requirement: 10,
    type: "total_games",
    unlocked: false,
    progress: 0
  },
  {
    id: "games_50",
    name: "Element Master",
    description: "Play 50 games",
    icon: "👨‍🔬",
    requirement: 50,
    type: "total_games",
    unlocked: false,
    progress: 0
  }
];
