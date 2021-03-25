export interface Quiz {
  id?: number;
  name?: string;
  description?: string;
  dueDate?: Date;
  timeLimit?: string;
  points?: number;
  showCorrectAnswers?: boolean;
  multipleAttempts?: boolean;
  published?: boolean;
}
