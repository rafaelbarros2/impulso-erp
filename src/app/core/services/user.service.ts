import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { User } from '../models';
import { StoreUser, CreateUserRequest, UpdateUserRequest } from '../models/store.model';

// Re-export User interface for backwards compatibility
export type { User };

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseApiService {
  private endpoint = '/users';

  // Original methods for backwards compatibility
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

  // New store-based user management methods
  getStoreUsers(storeId: string): Observable<StoreUser[]> {
    return this.get<StoreUser[]>(`${this.endpoint}/store/${storeId}`);
  }

  createUserForStore(storeId: string, user: CreateUserRequest): Observable<StoreUser> {
    return this.post<StoreUser>(`${this.endpoint}/store/${storeId}`, user);
  }

  updateStoreUser(userId: string, user: UpdateUserRequest): Observable<StoreUser> {
    return this.put<StoreUser>(`${this.endpoint}/${userId}`, user);
  }

  deleteStoreUser(userId: string): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${userId}`);
  }
}
