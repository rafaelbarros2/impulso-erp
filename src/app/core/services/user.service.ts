import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseApiService {
  private endpoint = '/users';

  getUsers(): Observable<User[]> {
    return this.get<User[]>(this.endpoint);
  }

  getUserById(id: number): Observable<User> {
    return this.get<User>(`${this.endpoint}/${id}`);
  }

  createUser(user: User): Observable<User> {
    return this.post<User>(this.endpoint, user);
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.put<User>(`${this.endpoint}/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
