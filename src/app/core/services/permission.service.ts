import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';

export interface Permission {
  id: string; // e.g., 'dashboard.view', 'products.edit'
  description: string;
}

export interface RolePermissions {
  role: 'Admin' | 'Manager' | 'Employee';
  permissions: string[]; // Array of permission IDs
}

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
