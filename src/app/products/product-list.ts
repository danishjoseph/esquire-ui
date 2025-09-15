import { Component } from '@angular/core';
import { PageBreadcrumb } from '../shared/components/ui/page-breadcrumb';

@Component({
  selector: 'app-product-list',
  imports: [PageBreadcrumb],
  template: ` <app-page-breadcrumb pageTitle="Products" /> `,
  styles: ``,
})
export class ProductList {}
