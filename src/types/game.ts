export interface ElementData {
  name: string;
  symbol: string;
  number: number;
  category: string;
  atomic_mass: number;
  xpos: number;
  ypos: number;
}

export interface Question {
  id: number;
  text: string;
  correctElement: string; // Element symbol (e.g., "H", "He", "Li")
  hint?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export type CategoryFilter = 'all' | string;
export type ViewMode = 'standard' | 'compact';
