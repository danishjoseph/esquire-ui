import { Routes } from '@angular/router';
import { Layout } from './shared/components/navigation/layout';
import { CustomerList } from './customers/customer-list';
import { NotFound } from './not-found';
import { ProductList } from './products/product-list';
import { Dashboard } from './dashboard/dashboard';
import { TicketAdd } from './workflow/tickets/ticket-add';
import { TicketList } from './workflow/tickets/ticket-list';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: Dashboard,
        pathMatch: 'full',
        title: 'Dashboard | Esquire',
      },
      {
        path: 'customers',
        component: CustomerList,
        pathMatch: 'full',
        title: 'Customers | Esquire',
      },
      {
        path: 'products',
        component: ProductList,
        pathMatch: 'full',
        title: 'Products | Esquire',
      },
      {
        path: 'service',
        children: [
          {
            path: 'tickets',
            component: TicketList,
            pathMatch: 'full',
            title: 'Tickets | Esquire',
          },
          {
            path: 'add',
            component: TicketAdd,
            pathMatch: 'full',
            title: 'Create Ticket | Esquire',
          },
        ],
      },
    ],
  },
  {
    path: '**',
    component: NotFound,
    title: 'NotFound | Esquire',
  },
];
