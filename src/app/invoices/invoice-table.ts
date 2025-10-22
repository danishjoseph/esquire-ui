import { Component, input, model, signal } from '@angular/core';
import { Purchase } from './invoice-resource';
import { Dropdown } from '../shared/components/ui/dropdown';
import { PurchaseStatus, WarrantyStatus } from '../workflow/tickets/purchase-info-form';
import { BadgeColor, Badge } from '../shared/components/ui/badge';
import { InvoiceModal } from './invoice-modal';

@Component({
  selector: 'app-invoice-table',
  imports: [Dropdown, Badge, InvoiceModal],
  template: `
    <table class="w-full table-auto">
      <thead
        class="sticky top-0 px-6 py-3.5 border-t border-gray-100 border-y bg-gray-50 dark:border-white/[0.05] dark:bg-gray-900"
      >
        <tr>
          <th
            class="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
          >
            Invoice ID
          </th>
          <th
            class="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
          >
            Product Info
          </th>
          <th
            class="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
          >
            Warranty Status
          </th>
          <th
            class="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
          >
            Purchase Status
          </th>
          <th
            class="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
          >
            <span class="sr-only">Action</span>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 dark:divide-white/[0.05]">
        @for (item of data(); track $index) {
          <tr>
            <td class="px-4 py-4 text-gray-700 whitespace-nowrap text-theme-sm dark:text-gray-400">
              {{ item.invoice_number }}
            </td>
            <td class="px-4 py-4 text-gray-700 whitespace-nowrap text-theme-sm dark:text-gray-400">
              <div>
                <span
                  class="mb-0.5 block text-theme-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  {{ item.product.name }}
                </span>
                <span class="text-gray-500 text-theme-sm dark:text-gray-400">
                  {{ item.product.model_name }}
                </span>
              </div>
            </td>
            <td class="px-4 py-4 text-gray-700 whitespace-nowrap text-theme-sm dark:text-gray-400">
              <app-badge size="sm" [color]="warrantyStatusMap[item.warranty_status].color">
                {{ warrantyStatusMap[item.warranty_status].label }}
              </app-badge>
            </td>
            <td class="px-4 py-4 text-gray-700 whitespace-nowrap text-theme-sm dark:text-gray-400">
              <app-badge size="sm" [color]="purchaseStatusMap[item.purchase_status].color">
                {{ purchaseStatusMap[item.purchase_status].label }}
              </app-badge>
            </td>
            <td class="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
              <app-dropdown class="relative" className="absolute right-0 z-10 w-40">
                <div dropdown-button>
                  <button class="text-gray-500 dark:text-gray-400">
                    <svg
                      class="fill-current"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M5.99902 10.245C6.96552 10.245 7.74902 11.0285 7.74902 11.995V12.005C7.74902 12.9715 6.96552 13.755 5.99902 13.755C5.03253 13.755 4.24902 12.9715 4.24902 12.005V11.995C4.24902 11.0285 5.03253 10.245 5.99902 10.245ZM17.999 10.245C18.9655 10.245 19.749 11.0285 19.749 11.995V12.005C19.749 12.9715 18.9655 13.755 17.999 13.755C17.0325 13.755 16.249 12.9715 16.249 12.005V11.995C16.249 11.0285 17.0325 10.245 17.999 10.245ZM13.749 11.995C13.749 11.0285 12.9655 10.245 11.999 10.245C11.0325 10.245 10.249 11.0285 10.249 11.995V12.005C10.249 12.9715 11.0325 13.755 11.999 13.755C12.9655 13.755 13.749 12.9715 13.749 12.005V11.995Z"
                        fill=""
                      />
                    </svg>
                  </button>
                </div>
                <div dropdown-content>
                  <button
                    class="text-sm flex w-full rounded-lg px-3 py-2 text-left font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                    (click)="updatePurchase(item.id)"
                  >
                    View More
                  </button>
                </div>
              </app-dropdown>
            </td>
          </tr>
        }
      </tbody>
    </table>
    <app-invoice-modal [invoiceId]="invoiceId()" [isOpen]="isOpen()" (closed)="closeModal()" />
  `,
})
export class InvoiceTable {
  readonly data = input.required<Purchase[]>();

  protected invoiceId = model('');
  protected isOpen = signal(false);

  openModal(id: string) {
    this.invoiceId.set(id);
    this.isOpen.set(true);
  }

  closeModal() {
    this.invoiceId.set('');
    this.isOpen.set(false);
  }

  readonly warrantyStatusMap: Record<WarrantyStatus, { label: string; color: BadgeColor }> = {
    [WarrantyStatus.UNDER_1YR]: {
      label: 'Under 1 Year',
      color: 'success',
    },
    [WarrantyStatus.WARRANTY_UPGRADE]: {
      label: 'Warranty Upgrade',
      color: 'primary',
    },
    [WarrantyStatus.ASC]: {
      label: 'ASC',
      color: 'info',
    },
    [WarrantyStatus.NON_WARRANTY]: {
      label: 'Non Warranty',
      color: 'warning',
    },
  };

  readonly purchaseStatusMap: Record<PurchaseStatus, { label: string; color: BadgeColor }> = {
    [PurchaseStatus.ESQUIRE]: {
      label: 'Esquire',
      color: 'success',
    },
    [PurchaseStatus.NON_ESQUIRE]: {
      label: 'Non Esquire',
      color: 'warning',
    },
  };

  updatePurchase(id: number) {
    this.openModal(id.toString());
  }
}
