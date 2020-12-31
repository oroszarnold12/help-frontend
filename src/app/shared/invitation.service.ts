import { HttpClient } from "@angular/common/http";
import { ThrowStmt } from "@angular/compiler";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { InvitationCreation } from "../model/invitation.creation.model";
import { Invitation } from "../model/invitation.model";

@Injectable({
  providedIn: "root",
})
export class InvitationService {
  constructor(private httpClient: HttpClient) {}

  getInvitations(): Observable<{ invitations: Invitation[] }> {
    return this.httpClient.get<{ invitations: Invitation[] }>(
      `api/invitations`
    );
  }

  acceptInvitation(id: number): Observable<void> {
    return this.httpClient.delete<void>(`api/invitations/${id}/accept`);
  }

  declineInvitation(id: number): Observable<void> {
    return this.httpClient.delete<void>(`api/invitations/${id}/decline`);
  }

  saveInvitation(invitations: InvitationCreation): Observable<void> {
    return this.httpClient.post<void>(`api/invitations`, invitations);
  }
}
