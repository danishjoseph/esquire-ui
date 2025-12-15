import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { PageBreadcrumb } from '../shared/components/ui/page-breadcrumb';
import { SearchInput } from '../shared/components/form/search-input';
import { Button } from '../shared/components/ui/button';
import { InvoiceResource } from './invoice-resource';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import { InfiniteScroll } from '../shared/directives/infinite-scroll';
import { InvoiceTable } from './invoice-table';
import { InvoiceModal } from './invoice-modal';
import { NotificationService } from '../shared/components/ui/notification-service';

@Component({
  selector: 'app-invoice-list',
  imports: [
    ReactiveFormsModule,
    InfiniteScroll,
    PageBreadcrumb,
    SearchInput,
    Button,
    InvoiceTable,
    InvoiceModal,
  ],
  template: `
    <app-page-breadcrumb pageTitle="Invoices" />
    <div
      class="overflow-hidden rounded-2xl border border-gray-200 bg-white pt-4 dark:border-white/[0.05] dark:bg-white/[0.03]"
    >
      <div class="flex gap-2 px-5 mb-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <form class="flex flex-col sm:flex-row justify-end w-full gap-3">
          <app-search-input [formControl]="search$" />
          <div class="flex gap-2 flex-row">
            <app-button
              size="sm"
              variant="outline"
              className="rounded-full"
              [startIcon]="addIcon"
              (btnClick)="openFilePicker()"
            >
              Import
            </app-button>
            <!-- Hidden file input -->
            <input
              id="file-input"
              #fileInput
              type="file"
              accept=".csv"
              class="hidden"
              (change)="onFileSelected($event)"
            />
            <app-button
              size="sm"
              variant="primary"
              className="rounded-full"
              (btnClick)="isOpen.set(true)"
              [startIcon]="addIcon"
            >
              Add New
            </app-button>
          </div>
        </form>
      </div>
      <div class="max-w-full overflow-x-auto">
        @if (resource.hasValue() && resource.value().purchases.length) {
          <div class="overflow-y-auto h-[70vh]">
            <app-invoice-table [data]="resource.value().purchases" />
            <span
              appInfiniteScroll
              (scrolled)="loadMore(resource.value().purchases.length)"
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
    <app-invoice-modal [isOpen]="isOpen()" (closed)="isOpen.set(false)" />
  `,
})
export class InvoiceList {
  protected invoiceResource = inject(InvoiceResource);
  protected notificationService = inject(NotificationService);
  protected isOpen = signal(false);
  protected fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  readonly addIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 10.0002H15.0006M10.0002 5V15.0006" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>`;

  #limit = 10;

  protected search$ = new FormControl('', { nonNullable: true });
  protected search = toSignal(this.search$.valueChanges.pipe(debounceTime(500)), {
    initialValue: '',
  });

  protected resource = rxResource({
    params: () => this.search(),
    stream: ({ params }) => this.invoiceResource.invoices(this.#limit, 0, params),
  });

  loadMore(offset: number) {
    return this.invoiceResource.fetchMore(offset);
  }

  openFilePicker() {
    this.fileInput().nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    this.invoiceResource.import(file).subscribe({
      next: () => {
        this.notificationService.showNotification(`Import Successful`);
      },
    });
  }
}
