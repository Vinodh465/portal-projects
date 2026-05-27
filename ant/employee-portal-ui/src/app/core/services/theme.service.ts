import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'ep_theme';
  theme = signal<Theme>(this.getStoredTheme());

  constructor() {
    this.applyTheme(this.theme());
  }

  toggleTheme(): void {
    const next: Theme = this.theme() === 'light' ? 'dark' : 'light';
    this.theme.set(next);
    localStorage.setItem(this.THEME_KEY, next);
    this.applyTheme(next);
  }

  private applyTheme(t: Theme): void {
    document.documentElement.setAttribute('data-theme', t);
    if (t === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  private getStoredTheme(): Theme {
    return (localStorage.getItem(this.THEME_KEY) as Theme) || 'light';
  }
}
