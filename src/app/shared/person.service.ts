import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { Person } from "../model/person.model";
import { ThinPerson } from "../model/thin.person.model";
import { url } from "./api-config";

@Injectable({
  providedIn: "root",
})
export class PersonService {
  imageChanged: Subject<string> = new Subject();
  imageChanged$ = this.imageChanged.asObservable();

  constructor(private httpClient: HttpClient) {}

  getPersons(): Observable<{ persons: ThinPerson[] }> {
    return this.httpClient.get<{ persons: ThinPerson[] }>(`${url}/persons`);
  }

  getPersonsForAdmin(): Observable<{ persons: Person[] }> {
    return this.httpClient.get<{ persons: Person[] }>(`${url}/persons`);
  }

  updatePerson(person: Person, id: number): Observable<Person> {
    return this.httpClient.put<Person>(`${url}/persons/${id}`, person);
  }

  deletePerson(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${url}/persons/${id}`);
  }

  getCurrentUser(): Observable<Person> {
    return this.httpClient.get<Person>(`${url}/user`);
  }

  changePassword(password: string): Observable<Person> {
    return this.httpClient.put<Person>(`${url}/user`, { password: password });
  }

  saveImage(data: FormData): Observable<Person> {
    return this.httpClient.post<Person>(`${url}/user/image`, data);
  }

  removeImage(): Observable<void> {
    return this.httpClient.delete<void>(`${url}/user/image`);
  }

  setImageUrl(url: string): void {
    this.imageChanged.next(url);
  }

  saveNotificationToken(token: string): Observable<void> {
    return this.httpClient.post<void>(`${url}/notificationToken`, token);
  }
}
