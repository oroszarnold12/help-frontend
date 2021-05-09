import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SERVER_URL } from 'src/environments/environment';
import { ParticipationCreation } from '../model/participation-creation.model';
import { Participation } from '../model/participation.model';

@Injectable({
  providedIn: 'root',
})
export class ParticipationService {
  constructor(private httpClient: HttpClient) {}

  getParticipations(): Observable<Participation[]> {
    return this.httpClient.get<Participation[]>(`${SERVER_URL}/participations`);
  }

  updateParticipations(
    participations: ParticipationCreation[]
  ): Observable<Participation[]> {
    return this.httpClient.put<Participation[]>(
      `${SERVER_URL}/participations`,
      participations
    );
  }
}
