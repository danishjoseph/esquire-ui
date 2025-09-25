import { KeyValue } from '@angular/common';
import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-tab-group',
  imports: [],
  template: `
    <div class="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
      @for (opt of options(); track opt.key) {
        <button
          (click)="selected.set(opt.key)"
          class="px-3 py-2 font-medium rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white"
          [class]="getButtonClass(opt.key)"
        >
          {{ opt.value }}
        </button>
      }
    </div>
  `,
})
export class TabGroup {
  readonly options = input.required<KeyValue<string, string>[]>();
  readonly selected = model();

  getButtonClassa(key: string): string {
    return this.selected() === key
      ? 'shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800'
      : 'text-gray-500 dark:text-gray-400';
  }
  getButtonClass(key: string): string {
    return this.selected() === key
      ? 'bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300'
      : 'text-gray-500 dark:text-gray-400 bg-transparent';
  }
}
