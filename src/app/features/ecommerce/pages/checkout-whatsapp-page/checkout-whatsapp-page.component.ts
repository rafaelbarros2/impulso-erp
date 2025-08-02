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
}

@Component({
  selector: 'app-checkout-whatsapp-page',
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
  templateUrl: './checkout-whatsapp-page.component.html',
  styleUrl: './checkout-whatsapp-page.component.scss'
})
export class CheckoutWhatsappPageComponent implements OnInit {
  checkoutForm!: FormGroup;
  isProcessing: boolean = false;

  // Dados mockados do carrinho
  cartItems: CheckoutItem[] = [
    { name: 'Vestido Floral Verão', quantity: 1, price: 119.90 },
    { name: 'Tênis Esportivo Casual', quantity: 1, price: 189.99 }
  ];

  selectedPaymentMethod: string = 'Dinheiro';
  orderTotal: number = 0;
  shippingCost: number = 0;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.renderSummary();
  }

  initForm(): void {
    this.checkoutForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      cep: ['', Validators.required],
      address: ['', Validators.required],
    });
  }

  // Simula o cálculo de frete
  calculateShipping(): void {
    const cep = this.checkoutForm.get('cep')?.value;
    if (cep && cep.replace(/\D/g, '').length === 8) {
      this.messageService.add({ severity: 'info', summary: 'Frete', detail: 'Calculando frete...' });
      
      // Simulação de cálculo de distância e frete
      // Em um cenário real, você usaria uma API de geolocalização.
      const mockedDistanceKm = Math.floor(Math.random() * 20) + 1;
      const pricePerKm = 10 / 5; // R$10 para 5km
      this.shippingCost = mockedDistanceKm * pricePerKm;
      
      this.renderSummary();
      this.messageService.add({ severity: 'success', summary: 'Frete Calculado', detail: `Distância: ${mockedDistanceKm}km. Custo: R$ ${this.shippingCost.toFixed(2).replace('.', ',')}` });
    }
  }

  selectPaymentMethod(method: string): void {
    this.selectedPaymentMethod = method;
  }

  renderSummary(): void {
    let subtotal = this.cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    this.orderTotal = subtotal + this.shippingCost;
  }

  placeOrder(): void {
    if (this.checkoutForm.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Por favor, preencha todos os campos obrigatórios.' });
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.isProcessing = true;
    this.messageService.add({ severity: 'info', summary: 'Processando', detail: 'Gerando pedido para WhatsApp...' });
    
    // Construir a mensagem do WhatsApp
    const name = this.checkoutForm.get('name')?.value;
    const phone = this.checkoutForm.get('phone')?.value;
    const address = this.checkoutForm.get('address')?.value;
    const cep = this.checkoutForm.get('cep')?.value;
    
    const messageParts = [
      `*Novo Pedido - Pagamento na Entrega*`,
      ``,
      `*Dados do Cliente:*`,
      `Nome: ${name}`,
      `Celular: ${phone}`,
      `Endereço: ${address} (CEP: ${cep})`,
      ``,
      `*Resumo do Pedido:*`,
      ...this.cartItems.map(item => `   - ${item.name} (${item.quantity}x) = R$ ${(item.quantity * item.price).toFixed(2).replace('.', ',')}`),
      ``,
      `*Valor do Frete:* R$ ${this.shippingCost.toFixed(2).replace('.', ',')}`,
      `*Total a Pagar:* R$ ${this.orderTotal.toFixed(2).replace('.', ',')}`,
      `*Forma de Pagamento:* ${this.selectedPaymentMethod}`
    ];
    
    const whatsappMessage = encodeURIComponent(messageParts.join('\n'));
    const whatsappLink = `https://api.whatsapp.com/send?phone=5599999999999&text=${whatsappMessage}`; // Substitua o número pelo da loja

    // Simulação do registro no ERP
    // Em um projeto real, aqui você faria uma chamada para a sua API REST do Spring Boot
    // para salvar os dados do pedido no banco de dados.
    setTimeout(() => {
      console.log('Pedido registrado no ERP com sucesso!');
      window.open(whatsappLink, '_blank');
      this.isProcessing = false;
      this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Mensagem gerada! Envie o pedido por WhatsApp.' });
    }, 1500);
  }
}
