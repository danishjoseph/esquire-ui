import {
  afterRenderEffect,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { NotificationService } from './notification-service';
import { SafeHtmlPipe } from '../../pipe/safe-html-pipe';
import { Button } from './button';

export type NotificationVariant = 'success' | 'error' | 'info' | 'warning';

@Component({
  selector: 'app-notification',
  imports: [SafeHtmlPipe, Button],
  template: `
    @if (isVisible()) {
      <div
        class="fixed top-2 left-2 right-2 sm:right-2 sm:left-auto p-2 z-[999999] border-b-4 bg-white dark:bg-[#1E2634] flex gap-3 items-center justify-between rounded-md shadow-theme-sm sm:max-w-[320px] w-auto sm:w-full"
        [class]="{
          'border-success-500': notification().variant === 'success',
          'border-error-500': notification().variant === 'error',
          'border-blue-light-500': notification().variant === 'info',
          'border-warning-500': notification().variant === 'warning',
        }"
      >
        <div class="flex items-center gap-3">
          <div
            class="flex items-center justify-center w-12 h-12 rounded-lg bg-success-50 text-success-500"
            [class]="{
              'bg-success-50': notification().variant === 'success',
              'bg-error-50': notification().variant === 'error',
              'bg-blue-light-50': notification().variant === 'info',
              'bg-warning-50': notification().variant === 'warning',
            }"
          >
            <span [innerHTML]="icon() | appSafeHtml"></span>
          </div>
          <div>
            <p class="text-sm text-gray-800 sm:text-base dark:text-white/90">
              {{ notification().text }}
            </p>
          </div>
        </div>
        <app-button
          size="xs"
          variant="transparent"
          class="text-gray-400 hover:text-gray-800 dark:hover:text-white/90"
          [startIcon]="closeIcon"
          (btnClick)="clear()"
        />
      </div>
    }
  `,
})
export class Notification {
  text = input();
  variant = input<NotificationVariant>('success');
  duration = input(5000);

  protected successIcon = `<svg class="size-5" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 22 22" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.70186 11.0001C2.70186 6.41711 6.41711 2.70186 11.0001 2.70186C15.5831 2.70186 19.2984 6.41711 19.2984 11.0001C19.2984 15.5831 15.5831 19.2984 11.0001 19.2984C6.41711 19.2984 2.70186 15.5831 2.70186 11.0001ZM11.0001 0.901855C5.423 0.901855 0.901855 5.423 0.901855 11.0001C0.901855 16.5772 5.423 21.0984 11.0001 21.0984C16.5772 21.0984 21.0984 16.5772 21.0984 11.0001C21.0984 5.423 16.5772 0.901855 11.0001 0.901855ZM14.6197 9.73951C14.9712 9.38804 14.9712 8.81819 14.6197 8.46672C14.2683 8.11525 13.6984 8.11525 13.347 8.46672L10.1894 11.6243L8.6533 10.0883C8.30183 9.7368 7.73198 9.7368 7.38051 10.0883C7.02904 10.4397 7.02904 11.0096 7.38051 11.3611L9.55295 13.5335C9.72174 13.7023 9.95065 13.7971 10.1894 13.7971C10.428 13.7971 10.657 13.7023 10.8257 13.5335L14.6197 9.73951Z" fill="#12B76A"></path></svg>`;
  protected errorIcon = `<svg class="size-5" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.12454 4.53906L15.8736 4.53906C16.1416 4.53906 16.3892 4.68201 16.5231 4.91406L20.3977 11.625C20.5317 11.857 20.5317 12.1429 20.3977 12.375L16.5231 19.0859C16.3892 19.3179 16.1416 19.4609 15.8736 19.4609H8.12454C7.85659 19.4609 7.609 19.3179 7.47502 19.0859L3.60048 12.375C3.46651 12.1429 3.46651 11.857 3.60048 11.625L7.47502 4.91406C7.609 4.68201 7.85659 4.53906 8.12454 4.53906ZM15.8736 3.03906H8.12454C7.3207 3.03906 6.57791 3.46791 6.17599 4.16406L2.30144 10.875C1.89952 11.5711 1.89952 12.4288 2.30144 13.125L6.17599 19.8359C6.57791 20.532 7.32069 20.9609 8.12454 20.9609H15.8736C16.6775 20.9609 17.4203 20.532 17.8222 19.8359L21.6967 13.125C22.0987 12.4288 22.0987 11.5711 21.6967 10.875L17.8222 4.16406C17.4203 3.46791 16.6775 3.03906 15.8736 3.03906ZM12.0007 7.81075C12.4149 7.81075 12.7507 8.14653 12.7507 8.56075V12.7803C12.7507 13.1945 12.4149 13.5303 12.0007 13.5303C11.5865 13.5303 11.2507 13.1945 11.2507 12.7803V8.56075C11.2507 8.14653 11.5865 7.81075 12.0007 7.81075ZM10.9998 15.3303C10.9998 14.778 11.4475 14.3303 11.9998 14.3303H12.0005C12.5528 14.3303 13.0005 14.778 13.0005 15.3303C13.0005 15.8826 12.5528 16.3303 12.0005 16.3303H11.9998C11.4475 16.3303 10.9998 15.8826 10.9998 15.3303Z" fill="#D92D20"></path></svg>`;
  protected warningIcon = `<svg class="size-5" width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.9497 3.875C13.0836 2.375 10.9186 2.375 10.0525 3.875L2.54699 16.875C1.68096 18.375 2.76349 20.25 4.49554 20.25H19.5067C21.2387 20.25 22.3212 18.375 21.4552 16.875L13.9497 3.875ZM11.3516 4.625C11.6403 4.125 12.3619 4.125 12.6506 4.625L20.1562 17.625C20.4448 18.125 20.084 18.75 19.5067 18.75H4.49554C3.91819 18.75 3.55735 18.125 3.84603 17.625L11.3516 4.625ZM12.0018 8.56075C12.416 8.56075 12.7518 8.89653 12.7518 9.31075V13.5303C12.7518 13.9445 12.416 14.2803 12.0018 14.2803C11.5876 14.2803 11.2518 13.9445 11.2518 13.5303V9.31075C11.2518 8.89653 11.5876 8.56075 12.0018 8.56075ZM11.0009 16.0803C11.0009 15.528 11.4486 15.0803 12.0009 15.0803H12.0016C12.5539 15.0803 13.0016 15.528 13.0016 16.0803C13.0016 16.6326 12.5539 17.0803 12.0016 17.0803H12.0009C11.4486 17.0803 11.0009 16.6326 11.0009 16.0803Z" fill="#DC6803"></path></svg>`;
  protected infoIcon = `<svg class="size-5" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.6501 11.9996C3.6501 7.38803 7.38852 3.64961 12.0001 3.64961C16.6117 3.64961 20.3501 7.38803 20.3501 11.9996C20.3501 16.6112 16.6117 20.3496 12.0001 20.3496C7.38852 20.3496 3.6501 16.6112 3.6501 11.9996ZM12.0001 1.84961C6.39441 1.84961 1.8501 6.39392 1.8501 11.9996C1.8501 17.6053 6.39441 22.1496 12.0001 22.1496C17.6058 22.1496 22.1501 17.6053 22.1501 11.9996C22.1501 6.39392 17.6058 1.84961 12.0001 1.84961ZM10.9992 7.52468C10.9992 8.07697 11.4469 8.52468 11.9992 8.52468H12.0002C12.5525 8.52468 13.0002 8.07697 13.0002 7.52468C13.0002 6.9724 12.5525 6.52468 12.0002 6.52468H11.9992C11.4469 6.52468 10.9992 6.9724 10.9992 7.52468ZM12.0002 17.371C11.586 17.371 11.2502 17.0352 11.2502 16.621V10.9445C11.2502 10.5303 11.586 10.1945 12.0002 10.1945C12.4144 10.1945 12.7502 10.5303 12.7502 10.9445V16.621C12.7502 17.0352 12.4144 17.371 12.0002 17.371Z" fill="#0BA5EC"></path></svg>`;
  protected closeIcon = `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-6"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.04289 16.5418C5.65237 16.9323 5.65237 17.5655 6.04289 17.956C6.43342 18.3465 7.06658 18.3465 7.45711 17.956L11.9987 13.4144L16.5408 17.9565C16.9313 18.347 17.5645 18.347 17.955 17.9565C18.3455 17.566 18.3455 16.9328 17.955 16.5423L13.4129 12.0002L17.955 7.45808C18.3455 7.06756 18.3455 6.43439 17.955 6.04387C17.5645 5.65335 16.9313 5.65335 16.5408 6.04387L11.9987 10.586L7.45711 6.04439C7.06658 5.65386 6.43342 5.65386 6.04289 6.04439C5.65237 6.43491 5.65237 7.06808 6.04289 7.4586L10.5845 12.0002L6.04289 16.5418Z" fill="currentColor"></path></svg>`;
  readonly isVisible = signal(false);

  protected readonly notification = linkedSignal(() => ({
    text: this.text(),
    variant: this.variant(),
    duration: this.duration(),
  }));

  protected readonly notificationStore = inject(NotificationService);

  constructor() {
    afterRenderEffect(() => {
      const notification = this.notificationStore.notification();
      if (notification) {
        this.notification.set(notification);
        this.isVisible.set(true);
        setTimeout(() => this.clear(), notification.duration);
      }
    });
  }

  clear() {
    this.isVisible.set(false);
  }

  icon = computed(() => {
    switch (this.notification().variant) {
      case 'success':
        return this.successIcon;
      case 'error':
        return this.errorIcon;
      case 'warning':
        return this.warningIcon;
      default:
        return this.infoIcon;
    }
  });
}
