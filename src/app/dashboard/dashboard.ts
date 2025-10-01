import { Component } from '@angular/core';
import { PageBreadcrumb } from '../shared/components/ui/page-breadcrumb';
import { CustomerMetrics } from './customer-metrics';
import { ProductMetrics } from './product-metrics';
import { serviceMetrics } from './service-metrics';

@Component({
  selector: 'app-dashboard',
  imports: [PageBreadcrumb, CustomerMetrics, ProductMetrics, serviceMetrics],
  template: `
    <app-page-breadcrumb pageTitle="Dashboard" />
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      <app-customer-metrics />
      <app-product-metrics />
      <app-service-metrics />
    </div>
  `,
})
export class Dashboard {}
