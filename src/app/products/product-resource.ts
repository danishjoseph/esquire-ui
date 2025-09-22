import { inject, Injectable, signal } from '@angular/core';
import { Customer } from '../customers/customer-resource';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { map } from 'rxjs';
import { IProductForm } from './product-form';
import { FormGroup } from '@angular/forms';

export enum ProductCategory {
  NORMAL_LAPTOP = 'NORMAL_LAPTOP',
  GAMING_LAPTOP = 'GAMING_LAPTOP',
  TABLET = 'TABLET',
  NORMAL_DESKTOP_CPU = 'NORMAL_DESKTOP_CPU',
  GAMING_CPU = 'GAMING_CPU',
  MONITORS = 'MONITORS',
  UPS = 'UPS',
  IPG_PRODUCTS = 'IPG_PRODUCTS',
  ACCESSORIES = 'ACCESSORIES',
  CCTV_DVR_NVR = 'CCTV_DVR_NVR',
  CCTV_CAMERA = 'CCTV_CAMERA',
  SMPS = 'SMPS',
  OTHERS = 'OTHERS',
}

type CreateProductInput = FormGroup<IProductForm>['value'];
type UpdateProductInput = CreateProductInput & { id: number };
type ProductResponse = CreateProductInput;

interface ListResponse {
  products: ProductList[];
}

interface Product {
  id: number;
  serial_number: string;
  category: ProductCategory;
  name: string;
  brand?: string;
  model_name?: string;
  created_at: Date;
  updated_at: Date;
  customer?: Customer;
}

export interface ProductList {
  id: Product['id'];
  serialNumber: Product['serial_number'];
  category: Product['category'];
  name: Product['category'];
  modelName?: Product['model_name'];
  brand?: Product['brand'];
}

interface ProductsRequest {
  offset: number;
  limit: number;
  search: string;
}

// const FULL_PRODUCT = gql`
//   fragment Product on Product {
//     id
//     name
//     serial_number
//     category
//     brand
//     model_name
//     created_at
//     updated_at
//     customer {
//       ...Customer
//     }
//   }
//
//   fragment Customer on Customer {
//     id
//     name
//   }
// `;

const PRODUCT = gql`
  fragment Product on Product {
    id
    name
    serial_number
    category
    brand
    model_name
  }
`;

const LIST_PRODUCTS = gql`
  fragment ListProducts on Product {
    id
    category
    name
    modelName: model_name
    serialNumber: serial_number
    brand
  }
`;

const PRODUCTS = gql<ListResponse, ProductsRequest>`
  query Products($limit: Int, $offset: Int, $search: String) {
    products(limit: $limit, offset: $offset, search: $search) {
      ...ListProducts
    }
  }
  ${LIST_PRODUCTS}
`;

const GET = gql<{ product: Product }, number>`
  query Product($id: Int!) {
    product(id: $id) {
      ...Product
    }
  }
  ${PRODUCT}
`;

const CREATE = gql<ProductResponse, unknown>`
  mutation CreateProduct($createProductInput: CreateProductInput!) {
    createProduct(createProductInput: $createProductInput) {
      ...Product
    }
  }
  ${PRODUCT}
`;

const UPDATE = gql<ProductResponse, unknown>`
  mutation UpdateProduct($updateProductInput: UpdateProductInput!) {
    updateProduct(updateProductInput: $updateProductInput) {
      ...Product
    }
  }
  ${PRODUCT}
`;

const DELETE = gql<boolean, number>`
  mutation RemoveProduct($id: Int!) {
    removeProduct(id: $id)
  }
`;

@Injectable({
  providedIn: 'root',
})
export class ProductResource {
  #apollo = inject(Apollo);
  #productsRef?: QueryRef<ListResponse, ProductsRequest>;
  #productsRequestState = signal<ProductsRequest | null>(null);

  products(limit: number, offset: number, search: string) {
    this.#productsRequestState.set({ limit, offset, search });
    this.#productsRef = this.#apollo.watchQuery({
      query: PRODUCTS,
      variables: { offset, limit, search },
      fetchPolicy: 'cache-and-network',
    });
    return this.#productsRef?.valueChanges.pipe(map((res) => res.data));
  }

  fetchMore(offset: number) {
    this.#productsRef?.fetchMore({
      variables: { offset },
    });
  }

  create(createProductInput: CreateProductInput) {
    return this.#apollo
      .mutate({
        mutation: CREATE,
        variables: { createProductInput },
        refetchQueries: [{ query: PRODUCTS, variables: { ...this.#productsRequestState() } }],
      })
      .pipe(map((res) => res.data));
  }

  update(updateProductInput: UpdateProductInput) {
    return this.#apollo
      .mutate({
        mutation: UPDATE,
        variables: { updateProductInput },
        refetchQueries: [{ query: PRODUCTS, variables: { ...this.#productsRequestState() } }],
      })
      .pipe(map((res) => res.data));
  }

  product(id: string) {
    return this.#apollo
      .watchQuery({
        query: GET,
        variables: { id: +id },
      })
      .valueChanges.pipe(map((res) => res.data));
  }

  remove(id: string) {
    return this.#apollo
      .mutate({
        mutation: DELETE,
        variables: { id: +id },
        refetchQueries: [{ query: PRODUCTS, variables: { ...this.#productsRequestState() } }],
      })
      .pipe(map((res) => res.data));
  }
}
