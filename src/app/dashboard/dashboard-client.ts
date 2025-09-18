import { inject, Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

export interface CustomerMetrics {
  totalCustomers: number;
  monthlyGrowth: number;
  currentMonthCustomers: number;
}

interface FetchCustomerMetricsResponse {
  customerMetrics: CustomerMetrics;
}
export const CUSTOMER_METRICS = gql<FetchCustomerMetricsResponse, unknown>`
  query fetchCustomerMetrics {
    customerMetrics {
      totalCustomers
      monthlyGrowth
      currentMonthCustomers
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class DashboardClient {
  private apollo = inject(Apollo);

  fetchCustomerMetrics() {
    return this.apollo.query({
      query: CUSTOMER_METRICS,
    });
  }
}
