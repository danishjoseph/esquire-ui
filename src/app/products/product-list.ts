import { Component } from '@angular/core';
import { PageBreadcrumb } from '../shared/components/ui/page-breadcrumb';
import { ProductTable } from './product-table';

@Component({
  selector: 'app-product-list',
  imports: [PageBreadcrumb, ProductTable],
  template: `
    <app-page-breadcrumb pageTitle="Products" />
    <app-product-table />
  `,
  styles: ``,
})
export class ProductList {}
