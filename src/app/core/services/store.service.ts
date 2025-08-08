import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { Store, StoreCreateRequest, StoreUpdateRequest, StoreUser, CreateUserRequest, UpdateUserRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class StoreService extends BaseApiService {

  // Store management
  getStore(subdomain: string): Observable<Store> {
    return this.get<Store>(`/stores/${subdomain}`);
  }

  getAllStores(): Observable<Store[]> {
    return this.get<Store[]>('/stores');
  }

  getSubsidiaries(subdomain: string): Observable<Store[]> {
    return this.get<Store[]>(`/stores/${subdomain}/subsidiaries`);
  }

  updateStore(subdomain: string, data: StoreUpdateRequest): Observable<Store> {
    return this.put<Store>(`/stores/${subdomain}`, data);
  }

  createSubsidiary(parentSubdomain: string, data: StoreCreateRequest): Observable<Store> {
    return this.post<Store>(`/stores/${parentSubdomain}/subsidiaries`, data);
  }

  // User management for managers
  getStoreUsers(storeId: string): Observable<StoreUser[]> {
    return this.get<StoreUser[]>(`/users/store/${storeId}`);
  }

  createUserForStore(storeId: string, user: CreateUserRequest): Observable<StoreUser> {
    return this.post<StoreUser>(`/users/store/${storeId}`, user);
  }

  updateUser(userId: string, user: UpdateUserRequest): Observable<StoreUser> {
    return this.put<StoreUser>(`/users/${userId}`, user);
  }

  deleteUser(userId: string): Observable<void> {
    return this.delete<void>(`/users/${userId}`);
  }
}