import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { MessageService } from 'primeng/api';

import { UserService, User } from '../../../../core/services/user.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
    ToggleButtonModule
  ],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  user: User | undefined;

  roles = [
    { label: 'Admin', value: 'Admin' },
    { label: 'Manager', value: 'Manager' },
    { label: 'Employee', value: 'Employee' }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.user = this.config.data?.user;
    this.isEditMode = !!this.user;

    this.userForm = this.fb.group({
      name: [this.user?.name || '', Validators.required],
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      role: [this.user?.role || 'Employee', Validators.required],
      active: [this.user?.active ?? true, Validators.required]
    });
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Por favor, preencha todos os campos obrigatórios.' });
      return;
    }

    this.isLoading = true;
    const userData = this.userForm.value;

    const operation = this.isEditMode
      ? this.userService.updateUser(this.user!.id!, userData)
      : this.userService.createUser(userData);

    operation.pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => {
        this.ref.close(true);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar o usuário.' });
      }
    });
  }

  cancel(): void {
    this.ref.close();
  }
}
