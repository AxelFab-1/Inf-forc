import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private readonly STORAGE_KEY = 'gym_theme';
  private readonly DARK_VALUE  = 'dark';
  private readonly LIGHT_VALUE = 'light';

  private _isDark = false;

  constructor() {
    this.applyStoredTheme();
  }

  /** Aplica el tema guardado en localStorage al arrancar la app */
  applyStoredTheme(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    this._isDark = stored === this.DARK_VALUE || (!stored && prefersDark);
    this.applyTheme(this._isDark);
  }

  get isDark(): boolean {
    return this._isDark;
  }

  toggle(): void {
    this._isDark = !this._isDark;
    this.applyTheme(this._isDark);
    localStorage.setItem(this.STORAGE_KEY, this._isDark ? this.DARK_VALUE : this.LIGHT_VALUE);
  }

  private applyTheme(dark: boolean): void {
    const html = document.documentElement;
    if (dark) {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.removeAttribute('data-theme');
    }
  }
}
