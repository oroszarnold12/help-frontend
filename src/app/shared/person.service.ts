import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Person } from "../model/person.model";
import { ThinPerson } from "../model/thin.person,model";

@Injectable({
  providedIn: "root",
})
export class PersonService {
  constructor(private httpClient: HttpClient) {}

  getPersons(): Observable<{ persons: ThinPerson[] }> {
    return this.httpClient.get<{ persons: ThinPerson[] }>(`api/persons`);
  }

  getPersonsForAdmin(): Observable<{ persons: Person[] }> {
    return this.httpClient.get<{ persons: Person[] }>(`api/persons`);
  }

  updatePerson(person: Person, id: number): Observable<Person> {
    return this.httpClient.put<Person>(`api/persons/${id}`, person);
  }

  deletePerson(id: number): Observable<void> {
    return this.httpClient.delete<void>(`api/persons/${id}`);
  }
}
