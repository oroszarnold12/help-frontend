import { IonDatetime } from "@ionic/angular";

export interface Assignment {
  id?: number;
  name?: string;
  dueDate?: string;
  points?: number;
  description?: string;
}
