import { Component, effect, input, model, output } from '@angular/core';
import { SafeHtmlPipe } from '../../pipe/safe-html-pipe';

@Component({
  selector: 'app-pagination',
  imports: [SafeHtmlPipe],
  template: `
    <div class="flex items-center justify-between gap-2 px-6 py-4 sm:justify-normal">
      <!-- Prev Button -->
      <button
        (click)="prevPage()"
        [disabled]="currentPage() === 1"
        class="flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 sm:p-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span [innerHTML]="prevIcon | appSafeHtml"> </span>
      </button>

      <!-- Mobile -->
      <span class="block text-sm font-medium text-gray-700 dark:text-gray-400 sm:hidden">
        Page {{ currentPage() }} of {{ totalPages() }}
      </span>

      <!-- Desktop pagination -->
      <ul class="hidden items-center gap-0.5 sm:flex">
        @for (page of visiblePages; track $index) {
          <li>
            <a
              role="button"
              tabindex="0"
              (click)="goToPage(page)"
              (keydown.enter)="goToPage(page)"
              [class]="{
                'bg-brand-500 text-white': currentPage() === page,
                'text-gray-700 dark:text-gray-400 hover:bg-brand-500 hover:text-white rounded-lg':
                  currentPage() !== page,
              }"
              class="flex items-center justify-center w-10 h-10 text-sm font-medium rounded-lg"
            >
              {{ page }}
            </a>
          </li>
        }
      </ul>

      <!-- Next Button -->
      <button
        (click)="nextPage()"
        [disabled]="currentPage() === totalPages()"
        class="flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 sm:p-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span [innerHTML]="nextIcon | appSafeHtml"> </span>
      </button>
    </div>
  `,
})
export class Pagination {
  readonly totalPages = input(10);
  readonly currentPage = model(1);
  readonly pageChange = output<number>();

  readonly prevIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="fill-current"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.58203 9.99868C2.58174 10.1909 2.6549 10.3833 2.80152 10.53L7.79818 15.5301C8.09097 15.8231 8.56584 15.8233 8.85883 15.5305C9.15183 15.2377 9.152 14.7629 8.85921 14.4699L5.13911 10.7472L16.6665 10.7472C17.0807 10.7472 17.4165 10.4114 17.4165 9.99715C17.4165 9.58294 17.0807 9.24715 16.6665 9.24715L5.14456 9.24715L8.85919 5.53016C9.15199 5.23717 9.15184 4.7623 8.85885 4.4695C8.56587 4.1767 8.09099 4.17685 7.79819 4.46984L2.84069 9.43049C2.68224 9.568 2.58203 9.77087 2.58203 9.99715C2.58203 9.99766 2.58203 9.99817 2.58203 9.99868Z"></path></svg>`;
  readonly nextIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="fill-current"><path fill-rule="evenodd" clip-rule="evenodd" d="M17.4165 9.9986C17.4168 10.1909 17.3437 10.3832 17.197 10.53L12.2004 15.5301C11.9076 15.8231 11.4327 15.8233 11.1397 15.5305C10.8467 15.2377 10.8465 14.7629 11.1393 14.4699L14.8594 10.7472L3.33203 10.7472C2.91782 10.7472 2.58203 10.4114 2.58203 9.99715C2.58203 9.58294 2.91782 9.24715 3.33203 9.24715L14.854 9.24715L11.1393 5.53016C10.8465 5.23717 10.8467 4.7623 11.1397 4.4695C11.4327 4.1767 11.9075 4.17685 12.2003 4.46984L17.1578 9.43049C17.3163 9.568 17.4165 9.77087 17.4165 9.99715C17.4165 9.99763 17.4165 9.99812 17.4165 9.9986Z"></path></svg>`;

  visiblePages: (number | string)[] = [];

  constructor() {
    effect(() => {
      this.updateVisiblePages();
    });
  }

  updateVisiblePages() {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', total);
      } else if (current >= total - 3) {
        pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total);
      }
    }

    this.visiblePages = pages;
  }

  goToPage(page: number | string) {
    if (typeof page === 'number' && page !== this.currentPage()) {
      this.currentPage.set(page);
      this.pageChange.emit(this.currentPage());
      this.updateVisiblePages();
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      this.pageChange.emit(this.currentPage());
      this.updateVisiblePages();
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
      this.pageChange.emit(this.currentPage());
      this.updateVisiblePages();
    }
  }
}
