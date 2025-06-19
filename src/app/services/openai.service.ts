import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OpenaiService {
    private apiUrl = 'https://api.deepseek.com/v1/chat/completions';
    private apiKey = 'sk-d6ed9c507c99485798274f97ed2e5ee7';

  constructor(private http: HttpClient) {}

  getChatResponse(messages: any[]): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    });

    const body = {
      model: 'deepseek-chat',
      messages: messages,
      temperature: 0.7
    };

    return this.http.post(this.apiUrl, body, { headers });
  }
}