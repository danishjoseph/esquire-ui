import { Component } from '@angular/core';
import { CustomerTable } from './customer-table';
import { PageBreadcrumb } from '../shared/components/ui/page-breadcrumb';

@Component({
  selector: 'app-customer-list',
  imports: [CustomerTable, PageBreadcrumb],
  template: `
    <app-page-breadcrumb pageTitle="Customers" />
    <app-customer-table />
  `,
})
export class CustomerList {}
