import { ConversationMessage } from './conversation-message.model';
import { Person } from './person.model';

export interface Conversation {
  id?: number;
  name?: string;
  participants?: Person[];
  creator?: Person;
  messages?: ConversationMessage[];
  lastMessage?: ConversationMessage;
}
