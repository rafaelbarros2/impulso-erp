import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { Permission, Role } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PermissionService extends BaseApiService {
  private endpoint = '/permissions';

  getPermissions(): Observable<Permission[]> {
    return this.get<Permission[]>(this.endpoint);
  }

  getRoles(): Observable<Role[]> {
    return this.get<Role[]>(`${this.endpoint}/roles`);
  }

  updateRole(role: Role): Observable<Role> {
    return this.put<Role>(`${this.endpoint}/roles/${role.id}`, role);
  }
}
