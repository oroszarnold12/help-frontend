import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { ConversationMessage } from "../model/conversation-message.model";
import { Conversation } from "../model/conversation.model";
import { url } from "./api-config";

@Injectable({
  providedIn: "root",
})
export class ConversationService {
  private newMessage = new Subject<void>();
  newMessage$ = this.newMessage.asObservable();

  constructor(private httpClient: HttpClient) {}

  getConversations(): Observable<Conversation[]> {
    return this.httpClient.get<Conversation[]>(`${url}/conversations`);
  }

  getConversation(conversationId: number): Observable<Conversation> {
    return this.httpClient.get<Conversation>(
      `${url}/conversations/${conversationId}`
    );
  }

  saveConversation(emails: string[], name?: string): Observable<Conversation> {
    return this.httpClient.post<Conversation>(`${url}/conversations/`, {
      emails: emails,
      name: name,
    });
  }

  addConversationParticipants(
    conversationId: number,
    emails: string[]
  ): Observable<Conversation> {
    return this.httpClient.post<Conversation>(
      `${url}/conversations/${conversationId}/participants`,
      {
        emails: emails,
      }
    );
  }

  kickConversationParticipant(
    conversationId: number,
    participantId: number
  ): Observable<void> {
    return this.httpClient.delete<void>(
      `${url}/conversations/${conversationId}/participants/${participantId}`
    );
  }

  saveConversationMessage(
    conversationId: number,
    content: string
  ): Observable<ConversationMessage> {
    return this.httpClient.post<ConversationMessage>(
      `${url}/conversations/${conversationId}/messages`,
      {
        content: content,
      }
    );
  }

  updateConversationMessage(
    conversationId: number,
    messageId: number,
    content: string
  ): Observable<ConversationMessage> {
    return this.httpClient.put<ConversationMessage>(
      `${url}/conversations/${conversationId}/messages/${messageId}`,
      {
        content: content,
      }
    );
  }

  onNewMessageReceived(): void {
    this.newMessage.next();
  }
}
