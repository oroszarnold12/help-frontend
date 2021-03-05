import { Time } from "@angular/common";

export interface Quiz {
  id?: number;
  name?: string;
  description?: string;
  dueDate?: Date;
  timeLimit?: Time;
  points?: number;
}
