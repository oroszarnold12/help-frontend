import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ParticipationCreation } from '../model/participation-creation.model';
import { Participation } from '../model/participation.model';
import { url } from './api-config';

@Injectable({
  providedIn: 'root',
})
export class ParticipationService {
  constructor(private httpClient: HttpClient) {}

  getParticipations(): Observable<Participation[]> {
    return this.httpClient.get<Participation[]>(`${url}/participations`);
  }

  updateParticipations(
    participations: ParticipationCreation[]
  ): Observable<Participation[]> {
    return this.httpClient.put<Participation[]>(
      `${url}/participations`,
      participations
    );
  }
}
