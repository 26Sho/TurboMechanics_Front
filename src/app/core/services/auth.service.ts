import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:9090';

  constructor(private http: HttpClient) {}

  register(user: any): Observable<any> {
    const body = {
      username: user.name,
      identification: user.Identification,
      phone: user.telephone,
      email: user.email,
      password: user.password
    };
    return this.http.post(`${this.apiUrl}/auth/register`, body);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap((response: any) => {
        if (response?.jwt) {
          localStorage.setItem('token', response.jwt);
        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('token');
  }
}