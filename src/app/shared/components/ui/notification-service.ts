import { Injectable, signal } from '@angular/core';
import { NotificationVariant } from './notification';

export interface Notification {
  text: string;
  variant: NotificationVariant;
  duration: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  #notification = signal<Notification | null>(null);

  readonly notification = this.#notification.asReadonly();

  showNotification(text: string, variant: NotificationVariant = 'info', duration = 5000): void {
    this.#notification.set({ text, variant, duration });
  }
}
