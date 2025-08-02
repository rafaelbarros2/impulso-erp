import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

interface CheckoutItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface ShippingOption {
  type: string;
  days: string;
  price: number;
  icon: string;
}

interface PaymentOption {
  name: string;
  code: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputMaskModule,
    CardModule,
    ToastModule
  ],
  providers: [MessageService, CurrencyPipe],
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.scss'
})
export class CheckoutPageComponent implements OnInit {
  checkoutForm!: FormGroup;
  isProcessing: boolean = false;

  // Dados mockados para o carrinho e resumo
  cartItems: CheckoutItem[] = [
    { 
      name: 'Vestido Floral Verão', 
      quantity: 1, 
      price: 119.90, 
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=300&h=300' 
    },
    { 
      name: 'Tênis Esportivo Casual', 
      quantity: 1, 
      price: 189.99, 
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=300&h=300' 
    }
  ];
  
  subtotal: number = 309.89;
  discount: number = 0;
  shipping: number = 15.90;
  total: number = 325.79;

  // Opções de envio
  shippingOptions: ShippingOption[] = [
    { type: 'PAC', days: '5-8 dias úteis', price: 15.90, icon: 'pi-truck text-green-600' },
    { type: 'SEDEX', days: '2-3 dias úteis', price: 25.90, icon: 'pi-truck text-blue-600' }
  ];
  selectedShipping: ShippingOption = this.shippingOptions[0];

  // Opções de pagamento
  paymentOptions: PaymentOption[] = [
    { 
      name: 'Cartão de Crédito', 
      code: 'credit_card', 
      icon: 'pi-credit-card text-purple-600', 
      description: 'Pague em até 12x sem juros' 
    },
    { 
      name: 'PIX', 
      code: 'pix', 
      icon: 'pi-qrcode text-green-600', 
      description: 'Pagamento instantâneo' 
    },
    { 
      name: 'Boleto Bancário', 
      code: 'boleto', 
      icon: 'pi-barcode text-gray-600', 
      description: 'Pagamento em até 3 dias úteis' 
    }
  ];
  selectedPayment: PaymentOption = this.paymentOptions[0];
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.updateTotals();
  }

  initForm(): void {
    this.checkoutForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]],
      address: ['', Validators.required],
      number: ['', Validators.required],
      complement: [''],
      // Campos do cartão de crédito (condicionais)
      cardNumber: [''],
      cardExpiry: [''],
      cardCvv: ['']
    });

    // Configurar validação condicional baseada no método de pagamento
    this.updateCardValidation();
  }

  private updateCardValidation(): void {
    const cardNumberControl = this.checkoutForm.get('cardNumber');
    const cardExpiryControl = this.checkoutForm.get('cardExpiry');
    const cardCvvControl = this.checkoutForm.get('cardCvv');

    if (this.selectedPayment.code === 'credit_card') {
      cardNumberControl?.setValidators([Validators.required, Validators.pattern(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/)]);
      cardExpiryControl?.setValidators([Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]);
      cardCvvControl?.setValidators([Validators.required, Validators.pattern(/^\d{3}$/)]);
    } else {
      cardNumberControl?.clearValidators();
      cardExpiryControl?.clearValidators();
      cardCvvControl?.clearValidators();
    }

    cardNumberControl?.updateValueAndValidity();
    cardExpiryControl?.updateValueAndValidity();
    cardCvvControl?.updateValueAndValidity();
  }

  // Simula a busca de endereço pelo CEP
  onCepChange(): void {
    const cep = this.checkoutForm.get('cep')?.value;
    if (cep && cep.replace(/\D/g, '').length === 8) {
      this.messageService.add({ 
        severity: 'info', 
        summary: 'Buscando CEP', 
        detail: 'Preenchendo endereço automaticamente...' 
      });
      
      // Simulação de delay para a API
      setTimeout(() => {
        this.checkoutForm.patchValue({
          address: 'Rua das Flores',
          number: '',
          complement: ''
        });
        this.messageService.add({ 
          severity: 'success', 
          summary: 'CEP Encontrado', 
          detail: 'Endereço preenchido com sucesso.' 
        });
      }, 500);
    }
  }

  onShippingSelect(option: ShippingOption): void {
    this.selectedShipping = option;
    this.shipping = option.price;
    this.updateTotals();
    this.messageService.add({ 
      severity: 'success', 
      summary: 'Envio', 
      detail: `Opção de envio "${option.type}" selecionada.` 
    });
  }

  onPaymentSelect(option: PaymentOption): void {
    this.selectedPayment = option;
    this.updateCardValidation(); // Atualiza as validações do cartão
    
    // Limpa os campos do cartão se não for cartão de crédito
    if (option.code !== 'credit_card') {
      this.checkoutForm.patchValue({
        cardNumber: '',
        cardExpiry: '',
        cardCvv: ''
      });
    }
    
    this.messageService.add({ 
      severity: 'success', 
      summary: 'Pagamento', 
      detail: `Método de pagamento "${option.name}" selecionado.` 
    });
  }

  updateTotals(): void {
    // Lógica de cálculo de totais
    this.total = this.subtotal - this.discount + this.shipping;
  }

  placeOrder(): void {
    if (this.checkoutForm.invalid) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Erro', 
        detail: 'Por favor, preencha todos os campos obrigatórios.' 
      });
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.isProcessing = true;
    this.messageService.add({ 
      severity: 'info', 
      summary: 'Processando', 
      detail: 'Finalizando seu pedido, aguarde...' 
    });
    
    // Simulação de processamento
    setTimeout(() => {
      this.isProcessing = false;
      this.messageService.add({ 
        severity: 'success', 
        summary: 'Sucesso', 
        detail: '🎉 Pedido finalizado com sucesso!' 
      });
      
      // Simulação de redirecionamento para a página de sucesso ou lista de pedidos
      setTimeout(() => {
        this.router.navigate(['/ecommerce/orders']);
      }, 1500);
    }, 2000);
  }

  goBackToCart(): void {
    this.router.navigate(['/ecommerce/cart']);
  }

  // Método auxiliar para debugging (opcional)
  getFormErrors(): any {
    let formErrors: any = {};
    Object.keys(this.checkoutForm.controls).forEach(key => {
      const controlErrors = this.checkoutForm.get(key)?.errors;
      if (controlErrors) {
        formErrors[key] = controlErrors;
      }
    });
    return formErrors;
  }
}