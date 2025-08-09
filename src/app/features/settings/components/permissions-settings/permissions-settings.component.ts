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


import { LoadingSpinnerComponent } from 'shared-lib';
import { PermissionService } from '../../../../core/services/permission.service';
import { Permission, Role } from '../../../../core/models';

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
      roles: this.permissionService.getRoles()
    }).pipe(
      finalize(() => this.isLoading = false),
      catchError(err => {
        this.error = 'Não foi possível carregar as permissões. Tente novamente mais tarde.';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: this.error });
        return of({ permissions: [], roles: [] });
      })
    ).subscribe(data => {
      this.permissions = data.permissions;
      this.buildForm(data.permissions, data.roles);
    });
  }

  buildForm(permissions: Permission[], roles: Role[]): void {
    const formControls: { [key: string]: FormGroup } = {};

    this.roles.forEach(roleName => {
      const role = roles.find(r => r.name === roleName);
      const roleGroup: { [key: string]: any } = {};
      permissions.forEach(permission => {
        const hasPermission = role?.permissions.some(p => p.id === permission.id) ?? false;
        roleGroup[permission.id] = [hasPermission];
      });
      formControls[roleName] = this.fb.group(roleGroup);
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

    const updateObservables = this.roles.map(roleName => {
      const roleData: Role = {
        id: roleName.toLowerCase(),
        name: roleName,
        description: `${roleName} role`,
        permissions: this.permissions.filter(p => formValue[roleName][p.id])
      };
      return this.permissionService.updateRole(roleData);
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
