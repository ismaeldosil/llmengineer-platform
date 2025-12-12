export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface LessonSection {
  title: string;
  content: string;
  codeExample?: string;
  keyPoints?: string[];
}

export interface Lesson {
  id: string;
  slug: string;
  title: string;
  description: string;
  week: number;
  order: number;
  difficulty: Difficulty;
  xpReward: number;
  estimatedMinutes: number;
  contentUrl?: string;
  sections?: LessonSection[];
  isCompleted?: boolean;
}

export interface LessonCompletion {
  lessonId: string;
  xpEarned: number;
  completedAt: string;
}

export interface CompleteLessonRequest {
  timeSpentSeconds: number;
}
