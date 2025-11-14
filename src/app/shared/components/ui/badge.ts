import { NgClass } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { SafeHtmlPipe } from '../../pipe/safe-html-pipe';

export type BadgeVariant = 'light' | 'solid';
export type BadgeSize = 'sm' | 'md';
export type BadgeColor = 'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark';

@Component({
  selector: 'app-badge',
  imports: [NgClass, SafeHtmlPipe],
  template: `
    <span class="flex" [ngClass]="baseStyles + ' ' + sizeClass() + ' ' + colorStyles()">
      @if (startIcon()) {
        <span
          class="mr-1 cursor-pointer"
          [innerHTML]="startIcon() | appSafeHtml"
          tabindex="0"
          (click)="iconClick.emit($event)"
          (keydown.enter)="iconClick.emit($event)"
          (keydown.space)="iconClick.emit($event)"
        ></span>
      }
      <ng-content></ng-content>
      @if (endIcon()) {
        <span
          class="ml-1 cursor-pointer"
          [innerHTML]="endIcon() | appSafeHtml"
          tabindex="0"
          (click)="iconClick.emit($event)"
          (keydown.enter)="iconClick.emit($event)"
          (keydown.space)="iconClick.emit($event)"
        ></span>
      }
    </span>
  `,
})
export class Badge {
  readonly variant = input<BadgeVariant>('light');
  readonly size = input<BadgeSize>('md');
  readonly color = input<BadgeColor>();
  readonly startIcon = input<string>(''); // SVG or HTML string
  readonly endIcon = input<string>(''); // SVG or HTML string
  readonly iconClick = output<Event>();

  readonly baseStyles =
    'inline-flex items-center whitespace-nowrap px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium';

  readonly sizeClass = computed(
    () =>
      ({
        sm: 'text-theme-xs',
        md: 'text-sm',
      })[this.size()],
  );

  readonly colorStyles = computed(() => {
    const color = this.color() || this.getRandomColor();
    const variants = {
      light: {
        primary: 'bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400',
        success: 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500',
        error: 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500',
        warning: 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400',
        info: 'bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500',
        light: 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80',
        dark: 'bg-gray-500 text-white dark:bg-white/5 dark:text-white',
      },
      solid: {
        primary: 'bg-brand-500 text-white dark:text-white',
        success: 'bg-success-500 text-white dark:text-white',
        error: 'bg-error-500 text-white dark:text-white',
        warning: 'bg-warning-500 text-white dark:text-white',
        info: 'bg-blue-light-500 text-white dark:text-white',
        light: 'bg-gray-400 dark:bg-white/5 text-white dark:text-white/80',
        dark: 'bg-gray-700 text-white dark:text-white',
      },
    };
    return variants[this.variant()][color];
  });

  private getRandomColor(): BadgeColor {
    const colors: BadgeColor[] = [
      'primary',
      'success',
      'error',
      'warning',
      'info',
      'light',
      'dark',
    ];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  }
}
