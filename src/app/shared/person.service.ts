import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SERVER_URL } from 'src/environments/environment';
import { Person } from '../model/person.model';
import { ThinPerson } from '../model/thin.person.model';

@Injectable({
  providedIn: 'root',
})
export class PersonService {
  imageChanged: Subject<string> = new Subject();
  imageChanged$ = this.imageChanged.asObservable();

  constructor(private httpClient: HttpClient) {}

  getPersons(): Observable<{ persons: ThinPerson[] }> {
    return this.httpClient.get<{ persons: ThinPerson[] }>(
      `${SERVER_URL}/persons`
    );
  }

  getPersonsForAdmin(): Observable<{ persons: Person[] }> {
    return this.httpClient.get<{ persons: Person[] }>(`${SERVER_URL}/persons`);
  }

  updatePerson(person: Person, id: number): Observable<Person> {
    return this.httpClient.put<Person>(`${SERVER_URL}/persons/${id}`, person);
  }

  deletePerson(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${SERVER_URL}/persons/${id}`);
  }

  getCurrentUser(): Observable<Person> {
    return this.httpClient.get<Person>(`${SERVER_URL}/user`);
  }

  changePassword(password: string): Observable<Person> {
    return this.httpClient.put<Person>(`${SERVER_URL}/user`, { password });
  }

  saveImage(data: FormData): Observable<Person> {
    return this.httpClient.post<Person>(`${SERVER_URL}/user/image`, data);
  }

  removeImage(): Observable<void> {
    return this.httpClient.delete<void>(`${SERVER_URL}/user/image`);
  }

  setImageUrl(imageUrl: string): void {
    this.imageChanged.next(imageUrl);
  }

  saveNotificationToken(token: string): Observable<void> {
    return this.httpClient.post<void>(`${SERVER_URL}/notificationToken`, token);
  }
}
