import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

export interface NotificationOptions {
  life?: number;
  closable?: boolean;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
  constructor(private messageService: MessageService) {}

  success(message: string, title: string = 'Sucesso', options?: NotificationOptions) {
    this.messageService.add({
      severity: 'success',
      summary: title,
      detail: message,
      life: options?.life || 5000,
      closable: options?.closable !== false,
      data: options?.data
    });
  }

  error(message: string, title: string = 'Erro', options?: NotificationOptions) {
    this.messageService.add({
      severity: 'error',
      summary: title,
      detail: message,
      life: options?.life || 8000,
      closable: options?.closable !== false,
      data: options?.data
    });
  }

  warning(message: string, title: string = 'Atenção', options?: NotificationOptions) {
    this.messageService.add({
      severity: 'warn',
      summary: title,
      detail: message,
      life: options?.life || 6000,
      closable: options?.closable !== false,
      data: options?.data
    });
  }

  info(message: string, title: string = 'Informação', options?: NotificationOptions) {
    this.messageService.add({
      severity: 'info',
      summary: title,
      detail: message,
      life: options?.life || 5000,
      closable: options?.closable !== false,
      data: options?.data
    });
  }

  clear() {
    this.messageService.clear();
  }

  // Specific error handlers for common scenarios
  handleFieldValidationErrors(fieldErrors: Array<{field: string, message: string}>) {
    if (fieldErrors && fieldErrors.length > 0) {
      const errorMessages = fieldErrors.map(error => `${error.field}: ${error.message}`);
      this.error(errorMessages.join('<br>'), 'Erro de Validação', { life: 10000 });
    }
  }

  handleAuthenticationError() {
    this.error('Sua sessão expirou. Por favor, faça login novamente.', 'Sessão Expirada', { life: 8000 });
  }

  handleAccessDeniedError() {
    this.error('Você não tem permissão para acessar este recurso.', 'Acesso Negado', { life: 8000 });
  }

  handleNetworkError() {
    this.error('Erro de conexão. Verifique sua internet e tente novamente.', 'Erro de Conexão', { life: 8000 });
  }

  handleServerError() {
    this.error('Erro interno do servidor. Tente novamente em alguns instantes.', 'Erro do Servidor', { life: 8000 });
  }

  handleInsufficientStockError(message: string) {
    this.warning(message, 'Estoque Insuficiente', { life: 8000 });
  }

  handleEntityNotFoundError(entityType: string) {
    this.error(`${entityType} não encontrado(a).`, 'Recurso Não Encontrado', { life: 6000 });
  }
}