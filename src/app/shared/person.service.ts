import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Person } from "../model/person.model";
import { ThinPerson } from "../model/thin.person.model";
import { url } from "./api-config";

@Injectable({
  providedIn: "root",
})
export class PersonService {
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
}
