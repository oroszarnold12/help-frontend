import { ConversationMessage } from './conversation-message.model';
import { ThinPerson } from './thin.person.model';

export interface Conversation {
  id?: number;
  name?: string;
  participants?: ThinPerson[];
  creator?: ThinPerson;
  messages?: ConversationMessage[];
  lastMessage?: ConversationMessage;
}
