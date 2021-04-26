import { ThinPerson } from "./thin.person.model";

export interface ConversationMessage {
  id?: number;
  content?: string;
  creationDate?: Date;
  creator?: ThinPerson;
  deleted?: boolean;
}
