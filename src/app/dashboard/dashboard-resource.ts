import { inject, Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map } from 'rxjs';

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
export class DashboardResource {
  private apollo = inject(Apollo);

  fetchCustomerMetrics() {
    return this.apollo
      .watchQuery({
        query: CUSTOMER_METRICS,
      })
      .valueChanges.pipe(map((res) => res.data));
  }
}
