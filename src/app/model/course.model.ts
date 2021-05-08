import { Announcement } from './announcement.model';
import { Assignment } from './assignment.model';
import { CourseFile } from './course-file.model';
import { Discussion } from './discussion.model';
import { Person } from './person.model';
import { Quiz } from './quiz.model';

export interface Course {
  id?: number;
  name?: string;
  longName?: string;
  description?: string;
  assignments?: Assignment[];
  announcements?: Announcement[];
  discussions?: Discussion[];
  files?: CourseFile[];
  teacher?: Person;
  quizzes?: Quiz[];
}
