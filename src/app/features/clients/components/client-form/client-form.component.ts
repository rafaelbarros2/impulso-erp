import { Component, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask'; // Para CPF/CNPJ e Telefone
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { HttpClientModule } from '@angular/common/http'; // Necessário se for usar HttpClient
import { ClientService, Client } from '../../../../core/services/client.service';
import { FormValidationService, ValidationState } from '../../../../core/services/form-validation.service';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

interface ClientType {
  name: string;
  code: string;
}

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputMaskModule, // Importado
    DropdownModule,
    ButtonModule,
    CardModule,
    ToastModule,
    HttpClientModule // Adicionado caso precise de HttpClient no futuro
  ],
  providers: [MessageService],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.scss'
})
export class ClientFormComponent implements OnInit, OnDestroy {
  clientForm!: FormGroup;
  
  // Signals for state management
  private clientId = signal<string | null>(null);
  private isLoading = signal<boolean>(false);
  private currentClient = signal<Client | null>(null);
  
  // Computed signals
  readonly isEditMode = computed(() => !!this.clientId());
  readonly pageTitle = computed(() => this.isEditMode() ? 'Editar Cliente' : 'Novo Cliente');
  readonly loading = computed(() => this.isLoading());
  
  // Form validation state from service
  readonly validationState = computed(() => this.formValidationService.validationErrors());
  readonly hasValidationErrors = computed(() => this.formValidationService.hasErrors());
  readonly generalErrors = computed(() => this.formValidationService.generalErrors());

  private subscriptions = new Subscription();

  clientTypes: ClientType[] = [
    { name: 'Pessoa Física', code: 'PF' },
    { name: 'Pessoa Jurídica', code: 'PJ' },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private clientService: ClientService,
    private formValidationService: FormValidationService
  ) {
    // Effect to update form when client data changes
    effect(() => {
      const client = this.currentClient();
      if (client && this.clientForm) {
        this.clientForm.patchValue({
          name: client.name,
          email: client.email || '',
          phone: client.phone || '',
          cpfCnpj: client.cpfCnpj || '',
          address: client.address || ''
        });
      }
    });
  }

  ngOnInit(): void {
    const clientIdParam = this.route.snapshot.paramMap.get('id');
    this.clientId.set(clientIdParam);

    this.initForm();

    if (this.isEditMode()) {
      this.loadClientData(Number(clientIdParam!));
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.formValidationService.resetValidation();
  }

  initForm(): void {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      phone: [''],
      cpfCnpj: ['', Validators.required],
      address: ['', Validators.maxLength(200)]
    });

    // Clear validation errors when form values change
    this.clientForm.valueChanges.subscribe(() => {
      this.formValidationService.clearServerValidationErrors(this.clientForm);
    });
  }

  loadClientData(id: number): void {
    this.isLoading.set(true);
    const loadSub = this.clientService.getClientById(id).subscribe({
      next: (client) => {
        this.currentClient.set(client);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);
        if (error.status === 404) {
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: 'Cliente não encontrado.' 
          });
          this.router.navigate(['/clients/list']);
        }
      }
    });
    this.subscriptions.add(loadSub);
  }

  onSaveClient(): void {
    // Clear previous validation errors
    this.formValidationService.clearServerValidationErrors(this.clientForm);

    // Validate client-side first
    if (!this.formValidationService.validateAllFormFields(this.clientForm)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro de Validação',
        detail: 'Por favor, corrija os erros nos campos destacados.'
      });
      return;
    }

    this.isLoading.set(true);
    const clientData: Client = {
      name: this.clientForm.value.name,
      email: this.clientForm.value.email,
      phone: this.clientForm.value.phone,
      cpfCnpj: this.clientForm.value.cpfCnpj,
      address: this.clientForm.value.address
    };

    const operation = this.isEditMode() 
      ? this.clientService.updateClient(Number(this.clientId()!), clientData)
      : this.clientService.createClient(clientData);

    const saveSub = operation.subscribe({
      next: (client) => {
        this.isLoading.set(false);
        const message = this.isEditMode() ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!';
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: message
        });
        this.router.navigate(['/clients/list']);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);
        if (error.status === 400 && error.error?.fieldErrors) {
          // Handle validation errors from the backend
          this.formValidationService.applyServerValidationErrors(
            this.clientForm,
            error.error.fieldErrors.map((fe: any) => ({ field: fe.field, message: fe.message })),
            'Por favor, corrija os erros destacados.'
          );
        }
        // The error interceptor will handle other error cases
      }
    });
    this.subscriptions.add(saveSub);
  }

  onCancel(): void {
    this.router.navigate(['/clients/list']);
  }

  // Helper methods for template
  getFieldError(fieldName: string): string | null {
    const control = this.clientForm.get(fieldName);
    return this.formValidationService.getFieldErrorMessage(control, fieldName);
  }

  hasFieldError(fieldName: string): boolean {
    const control = this.clientForm.get(fieldName);
    return this.formValidationService.hasFieldError(control);
  }
}
