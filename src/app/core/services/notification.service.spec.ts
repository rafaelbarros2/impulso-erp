import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let messageService: jasmine.SpyObj<MessageService>;

  beforeEach(() => {
    const messageSpy = jasmine.createSpyObj('MessageService', ['add', 'clear']);

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: MessageService, useValue: messageSpy }
      ]
    });

    service = TestBed.inject(NotificationService);
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show success notification', () => {
    service.success('Test message', 'Success Title');

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Success Title',
      detail: 'Test message',
      life: 5000,
      closable: true,
      data: undefined
    });
  });

  it('should show error notification', () => {
    service.error('Error message', 'Error Title');

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error Title',
      detail: 'Error message',
      life: 8000,
      closable: true,
      data: undefined
    });
  });

  it('should show warning notification', () => {
    service.warning('Warning message', 'Warning Title');

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Warning Title',
      detail: 'Warning message',
      life: 6000,
      closable: true,
      data: undefined
    });
  });

  it('should show info notification', () => {
    service.info('Info message', 'Info Title');

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'info',
      summary: 'Info Title',
      detail: 'Info message',
      life: 5000,
      closable: true,
      data: undefined
    });
  });

  it('should handle field validation errors', () => {
    const fieldErrors = [
      { field: 'name', message: 'Name is required' },
      { field: 'email', message: 'Invalid email format' }
    ];

    service.handleFieldValidationErrors(fieldErrors);

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Erro de Validação',
      detail: 'name: Name is required<br>email: Invalid email format',
      life: 10000,
      closable: true,
      data: undefined
    });
  });

  it('should handle authentication error', () => {
    service.handleAuthenticationError();

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Sessão Expirada',
      detail: 'Sua sessão expirou. Por favor, faça login novamente.',
      life: 8000,
      closable: true,
      data: undefined
    });
  });

  it('should handle access denied error', () => {
    service.handleAccessDeniedError();

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Acesso Negado',
      detail: 'Você não tem permissão para acessar este recurso.',
      life: 8000,
      closable: true,
      data: undefined
    });
  });

  it('should handle network error', () => {
    service.handleNetworkError();

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Erro de Conexão',
      detail: 'Erro de conexão. Verifique sua internet e tente novamente.',
      life: 8000,
      closable: true,
      data: undefined
    });
  });

  it('should handle server error', () => {
    service.handleServerError();

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Erro do Servidor',
      detail: 'Erro interno do servidor. Tente novamente em alguns instantes.',
      life: 8000,
      closable: true,
      data: undefined
    });
  });

  it('should handle insufficient stock error', () => {
    const message = 'Insufficient stock for product Test. Requested: 5, Available: 2';
    service.handleInsufficientStockError(message);

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Estoque Insuficiente',
      detail: message,
      life: 8000,
      closable: true,
      data: undefined
    });
  });

  it('should handle entity not found error', () => {
    service.handleEntityNotFoundError('Produto');

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Recurso Não Encontrado',
      detail: 'Produto não encontrado(a).',
      life: 6000,
      closable: true,
      data: undefined
    });
  });

  it('should clear all notifications', () => {
    service.clear();

    expect(messageService.clear).toHaveBeenCalled();
  });

  it('should use custom options', () => {
    const options = {
      life: 10000,
      closable: false,
      data: { test: 'data' }
    };

    service.success('Test message', 'Title', options);

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Title',
      detail: 'Test message',
      life: 10000,
      closable: false,
      data: { test: 'data' }
    });
  });

  it('should handle empty field errors array', () => {
    service.handleFieldValidationErrors([]);

    expect(messageService.add).not.toHaveBeenCalled();
  });

  it('should handle undefined field errors', () => {
    service.handleFieldValidationErrors(undefined as any);

    expect(messageService.add).not.toHaveBeenCalled();
  });
});