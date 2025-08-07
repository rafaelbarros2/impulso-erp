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
import { finalize } from 'rxjs/operators';

import { FinanceService } from '../../../../core/services/finance.service';
import { ClientService } from '../../../../core/services/client.service';
import { Payable, Client } from '../../../../core/models';

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
    CalendarModule
  ],
  providers: [MessageService],
  templateUrl: './payable-form.component.html',
  styleUrls: ['./payable-form.component.scss']
})
export class PayableFormComponent implements OnInit {
  payableForm!: FormGroup;
  isEditMode = false;
  payableId: number | null = null;
  pageTitle = 'Nova Conta a Pagar';
  isLoading = false;
  suppliers: Client[] = [];

  statusOptions = [
    { label: 'Pendente', value: 'Pendente' },
    { label: 'Pago', value: 'Pago' },
    { label: 'Atrasado', value: 'Atrasado' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private financeService: FinanceService,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.payableId = +id;
      this.isEditMode = true;
      this.pageTitle = 'Editar Conta a Pagar';
      this.loadPayableData(this.payableId);
    } else {
      this.isEditMode = false;
      this.pageTitle = 'Nova Conta a Pagar';
    }

    this.initForm();
    this.loadSuppliers();
  }

  initForm(): void {
    this.payableForm = this.fb.group({
      description: ['', Validators.required],
      supplierId: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      dueDate: [null, Validators.required],
      status: ['Pendente', Validators.required],
      paymentDate: [{ value: null, disabled: true }],
      notes: ['']
    });

    this.payableForm.get('status')?.valueChanges.subscribe(status => {
      const paymentDateControl = this.payableForm.get('paymentDate');
      if (status === 'Pago') {
        paymentDateControl?.enable();
      } else {
        paymentDateControl?.disable();
        paymentDateControl?.setValue(null);
      }
    });
  }

  loadSuppliers(): void {
    this.isLoading = true;
    this.clientService.getAllClients()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (clients) => {
          // Assuming suppliers are a type of client for now
          this.suppliers = clients;
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar os fornecedores.' });
        }
      });
  }

  loadPayableData(id: number): void {
    this.isLoading = true;
    this.financeService.getPayableById(id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (payable) => {
          this.payableForm.patchValue({
            ...payable,
            dueDate: new Date(payable.dueDate),
            paymentDate: payable.paymentDate ? new Date(payable.paymentDate) : null
          });
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar os dados da conta a pagar.' });
        }
      });
  }

  onSavePayable(): void {
    if (this.payableForm.invalid) {
      this.payableForm.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Por favor, preencha todos os campos obrigatórios.' });
      return;
    }

    this.isLoading = true;
    const payableData = this.payableForm.getRawValue();

    const operation = this.isEditMode
      ? this.financeService.updatePayable(this.payableId!, payableData)
      : this.financeService.createPayable(payableData);

    operation.pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => {
        const successMessage = this.isEditMode ? 'Conta a pagar atualizada com sucesso!' : 'Conta a pagar cadastrada com sucesso!';
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: successMessage });
        this.router.navigate(['/finance/payables']);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar a conta a pagar.' });
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/finance/payables']);
  }
}
