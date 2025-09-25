import { Component, input, output } from '@angular/core';
import { Modal } from '../shared/components/model/modal';
import { ProductForm } from './product-form';

@Component({
  selector: 'app-product-modal',
  imports: [Modal, ProductForm],
  template: `
    <app-modal
      [isOpen]="isOpen()"
      (closeEvent)="closed.emit()"
      className="max-w-[700px] p-5 lg:p-10"
    >
      @if (isOpen()) {
        <div class=" overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <app-product-form [productId]="productId()" (formSubmit)="closed.emit()" />
        </div>
      }
    </app-modal>
  `,
})
export class ProductModal {
  readonly productId = input('');
  readonly isOpen = input.required<boolean>();
  readonly closed = output();
}
