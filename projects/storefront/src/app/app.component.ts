import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { DynamicStylesService } from './services/dynamic-styles.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'storefront';
  private dynamicStylesService = inject(DynamicStylesService);

  ngOnInit() {
    // Carregar estilos dinâmicos na inicialização
    this.dynamicStylesService.loadStyles().subscribe({
      next: (config) => {
        if (config) {
          console.log('✅ Estilos dinâmicos carregados com sucesso!', config);
        } else {
          console.log('⚠️ Nenhuma configuração de estilos encontrada');
        }
      },
      error: (error) => {
        console.error('❌ Erro ao carregar estilos dinâmicos:', error);
      }
    });
  }
}
