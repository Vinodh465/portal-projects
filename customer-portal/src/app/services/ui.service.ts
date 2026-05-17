import { Injectable, Inject, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private sidebarOpen = new BehaviorSubject<boolean>(false);
  sidebarOpen$ = this.sidebarOpen.asObservable();
  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  toggleSidebar(): void {
    const newState = !this.sidebarOpen.value;
    this.sidebarOpen.next(newState);
    this.updateBodyClass(newState);
  }

  setSidebarState(isOpen: boolean): void {
    this.sidebarOpen.next(isOpen);
    this.updateBodyClass(isOpen);
  }

  private updateBodyClass(isOpen: boolean): void {
    if (isOpen) {
      this.renderer.addClass(document.body, 'sidebar-open');
    } else {
      this.renderer.removeClass(document.body, 'sidebar-open');
    }
  }

  isSidebarOpen(): boolean {
    return this.sidebarOpen.value;
  }
}
