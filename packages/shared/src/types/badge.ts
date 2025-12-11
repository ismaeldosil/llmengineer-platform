export type BadgeCategory = 'progress' | 'streak' | 'completion' | 'mastery' | 'special';

export interface Badge {
  id: string;
  slug?: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  earnedAt?: string;
}

export interface BadgesResponse {
  earned: Badge[];
  locked: Badge[];
}
