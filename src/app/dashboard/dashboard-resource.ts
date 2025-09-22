import { inject, Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map } from 'rxjs';

export interface GrowthMetrics {
  total: number;
  monthlyGrowth: number;
  currentMonthCount: number;
}

interface CustomerMetricsResponse {
  customerMetrics: GrowthMetrics;
}

interface ProductMetricsResponse {
  productMetrics: GrowthMetrics;
}

export const CUSTOMER_METRICS = gql<CustomerMetricsResponse, unknown>`
  query fetchCustomerMetrics {
    customerMetrics {
      total
      monthlyGrowth
      currentMonthCount
    }
  }
`;

export const PRODUCT_METRICS = gql<ProductMetricsResponse, unknown>`
  query fetchProductMetrics {
    productMetrics {
      total
      monthlyGrowth
      currentMonthCount
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

  fetchProductMetrics() {
    return this.apollo
      .watchQuery({
        query: PRODUCT_METRICS,
      })
      .valueChanges.pipe(map((res) => res.data));
  }
}
