import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { Permission, RolePermissions } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PermissionService extends BaseApiService {
  private endpoint = '/permissions';

  getPermissions(): Observable<Permission[]> {
    return this.get<Permission[]>(this.endpoint);
  }

  getRolePermissions(): Observable<RolePermissions[]> {
    return this.get<RolePermissions[]>(`${this.endpoint}/roles`);
  }

  updateRolePermissions(rolePermissions: RolePermissions): Observable<RolePermissions> {
    return this.put<RolePermissions>(`${this.endpoint}/roles/${rolePermissions.role}`, rolePermissions);
  }
}
