import { Component } from '@angular/core';
import { PageBreadcrumb } from '../../shared/components/ui/page-breadcrumb';
import { TicketForm } from './ticket-form';

@Component({
  selector: 'app-ticket-add',
  imports: [PageBreadcrumb, TicketForm],
  template: `
    <app-page-breadcrumb pageTitle="Add Ticket" />
    <app-ticket-form />
  `,
})
export class TicketAdd {}
