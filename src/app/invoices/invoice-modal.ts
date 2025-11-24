import { Component, input, output } from '@angular/core';
import { Modal } from '../shared/components/model/modal';
import { InvoiceForm } from './invoice-form';

@Component({
  selector: 'app-invoice-modal',
  imports: [Modal, InvoiceForm],
  template: `
    <app-modal [isOpen]="isOpen()" (closeEvent)="closed.emit()" className="max-w-[700px] p-5">
      @if (isOpen()) {
        <div
          class="custom-scrollbar w-full max-w-[850px] max-h-[80vh] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11"
        >
          <app-invoice-form [invoiceId]="invoiceId()" (formSubmit)="closed.emit()" />
        </div>
      }
    </app-modal>
  `,
})
export class InvoiceModal {
  readonly invoiceId = input('');
  readonly isOpen = input.required<boolean>();
  readonly closed = output();
}
