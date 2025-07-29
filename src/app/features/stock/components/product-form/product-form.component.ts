import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect'; // Adicionado para MultiSelect
import { HttpClientModule } from '@angular/common/http';

interface Category {
  name: string;
  code: string;
}

interface Size {
  name: string;
  code: string;
}

interface Color {
  name: string;
  hex: string;
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    ButtonModule,
    FileUploadModule,
    CardModule,
    ToastModule,
    MultiSelectModule,
    HttpClientModule // Importado para usar p-multiSelect
  ],
  providers: [MessageService],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  isEditMode: boolean = false;
  productId: string | null = null;
  pageTitle: string = 'Novo Produto';

  categories: Category[] = [
    { name: 'Vestidos', code: 'VSTD' },
    { name: 'Calças', code: 'CALC' },
    { name: 'Blusas', code: 'BLUS' },
    { name: 'Saias', code: 'SAIA' },
    { name: 'Calçados', code: 'CALCADO' },
    { name: 'Acessórios', code: 'ACESS' },
  ];

  sizes: Size[] = [
    { name: 'PP', code: 'PP' },
    { name: 'P', code: 'P' },
    { name: 'M', code: 'M' },
    { name: 'G', code: 'G' },
    { name: 'GG', code: 'GG' },
  ];

  colors: Color[] = [
    { name: 'Vermelho', hex: '#FF0000' },
    { name: 'Azul', hex: '#0000FF' },
    { name: 'Verde', hex: '#00FF00' },
    { name: 'Preto', hex: '#000000' },
    { name: 'Branco', hex: '#FFFFFF' },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.productId;
    this.pageTitle = this.isEditMode ? 'Editar Produto' : 'Novo Produto';

    this.initForm();

    if (this.isEditMode) {
      this.loadProductData(this.productId!);
    }
  }

  initForm(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      sku: ['', Validators.required],
      category: [null, Validators.required],
      priceCost: [null, [Validators.required, Validators.min(0)]],
      priceSale: [null, [Validators.required, Validators.min(0)]],
      // Para MVP, vamos simplificar o estoque e variações
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      minStock: [0, [Validators.required, Validators.min(0)]],
      imageUrl: [''], // Para MVP, uma URL simples
      // Variações (simplificado para MVP)
      selectedSizes: [[]],
      selectedColors: [[]],
    });
  }

  loadProductData(id: string): void {
    // Simula o carregamento de dados de um produto existente para o MVP
    // Em um projeto real, isso viria de um serviço.
    const mockProduct = {
      id: id,
      name: 'Vestido Floral Verão',
      description: 'Vestido leve e confortável para o verão, com estampa floral vibrante.',
      sku: 'VF1001',
      category: { name: 'Vestidos', code: 'VSTD' },
      priceCost: 60.00,
      priceSale: 129.90,
      stockQuantity: 50,
      minStock: 10,
      imageUrl: 'https://placehold.co/100x100/E0F2F1/000000?text=Vestido',
      selectedSizes: [{ name: 'P', code: 'P' }, { name: 'M', code: 'M' }],
      selectedColors: [{ name: 'Vermelho', hex: '#FF0000' }],
    };

    this.productForm.patchValue({
      name: mockProduct.name,
      description: mockProduct.description,
      sku: mockProduct.sku,
      category: mockProduct.category,
      priceCost: mockProduct.priceCost,
      priceSale: mockProduct.priceSale,
      stockQuantity: mockProduct.stockQuantity,
      minStock: mockProduct.minStock,
      imageUrl: mockProduct.imageUrl,
      selectedSizes: mockProduct.selectedSizes,
      selectedColors: mockProduct.selectedColors,
    });
  }

  onSaveProduct(): void {
    if (this.productForm.valid) {
      const productData = this.productForm.value;
      // Lógica para salvar/atualizar o produto no MVP (simulação)
      console.log('Dados do produto a serem salvos:', productData);

      if (this.isEditMode) {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Produto atualizado com sucesso!' });
      } else {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Produto cadastrado com sucesso!' });
      }
      this.router.navigate(['/stock/products']); // Redireciona para a lista de produtos
    } else {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Por favor, preencha todos os campos obrigatórios.' });
      this.productForm.markAllAsTouched(); // Marca todos os campos como "touched" para exibir erros
    }
  }

  onCancel(): void {
    this.router.navigate(['/stock/products']);
  }

  // Simulação de upload de arquivo (para MVP, apenas exibe o nome)
  onUpload(event: any): void {
    if (event.files && event.files.length > 0) {
      const file = event.files[0];
      this.messageService.add({ severity: 'info', summary: 'Upload de Imagem', detail: `Arquivo ${file.name} selecionado.` });
      // Em um cenário real, você faria o upload para um serviço de armazenamento de arquivos
      // e atualizaria a URL da imagem no formulário.
      // Por enquanto, apenas para demonstração:
      // this.productForm.get('imageUrl')?.setValue('URL_DA_IMAGEM_UPLOADED');
    }
  }
}
