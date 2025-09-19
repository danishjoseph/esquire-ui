import { Component } from '@angular/core';
import { PageBreadcrumb } from '../shared/components/ui/page-breadcrumb';
import { CustomerMetrics } from './customer-metrics';
import { ProductMetrics } from './product-metrics';

@Component({
  selector: 'app-dashboard',
  imports: [PageBreadcrumb, CustomerMetrics, ProductMetrics],
  template: `
    <app-page-breadcrumb pageTitle="Dashboard" />
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      <app-customer-metrics />
      <app-product-metrics />
    </div>
  `,
})
export class Dashboard {}
