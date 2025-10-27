import { inject, Injectable, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { IUserForm } from './user-form-service';
import { map } from 'rxjs';

type CreateUserInput = FormGroup<IUserForm>['value'];
type UpdateUserInput = CreateUserInput & { id: number };
type UserResponse = CreateUserInput;

export enum UserRole {
  FOE = 'FOE',
  ADMIN = 'ADMIN',
  ENGINEER = 'ENGINEER',
}

export interface User {
  id: number;
  sub: string;
  name: string;
  mobile: string;
  email: string;
  role: UserRole;
  deletedAt: Date;
}

interface UsersRequest {
  offset: number;
  limit: number;
  search: string;
}

interface UsersResponse {
  users: User[];
}

const USER = gql`
  fragment User on User {
    id
    sub
    name
    mobile
    email
    role
    deletedAt
  }
`;

const USERS = gql<UsersResponse, UsersRequest>`
  query Users($limit: Int, $offset: Int, $search: String) {
    users(limit: $limit, offset: $offset, search: $search) {
      ...User
    }
  }
  ${USER}
`;

const GET = gql<{ user: User }, number>`
  query User($id: Int!) {
    user(id: $id) {
      ...User
    }
  }
  ${USER}
`;

const CREATE = gql<UserResponse, unknown>`
  mutation CreateUser($createUserInput: CreateUserInput!) {
    createUser(createUserInput: $createUserInput) {
      ...User
    }
  }
  ${USER}
`;

const UPDATE = gql<UserResponse, unknown>`
  mutation UpdateUser($updateUserInput: UpdateUserInput!) {
    updateUser(updateUserInput: $updateUserInput) {
      ...User
    }
  }
  ${USER}
`;

@Injectable({
  providedIn: 'root',
})
export class UserResource {
  #apollo = inject(Apollo);
  #usersRef?: QueryRef<UsersResponse, UsersRequest>;
  #usersRequestState = signal<UsersRequest | null>(null);

  users(limit: number, offset: number, search: string) {
    this.#usersRequestState.set({ limit, offset, search });
    this.#usersRef = this.#apollo.watchQuery({
      query: USERS,
      variables: { offset, limit, search },
      fetchPolicy: 'cache-and-network',
    });
    return this.#usersRef?.valueChanges.pipe(map((res) => res.data));
  }

  fetchMore(offset: number) {
    this.#usersRef?.fetchMore({
      variables: { offset },
    });
  }

  user(id: string) {
    return this.#apollo
      .watchQuery({
        query: GET,
        variables: { id: +id },
        fetchPolicy: 'no-cache',
      })
      .valueChanges.pipe(map((res) => res.data));
  }

  create(createUserInput: CreateUserInput) {
    return this.#apollo
      .mutate({
        mutation: CREATE,
        variables: { createUserInput },
        refetchQueries: [{ query: USERS, variables: { ...this.#usersRequestState() } }],
      })
      .pipe(map((res) => res.data));
  }

  update(updateUserInput: UpdateUserInput) {
    return this.#apollo
      .mutate({
        mutation: UPDATE,
        variables: { updateUserInput },
        refetchQueries: [{ query: USERS, variables: { ...this.#usersRequestState() } }],
      })
      .pipe(map((res) => res.data));
  }
}
