import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-top-bar',
  imports: [CommonModule, ButtonModule, MenuModule],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss'
})
export class TopBarComponent implements OnInit {
  currentUser: User | null = null;
  userMenuItems: MenuItem[] = [];

  constructor(private authService: AuthService) {
    effect(() => {
      this.currentUser = this.authService.currentUser$();
    });
  }

  ngOnInit(): void {
    this.userMenuItems = [
      {
        label: 'Perfil',
        icon: 'pi pi-user',
        command: () => this.viewProfile()
      },
      {
        label: 'Configurações',
        icon: 'pi pi-cog',
        command: () => this.openSettings()
      },
      {
        separator: true
      },
      {
        label: 'Sair',
        icon: 'pi pi-sign-out',
        command: () => this.logout()
      }
    ];
  }

  viewProfile(): void {
    // Navigate to profile page
    console.log('View profile');
  }

  openSettings(): void {
    // Navigate to settings page
    console.log('Open settings');
  }

  logout(): void {
    this.authService.logout();
  }
}
