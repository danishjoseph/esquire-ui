import { Component, input, output } from '@angular/core';
import { SafeHtmlPipe } from '../../pipe/safe-html-pipe';

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
        variantClasses +
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
  readonly variant = input<'primary' | 'outline'>('primary');
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

  get variantClasses(): string {
    return this.variant() === 'primary'
      ? 'bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300'
      : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300';
  }

  get disabledClasses(): string {
    return this.disabled() ? 'cursor-not-allowed opacity-50' : '';
  }

  onClick(event: Event) {
    if (!this.disabled()) {
      this.btnClick.emit(event);
    }
  }
}
