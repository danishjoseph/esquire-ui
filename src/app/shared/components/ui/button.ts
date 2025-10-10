import { Component, computed, input, output } from '@angular/core';
import { SafeHtmlPipe } from '../../pipe/safe-html-pipe';

type ButtonVariant = 'primary' | 'outline' | 'icon' | 'transparent';

@Component({
  selector: 'app-button',
  imports: [SafeHtmlPipe],
  template: `
    <button
      [type]="type()"
      [class]="
        'inline-flex items-center justify-center gap-2 rounded-lg transition ' +
        className() +
        ' ' +
        sizeClasses +
        ' ' +
        variantClasses() +
        ' ' +
        disabledClasses
      "
      [disabled]="disabled()"
      (click)="onClick($event)"
    >
      @if (startIcon()) {
        <span class="flex items-center" [innerHTML]="startIcon() | appSafeHtml"></span>
      }
      <ng-content></ng-content>
      @if (endIcon()) {
        <span class="flex items-center" [innerHTML]="endIcon() | appSafeHtml"></span>
      }
    </button>
  `,
})
export class Button {
  readonly type = input<'submit' | 'reset' | 'button'>('button');
  readonly size = input<'xs' | 'sm' | 'md'>('md');
  readonly variant = input<ButtonVariant>('primary');
  readonly disabled = input(false);
  readonly className = input('');
  readonly startIcon = input('');
  readonly endIcon = input('');

  readonly btnClick = output<Event>();

  get sizeClasses(): string {
    if (this.size() === 'xs') {
      return 'px-2 py-2 text-xs'; // Adjust these values to fit your design
    }
    return this.size() === 'sm' ? 'px-4 py-3 text-sm' : 'px-5 py-3.5 text-sm';
  }

  variantClasses = computed(() => {
    const buttonStyles: Record<ButtonVariant, string> = {
      primary: 'bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300',
      outline:
        'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300',
      icon: 'w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800',
      transparent:
        'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-300',
    };
    return buttonStyles[this.variant()];
  });
  // get variantClasses(): string {
  //   return this.variant() === 'primary'
  //     ? 'bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300'
  //     : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300';
  // }

  get disabledClasses(): string {
    return this.disabled() ? 'cursor-not-allowed opacity-50' : '';
  }

  onClick(event: Event) {
    if (!this.disabled()) {
      this.btnClick.emit(event);
    }
  }
}
