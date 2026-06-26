import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
export interface UserProfileResponse {
  id: number;
  username: string;
  identification: number;
  phone: string;
  email: string;
  rolId: number;
}

export interface UserProfileRequest {
  username: string;
  identification: number;
  phone: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class UserProfileService {

  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /** GET /users/me — perfil del usuario autenticado */
  getMyProfile(): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(`${this.apiUrl}/me`);
  }

  /** PUT /users/me — actualiza datos del perfil */
  updateMyProfile(data: UserProfileRequest): Observable<UserProfileResponse> {
    return this.http.put<UserProfileResponse>(`${this.apiUrl}/me`, data);
  }

  /** PUT /users/me/password — cambia contraseña */
  changePassword(data: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/me/password`, data);
  }
}