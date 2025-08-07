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
import { ToggleButtonModule } from 'primeng/togglebutton';
import { MultiSelectModule } from 'primeng/multiselect';
import { HttpClientModule } from '@angular/common/http';
import { ProductService, Product } from '../../../../core/services/product.service';
import { OnlineProductService, OnlineProduct } from '../../../../core/services/online-product.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { LoadingSpinnerComponent } from '../../../../shared';
import { finalize } from 'rxjs/operators';

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
    MultiSelectModule,
    HttpClientModule,
    LoadingSpinnerComponent
  ],
  providers: [MessageService],
  templateUrl: './online-product-form.component.html',
  styleUrl: './online-product-form.component.scss'
})
export class OnlineProductFormComponent implements OnInit {
  onlineProductForm!: FormGroup;
  isEditMode: boolean = false;
  onlineProductId: number | null = null;
  pageTitle: string = 'Novo Produto Online';

  availableBaseProducts: Product[] = [];
  isLoadingProducts: boolean = false;
  hasProductsError: boolean = false;

  readonly LOADING_KEYS = LoadingService.KEYS;

  statusOptions = [
    { label: 'Ativo', value: true },
    { label: 'Inativo', value: false }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private productService: ProductService,
    private onlineProductService: OnlineProductService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.onlineProductId = +id;
      this.isEditMode = true;
      this.pageTitle = 'Editar Produto Online';
      this.loadOnlineProductData(this.onlineProductId);
    } else {
      this.isEditMode = false;
      this.pageTitle = 'Novo Produto Online';
    }

    this.initForm();
    this.loadBaseProducts();
  }

  initForm(): void {
    this.onlineProductForm = this.fb.group({
      productId: [null, Validators.required],
      title: ['', Validators.required],
      description: [''],
      price: [null, [Validators.required, Validators.min(0.01)]],
      discountPrice: [null],
      imageUrl: [''],
      category: [''],
      featured: [false],
      active: [true, Validators.required]
    });

    if (this.isEditMode) {
      this.onlineProductForm.get('productId')?.disable();
    }
  }

  loadBaseProducts(): void {
    this.hasProductsError = false;
    this.isLoadingProducts = true;
    
    this.productService.getAllProducts()
      .pipe(finalize(() => this.isLoadingProducts = false))
      .subscribe({
        next: (products: Product[]) => {
          this.availableBaseProducts = products.filter(p => p.active && p.stockQuantity > 0);
        },
        error: (error) => {
          console.error('Error loading base products:', error);
          this.hasProductsError = true;
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível carregar os produtos base. Tente novamente.'
          });
        }
      });
  }

  loadOnlineProductData(id: number): void {
    this.loadingService.setLoading(this.LOADING_KEYS.PRODUCT_DETAILS, true);
    this.onlineProductService.getOnlineProductById(id)
      .pipe(finalize(() => this.loadingService.setLoading(this.LOADING_KEYS.PRODUCT_DETAILS, false)))
      .subscribe({
        next: (product) => {
          this.onlineProductForm.patchValue(product);
        },
        error: (error) => {
          console.error('Error loading online product:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível carregar os dados do produto online.'
          });
        }
      });
  }

  onRetryLoadProducts(): void {
    this.loadBaseProducts();
  }

  getLoadingService(): LoadingService {
    return this.loadingService;
  }

  onSaveOnlineProduct(): void {
    if (this.onlineProductForm.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Por favor, preencha todos os campos obrigatórios e válidos.' });
      this.onlineProductForm.markAllAsTouched();
      return;
    }

    const formData = this.onlineProductForm.getRawValue();
    const operation = this.isEditMode
      ? this.onlineProductService.updateOnlineProduct(this.onlineProductId!, formData)
      : this.onlineProductService.createOnlineProduct(formData);

    const successMessage = this.isEditMode
      ? 'Produto online atualizado com sucesso!'
      : 'Produto online cadastrado com sucesso!';

    this.loadingService.setLoading(this.LOADING_KEYS.FORM_SUBMIT, true);
    operation
      .pipe(finalize(() => this.loadingService.setLoading(this.LOADING_KEYS.FORM_SUBMIT, false)))
      .subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: successMessage });
          this.router.navigate(['/ecommerce/products']);
        },
        error: (error) => {
          console.error('Error saving online product:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Ocorreu um erro ao salvar o produto online.'
          });
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/ecommerce/products']);
  }
}
