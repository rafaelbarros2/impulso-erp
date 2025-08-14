import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CalendarModule } from 'primeng/calendar';
import { HttpClientModule } from '@angular/common/http'; // Necessário se for usar HttpClient
import { Client } from '../../../../core/models';

@Component({
  selector: 'app-receivable-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    ButtonModule,
    CardModule,
    ToastModule,
    CalendarModule,
    HttpClientModule
  ],
  providers: [MessageService],
  templateUrl: './receivable-form.component.html',
  styleUrl: './receivable-form.component.scss'
})
export class ReceivableFormComponent implements OnInit {
  receivableForm!: FormGroup;
  isEditMode: boolean = false;
  receivableId: string | null = null;
  pageTitle: string = 'Nova Conta a Receber';

  // TODO: Implementar carregamento real de clientes da API
  // clients: Client[] = [
  //   { id: '1', name: 'Maria Silva' },
  //   { id: '2', name: 'João Santos' },
  //   { id: '3', name: 'Empresa ABC' },
  //   { id: '4', name: 'Ana Costa' },
  // ];
  clients: Client[] = []; // Removido dados mockados

  statusOptions = [
    { label: 'Pendente', value: 'Pendente' },
    { label: 'Recebido', value: 'Recebido' },
    { label: 'Atrasado', value: 'Atrasado' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.receivableId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.receivableId;
    this.pageTitle = this.isEditMode ? 'Editar Conta a Receber' : 'Nova Conta a Receber';

    this.initForm();

    if (this.isEditMode) {
      this.loadReceivableData(this.receivableId!);
    }
  }

  initForm(): void {
    this.receivableForm = this.fb.group({
      description: ['', Validators.required],
      client: [null, Validators.required], // Objeto Client
      amount: [null, [Validators.required, Validators.min(0.01)]],
      dueDate: [null, Validators.required],
      status: ['Pendente', Validators.required],
      paymentDate: [null],
      notes: ['']
    });

    // Desabilitar campo de data de pagamento se o status não for "Recebido"
    this.receivableForm.get('status')?.valueChanges.subscribe(status => {
      const paymentDateControl = this.receivableForm.get('paymentDate');
      if (status === 'Recebido') {
        paymentDateControl?.enable();
      } else {
        paymentDateControl?.disable();
        paymentDateControl?.setValue(null); // Limpa a data se o status mudar
      }
    });
  }

  loadReceivableData(id: string): void {
    // TODO: Implementar carregamento real de dados da API
    // const mockReceivable = {
    //   id: id,
    //   description: 'Venda PDV - Cliente Maria',
    //   client: { id: '1', name: 'Maria Silva' },
    //   amount: 349.90,
    //   dueDate: new Date('2025-07-30'),
    //   status: 'Recebido',
    //   paymentDate: new Date('2025-07-29'),
    //   notes: 'Venda de roupas de verão.'
    // };

    // // Ajusta o status para que o campo paymentDate seja habilitado se necessário
    // this.receivableForm.patchValue({
    //   ...mockReceivable,
    //   client: this.clients.find(c => c.id === mockReceivable.client.id) // Garante que o objeto cliente seja o da lista
    // });
  }

  onSaveReceivable(): void {
    if (this.receivableForm.valid) {
      const receivableData = this.receivableForm.value;
      console.log('Dados da conta a receber a serem salvos:', receivableData);

      if (this.isEditMode) {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Conta a receber atualizada com sucesso!' });
      } else {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Conta a receber cadastrada com sucesso!' });
      }
      this.router.navigate(['/finance/receivables']);
    } else {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Por favor, preencha todos os campos obrigatórios e válidos.' });
      this.receivableForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/finance/receivables']);
  }
}
