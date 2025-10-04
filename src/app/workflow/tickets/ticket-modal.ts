import { Component, input, output } from '@angular/core';
import { Modal } from '../../shared/components/model/modal';
import { TicketForm } from './ticket-form';

@Component({
  selector: 'app-ticket-modal',
  imports: [Modal, TicketForm],
  template: `
    <app-modal [isFullscreen]="false" [isOpen]="isOpen()" (closeEvent)="closed.emit()">
      @if (isOpen()) {
        <div class="max-h-screen overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <app-ticket-form [ticketId]="ticketId()" />
        </div>
      }
    </app-modal>
  `,
})
export class TicketModal {
  readonly ticketId = input('');
  readonly isOpen = input.required<boolean>();
  readonly closed = output();
}
