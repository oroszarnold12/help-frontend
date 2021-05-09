import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SERVER_URL } from 'src/environments/environment';
import { InvitationCreation } from '../model/invitation.creation.model';
import { Invitation } from '../model/invitation.model';

@Injectable({
  providedIn: 'root',
})
export class InvitationService {
  constructor(private httpClient: HttpClient) {}

  getInvitations(): Observable<{ invitations: Invitation[] }> {
    return this.httpClient.get<{ invitations: Invitation[] }>(
      `${SERVER_URL}/invitations`
    );
  }

  acceptInvitation(id: number): Observable<void> {
    const httpParams = new HttpParams().set('accept', 'true');
    return this.httpClient.delete<void>(`${SERVER_URL}/invitations/${id}`, {
      params: httpParams,
    });
  }

  declineInvitation(id: number): Observable<void> {
    const httpParams = new HttpParams().set('accept', 'false');
    return this.httpClient.delete<void>(`${SERVER_URL}/invitations/${id}`, {
      params: httpParams,
    });
  }

  saveInvitation(invitations: InvitationCreation): Observable<void> {
    return this.httpClient.post<void>(`${SERVER_URL}/invitations`, invitations);
  }
}
