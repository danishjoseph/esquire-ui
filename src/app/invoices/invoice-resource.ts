import { inject, Injectable, signal } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { PurchaseStatus, WarrantyStatus } from '../workflow/tickets/purchase-info-form';
import { map } from 'rxjs';
import { Product } from '../products/product-resource';
import { IProductForm } from '../products/product-form-service';
import { FormGroup } from '@angular/forms';
import { ICustomerForm } from '../customers/customer-form-service';
import { Customer } from '../customers/customer-resource';

export interface Purchase {
  id: number;
  purchase_status: PurchaseStatus;
  warranty_status: WarrantyStatus;
  purchase_date: Date | null;
  invoice_number: string | null;
  warranty_expiry: Date | null;
  asc_start_date: Date | null;
  asc_expiry_date: Date | null;
  product: Product;
  customer: Customer;
  created_at: Date;
  updated_at: Date;
}

interface PurchasesRequest {
  offset: number;
  limit: number;
  search: string;
  customerId?: number | null;
}

interface PurchaseResponse {
  purchases: Purchase[];
}

export interface CreatePurchaseInput {
  purchase_status: PurchaseStatus | null;
  warranty_status: WarrantyStatus | null;
  purchase_date: Date | null;
  invoice_number: string | null;
  warranty_expiry: Date | null;
  asc_start_date: Date | null;
  asc_expiry_date: Date | null;
  product: FormGroup<IProductForm>['value'];
  customer: FormGroup<ICustomerForm>['value'];
}

export type UpdatePurchaseInput = CreatePurchaseInput & { id: number };

const PURCHASE = gql`
  fragment Purchase on Purchase {
    id
    purchase_status
    warranty_status
    purchase_date
    invoice_number
    warranty_expiry
    asc_start_date
    asc_expiry_date
    product {
      id
      name
      serial_number
      category
      brand
      model_name
      product_warranty
    }
  }
`;

const PURCHASES = gql<PurchaseResponse, PurchasesRequest>`
  query Invoices($limit: Int, $offset: Int, $search: String, $customerId: Int) {
    purchases(limit: $limit, offset: $offset, search: $search, customerId: $customerId) {
      ...Purchase
    }
  }
  ${PURCHASE}
`;

const GET = gql<{ purchase: Purchase }, number>`
  query Invoice($id: Int!) {
    purchase(id: $id) {
      id
      purchase_status
      warranty_status
      purchase_date
      invoice_number
      warranty_expiry
      asc_start_date
      asc_expiry_date
      product {
        id
        name
        serial_number
        category
        brand
        model_name
        product_warranty
      }
      customer {
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
      }
      created_at
      updated_at
    }
  }
`;

const CREATE = gql<{ id: number }, unknown>`
  mutation CreateInvoice($createPurchaseInput: CreatePurchaseInput!) {
    createPurchase(createPurchaseInput: $createPurchaseInput) {
      id
    }
  }
`;

const UPDATE = gql<{ updatePurchase: { id: number } }, unknown>`
  mutation UpdateInvoice($updatePurchaseInput: UpdatePurchaseInput!) {
    updatePurchase(updatePurchaseInput: $updatePurchaseInput) {
      id
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class InvoiceResource {
  #apollo = inject(Apollo);
  #purchasesRef?: QueryRef<PurchaseResponse, PurchasesRequest>;
  #purchasesRequestState = signal<PurchasesRequest | null>(null);

  invoices(limit: number, offset: number, search: string, customerId?: number | null) {
    const requestState: PurchasesRequest = {
      limit,
      offset,
      search,
      customerId: customerId ?? null,
    };
    this.#purchasesRequestState.set(requestState);
    this.#purchasesRef = this.#apollo.watchQuery({
      query: PURCHASES,
      variables: requestState,
      fetchPolicy: 'cache-and-network',
    });
    return this.#purchasesRef?.valueChanges.pipe(map((res) => res.data));
  }

  fetchMore(offset: number) {
    this.#purchasesRef?.fetchMore({
      variables: { offset },
    });
  }

  invoice(id: string) {
    return this.#apollo
      .watchQuery({
        query: GET,
        variables: { id: +id },
        fetchPolicy: 'no-cache',
      })
      .valueChanges.pipe(map((res) => res.data));
  }

  create(createPurchaseInput: CreatePurchaseInput) {
    return this.#apollo
      .mutate({
        mutation: CREATE,
        variables: { createPurchaseInput },
        refetchQueries: [{ query: PURCHASES, variables: { ...this.#purchasesRequestState() } }],
      })
      .pipe(map((res) => res.data));
  }

  update(updatePurchaseInput: UpdatePurchaseInput) {
    return this.#apollo
      .mutate({
        mutation: UPDATE,
        variables: { updatePurchaseInput },
        refetchQueries: [{ query: PURCHASES, variables: { ...this.#purchasesRequestState() } }],
      })
      .pipe(map((res) => res.data));
  }
}
