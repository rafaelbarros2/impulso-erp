import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import {  TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { SaleDisplayData } from '../../../../core/models';

@Component({
  selector: 'app-sales-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TableModule, InputTextModule, DropdownModule],
  templateUrl: './sales-page.component.html',
  styleUrls: ['./sales-page.component.scss'],
})
export class SalesPageComponent {
  allSalesData: SaleDisplayData[] = [
    { id: '#1024', customer: 'Carlos Pereira', date: '16/07/2025', status: 'Pago', total: 'R$ 1.250,00', totalValue: 1250 },
    { id: '#1023', customer: 'Mariana Costa', date: '15/07/2025', status: 'Pendente', total: 'R$ 89,90', totalValue: 89.90 },
    { id: '#1022', customer: 'Tech Solutions Ltda', date: '15/07/2025', status: 'Pago', total: 'R$ 5.400,00', totalValue: 5400 },
    { id: '#1021', customer: 'João Almeida', date: '14/07/2025', status: 'Cancelado', total: 'R$ 320,50', totalValue: 320.50 },
    { id: '#1020', customer: 'Fernanda Lima', date: '14/07/2025', status: 'Pago', total: 'R$ 150,00', totalValue: 150 },
    { id: '#1019', customer: 'Global Corp', date: '13/07/2025', status: 'Pago', total: 'R$ 8.200,00', totalValue: 8200 },
    { id: '#1018', customer: 'Ana Silva', date: '12/07/2025', status: 'Pendente', total: 'R$ 450,00', totalValue: 450 },
    { id: '#1017', customer: 'Empresa XYZ', date: '11/07/2025', status: 'Pago', total: 'R$ 2.100,00', totalValue: 2100 },
    { id: '#1016', customer: 'Pedro Santos', date: '10/07/2025', status: 'Cancelado', total: 'R$ 75,00', totalValue: 75 },
    { id: '#1015', customer: 'Inovação Tech', date: '09/07/2025', status: 'Pago', total: 'R$ 3.800,00', totalValue: 3800 }
  ];

  salesData: SaleDisplayData[] = [...this.allSalesData];

  searchTerm: string = '';
  selectedStatus: any = null;

  statusOptions = [
    { label: 'Todos os Status', value: null },
    { label: 'Pago', value: 'Pago' },
    { label: 'Pendente', value: 'Pendente' },
    { label: 'Cancelado', value: 'Cancelado' }
  ];

  constructor() {
    this.applyFilters();
  }

  applyFilters() {
    this.salesData = this.allSalesData.filter(sale => {
      const matchesSearch = !this.searchTerm || 
        sale.customer.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        sale.id.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || sale.status === this.selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  onStatusChange() {
    this.applyFilters();
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pago': 
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200';
      case 'pendente': 
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'cancelado': 
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200';
      default: 
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200';
    }
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'pago': return 'pi pi-check-circle';
      case 'pendente': return 'pi pi-clock';
      case 'cancelado': return 'pi pi-times-circle';
      default: return 'pi pi-info-circle';
    }
  }

  onNewSale() {
    console.log('Nova venda clicada');
  }
}