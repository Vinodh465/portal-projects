import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent],
  template: `
    <div class="shell-container" [class.dark-mode]="themeService.theme() === 'dark'">
      <app-sidebar />
      <div class="main-area">
        <app-navbar />
        <main class="content-area">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .shell-container {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: var(--bg-primary);
    }
    .main-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .content-area {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      background: var(--bg-primary);
    }
    @media (max-width: 768px) {
      .content-area { padding: 16px; }
    }
  `]
})
export class ShellComponent {
  themeService = inject(ThemeService);
  authService = inject(AuthService);

  constructor() {
    this.authService.refreshUserProfile();
  }
}
