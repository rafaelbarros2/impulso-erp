import { Component, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
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
import { ProductService } from '../../../../core/services/product.service';
import { FormValidationService } from '../../../../core/services/form-validation.service';
import { Product } from '../../../../core/services/product-state.service';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

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
export class ProductFormComponent implements OnInit, OnDestroy {
  productForm!: FormGroup;
  
  // Signals for state management
  private productId = signal<string | null>(null);
  private isLoading = signal<boolean>(false);
  private currentProduct = signal<Product | null>(null);
  
  // Computed signals
  readonly isEditMode = computed(() => !!this.productId());
  readonly pageTitle = computed(() => this.isEditMode() ? 'Editar Produto' : 'Novo Produto');
  readonly loading = computed(() => this.isLoading());
  
  // Form validation state from service
  readonly validationState = computed(() => this.formValidationService.validationErrors());
  readonly hasValidationErrors = computed(() => this.formValidationService.hasErrors());
  readonly generalErrors = computed(() => this.formValidationService.generalErrors());

  private subscriptions = new Subscription();

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
    private messageService: MessageService,
    private productService: ProductService,
    private formValidationService: FormValidationService
  ) {
    // Effect to update form when product data changes
    effect(() => {
      const product = this.currentProduct();
      if (product && this.productForm) {
        this.productForm.patchValue({
          name: product.name,
          description: product.description || '',
          sku: product.sku,
          category: this.categories.find(cat => cat.code === product.category) || null,
          priceCost: product.priceCost,
          priceSale: product.priceSale,
          stockQuantity: product.stockQuantity,
          minStock: product.minStock,
          imageUrl: product.imageUrl || ''
        });
      }
    });
  }

  ngOnInit(): void {
    const productIdParam = this.route.snapshot.paramMap.get('id');
    this.productId.set(productIdParam);

    this.initForm();

    if (this.isEditMode()) {
      this.loadProductData(productIdParam!);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.formValidationService.resetValidation();
  }

  initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      sku: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      category: [null, Validators.required],
      priceCost: [null, [Validators.required, Validators.min(0)]],
      priceSale: [null, [Validators.required, Validators.min(0)]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      minStock: [0, [Validators.required, Validators.min(0)]],
      imageUrl: ['', Validators.maxLength(500)]
    });

    // Clear validation errors when form values change
    this.productForm.valueChanges.subscribe(() => {
      this.formValidationService.clearServerValidationErrors(this.productForm);
    });
  }

  loadProductData(id: string): void {
    this.isLoading.set(true);
    const loadSub = this.productService.getProductById(id).subscribe({
      next: (product) => {
        // Convert the product to our interface format
        const productData: Product = {
          id: product.id,
          name: product.name,
          description: product.description,
          sku: product.sku,
          category: product.category,
          priceCost: product.priceCost,
          priceSale: product.priceSale,
          stockQuantity: product.stockQuantity,
          minStock: product.minStock,
          imageUrl: product.imageUrl,
          active: product.active
        };
        this.currentProduct.set(productData);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);
        if (error.status === 404) {
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Erro', 
            detail: 'Produto não encontrado.' 
          });
          this.router.navigate(['/stock/products']);
        }
      }
    });
    this.subscriptions.add(loadSub);
  }

  onSaveProduct(): void {
    // Clear previous validation errors
    this.formValidationService.clearServerValidationErrors(this.productForm);

    // Validate client-side first
    if (!this.formValidationService.validateAllFormFields(this.productForm)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro de Validação',
        detail: 'Por favor, corrija os erros nos campos destacados.'
      });
      return;
    }

    this.isLoading.set(true);
    const productData: Product = {
      name: this.productForm.value.name,
      description: this.productForm.value.description,
      sku: this.productForm.value.sku,
      category: this.productForm.value.category?.code,
      priceCost: this.productForm.value.priceCost,
      priceSale: this.productForm.value.priceSale,
      stockQuantity: this.productForm.value.stockQuantity,
      minStock: this.productForm.value.minStock,
      imageUrl: this.productForm.value.imageUrl
    };

    const operation = this.isEditMode() 
      ? this.productService.updateProduct(this.productId()!, productData)
      : this.productService.createProduct(productData);

    const saveSub = operation.subscribe({
      next: (product) => {
        this.isLoading.set(false);
        const message = this.isEditMode() ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!';
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: message
        });
        this.router.navigate(['/stock/products']);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);
        if (error.status === 400 && error.error?.fieldErrors) {
          // Handle validation errors from the backend
          this.formValidationService.applyServerValidationErrors(
            this.productForm,
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
    this.router.navigate(['/stock/products']);
  }

  // Helper methods for template
  getFieldError(fieldName: string): string | null {
    const control = this.productForm.get(fieldName);
    return this.formValidationService.getFieldErrorMessage(control, fieldName);
  }

  hasFieldError(fieldName: string): boolean {
    const control = this.productForm.get(fieldName);
    return this.formValidationService.hasFieldError(control);
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
