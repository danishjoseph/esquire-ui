import { Component, inject, input, model } from '@angular/core';
import { AvatarText } from '../shared/components/avatar/avatar-text';
import { Button } from '../shared/components/ui/button';
import { ModalStore } from '../shared/components/model/modal-store';
import { CustomerForm } from './customer-form';
import { Customer, CustomerResource } from './customer-resource';

interface ICustomerTable {
  id: string;
  avatarColor: string;
  user: {
    initials: string;
    name: string;
    email: string;
  };
  contact: {
    primary: string;
    secondary: string;
  };
  address: string;
  pincode: string;
  actions: {
    delete: boolean;
  };
}

function transformCustomerData(customers: Customer[]): ICustomerTable[] {
  return customers?.map((customer) => ({
    id: customer.id.toString(),
    avatarColor: 'brand',
    user: {
      initials: customer.name,
      name: customer.name,
      email: customer.email || '-', // Fallback to empty string if email is undefined
    },
    contact: {
      primary: customer.mobile,
      secondary: customer.alt_mobile || '-', // Fallback to empty string if alt_mobile is undefined
    },
    address: `${customer.house_office || '.'} ${customer.street_building || '.'}, ${customer.area || '.'}, ${customer.district || '.'}`,
    pincode: customer.pincode || '-', // Fallback to empty string if pincode is undefined
    actions: { delete: true, edit: true },
  }));
}

@Component({
  selector: 'app-customer-table',
  imports: [AvatarText, Button, CustomerForm],
  template: `
    <div
      class="overflow-hidden rounded-2xl border border-gray-200 bg-white pt-4 dark:border-white/[0.05] dark:bg-white/[0.03]"
    >
      <form>
        <div class="flex gap-2 px-5 mb-4 sm:flex-row sm:items-center sm:px-6">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center w-full sm:justify-end ">
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
                class="dark:bg-dark-900 h-[42px] w-full sm:w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-[42px] pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
              />
            </div>
            <app-button
              size="sm"
              variant="outline"
              className="rounded-full"
              (btnClick)="openModal()"
            >
              Add Customer
            </app-button>
          </div>
        </div>
      </form>
      @if (modalStore.isOpen()) {
        <app-customer-form [customerId]="customerId()" />
      }

      <div class="max-w-full overflow-x-auto">
        <table class="min-w-full">
          <thead
            class="px-6 py-3.5 border-t border-gray-100 border-y bg-gray-50 dark:border-white/[0.05] dark:bg-gray-900"
          >
            <tr>
              <th
                class="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start"
              >
                Customer ID
              </th>
              <th
                class="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start"
              >
                Customer
              </th>
              <th
                class="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start"
              >
                Contact
              </th>
              <th
                class="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start"
              >
                Address
              </th>
              <th
                class="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            @for (row of data(); track $index) {
              <tr>
                <td class="px-4 sm:px-6 py-3.5">
                  <div class="flex items-center gap-3">
                    <div>
                      <span
                        class="block font-medium text-gray-700 text-theme-sm dark:text-gray-400"
                      >
                        {{ row.id }}
                      </span>
                    </div>
                  </div>
                </td>
                <td class="px-4 sm:px-6 py-3.5">
                  <div class="flex items-center gap-3">
                    <app-avatar-text [name]="row.user.name" class="w-10 h-10" />
                    <div>
                      <span
                        class="mb-0.5 block text-theme-sm font-medium text-gray-700 dark:text-gray-400"
                      >
                        {{ row.user.name }}
                      </span>
                      <span class="text-gray-500 text-theme-sm dark:text-gray-400">
                        {{ row.user.email }}
                      </span>
                    </div>
                  </div>
                </td>
                <td class="px-4 sm:px-6 py-3.5">
                  <span
                    class="mb-0.5 block text-theme-sm font-medium text-gray-700 dark:text-gray-400"
                  >
                    {{ row.contact.primary }}
                  </span>
                  <span class="text-gray-500 text-theme-sm dark:text-gray-400">
                    {{ row.contact.secondary }}
                  </span>
                </td>
                <td class="px-4 sm:px-6 py-3.5">
                  <p class="text-gray-700 text-theme-sm dark:text-gray-400">
                    {{ row.address }}
                  </p>
                </td>
                <td class="px-4 sm:px-6 py-3.5">
                  <div class="flex items-center w-full gap-4">
                    <app-button
                      size="xs"
                      className="hover:text-blue-light-500"
                      variant="outline"
                      [startIcon]="editIcon"
                      (btnClick)="updateCustomer(row.id)"
                    />
                    <app-button
                      size="xs"
                      className="hover:text-error-500"
                      variant="outline"
                      [startIcon]="deleteIcon"
                      (btnClick)="deleteCustomer(row.id)"
                    >
                    </app-button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class CustomerTable {
  readonly data = input.required<ICustomerTable[], Customer[]>({
    transform: transformCustomerData,
  });
  readonly editIcon = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="size-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>`;
  readonly deleteIcon = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="size-4"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`;
  readonly searchIcon = `<svg class="fill-gray-500 dark:fill-gray-400" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.04199 9.37381C3.04199 5.87712 5.87735 3.04218 9.37533 3.04218C12.8733 3.04218 15.7087 5.87712 15.7087 9.37381C15.7087 12.8705 12.8733 15.7055 9.37533 15.7055C5.87735 15.7055 3.04199 12.8705 3.04199 9.37381ZM9.37533 1.54218C5.04926 1.54218 1.54199 5.04835 1.54199 9.37381C1.54199 13.6993 5.04926 17.2055 9.37533 17.2055C11.2676 17.2055 13.0032 16.5346 14.3572 15.4178L17.1773 18.2381C17.4702 18.531 17.945 18.5311 18.2379 18.2382C18.5308 17.9453 18.5309 17.4704 18.238 17.1775L15.4182 14.3575C16.5367 13.0035 17.2087 11.2671 17.2087 9.37381C17.2087 5.04835 13.7014 1.54218 9.37533 1.54218Z" fill=""></path></svg>`;

  protected modalStore = inject(ModalStore);
  protected customerResource = inject(CustomerResource);

  protected customerId = model('');

  openModal(id?: string) {
    this.customerId.set(id ?? '');
    this.modalStore.openModal();
  }

  updateCustomer(id: string) {
    this.openModal(id);
  }

  deleteCustomer(id: string) {
    this.customerResource.remove(id).subscribe();
  }
}
