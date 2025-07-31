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

interface Supplier {
  id: string;
  name: string;
}

@Component({
  selector: 'app-payable-form',
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
  templateUrl: './payable-form.component.html',
  styleUrl: './payable-form.component.scss'
})
export class PayableFormComponent implements OnInit {
  payableForm!: FormGroup;
  isEditMode: boolean = false;
  payableId: string | null = null;
  pageTitle: string = 'Nova Conta a Pagar';

  // Dados mockados de fornecedores para o dropdown
  suppliers: Supplier[] = [
    { id: '1', name: 'Imobiliária Central' },
    { id: '2', name: 'Energia Elétrica S.A.' },
    { id: '3', name: 'Tecelagem Fina' },
    { id: '4', name: 'Funcionário A' },
    { id: '5', name: 'Tech Services' },
  ];

  statusOptions = [
    { label: 'Pendente', value: 'Pendente' },
    { label: 'Pago', value: 'Pago' },
    { label: 'Atrasado', value: 'Atrasado' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.payableId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.payableId;
    this.pageTitle = this.isEditMode ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar';

    this.initForm();

    if (this.isEditMode) {
      this.loadPayableData(this.payableId!);
    }
  }

  initForm(): void {
    this.payableForm = this.fb.group({
      description: ['', Validators.required],
      supplier: [null, Validators.required], // Objeto Supplier
      amount: [null, [Validators.required, Validators.min(0.01)]],
      dueDate: [null, Validators.required],
      status: ['Pendente', Validators.required],
      paymentDate: [null],
      notes: ['']
    });

    // Desabilitar campo de data de pagamento se o status não for "Pago"
    this.payableForm.get('status')?.valueChanges.subscribe(status => {
      const paymentDateControl = this.payableForm.get('paymentDate');
      if (status === 'Pago') {
        paymentDateControl?.enable();
      } else {
        paymentDateControl?.disable();
        paymentDateControl?.setValue(null); // Limpa a data se o status mudar
      }
    });
  }

  loadPayableData(id: string): void {
    // Simula o carregamento de dados de uma conta a pagar existente para o MVP
    const mockPayable = {
      id: id,
      description: 'Aluguel Escritório',
      supplier: { id: '1', name: 'Imobiliária Central' },
      amount: 1500.00,
      dueDate: new Date('2025-07-05'),
      status: 'Pago',
      paymentDate: new Date('2025-07-04'),
      notes: 'Referente ao mês de Junho.'
    };

    // Ajusta o status para que o campo paymentDate seja habilitado se necessário
    this.payableForm.patchValue({
      ...mockPayable,
      supplier: this.suppliers.find(s => s.id === mockPayable.supplier.id) // Garante que o objeto fornecedor seja o da lista
    });
  }

  onSavePayable(): void {
    if (this.payableForm.valid) {
      const payableData = this.payableForm.value;
      console.log('Dados da conta a pagar a serem salvos:', payableData);

      if (this.isEditMode) {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Conta a pagar atualizada com sucesso!' });
      } else {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Conta a pagar cadastrada com sucesso!' });
      }
      this.router.navigate(['/finance/payables']);
    } else {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Por favor, preencha todos os campos obrigatórios e válidos.' });
      this.payableForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/finance/payables']);
  }
}
