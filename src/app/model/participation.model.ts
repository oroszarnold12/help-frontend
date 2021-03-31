import { Course } from "./course.model";

export interface Participation {
  course?: Course;
  showOnDashboard?: boolean;
}
