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
import { ToggleButtonModule } from 'primeng/togglebutton'; // Para visibilidade online
import { MultiSelectModule } from 'primeng/multiselect'; // Para variações (se aplicável)
import { HttpClientModule } from '@angular/common/http'; // Necessário se for usar HttpClient

interface ProductBase {
  id: string;
  name: string;
  sku: string;
  price: number; // Preço de custo/base do produto
  image: string;
  // Outras propriedades do produto base, como variantes, categoria, etc.
}

@Component({
  selector: 'app-online-product-form',
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
    ToggleButtonModule,
    MultiSelectModule, // Importado
    HttpClientModule
  ],
  providers: [MessageService],
  templateUrl: './online-product-form.component.html',
  styleUrl: './online-product-form.component.scss'
})
export class OnlineProductFormComponent implements OnInit {
  onlineProductForm!: FormGroup;
  isEditMode: boolean = false;
  onlineProductId: string | null = null;
  pageTitle: string = 'Novo Produto Online';

  // Dados mockados de produtos base para seleção
  availableBaseProducts: ProductBase[] = [
    { id: 'base1', name: 'Vestido Floral Verão (Estoque)', sku: 'VF1001', price: 129.90, image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=300&fit=crop' },
    { id: 'base2', name: 'Calça Jeans Skinny (Estoque)', sku: 'CJ2002', price: 89.50, image: 'https://images.unsplash.com/photo-1541099645167-bb809425f705?w=300&h=300&fit=crop' },
    { id: 'base3', name: 'Tênis Esportivo Casual (Estoque)', sku: 'TE4004', price: 199.99, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop' },
  ];

  statusOptions = [
    { label: 'Ativo', value: 'Ativo' },
    { label: 'Inativo', value: 'Inativo' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.onlineProductId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.onlineProductId;
    this.pageTitle = this.isEditMode ? 'Editar Produto Online' : 'Novo Produto Online';

    this.initForm();

    if (this.isEditMode) {
      this.loadOnlineProductData(this.onlineProductId!);
    }
  }

  initForm(): void {
    this.onlineProductForm = this.fb.group({
      baseProduct: [null, Validators.required], // Referência ao produto base do estoque
      onlinePrice: [null, [Validators.required, Validators.min(0.01)]],
      onlineDescription: [''],
      seoTitle: [''],
      seoDescription: [''],
      isVisibleOnline: [true], // Toggle para visibilidade
      // Campos adicionais para e-commerce, como imagens específicas, tags, etc.
    });

    // Desabilitar seleção de produto base em modo de edição
    if (this.isEditMode) {
      this.onlineProductForm.get('baseProduct')?.disable();
    }
  }

  loadOnlineProductData(id: string): void {
    // Simula o carregamento de dados de um produto online existente
    const mockOnlineProduct = {
      id: id,
      baseProduct: this.availableBaseProducts[0], // Mockando um produto base
      onlinePrice: 119.90,
      onlineDescription: 'Vestido leve e confortável para o verão, com estampa floral vibrante. Perfeito para o dia a dia e eventos casuais.',
      seoTitle: 'Vestido Floral Verão - Loja Fashion',
      seoDescription: 'Compre Vestido Floral Verão com estampa exclusiva. Conforto e estilo para seu dia a dia.',
      isVisibleOnline: true,
    };

    this.onlineProductForm.patchValue({
      ...mockOnlineProduct,
      baseProduct: this.availableBaseProducts.find(p => p.id === mockOnlineProduct.baseProduct.id)
    });
  }

  onSaveOnlineProduct(): void {
    if (this.onlineProductForm.valid) {
      const formData = this.onlineProductForm.getRawValue(); // Usa getRawValue para incluir campos desabilitados
      console.log('Dados do produto online a serem salvos:', formData);

      if (this.isEditMode) {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Produto online atualizado com sucesso!' });
      } else {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Produto online cadastrado com sucesso!' });
      }
      this.router.navigate(['/ecommerce/products']);
    } else {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Por favor, preencha todos os campos obrigatórios e válidos.' });
      this.onlineProductForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/ecommerce/products']);
  }
}
