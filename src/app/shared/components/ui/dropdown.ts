import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  input,
  signal,
  viewChild,
} from '@angular/core';

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
        <div
          #contentRef
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
          tabindex="0"
          (click)="close()"
          (keydown.enter)="toggle()"
          (keydown.space)="toggle()"
          [class]="dropdownClasses()"
        >
          <div class="space-y-1">
            <ng-content select="[dropdown-content]"></ng-content>
          </div>
        </div>
      }
    </ng-container>
  `,
})
export class Dropdown implements AfterViewInit {
  readonly className = input('');
  isOpen = signal(false);

  readonly buttonRef = viewChild.required<ElementRef<HTMLDivElement>>('buttonRef');
  readonly contentRef = viewChild<ElementRef<HTMLDivElement>>('contentRef'); // optional

  readonly dropdownClasses = computed(
    () =>
      `p-2 bg-white border border-gray-200 rounded-2xl shadow-lg dark:border-gray-800 dark:bg-gray-900 + ${this.className()}`,
  );

  ngAfterViewInit(): void {
    document.addEventListener('click', this.handleDocumentClick);
  }

  close() {
    this.isOpen.set(false);
  }

  toggle() {
    this.isOpen.update((v) => !v);
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
