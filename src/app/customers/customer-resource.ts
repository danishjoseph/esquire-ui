import { inject, Injectable, signal } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { ICustomerForm } from './customer-form-service';
import { FormGroup } from '@angular/forms';
import { map } from 'rxjs';
import { CUSTOMER_METRICS } from '../dashboard/dashboard-resource';

type CreateCustomerInput = FormGroup<ICustomerForm>['value'];
type UpdateCustomerInput = CreateCustomerInput & { id: number };
type CustomerResponse = CreateCustomerInput;

interface CustomersResponse {
  customers: Customer[];
}

interface CustomersRequest {
  offset: number;
  limit: number;
  search: string;
}

export interface Customer {
  id: number;
  name: string;
  mobile: string;
  alt_mobile?: string;
  email?: string;
  address?: string;
  house_office?: string;
  street_building?: string;
  area?: string;
  pincode?: string;
  district?: string;
  created_at: Date;
  updated_at: Date;
}

const CUSTOMER = gql`
  fragment Customer on Customer {
    id
    name
    mobile
    alt_mobile
    email
    address
    house_office
    street_building
    area
    pincode
    district
    created_at
    updated_at
  }
`;

const CUSTOMERS = gql<CustomersResponse, CustomersRequest>`
  query Customers($limit: Int, $offset: Int, $search: String) {
    customers(limit: $limit, offset: $offset, search: $search) {
      ...Customer
    }
  }
  ${CUSTOMER}
`;

const GET = gql<{ customer: Customer }, number>`
  query Customer($id: Int!) {
    customer(id: $id) {
      name
      mobile
      alt_mobile
      email
      address
      house_office
      street_building
      area
      pincode
      district
    }
  }
`;

const CREATE = gql<CustomerResponse, unknown>`
  mutation CreateCustomer($createCustomerInput: CreateCustomerInput!) {
    createCustomer(createCustomerInput: $createCustomerInput) {
      ...Customer
    }
  }
  ${CUSTOMER}
`;

const UPDATE = gql<CustomerResponse, unknown>`
  mutation UpdateCustomer($updateCustomerInput: UpdateCustomerInput!) {
    updateCustomer(updateCustomerInput: $updateCustomerInput) {
      ...Customer
    }
  }
  ${CUSTOMER}
`;

const DELETE = gql<boolean, number>`
  mutation RemoveCustomer($id: Int!) {
    removeCustomer(id: $id)
  }
`;

@Injectable({
  providedIn: 'root',
})
export class CustomerResource {
  #apollo = inject(Apollo);
  #customersRef?: QueryRef<CustomersResponse, CustomersRequest>;
  #customersRequestState = signal<CustomersRequest | null>(null);

  create(createCustomerInput: CreateCustomerInput) {
    return this.#apollo
      .mutate({
        mutation: CREATE,
        variables: { createCustomerInput },
        refetchQueries: [
          { query: CUSTOMERS, variables: { ...this.#customersRequestState() } },
          { query: CUSTOMER_METRICS },
        ],
      })
      .pipe(map((res) => res.data));
  }

  update(updateCustomerInput: UpdateCustomerInput) {
    return this.#apollo
      .mutate({
        mutation: UPDATE,
        variables: { updateCustomerInput },
        refetchQueries: [{ query: CUSTOMERS, variables: { ...this.#customersRequestState() } }],
      })
      .pipe(map((res) => res.data));
  }

  customers(limit: number, offset: number, search: string) {
    this.#customersRequestState.set({ limit, offset, search });
    this.#customersRef = this.#apollo.watchQuery({
      query: CUSTOMERS,
      variables: { offset, limit, search },
      fetchPolicy: 'cache-and-network',
    });
    return this.#customersRef?.valueChanges.pipe(map((res) => res.data));
  }

  fetchMore(offset: number) {
    this.#customersRef?.fetchMore({
      variables: { offset },
    });
  }

  customer(id: string) {
    return this.#apollo
      .watchQuery({
        query: GET,
        variables: { id: +id },
        fetchPolicy: 'no-cache',
      })
      .valueChanges.pipe(map((res) => res.data));
  }

  remove(id: string) {
    return this.#apollo
      .mutate({
        mutation: DELETE,
        variables: { id: +id },
        refetchQueries: [{ query: CUSTOMERS, variables: { ...this.#customersRequestState() } }],
      })
      .pipe(map((res) => res.data));
  }
}
