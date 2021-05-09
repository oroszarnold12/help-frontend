import { Person } from './person.model';

export interface ConversationMessage {
  id?: number;
  content?: string;
  creationDate?: Date;
  creator?: Person;
  deleted?: boolean;
}
