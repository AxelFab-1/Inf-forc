import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('infinity-force');

  // La inyección en el constructor es suficiente para que
  // applyStoredTheme() se ejecute al inicializar la app.
  constructor(public themeService: ThemeService) {}
}
