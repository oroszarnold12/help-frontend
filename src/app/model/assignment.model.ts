import { IonDatetime } from "@ionic/angular";

export interface Assignment {
  id?: number;
  name?: string;
  dueData?: string;
  points?: number;
  description?: string;
}
