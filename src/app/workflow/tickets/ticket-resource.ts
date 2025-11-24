import { inject, Injectable, signal } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { map } from 'rxjs';
import {
  Purchase,
  PurchaseStatus,
  ServiceStatus,
  ServiceType,
  WarrantyStatus,
} from './purchase-info-form';
import { FormGroup } from '@angular/forms';
import { ICustomerForm } from '../../customers/customer-form-service';
import { IAccessory, IWorkLog, LogType, ProductCondition } from './ticket-form-service';
import { ProductCategory } from '../../products/product-resource';
import { IProductForm } from '../../products/product-form-service';

export enum TicketStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  QC = 'QC',
  DELIVERY_READY = 'DELIVERY_READY',
  DELIVERED = 'DELIVERED',
  CLOSED = 'CLOSED',
}

interface ListResponse {
  services: {
    services: TicketTable[];
    total: number;
  };
}

interface TicketResponse {
  createService: CreateServiceInput & { caseId: string };
}

export interface CreateServiceInput {
  status: TicketStatus;
  service_type: ServiceType;
  service_status?: ServiceStatus;
  quotation_amount: number;
  service_charge: number;
  gst_amount: number;
  total_amount: number;
  advance_amount: number;
  product_condition: ProductCondition;
  accessories: IAccessory[];
  purchase?: {
    purchase_status: PurchaseStatus | null;
    warranty_status: WarrantyStatus | null;
    purchase_date: Date | null;
    invoice_number: string | null;
    warranty_expiry: Date | null;
    asc_start_date: Date | null;
    asc_expiry_date: Date | null;
    product?: FormGroup<IProductForm>['value'];
    product_id?: string;
    customer?: FormGroup<ICustomerForm>['value'];
    customer_id?: string;
  };
  purchase_id?: string;
  service_logs: IWorkLog[];
  service_section: ServiceSectionName | null;
}

interface UpdateServiceInput {
  id: number;
  status: TicketStatus;
  service_section_name: ServiceSectionName | null;
  service_logs: FormGroup<IWorkLog>['value'][];
}

interface ServiceStatusMetrics {
  total: number;
  pending: number;
  solved: number;
}

interface Accessory {
  id: number;
  accessory_name: string;
  service: Ticket;
  accessory_received: boolean;
  created_at: Date;
}

interface ServiceSection {
  id: number;
  service_section_name: ServiceSectionName;
}

enum ServiceSectionName {
  LAP_CARE = 'LAP_CARE',
  CHIP_LEVEL = 'CHIP_LEVEL',
  DESKTOP_CARE = 'DESKTOP_CARE',
  IPG = 'IPG',
  VENDOR_ASP = 'VENDOR_ASP',
  OUTSOURCE = 'OUTSOURCE',
  HOLD = 'HOLD',
}

interface Ticket {
  id: number;
  accessories: Accessory[];
  purchase: Purchase[];
  service_section: ServiceSection;
  status: TicketStatus;
  service_type: ServiceType;
  service_status: ServiceStatus;
  case_id: string;
  quotation_amount: number;
  service_charge: number;
  gst_amount: number;
  total_amount: number;
  advance_amount: number;
  product_condition: ProductCondition;
  created_at: Date;
  updated_at: Date;
}

export interface TicketView {
  id: string;
  accessories: [
    {
      accessory_name: string;
      accessory_received: boolean;
    },
  ];
  purchase: {
    product: {
      name: string;
      serial_number: string;
      category: ProductCategory;
      brand: string;
      model_name: string;
    };
    customer: {
      name: string;
      mobile: string;
      alt_mobile: string | null;
      email: string | null;
      address: string | null;
      house_office: string | null;
      street_building: string | null;
      area: string | null;
      pincode: string | null;
      district: string | null;
    };
    purchase_status: PurchaseStatus;
    warranty_status: WarrantyStatus;
    purchase_date: Date | null;
    invoice_number: string | null;
    warranty_expiry: Date | null;
    asc_start_date: Date | null;
    asc_expiry_date: Date | null;
  };
  product_condition: ProductCondition;
  quotation_amount: number;
  service_charge: number;
  gst_amount: number;
  total_amount: number;
  advance_amount: number;
  service_status: ServiceStatus | null;
  status: TicketStatus;
  service_logs: [
    {
      service_log_type: LogType;
      log_description: string;
    },
  ];
  service_section: {
    service_section_name: ServiceSectionName;
  };
}

interface ServiceLogs {
  id: string;
  case_id: string;
  accessories: [
    {
      accessory_name: string;
      accessory_received: boolean;
      created_at: Date;
      created_by: {
        name: string | null;
        role: string | null;
      } | null;
    },
  ];
  service_logs: [
    {
      service_log_type: LogType;
      log_description: string;
      created_at: Date;
      updated_at: Date;
      created_by: {
        name: string | null;
        role: string | null;
      } | null;
      updated_by: {
        name: string | null;
        role: string | null;
      } | null;
    },
  ];
  status: TicketStatus;
  created_at: Date;
}

interface TicketsRequest {
  offset: number;
  limit: number;
  sections: ServiceSectionName[];
  status: TicketStatus;
  service_type: ServiceType[];
  search: string;
}

export interface TicketTable {
  id: Ticket['id'];
  caseId: Ticket['case_id'];
  purchase: {
    product: { name: string };
    customer: { name: string; mobile: string };
  };
  createdAt: Date;
  serviceSection: { id: string; name: ServiceSectionName } | null;
  status: TicketStatus;
  updated_by?: {
    name: string | null;
  };
}

interface FilterOption<T> {
  name: T;
  count: number;
}

interface TicketFilters {
  ticketFilters: {
    serviceSections: FilterOption<ServiceSectionName>[];
    serviceTypes: FilterOption<ServiceType>[];
  };
}

const TICKET = gql`
  fragment Ticket on Service {
    id
    caseId: case_id
    accessories {
      accessory_name
      accessory_received
    }
    purchase {
      product {
        name
        serial_number
        category
        brand
        model_name
      }
      customer {
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
      purchase_status
      warranty_status
      purchase_date
      invoice_number
      asc_start_date
      asc_expiry_date
    }
    service_status
    product_condition
    quotation_amount
    service_charge
    gst_amount
    total_amount
    advance_amount
    service_status
    status
    service_logs {
      service_log_type
      log_description
    }
    service_section {
      service_section_name
    }
  }
`;

const TICKET_TABLE = gql`
  fragment TicketTable on Service {
    id
    caseId: case_id
    purchase {
      product {
        name
      }
      customer {
        name
        mobile
      }
    }
    createdAt: created_at
    serviceSection: service_section {
      id
      name: service_section_name
    }
    status
    updated_by {
      name
    }
  }
`;

const TICKETS = gql<ListResponse, TicketsRequest>`
  query services(
    $limit: Int
    $offset: Int
    $sections: [ServiceSectionName!]
    $status: TicketStatus
    $service_type: [ServiceType!]
    $search: String
  ) {
    services(
      limit: $limit
      offset: $offset
      sections: $sections
      status: $status
      service_type: $service_type
      search: $search
    ) {
      total
      services {
        ...TicketTable
      }
    }
  }
  ${TICKET_TABLE}
`;

const CREATE = gql<TicketResponse, unknown>`
  mutation CreateService($createServiceInput: CreateServiceInput!) {
    createService(createServiceInput: $createServiceInput) {
      id
      status
      caseId: case_id
    }
  }
`;

const METRICS = gql<{ serviceStatusMetrics: ServiceStatusMetrics }, unknown>`
  query serviceStatuaMetrics {
    serviceStatusMetrics {
      total
      pending
      solved
    }
  }
`;

const GET = gql<{ service: TicketView }, number>`
  query Service($id: Int!) {
    service(id: $id) {
      ...Ticket
    }
  }
  ${TICKET}
`;

const GET_LOGS = gql<{ service: ServiceLogs }, number>`
  query Service($id: Int!) {
    service(id: $id) {
      id
      case_id
      accessories {
        accessory_name
        accessory_received
        created_at
        created_by {
          name
          role
        }
      }
      serviceSection: service_section {
        id
        name: service_section_name
      }
      service_logs {
        service_log_type
        log_description
        created_at
        updated_at
        created_by {
          name
          role
        }
        updated_by {
          name
          role
        }
      }
      status
      created_at
    }
  }
`;

const UPDATE = gql<TicketResponse, unknown>`
  mutation updateService($updateServiceInput: UpdateServiceInput!) {
    updateService(updateServiceInput: $updateServiceInput) {
      id
      case_id
      status
    }
  }
`;

const GET_ALL_TICKET_FILTERS = gql<TicketFilters, { status: TicketStatus }>`
  query ticketFilters($status: TicketStatus!) {
    ticketFilters(status: $status) {
      serviceSections {
        name
        count
      }
      serviceTypes {
        name
        count
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class TicketResource {
  #apollo = inject(Apollo);
  #ticketsRef?: QueryRef<ListResponse, TicketsRequest>;
  #ticketsRequestState = signal<TicketsRequest | null>(null);

  tickets(
    limit: number,
    offset: number,
    sections: ServiceSectionName[],
    status: TicketStatus,
    service_type: ServiceType[],
    search: string,
  ) {
    this.#ticketsRequestState.set({ limit, offset, sections, status, service_type, search });
    this.#ticketsRef = this.#apollo.watchQuery({
      query: TICKETS,
      variables: { offset, limit, sections, status, service_type, search },
      fetchPolicy: 'cache-and-network',
    });
    return this.#ticketsRef?.valueChanges.pipe(map((res) => res.data));
  }

  metrics() {
    return this.#apollo
      .watchQuery({
        query: METRICS,
      })
      .valueChanges.pipe(map((res) => res.data));
  }

  create(createServiceInput: CreateServiceInput) {
    return this.#apollo
      .mutate({
        mutation: CREATE,
        variables: { createServiceInput },
        refetchQueries: [{ query: TICKETS, variables: { ...this.#ticketsRequestState() } }],
      })
      .pipe(map((res) => res.data));
  }

  ticket(id: string) {
    return this.#apollo
      .watchQuery({
        query: GET,
        variables: { id: +id },
      })
      .valueChanges.pipe(map((res) => res.data));
  }

  update(updateServiceInput: UpdateServiceInput) {
    return this.#apollo
      .mutate({
        mutation: UPDATE,
        variables: { updateServiceInput },
        refetchQueries: [
          { query: GET_LOGS, variables: { id: updateServiceInput.id } },
          { query: TICKETS, variables: { ...this.#ticketsRequestState() } },
          {
            query: GET_ALL_TICKET_FILTERS,
            variables: { status: updateServiceInput.status },
          },
        ],
      })
      .pipe(map((res) => res.data));
  }

  serviceLogs(id: string) {
    return this.#apollo
      .watchQuery({
        query: GET_LOGS,
        variables: { id: +id },
      })
      .valueChanges.pipe(map((res) => res.data));
  }

  ticketFilters(status: TicketStatus) {
    return this.#apollo
      .watchQuery({
        query: GET_ALL_TICKET_FILTERS,
        variables: { status },
      })
      .valueChanges.pipe(map((res) => res.data));
  }
}
