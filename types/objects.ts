export interface Questionnaire {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

export interface Flashcard {
  id: string;
  questionnaire_id: string;
  question: string;
  answer: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}