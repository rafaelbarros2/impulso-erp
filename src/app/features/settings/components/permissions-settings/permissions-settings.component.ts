import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { PermissionService, Permission, RolePermissions } from '../../../../core/services/permission.service';
import { LoadingSpinnerComponent } from '../../../../shared';

@Component({
  selector: 'app-permissions-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    CheckboxModule,
    ToastModule,
    CardModule,
    LoadingSpinnerComponent
  ],
  providers: [MessageService],
  templateUrl: './permissions-settings.component.html',
  styleUrls: ['./permissions-settings.component.scss']
})
export class PermissionsSettingsComponent implements OnInit {
  permissionsForm!: FormGroup;
  permissions: Permission[] = [];
  roles: string[] = ['Admin', 'Manager', 'Employee'];
  isLoading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private permissionService: PermissionService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.permissionsForm = this.fb.group({});
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.error = null;

    forkJoin({
      permissions: this.permissionService.getPermissions(),
      rolePermissions: this.permissionService.getRolePermissions()
    }).pipe(
      finalize(() => this.isLoading = false),
      catchError(err => {
        this.error = 'Não foi possível carregar as permissões. Tente novamente mais tarde.';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: this.error });
        return of({ permissions: [], rolePermissions: [] });
      })
    ).subscribe(data => {
      this.permissions = data.permissions;
      this.buildForm(data.permissions, data.rolePermissions);
    });
  }

  buildForm(permissions: Permission[], rolePermissions: RolePermissions[]): void {
    const formControls: { [key: string]: FormGroup } = {};

    this.roles.forEach(role => {
      const rolePerms = rolePermissions.find(rp => rp.role === role);
      const roleGroup: { [key: string]: any } = {};
      permissions.forEach(permission => {
        roleGroup[permission.id] = [rolePerms?.permissions.includes(permission.id) ?? false];
      });
      formControls[role] = this.fb.group(roleGroup);
    });

    this.permissionsForm = this.fb.group(formControls);
  }

  getRoleFormGroup(role: string): FormGroup {
    return this.permissionsForm.get(role) as FormGroup;
  }

  savePermissions(): void {
    if (this.permissionsForm.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Formulário inválido.' });
      return;
    }

    this.isLoading = true;
    const formValue = this.permissionsForm.value;

    const updateObservables = this.roles.map(role => {
      const rolePermissions: RolePermissions = {
        role: role as 'Admin' | 'Manager' | 'Employee',
        permissions: Object.keys(formValue[role]).filter(permissionId => formValue[role][permissionId])
      };
      return this.permissionService.updateRolePermissions(rolePermissions);
    });

    forkJoin(updateObservables).pipe(
      finalize(() => this.isLoading = false),
      catchError(err => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar as permissões.' });
        return of(null);
      })
    ).subscribe(result => {
      if (result) {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Permissões atualizadas com sucesso.' });
      }
    });
  }
}
