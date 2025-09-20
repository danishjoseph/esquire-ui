import { Component, inject } from '@angular/core';
import { CustomerTable } from './customer-table';
import { PageBreadcrumb } from '../shared/components/ui/page-breadcrumb';
import { CustomerResource } from './customer-resource';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-customer-list',
  imports: [CustomerTable, PageBreadcrumb],
  template: `
    <app-page-breadcrumb pageTitle="Customers" />
    @if (resource.hasValue()) {
      <app-customer-table [data]="resource.value().customers" />
    }
  `,
})
export class CustomerList {
  protected customerResource = inject(CustomerResource);

  protected resource = rxResource({
    stream: () => this.customerResource.customers(),
  });
}
