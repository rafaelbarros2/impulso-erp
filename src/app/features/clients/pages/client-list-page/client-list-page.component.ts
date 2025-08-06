import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { ClientService, Client } from '../../../../core/services/client.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { LoadingSpinnerComponent, SkeletonLoaderComponent, EmptyStateComponent, EMPTY_STATES } from '../../../../shared';
import { finalize } from 'rxjs/operators';

interface ClientDisplay extends Client {
  status: 'Ativo' | 'Inativo' | 'Potencial';
}

@Component({
  selector: 'app-client-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    TagModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    LoadingSpinnerComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './client-list-page.component.html',
  styleUrl: './client-list-page.component.scss'
})
export class ClientListPageComponent implements OnInit {
  clients: ClientDisplay[] = [];
  selectedClients: ClientDisplay[] = [];
  globalFilter: string = '';
  hasError: boolean = false;
  @ViewChild('dt') dt!: Table;
  
  // Loading states
  readonly LOADING_KEYS = LoadingService.KEYS;
  readonly EMPTY_STATES = EMPTY_STATES;

  constructor(
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private clientService: ClientService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  getLoadingService(): LoadingService {
    return this.loadingService;
  }

  loadClients(): void {
    this.hasError = false;
    
    this.loadingService.withLoadingObservable(
      this.LOADING_KEYS.CLIENTS,
      () => this.clientService.getAllClients()
    ).pipe(
      finalize(() => {
        // This will be called after loading completes or errors
      })
    ).subscribe({
      next: (clients: Client[]) => {
        // Map the clients to include status property for display
        this.clients = clients.map((client: Client) => ({
          ...client,
          status: client.active ? 'Ativo' : 'Inativo' as 'Ativo' | 'Inativo' | 'Potencial'
        }));
      },
      error: (error: any) => {
        console.error('Error loading clients:', error);
        this.hasError = true;
        
        // Fallback to mock data for MVP
        this.loadMockClients();
        
        this.messageService.add({ 
          severity: 'warn', 
          summary: 'Aviso', 
          detail: 'Erro ao carregar clientes da API. Exibindo dados de exemplo.' 
        });
      }
    });
  }

  private loadMockClients(): void {
    // Mock data as fallback
    this.clients = [
      { id: 1, name: 'Maria Silva', cpfCnpj: '123.456.789-00', phone: '(11) 98765-4321', email: 'maria.s@email.com', status: 'Ativo', active: true },
      { id: 2, name: 'João Santos', cpfCnpj: '098.765.432-10', phone: '(21) 99876-5432', email: 'joao.s@email.com', status: 'Ativo', active: true },
      { id: 3, name: 'Ana Costa', cpfCnpj: '111.222.333-44', phone: '(31) 97777-8888', email: 'ana.c@email.com', status: 'Potencial', active: true },
      { id: 4, name: 'Empresa XYZ Ltda', cpfCnpj: '12.345.678/0001-90', phone: '(41) 3000-1234', email: 'contato@xyz.com', status: 'Ativo', active: true },
      { id: 5, name: 'Pedro Lima', cpfCnpj: '555.444.333-22', phone: '(51) 91234-5678', email: 'pedro.l@email.com', status: 'Inativo', active: false },
    ];
  }

  onRetryLoad(): void {
    this.loadClients();
  }

  getSeverity(status: string): string {
    switch (status) {
      case 'Ativo':
        return 'success';
      case 'Inativo':
        return 'danger';
      case 'Potencial':
        return 'info';
      default:
        return 'secondary';
    }
  }

  onAddNewClient(): void {
    this.router.navigate(['/clients/new']);
  }

  onEditClient(client: ClientDisplay): void {
    this.router.navigate(['/clients/edit', client.id]);
  }

  onDeleteClient(event: Event, client: ClientDisplay): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Tem certeza que deseja excluir o cliente "${client.name}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        if (client.id) {
          this.clientService.deleteClient(client.id).subscribe({
            next: () => {
              this.clients = this.clients.filter(c => c.id !== client.id);
              this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente excluído com sucesso!' });
            },
            error: (error) => {
              console.error('Error deleting client:', error);
              this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir cliente.' });
            }
          });
        }
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'Exclusão de cliente cancelada.' });
      }
    });
  }

  deleteSelectedClients(event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Tem certeza que deseja excluir os ${this.selectedClients.length} clientes selecionados?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        const selectedIds = new Set(this.selectedClients.map(c => c.id));
        this.clients = this.clients.filter(c => !selectedIds.has(c.id));
        this.selectedClients = [];
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Clientes selecionados excluídos com sucesso!' });
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'Exclusão de clientes cancelada.' });
      }
    });
  }
}
