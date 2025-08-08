import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';

import { UserService, User } from '../../../../core/services/user.service';
import { StoreService } from '../../../../core/services/store.service';
import { AuthStateService } from '../../../../core/state/auth-state.service';
import { LoadingSpinnerComponent } from '../../../../shared';
import { StoreUser } from '../../../../core/models/store.model';

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
    TagModule,
    LoadingSpinnerComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './users-settings.component.html',
  styleUrls: ['./users-settings.component.scss']
})
export class UsersSettingsComponent implements OnInit {
  users$: Observable<StoreUser[]> | undefined;
  isLoading = false;
  error: string | null = null;
  currentStoreId: string | null = null;

  cols: { field: string; header: string }[];

  constructor(
    private userService: UserService,
    private storeService: StoreService,
    private authState: AuthStateService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.cols = [
      { field: 'name', header: 'Nome' },
      { field: 'email', header: 'Email' },
      { field: 'role', header: 'Função' },
      { field: 'isActive', header: 'Status' },
      { field: 'actions', header: 'Ações' }
    ];
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    const currentUser = this.authState.getCurrentUser();
    if (!currentUser?.store?.subdomain) {
      this.error = 'Usuário não possui loja associada';
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: this.error });
      return;
    }

    this.currentStoreId = currentUser.store.subdomain;
    this.isLoading = true;
    this.error = null;
    
    this.users$ = this.storeService.getStoreUsers(this.currentStoreId).pipe(
      tap(() => this.isLoading = false),
      catchError(err => {
        this.isLoading = false;
        this.error = 'Não foi possível carregar os usuários. Tente novamente mais tarde.';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: this.error });
        return of([]);
      })
    );
  }

  openUserDialog(user?: StoreUser): void {
    // TODO: Implement user dialog functionality
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Funcionalidade de edição de usuário será implementada em breve'
    });
  }

  deleteUser(user: StoreUser): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o usuário ${user.name}?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.isLoading = true;
        this.storeService.deleteUser(user.id)
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

  getRoleSeverity(role: string): 'success' | 'info' | 'warning' | 'danger' {
    switch (role) {
      case 'ADMIN': return 'danger';
      case 'MANAGER': return 'warning';
      case 'USER': return 'info';
      default: return 'info';
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'ADMIN': return 'Administrador';
      case 'MANAGER': return 'Gerente';
      case 'USER': return 'Usuário';
      default: return role;
    }
  }
}
