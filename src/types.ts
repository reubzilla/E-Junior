export interface Word {
  term: string;
  definition: string;
  example: string;
}

export interface GrammarPoint {
  title: string;
  description: string;
  examples: string[];
}

export interface Presentation {
  id: string;
  title: string;
  task: string;
  scaffolding: string[];
}

export interface RubricCriterion {
  name: string;
  description: string;
  maxPoints: number;
}

export interface Unit {
  id: string;
  levelId: number;
  unitNumber: number;
  title: string;
  vocabulary: Word[];
  grammar: GrammarPoint[];
  presentations: Presentation[];
  rubric: RubricCriterion[];
}

export interface Level {
  id: number;
  name: string;
  units: Unit[];
}

export interface SyllabusSection {
  id: string;
  title: string;
  content: string;
  icon: 'Target' | 'Calendar' | 'Award' | 'Info';
}

export interface SyllabusData {
  id: string;
  title: string;
  description: string;
  sections: SyllabusSection[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
