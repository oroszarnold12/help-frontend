import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ThinPerson } from "../model/thin.person,model";

@Injectable({
  providedIn: "root",
})
export class PersonService {
  constructor(private httpClient: HttpClient) {}

  getPersons(): Observable<{ persons: ThinPerson[] }> {
    return this.httpClient.get<{ persons: ThinPerson[] }>(`api/persons`);
  }
}
