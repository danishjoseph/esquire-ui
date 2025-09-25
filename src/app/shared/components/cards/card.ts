import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  imports: [],
  template: `
    <div
      class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] {{
        className()
      }}"
    >
      <!-- Card Header -->
      <div class="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <!-- Title + description -->
        <div class="min-w-0">
          <h3 class="text-lg font-medium text-gray-800 dark:text-white/90 truncate">
            {{ title() }}
          </h3>
          @if (desc()) {
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
              {{ desc() }}
            </p>
          }
        </div>

        <!-- Actions -->
        <div class="mt-3 sm:mt-0 flex gap-2 flex-wrap">
          <ng-content select="[card-actions]"></ng-content>
        </div>
      </div>

      <!-- Card Body -->
      <div class="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
        <div class="space-y-6">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
})
export class Card {
  readonly title = input.required<string>();
  readonly desc = input<string>('');
  readonly className = input<string>('');
}
