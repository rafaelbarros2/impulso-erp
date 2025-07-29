import { Component, OnInit } from '@angular/core';
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
export class ClientFormComponent implements OnInit {
  clientForm!: FormGroup;
  isEditMode: boolean = false;
  clientId: string | null = null;
  pageTitle: string = 'Novo Cliente';

  clientTypes: ClientType[] = [
    { name: 'Pessoa Física', code: 'PF' },
    { name: 'Pessoa Jurídica', code: 'PJ' },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.clientId;
    this.pageTitle = this.isEditMode ? 'Editar Cliente' : 'Novo Cliente';

    this.initForm();

    if (this.isEditMode) {
      this.loadClientData(this.clientId!);
    }
  }

  initForm(): void {
    this.clientForm = this.fb.group({
      clientType: ['PF', Validators.required], // Default para Pessoa Física
      name: ['', Validators.required],
      cpfCnpj: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: [''],
      city: [''],
      state: [''],
      zipCode: [''],
      notes: ['']
    });

    // Adiciona ou remove validação de CPF/CNPJ baseada no tipo de cliente
    this.clientForm.get('clientType')?.valueChanges.subscribe(type => {
      const cpfCnpjControl = this.clientForm.get('cpfCnpj');
      if (type === 'PF') {
        cpfCnpjControl?.setValidators([Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]); // Exemplo de regex para CPF
      } else {
        cpfCnpjControl?.setValidators([Validators.required, Validators.pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)]); // Exemplo de regex para CNPJ
      }
      cpfCnpjControl?.updateValueAndValidity();
    });
  }

  loadClientData(id: string): void {
    // Simula o carregamento de dados de um cliente existente para o MVP
    const mockClient = {
      id: id,
      clientType: 'PF',
      name: 'Maria Silva',
      cpfCnpj: '123.456.789-00',
      phone: '(11) 98765-4321',
      email: 'maria.s@email.com',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01000-000',
      notes: 'Cliente fiel desde 2020.'
    };

    this.clientForm.patchValue(mockClient);
  }

  onSaveClient(): void {
    if (this.clientForm.valid) {
      const clientData = this.clientForm.value;
      console.log('Dados do cliente a serem salvos:', clientData);

      if (this.isEditMode) {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente atualizado com sucesso!' });
      } else {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente cadastrado com sucesso!' });
      }
      this.router.navigate(['/clients/list']);
    } else {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Por favor, preencha todos os campos obrigatórios e válidos.' });
      this.clientForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/clients/list']);
  }
}
