import { HttpClient, HttpParams } from "@angular/common/http";
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
    let httpParams = new HttpParams().set("accept", "true");
    return this.httpClient.delete<void>(`api/invitations/${id}`, {
      params: httpParams,
    });
  }

  declineInvitation(id: number): Observable<void> {
    let httpParams = new HttpParams().set("accept", "false");
    return this.httpClient.delete<void>(`api/invitations/${id}`, {
      params: httpParams,
    });
  }

  saveInvitation(invitations: InvitationCreation): Observable<void> {
    return this.httpClient.post<void>(`api/invitations`, invitations);
  }
}
