import { inject, Injectable, InjectionToken, signal } from '@angular/core';

type Theme = 'light' | 'dark';

export const BROWSER_STORAGE = new InjectionToken<Storage>('Browser Storage', {
  providedIn: 'root',
  factory: () => localStorage,
});

@Injectable({
  providedIn: 'root',
})
export class ThemeStore {
  #theme = signal<Theme>('light');
  theme = this.#theme.asReadonly();
  private localStorage = inject(BROWSER_STORAGE);

  constructor() {
    const savedTheme = (this.localStorage.getItem('theme') as Theme) || 'light';
    this.setTheme(savedTheme);
  }

  toggleTheme() {
    const newTheme = this.#theme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setTheme(theme: Theme) {
    this.#theme.set(theme);
    this.localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark:bg-gray-900');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark:bg-gray-900');
    }
  }
}
