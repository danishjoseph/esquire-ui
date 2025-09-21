import { Component, DestroyRef, effect, inject, input, output } from '@angular/core';
import { ModalStore } from './modal-store';

@Component({
  selector: 'app-modal',
  imports: [],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 flex items-center justify-center overflow-y-auto modal z-99999">
        <!-- Backdrop -->
        @if (!isFullscreen()) {
          <div
            class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]"
            (click)="onBackdropClick()"
            role="button"
            tabindex="0"
          ></div>
        }
        <!-- Modal Content -->
        <div
          class="relative"
          [class]="[
            isFullscreen() ? 'w-full h-full' : 'w-full rounded-3xl bg-white dark:bg-gray-900',
            className(),
          ]"
          (click)="onContentClick($event)"
          role="button"
          tabindex="0"
        >
          @if (showCloseButton()) {
            <button
              (click)="closeEvent.emit()"
              class="absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white sm:right-6 sm:top-6 sm:h-11 sm:w-11"
              aria-label="Close modal"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          }
          <div>
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    }
  `,
  host: {
    '(document:keydown)': 'onEscape($event)',
  },
})
export class Modal {
  readonly closeEvent = output();
  readonly className = input();
  readonly showCloseButton = input(true);
  readonly isFullscreen = input(false);

  protected modelStore = inject(ModalStore);
  readonly isOpen = this.modelStore.isOpen;

  constructor() {
    effect(() => {
      document.body.style.overflow = this.isOpen() ? 'hidden' : 'unset';
    });

    inject(DestroyRef).onDestroy(() => {
      document.body.style.overflow = 'unset';
    });
  }

  onBackdropClick() {
    if (!this.isFullscreen()) {
      this.closeEvent.emit();
    }
  }

  onContentClick(event: MouseEvent) {
    event.stopPropagation();
  }

  onEscape(event: KeyboardEvent) {
    if (this.isOpen() && event.key === 'Escape') {
      this.closeEvent.emit();
    }
  }
}
