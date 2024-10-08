import { AnnouncementComment } from './announcement-comment.model';
import { Person } from './person.model';

export interface Announcement {
  id?: number;
  name?: string;
  date?: string;
  content?: string;
  creator?: Person;
  comments?: AnnouncementComment[];
}
