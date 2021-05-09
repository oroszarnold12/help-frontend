import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SERVER_URL } from 'src/environments/environment';
import { ConversationMessage } from '../model/conversation-message.model';
import { Conversation } from '../model/conversation.model';

@Injectable({
  providedIn: 'root',
})
export class ConversationService {
  private newMessage = new Subject<void>();
  newMessage$ = this.newMessage.asObservable();

  constructor(private httpClient: HttpClient) {}

  getConversations(): Observable<Conversation[]> {
    return this.httpClient.get<Conversation[]>(`${SERVER_URL}/conversations`);
  }

  getConversation(conversationId: number): Observable<Conversation> {
    return this.httpClient.get<Conversation>(
      `${SERVER_URL}/conversations/${conversationId}`
    );
  }

  saveConversation(emails: string[], name?: string): Observable<Conversation> {
    return this.httpClient.post<Conversation>(`${SERVER_URL}/conversations/`, {
      emails,
      name,
    });
  }

  addConversationParticipants(
    conversationId: number,
    emails: string[]
  ): Observable<Conversation> {
    return this.httpClient.post<Conversation>(
      `${SERVER_URL}/conversations/${conversationId}/participants`,
      {
        emails,
      }
    );
  }

  kickConversationParticipant(
    conversationId: number,
    participantId: number
  ): Observable<void> {
    return this.httpClient.delete<void>(
      `${SERVER_URL}/conversations/${conversationId}/participants/${participantId}`
    );
  }

  saveConversationMessage(
    conversationId: number,
    content: string
  ): Observable<ConversationMessage> {
    return this.httpClient.post<ConversationMessage>(
      `${SERVER_URL}/conversations/${conversationId}/messages`,
      {
        content,
      }
    );
  }

  updateConversationMessage(
    conversationId: number,
    messageId: number,
    content: string
  ): Observable<ConversationMessage> {
    return this.httpClient.put<ConversationMessage>(
      `${SERVER_URL}/conversations/${conversationId}/messages/${messageId}`,
      {
        content,
      }
    );
  }

  onNewMessageReceived(): void {
    this.newMessage.next();
  }
}
