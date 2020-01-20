import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BullyserviceService {

  constructor(private http: HttpClient) { }

  getCharacterPage(body): Observable<any> {
    const url = 'https://www.tibia.com/community/?subtopic=characters';
    return this.http.post(url, body, {responseType: 'text'});
  }
}
