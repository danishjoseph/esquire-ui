import { inject, Injectable, signal } from '@angular/core';
import { TicketStatus } from './ticket-list';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { map } from 'rxjs';
import { ProductCondition, Purchase, ServiceStatus, ServiceType } from './purchase-info-form';

interface ListResponse {
  services: TicketTable[];
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
  CHIP_LEVEL = ' CHIP_LEVEL',
  DESKTOP_CARE = 'DESKTOP_CARE',
  IPG = 'IPG',
  VENDOR_ASP = 'VENDOR_ASP',
  OUTSOURCE = 'OUTSOURCE',
  HOLD = 'HOLD',
}

export interface Ticket {
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

interface TicketsRequest {
  offset: number;
  limit: number;
  status: TicketStatus;
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
  serviceSection: { id: string; name: string } | null;
  assignedExecutive: null;
  status: TicketStatus;
}

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
  }
`;

const TICKETS = gql<ListResponse, TicketsRequest>`
  query services($limit: Int, $offset: Int, $status: TicketStatus, $search: String) {
    services(limit: $limit, offset: $offset, status: $status, search: $search) {
      ...TicketTable
    }
  }
  ${TICKET_TABLE}
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

@Injectable({
  providedIn: 'root',
})
export class TicketResource {
  #apollo = inject(Apollo);
  #ticketsRef?: QueryRef<ListResponse, TicketsRequest>;
  #ticketsRequestState = signal<TicketsRequest | null>(null);

  tickets(limit: number, offset: number, status: TicketStatus, search: string) {
    this.#ticketsRequestState.set({ limit, offset, status, search });
    this.#ticketsRef = this.#apollo.watchQuery({
      query: TICKETS,
      variables: { offset, limit, status, search },
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
}
