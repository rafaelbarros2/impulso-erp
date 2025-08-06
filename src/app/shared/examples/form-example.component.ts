import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';

// Importações dos componentes shared
import { CpfCnpjInputComponent } from '../components/form-controls/cpf-cnpj-input/cpf-cnpj-input.component';
import { PriceInputComponent } from '../components/form-controls/price-input/price-input.component';
import { BaseCardComponent } from '../components/cards/base-card/base-card.component';
import { LoadingSpinnerComponent } from '../components/ui/loading-spinner/loading-spinner.component';
import { PricePipe } from '../pipes/price.pipe';

@Component({
  selector: 'app-form-example',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    // Componentes shared
    CpfCnpjInputComponent,
    PriceInputComponent,
    BaseCardComponent,
    LoadingSpinnerComponent,
    PricePipe
  ],
  template: `
    <div class="form-example-container">
      <!-- Exemplo de uso do BaseCard -->
      <app-base-card 
        title="Exemplo de Formulário com Componentes Shared"
        subtitle="Demonstração dos componentes reutilizáveis"
        [elevated]="true">
        
        <form [formGroup]="exampleForm" (ngSubmit)="onSubmit()">
          
          <!-- Exemplo do CPF/CNPJ Input -->
          <div class="form-section">
            <h4>Documento</h4>
            <app-cpf-cnpj-input
              formControlName="document"
              label="CPF/CNPJ"
              helpText="Selecione o tipo de documento e digite o número"
              [required]="true"
              [showTypeSelector]="true">
            </app-cpf-cnpj-input>
          </div>

          <!-- Campo normal para comparação -->
          <div class="form-section">
            <h4>Nome</h4>
            <input 
              type="text" 
              pInputText 
              formControlName="name"
              placeholder="Digite o nome"
              class="w-full">
          </div>

          <!-- Exemplo dos Price Inputs -->
          <div class="form-section">
            <h4>Preços</h4>
            <div class="price-inputs-grid">
              <app-price-input
                formControlName="costPrice"
                label="Preço de Custo"
                helpText="Valor pago pelo produto"
                [required]="true"
                [showButtons]="true">
              </app-price-input>

              <app-price-input
                formControlName="salePrice"
                label="Preço de Venda"
                helpText="Valor cobrado do cliente"
                [required]="true"
                [compareValue]="exampleForm.get('costPrice')?.value"
                [showButtons]="true">
              </app-price-input>
            </div>
          </div>

          <!-- Loading Spinner exemplo -->
          <div class="form-section" *ngIf="isLoading">
            <app-loading-spinner 
              text="Salvando dados..."
              [center]="true">
            </app-loading-spinner>
          </div>

          <!-- Botões -->
          <div class="form-actions">
            <button 
              type="button" 
              pButton 
              label="Cancelar" 
              class="p-button-secondary"
              (click)="onCancel()">
            </button>
            <button 
              type="submit" 
              pButton 
              label="Salvar" 
              [disabled]="!exampleForm.valid || isLoading">
            </button>
          </div>
        </form>

        <!-- Demonstração do PricePipe -->
        <div slot="footer" *ngIf="exampleForm.get('salePrice')?.value">
          <p>Preço formatado com pipe: {{ exampleForm.get('salePrice')?.value | price }}</p>
        </div>
      </app-base-card>

      <!-- Debug Info -->
      <app-base-card title="Debug - Estado do Formulário" [compact]="true">
        <pre>{{ getFormDebugInfo() | json }}</pre>
      </app-base-card>
    </div>
  `,
  styles: [`
    .form-example-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-section {
      margin-bottom: 1.5rem;
    }

    .form-section h4 {
      margin: 0 0 0.75rem 0;
      color: var(--text-color);
      font-size: 1rem;
      font-weight: 600;
    }

    .price-inputs-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    @media (max-width: 768px) {
      .price-inputs-grid {
        grid-template-columns: 1fr;
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid var(--surface-border);
    }

    pre {
      background: var(--surface-ground);
      padding: 1rem;
      border-radius: var(--border-radius);
      font-size: 0.75rem;
      max-height: 200px;
      overflow-y: auto;
    }
  `]
})
export class FormExampleComponent implements OnInit {
  exampleForm!: FormGroup;
  isLoading: boolean = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.exampleForm = this.fb.group({
      document: ['', Validators.required],
      name: ['', Validators.required],
      costPrice: [null, [Validators.required, Validators.min(0.01)]],
      salePrice: [null, [Validators.required, Validators.min(0.01)]]
    });

    // Observa mudanças no preço de custo para recalcular margem
    this.exampleForm.get('costPrice')?.valueChanges.subscribe(() => {
      // Força re-validação do preço de venda para atualizar comparação
      this.exampleForm.get('salePrice')?.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    if (this.exampleForm.valid) {
      this.isLoading = true;
      
      // Simula salvamento
      setTimeout(() => {
        this.isLoading = false;
        console.log('Formulário salvo:', this.exampleForm.value);
        alert('Dados salvos com sucesso!');
      }, 2000);
    } else {
      this.exampleForm.markAllAsTouched();
      alert('Por favor, preencha todos os campos obrigatórios.');
    }
  }

  onCancel(): void {
    this.exampleForm.reset();
  }

  getFormDebugInfo(): any {
    return {
      value: this.exampleForm.value,
      valid: this.exampleForm.valid,
      errors: this.getFormErrors(),
      touched: this.exampleForm.touched,
      dirty: this.exampleForm.dirty
    };
  }

  private getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.exampleForm.controls).forEach(key => {
      const control = this.exampleForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }
}