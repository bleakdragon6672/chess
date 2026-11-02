export type AppTab = "play" | "puzzles" | "learn" | "review" | "coach";

export type BotProfile = {
  id: number;
  name: string;
  title: string;
  avatar: string;
  color: string;
  bio: string;
  style: string;
  repertoire: string[];
  skill: number;
  blunderRate: number;
  traits: string[];
};

export type PlayedMove = {
  san: string;
  from: string;
  to: string;
  color: "w" | "b";
  captured?: string;
  isCheck?: boolean;
  classification?: string;
};

export type FloatingBadge = {
  id: number;
  square: string;
  label: string;
  tone: "mint" | "amber" | "red" | "blue";
};

export type Opening = {
  name: string;
  eco: string;
  moves: string;
  category: string;
  score: string;
  concept: string;
  tags: string[];
};

export type Puzzle = {
  id: number;
  title: string;
  theme: string;
  rating: number;
  difficulty: string;
  fen: string;
  solution: string;
  hint: string;
};
