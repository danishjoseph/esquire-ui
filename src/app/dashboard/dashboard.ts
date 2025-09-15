import { Component } from '@angular/core';
import { PageBreadcrumb } from '../shared/components/ui/page-breadcrumb';
import { Maintenance } from '../maintenance';

@Component({
  selector: 'app-dashboard',
  imports: [PageBreadcrumb, Maintenance],
  template: `
    <app-page-breadcrumb pageTitle="Dashboard" />
    <app-maintenance />
  `,
})
export class Dashboard {}
