
export interface ElementData {
  name: string;
  symbol: string;
  atomicNumber: number;
  category: string;
  group: number;
  period: number;
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
