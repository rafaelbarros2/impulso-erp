import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';

import { UserService, User } from '../../../../core/services/user.service';
import { LoadingSpinnerComponent } from '../../../../shared';
import { UserFormComponent } from '../user-form/user-form.component';

@Component({
  selector: 'app-users-settings',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    CardModule,
    TooltipModule,
    LoadingSpinnerComponent,
    UserFormComponent
  ],
  providers: [DialogService, ConfirmationService, MessageService],
  templateUrl: './users-settings.component.html',
  styleUrls: ['./users-settings.component.scss']
})
export class UsersSettingsComponent implements OnInit {
  users$: Observable<User[]> | undefined;
  isLoading = false;
  error: string | null = null;

  cols: { field: string; header: string }[];

  private dialogRef: DynamicDialogRef | undefined;

  constructor(
    private userService: UserService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.cols = [
      { field: 'name', header: 'Nome' },
      { field: 'email', header: 'Email' },
      { field: 'role', header: 'Função' },
      { field: 'active', header: 'Status' },
      { field: 'actions', header: 'Ações' }
    ];
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = null;
    this.users$ = this.userService.getUsers().pipe(
      tap(() => this.isLoading = false),
      catchError(err => {
        this.isLoading = false;
        this.error = 'Não foi possível carregar os usuários. Tente novamente mais tarde.';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: this.error });
        return of([]);
      })
    );
  }

  openUserDialog(user?: User): void {
    const header = user ? 'Editar Usuário' : 'Novo Usuário';
    this.dialogRef = this.dialogService.open(UserFormComponent, {
      header,
      width: '500px',
      contentStyle: { 'max-height': '90vh', 'overflow': 'auto' },
      baseZIndex: 10000,
      data: { user }
    });

    this.dialogRef.onClose.subscribe((result) => {
      if (result) {
        this.loadUsers();
        const summary = user ? 'Usuário atualizado com sucesso' : 'Usuário criado com sucesso';
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: summary });
      }
    });
  }

  deleteUser(user: User): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o usuário ${user.name}?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.isLoading = true;
        this.userService.deleteUser(user.id!)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe({
            next: () => {
              this.loadUsers();
              this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário excluído com sucesso' });
            },
            error: (err) => {
              this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível excluir o usuário.' });
            }
          });
      }
    });
  }
}
