import { inject, Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { ICustomerForm } from './customer-form';
import { FormGroup } from '@angular/forms';
import { map } from 'rxjs';

type CreateCustomerInput = FormGroup<ICustomerForm>['value'];
type UpdateCustomerInput = CreateCustomerInput & { id: number };
type CustomerResponse = CreateCustomerInput;

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

const CUSTOMERS = gql<{ customers: Customer[] }, unknown>`
  query Customers {
    customers {
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

  create(createCustomerInput: CreateCustomerInput) {
    return this.#apollo
      .mutate({
        mutation: CREATE,
        variables: { createCustomerInput },
        refetchQueries: [{ query: CUSTOMERS }],
      })
      .pipe(map((res) => res.data));
  }

  update(updateCustomerInput: UpdateCustomerInput) {
    return this.#apollo
      .mutate({
        mutation: UPDATE,
        variables: { updateCustomerInput },
        refetchQueries: [{ query: CUSTOMERS }],
      })
      .pipe(map((res) => res.data));
  }

  customers() {
    return this.#apollo
      .watchQuery({
        query: CUSTOMERS,
      })
      .valueChanges.pipe(map((res) => res.data));
  }

  customer(id: string) {
    return this.#apollo
      .query({
        query: GET,
        variables: { id: +id },
      })
      .pipe(map((res) => res.data));
  }

  remove(id: string) {
    return this.#apollo
      .mutate({
        mutation: DELETE,
        variables: { id: +id },
        refetchQueries: [{ query: CUSTOMERS }],
      })
      .pipe(map((res) => res.data));
  }
}
