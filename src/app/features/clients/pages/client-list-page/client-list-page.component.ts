import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms'; // Necessário para ngModel

interface Client {
  id: string;
  name: string;
  cpfCnpj: string;
  phone: string;
  email: string;
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
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './client-list-page.component.html',
  styleUrl: './client-list-page.component.scss'
})
export class ClientListPageComponent implements OnInit {
  clients: Client[] = [];
  selectedClients: Client[] = [];
  globalFilter: string = '';

  constructor(
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    // Dados mockados para MVP. Em um projeto real, isso viria de um serviço.
    this.clients = [
      { id: '1', name: 'Maria Silva', cpfCnpj: '123.456.789-00', phone: '(11) 98765-4321', email: 'maria.s@email.com', status: 'Ativo' },
      { id: '2', name: 'João Santos', cpfCnpj: '098.765.432-10', phone: '(21) 99876-5432', email: 'joao.s@email.com', status: 'Ativo' },
      { id: '3', name: 'Ana Costa', cpfCnpj: '111.222.333-44', phone: '(31) 97777-8888', email: 'ana.c@email.com', status: 'Potencial' },
      { id: '4', name: 'Empresa XYZ Ltda', cpfCnpj: '12.345.678/0001-90', phone: '(41) 3000-1234', email: 'contato@xyz.com', status: 'Ativo' },
      { id: '5', name: 'Pedro Lima', cpfCnpj: '555.444.333-22', phone: '(51) 91234-5678', email: 'pedro.l@email.com', status: 'Inativo' },
    ];
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

  onEditClient(client: Client): void {
    this.router.navigate(['/clients/edit', client.id]);
  }

  onDeleteClient(event: Event, client: Client): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Tem certeza que deseja excluir o cliente "${client.name}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.clients = this.clients.filter(c => c.id !== client.id);
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente excluído com sucesso!' });
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
