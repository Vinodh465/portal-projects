import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/topbar/topbar.component';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, LoaderComponent, CommonModule],
  template: `
    <app-loader />
    <div class="layout" [class.sidebar-collapsed]="collapsed()">
      <app-sidebar [collapsed]="collapsed()" (toggleSidebar)="collapsed.set(!collapsed())" />
      <div class="layout__body">
        <app-topbar (toggleSidebar)="collapsed.set(!collapsed())" />
        <main class="layout__content fade-in">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  collapsed = signal(false);
}
