import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { createPopper, Instance } from '@popperjs/core';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  template: `
    <ng-container>
      <div
        #buttonRef
        role="button"
        tabindex="0"
        (click)="toggle()"
        (keydown.enter)="toggle()"
        (keydown.space)="toggle()"
        class="inline-flex items-center justify-center"
      >
        <ng-content select="[dropdown-button]"></ng-content>
      </div>

      @if (isOpen()) {
        <div #contentRef class="absolute right-0 z-10">
          <div
            class="p-2 bg-white border border-gray-200 rounded-2xl shadow-lg
                   dark:border-gray-800 dark:bg-gray-900 w-40"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
            tabindex="0"
            (click)="close()"
            (keydown.enter)="toggle()"
            (keydown.space)="toggle()"
          >
            <div class="space-y-1">
              <ng-content select="[dropdown-content]"></ng-content>
            </div>
          </div>
        </div>
      }
    </ng-container>
  `,
})
export class Dropdown implements AfterViewInit {
  isOpen = signal(false);

  readonly buttonRef = viewChild.required<ElementRef<HTMLDivElement>>('buttonRef');
  readonly contentRef = viewChild<ElementRef<HTMLDivElement>>('contentRef'); // optional

  private popperInstance: Instance | null = null;
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.destroyRef.onDestroy(() => {
      document.removeEventListener('click', this.handleDocumentClick);
      this.popperInstance?.destroy();
      this.popperInstance = null;
    });
  }

  ngAfterViewInit(): void {
    document.addEventListener('click', this.handleDocumentClick);
  }

  close() {
    this.isOpen.set(false);
  }

  toggle() {
    this.isOpen.update((v) => !v);

    if (this.isOpen() && this.buttonRef() && this.contentRef()) {
      // Init or update Popper
      this.popperInstance = createPopper(
        this.buttonRef().nativeElement,
        this.contentRef()!.nativeElement,
        {
          placement: 'bottom-end',
          modifiers: [
            {
              name: 'offset',
              options: { offset: [0, 4] },
            },
            { name: 'preventOverflow', options: { boundary: 'viewport' } }, // <-- prevents clipping
            { name: 'flip', options: { fallbackPlacements: ['bottom-start', 'top-end'] } }, // auto-flip
          ],
          // strategy: 'fixed',
        },
      );
    }
  }

  private handleDocumentClick = (event: MouseEvent) => {
    const target = event.target as Node;
    const button = this.buttonRef()?.nativeElement;
    const content = this.contentRef()?.nativeElement;

    if (button && content && !button.contains(target) && !content.contains(target)) {
      this.isOpen.set(false);
    }
  };
}
