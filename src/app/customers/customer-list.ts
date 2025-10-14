import { Component, inject, signal } from '@angular/core';
import { CustomerTable } from './customer-table';
import { PageBreadcrumb } from '../shared/components/ui/page-breadcrumb';
import { CustomerResource } from './customer-resource';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { InfiniteScroll } from '../shared/directives/infinite-scroll';
import { Button } from '../shared/components/ui/button';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { CustomerModal } from './customer-modal';
import { SearchInput } from '../shared/components/form/search-input';

@Component({
  selector: 'app-customer-list',
  imports: [
    CustomerTable,
    PageBreadcrumb,
    InfiniteScroll,
    Button,
    ReactiveFormsModule,
    CustomerModal,
    SearchInput,
  ],
  template: `
    <app-page-breadcrumb pageTitle="Customers" />
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
            Add Customer
          </app-button>
        </form>
      </div>
      <!-- <app-customer-form [isOpen]="isOpen()" (closed)="isOpen.set(false)" /> -->

      <div class="max-w-full overflow-x-auto">
        @if (resource.hasValue() && resource.value().customers.length) {
          <div class="overflow-y-auto h-[70vh]">
            <app-customer-table [data]="resource.value().customers" />
            <span
              appInfiniteScroll
              (scrolled)="loadMore(resource.value().customers.length)"
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
    <app-customer-modal [isOpen]="isOpen()" (closed)="isOpen.set(false)" />
  `,
})
export class CustomerList {
  protected customerResource = inject(CustomerResource);
  protected isOpen = signal(false);

  readonly addIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 10.0002H15.0006M10.0002 5V15.0006" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>`;

  #limit = 10;

  protected search$ = new FormControl('', { nonNullable: true });
  protected search = toSignal(this.search$.valueChanges.pipe(debounceTime(500)), {
    initialValue: '',
  });

  protected resource = rxResource({
    params: () => this.search(),
    stream: ({ params }) => this.customerResource.customers(this.#limit, 0, params),
  });

  loadMore(offset: number) {
    return this.customerResource.fetchMore(offset);
  }
}
