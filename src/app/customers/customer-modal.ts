import { Component, input, output } from '@angular/core';
import { Modal } from '../shared/components/model/modal';
import { CustomerForm } from './customer-form';

@Component({
  selector: 'app-customer-modal',
  imports: [Modal, CustomerForm],
  template: `
    <app-modal
      [isOpen]="isOpen()"
      (closeEvent)="closed.emit()"
      className="max-w-[700px] p-5 lg:p-10"
    >
      @if (isOpen()) {
        <div
          class="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11"
        >
          <div class="px-2 pr-14">
            <h4 class="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {{ this.customerId() ? 'Update' : 'Add' }} Customer Information
            </h4>
            <p class="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Please fill out the form below to add or update a customer record. Ensure all
              necessary fields are completed accurately to maintain high data quality.
            </p>
          </div>
          <app-customer-form [customerId]="customerId()" (formSubmit)="closed.emit()" />
        </div>
      }
    </app-modal>
  `,
})
export class CustomerModal {
  readonly customerId = input('');
  readonly isOpen = input.required<boolean>();
  readonly closed = output();
}
