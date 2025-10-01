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

@Component({
  selector: 'app-customer-list',
  imports: [
    CustomerTable,
    PageBreadcrumb,
    InfiniteScroll,
    Button,
    ReactiveFormsModule,
    CustomerModal,
  ],
  template: `
    <app-page-breadcrumb pageTitle="Customers" />
    <div
      class="overflow-hidden rounded-2xl border border-gray-200 bg-white pt-4 dark:border-white/[0.05] dark:bg-white/[0.03]"
    >
      <div class="flex gap-2 px-5 mb-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <form class="flex flex-col sm:flex-row justify-end w-full gap-3">
          <div class="relative">
            <button class="absolute -translate-y-1/2 left-4 top-1/2" type="button">
              <svg
                class="fill-gray-500 dark:fill-gray-400"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M3.04199 9.37381C3.04199 5.87712 5.87735 3.04218 9.37533 3.04218C12.8733 3.04218 15.7087 5.87712 15.7087 9.37381C15.7087 12.8705 12.8733 15.7055 9.37533 15.7055C5.87735 15.7055 3.04199 12.8705 3.04199 9.37381ZM9.37533 1.54218C5.04926 1.54218 1.54199 5.04835 1.54199 9.37381C1.54199 13.6993 5.04926 17.2055 9.37533 17.2055C11.2676 17.2055 13.0032 16.5346 14.3572 15.4178L17.1773 18.2381C17.4702 18.531 17.945 18.5311 18.2379 18.2382C18.5308 17.9453 18.5309 17.4704 18.238 17.1775L15.4182 14.3575C16.5367 13.0035 17.2087 11.2671 17.2087 9.37381C17.2087 5.04835 13.7014 1.54218 9.37533 1.54218Z"
                  fill=""
                ></path>
              </svg>
            </button>
            <input
              type="text"
              placeholder="Search..."
              [formControl]="search$"
              class="dark:bg-dark-900 h-[42px] w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-[42px] pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
            />
          </div>
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
