
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { StoreService } from '../../../../core/services/store.service';
import { AuthStateService } from '../../../../core/state/auth-state.service';
import { Store, StoreCreateRequest, StoreUpdateRequest } from '../../../../core/models';

@Component({
  selector: 'app-subsidiary-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TableModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './subsidiary-settings.component.html',
  styleUrls: ['./subsidiary-settings.component.scss']
})
export class SubsidiarySettingsComponent implements OnInit {
  
  mainStore: Store | null = null;
  subsidiaries: Store[] = [];
  selectedSubsidiary: Store | null = null;
  
  showCreateDialog = false;
  showEditDialog = false;
  
  createForm: FormGroup;
  editForm: FormGroup;
  
  loading = false;
  
  constructor(
    private fb: FormBuilder,
    private storeService: StoreService,
    private authState: AuthStateService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.createForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      subdomain: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]]
    });
    
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
  }
  
  ngOnInit() {
    this.loadStoreData();
  }
  
  loadStoreData() {
    this.loading = true;
    const currentUser = this.authState.getCurrentUser();
    
    if (currentUser?.store) {
      this.storeService.getStore(currentUser.store.subdomain).subscribe({
        next: (store) => {
          if (store.parentStore) {
            this.mainStore = store.parentStore;
            this.loadSubsidiaries(store.parentStore.subdomain);
          } else {
            this.mainStore = store;
            this.loadSubsidiaries(store.subdomain);
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao carregar dados da loja'
          });
          this.loading = false;
        }
      });
    }
  }
  
  loadSubsidiaries(storeSubdomain: string) {
    this.storeService.getSubsidiaries(storeSubdomain).subscribe({
      next: (subsidiaries) => {
        this.subsidiaries = subsidiaries;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar subsidiárias'
        });
        this.loading = false;
      }
    });
  }
  
  openCreateDialog() {
    this.createForm.reset();
    this.showCreateDialog = true;
  }
  
  openEditDialog(subsidiary: Store) {
    this.selectedSubsidiary = subsidiary;
    this.editForm.patchValue({
      name: subsidiary.name
    });
    this.showEditDialog = true;
  }
  
  createSubsidiary() {
    if (this.createForm.valid && this.mainStore) {
      const formData: StoreCreateRequest = this.createForm.value;
      
      this.storeService.createSubsidiary(this.mainStore.subdomain, formData).subscribe({
        next: (newSubsidiary) => {
          this.subsidiaries.push(newSubsidiary);
          this.showCreateDialog = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Subsidiária criada com sucesso'
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao criar subsidiária'
          });
        }
      });
    }
  }
  
  updateSubsidiary() {
    if (this.editForm.valid && this.selectedSubsidiary) {
      const formData: StoreUpdateRequest = this.editForm.value;
      
      this.storeService.updateStore(this.selectedSubsidiary.subdomain, formData).subscribe({
        next: (updatedStore) => {
          const index = this.subsidiaries.findIndex(s => s.id === updatedStore.id);
          if (index !== -1) {
            this.subsidiaries[index] = updatedStore;
          }
          this.showEditDialog = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Subsidiária atualizada com sucesso'
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao atualizar subsidiária'
          });
        }
      });
    }
  }
  
  confirmDelete(subsidiary: Store) {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir a subsidiária "${subsidiary.name}"?`,
      header: 'Confirmar exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Note: You would need to implement a delete endpoint in the backend
        this.messageService.add({
          severity: 'info',
          summary: 'Info',
          detail: 'Funcionalidade de exclusão não implementada'
        });
      }
    });
  }
}
