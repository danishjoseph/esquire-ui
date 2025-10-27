import { Component, input, output } from '@angular/core';
import { Modal } from '../../shared/components/model/modal';
import { UserForm } from './user-form';

@Component({
  selector: 'app-user-modal',
  imports: [Modal, UserForm],
  template: `
    <app-modal [isOpen]="isOpen()" (closeEvent)="closed.emit()" className="max-w-[700px] p-5">
      @if (isOpen()) {
        <div
          class="custom-scrollbar w-full max-w-[700px] max-h-[80vh] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11"
        >
          <app-user-form [userId]="userId()" (formSubmit)="closed.emit()" />
        </div>
      }
    </app-modal>
  `,
})
export class UserModal {
  readonly userId = input('');
  readonly isOpen = input.required<boolean>();
  readonly closed = output();
}
