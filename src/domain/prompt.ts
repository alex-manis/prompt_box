export type Category = 'Coding' | 'Writing' | 'Marketing' | 'Other';

export const CATEGORIES: Category[] = ['Coding', 'Writing', 'Marketing', 'Other'];

export interface Prompt {
  id: string;
  title: string;
  category: Category;
  template: string;
  createdAt: number;
  updatedAt: number;
}

export interface PromptFormData {
  title: string;
  category: Category;
  template: string;
}
