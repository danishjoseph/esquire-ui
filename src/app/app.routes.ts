import { Routes } from '@angular/router';
import { Layout } from './shared/components/navigation/layout';
import { CustomerList } from './customers/customer-list';
import { NotFound } from './not-found';
import { ProductList } from './products/product-list';
import { Dashboard } from './dashboard/dashboard';
import { TicketAdd } from './workflow/tickets/ticket-add';
import { TicketList } from './workflow/tickets/ticket-list';
import { TicketReply } from './workflow/tickets/ticket-reply';
import { autoLoginPartialRoutesGuard } from 'angular-auth-oidc-client';
import { InvoiceList } from './invoices/invoice-list';
import { UserList } from './settings/users/user-list';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    canActivate: [autoLoginPartialRoutesGuard],
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
        path: 'invoices',
        component: InvoiceList,
        pathMatch: 'full',
        title: 'Invoices | Esquire',
      },
      {
        path: 'service',
        children: [
          {
            path: 'tickets',
            pathMatch: 'full',
            redirectTo: 'tickets/in-progress',
          },
          {
            path: 'tickets/:status',
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
          {
            path: 'reply',
            component: TicketReply,
            pathMatch: 'full',
            title: 'Feedback Log | Esquire',
          },
        ],
      },
      {
        path: 'settings',
        children: [
          {
            path: 'users',
            pathMatch: 'full',
            component: UserList,
            title: 'Manage Users | Esquire',
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
