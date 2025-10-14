import { Component, inject, signal } from '@angular/core';
import { PageBreadcrumb } from '../shared/components/ui/page-breadcrumb';
import { ProductTable } from './product-table';
import { ProductResource } from './product-resource';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import { Button } from '../shared/components/ui/button';
import { ProductModal } from './product-modal';
import { SearchInput } from '../shared/components/form/search-input';

@Component({
  selector: 'app-product-list',
  imports: [PageBreadcrumb, ProductTable, Button, ReactiveFormsModule, ProductModal, SearchInput],
  template: `
    <app-page-breadcrumb pageTitle="Products" />
    <div
      class="overflow-hidden rounded-2xl border border-gray-200 bg-white pt-4 dark:border-white/[0.05] dark:bg-white/[0.03]"
    >
      <div class="flex gap-2 px-5 mb-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <form class="flex flex-col sm:flex-row justify-end w-full gap-3">
          <app-search-input [formControl]="search$" />
          <app-button
            size="sm"
            variant="primary"
            className="rounded-full"
            (btnClick)="isOpen.set(true)"
            [startIcon]="addIcon"
          >
            Add Product
          </app-button>
        </form>
      </div>

      <div class="max-w-full overflow-x-auto">
        <div class="max-w-full overflow-x-auto">
          @if (resource.hasValue() && resource.value().products.length) {
            <div class="overflow-y-auto h-[70vh]">
              <app-product-table [data]="resource.value().products" />
              <span
                appInfiniteScroll
                (scrolled)="loadMore(resource.value().products.length)"
                class="block h-6 w-full"
              ></span>
            </div>
          } @else {
            <div class="h-[70vh] flex items-center justify-center text-gray-500 dark:text-gray-400">
              No rows to display.
            </div>
          }
        </div>
      </div>
    </div>
    <app-product-modal [isOpen]="isOpen()" (closed)="isOpen.set(false)" />
  `,
})
export class ProductList {
  protected productResource = inject(ProductResource);
  protected isOpen = signal(false);

  readonly addIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 10.0002H15.0006M10.0002 5V15.0006" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>`;

  #limit = 10;

  protected search$ = new FormControl('', { nonNullable: true });
  protected search = toSignal(this.search$.valueChanges.pipe(debounceTime(500)), {
    initialValue: '',
  });

  protected resource = rxResource({
    params: () => this.search(),
    stream: ({ params }) => this.productResource.products(this.#limit, 0, params),
  });

  loadMore(offset: number) {
    return this.productResource.fetchMore(offset);
  }
}
